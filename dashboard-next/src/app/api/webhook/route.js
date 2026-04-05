import DonationSchema from '../../../models/Donations';
import Donate from '@/models/Donate';
import { connectDB } from '@/lib/mongodb';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { sendWhatsAppMessage, sendWhatsAppTemplateMessage } from '@/lib/whatsapp';

async function sendEmail(to, subject, text, html) {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      debug: process.env.NODE_ENV === 'development',
    });

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'SwamiG Dashboard',
        address: process.env.EMAIL_USER || '',
      },
      to,
      subject,
      text,
      ...(html && { html }),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
}

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

function buildReceiptNumber(paymentId) {
  const date = new Date();
  const yyyymmdd = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');
  const suffix = String(paymentId || '').slice(-6).toUpperCase();
  return `80G-${yyyymmdd}-${suffix || Date.now()}`;
}

function buildReceiptAccessToken() {
  return crypto.randomBytes(24).toString('hex');
}

function getPublicReceiptUrl(req, receiptAccessToken) {
  const configuredBaseUrl =
    process.env.PUBLIC_APP_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_BASE_URL;

  const origin = configuredBaseUrl || req.nextUrl.origin;
  return `${String(origin).replace(/\/+$/, '')}/api/donation-receipt/${receiptAccessToken}`;
}

function buildDonationReceiptEmail({ name, amount, donatedAt, receiptNumber, campaignTitle, panNumber }) {
  const formattedAmount = `Rs. ${Number(amount || 0).toFixed(2)}`;
  const formattedDate = new Date(donatedAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subject = 'Donation Receipt - AvdheshanandG Mission';
  const text = `Hari Om.

This is to acknowledge with thanks the donation of ${formattedAmount} received from ${name || 'the donor'} towards ${campaignTitle || 'General Donation'}.

Your donation receipt dated ${formattedDate} is attached herewith.

Receipt number is ${receiptNumber} and PAN provided is ${panNumber || 'Not provided'}.

With regards,
AvdheshanandG Mission Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #7b1e1e;">Donation Receipt</h1>
      <p>Hari Om.</p>
      <p>This is to acknowledge with thanks the donation of <strong>${formattedAmount}</strong> received from <strong>${name || 'the donor'}</strong> towards <strong>${campaignTitle || 'General Donation'}</strong>.</p>
      <div style="background: #fff6ea; border: 1px solid #f0d2a4; border-radius: 16px; padding: 18px; margin-top: 16px;">
        <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
        <p><strong>Donation Date:</strong> ${formattedDate}</p>
        <p><strong>PAN:</strong> ${panNumber || 'Not provided'}</p>
      </div>
      <p style="margin-top: 16px; color: #555;">With regards,<br/>AvdheshanandG Mission Team</p>
    </div>
  `;

  return { subject, text, html };
}

export async function POST(req) {
  try {
    if (!webhookSecret) {
      return NextResponse.json(
        { success: false, message: 'Webhook secret is not configured' },
        { status: 500 }
      );
    }

    // 1. Read raw body for signature verification
    const rawBody = Buffer.from(await req.arrayBuffer());

    // 2. Verify signature
    const signature = req.headers.get('x-razorpay-signature');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (!signature || signature !== expectedSignature) {
      console.error('❌ Invalid Razorpay webhook signature');
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
    }

    // 3. Parse event
    const event = JSON.parse(rawBody.toString());
    console.log('🔔 Razorpay event received:', event.event);

    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;

        // Extract metadata (if you passed custom fields in notes during order creation)
        const notes = payment.notes || {};
        const email = notes.email || payment.email;
        const name = notes.full_name || payment.contact_name;
        const phone = notes.phone || payment.contact;
        const address = notes.address;
        const nationality = notes.nationality;
        const campaignId = notes.campaign_id;
        const donationType = notes.donation_type === 'subscription' ? 'subscription' : 'one_time';
        const panNumber = notes.pan_number || notes.panNumber;
        const taxBenefitOptIn = notes.tax_benefit_opt_in === 'true' || notes.taxBenefitOptIn === 'true';
        const amount = payment.amount; // in paise

        let donationConfirmation = null;
        let isNewDonation = false;

        try {
          await connectDB();
          const existingDonation = await DonationSchema.findOne({ paymentId: payment.id })
            .select('_id paymentId')
            .lean();

          if (existingDonation) {
            donationConfirmation = existingDonation;
          } else {
            const receiptNumber = buildReceiptNumber(payment.id);
            const receiptAccessToken = buildReceiptAccessToken();
            donationConfirmation = await DonationSchema.create({
              amount,
              email,
              name,
              phone,
              address,
              nationality,
              campaignId,
              orderId: payment.order_id,
              paymentId: payment.id,
              subscriptionId: payment.subscription_id,
              currency: payment.currency || 'INR',
              paymentStatus: 'completed',
              paymentMethod: payment.method,
              donatedAt: new Date(),
              donationType,
              panNumber,
              taxBenefitOptIn,
              receiptNumber,
              receiptAccessToken,
              receiptIssuedAt: new Date(),
              source: notes.source || 'unknown',
            });
            isNewDonation = true;

            if (campaignId) {
              await Donate.findByIdAndUpdate(campaignId, {
                $inc: { achieved: amount / 100, donors: 1 },
              }).catch((campaignError) => {
                console.error('❌ Failed updating campaign totals:', campaignError);
              });
            }
          }
        } catch (dbErr) {
          console.error('❌ Error saving donation to DB:', dbErr);
        }

        if (donationConfirmation && isNewDonation) {
          try {
            const campaign = campaignId ? await Donate.findById(campaignId).lean() : null;
            const receiptPayload = buildDonationReceiptEmail({
              name,
              amount: amount / 100,
              donatedAt: donationConfirmation.donatedAt || new Date(),
              receiptNumber: donationConfirmation.receiptNumber,
              campaignTitle: campaign?.title,
              panNumber,
            });

            await sendEmail(email, receiptPayload.subject, receiptPayload.text, receiptPayload.html);
            await DonationSchema.findByIdAndUpdate(donationConfirmation._id, {
              receiptEmailSentAt: new Date(),
            }).catch(() => {});

            if (phone) {
              const receiptUrl = getPublicReceiptUrl(req, donationConfirmation.receiptAccessToken);
              const templateName =
                process.env.WHATSAPP_DONATION_RECEIPT_TEMPLATE ||
                'donation_80g_receipt_v1';

              const whatsappResult = await sendWhatsAppTemplateMessage({
                to: phone,
                templateName,
                languageCode: 'en',
                callbackData: 'donation_80g_receipt',
                headerValues: [receiptUrl],
                fileName: `Donation-Receipt-${donationConfirmation.receiptNumber}.pdf`,
                bodyValues: [
                  name || 'Donor',
                  (amount / 100).toFixed(2),
                  campaign?.title || 'General Donation',
                  payment.id,
                  new Date(donationConfirmation.donatedAt || new Date()).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }),
                  donationConfirmation.receiptNumber || 'Receipt Pending',
                  panNumber || 'Not provided',
                ],
              });

              if (whatsappResult.success) {
                await DonationSchema.findByIdAndUpdate(donationConfirmation._id, {
                  receiptWhatsappSentAt: new Date(),
                }).catch(() => {});
              } else {
                console.error('❌ WhatsApp template send failed, falling back to text:', whatsappResult.error);
                await sendWhatsAppMessage(
                  phone,
                  `Hari Om. This is to acknowledge with thanks the donation of Rs. ${(amount / 100).toFixed(2)} received from ${name || 'the donor'} towards ${campaign?.title || 'General Donation'}. Receipt number is ${donationConfirmation.receiptNumber}. With regards, AvdheshanandG Mission Team.`
                ).catch(() => {});
              }
            }
          } catch (mailErr) {
            console.error('❌ Error sending donation receipt:', mailErr);
          }
        }
        break;
      }

      default:
        console.log(`⚠️ Unhandled Razorpay event type: ${event.event}`);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (err) {
    console.error('❌ Webhook error:', err);
    return NextResponse.json({ success: false, message: 'Webhook handler failed' }, { status: 500 });
  }
}
