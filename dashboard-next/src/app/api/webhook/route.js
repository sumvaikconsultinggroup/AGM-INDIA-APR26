import DonationSchema from '../../../models/Donations';
import Donate from '@/models/Donate';
import { connectDB } from '@/lib/mongodb';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { deliverDonationReceipt } from '@/lib/donations/receiptDelivery';

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
            const delivery = await deliverDonationReceipt({
              donation: {
                _id: donationConfirmation._id?.toString?.() || donationConfirmation._id,
                name,
                email,
                phone,
                amount: amount / 100,
                donatedAt: donationConfirmation.donatedAt || new Date(),
                receiptNumber: donationConfirmation.receiptNumber,
                receiptAccessToken: donationConfirmation.receiptAccessToken,
                paymentId: payment.id,
                orderId: payment.order_id,
                panNumber,
              },
              campaignTitle: campaign?.title,
              requestOrigin: req.nextUrl.origin,
            });

            if (delivery.emailResult?.success) {
              await DonationSchema.findByIdAndUpdate(donationConfirmation._id, {
                receiptEmailSentAt: new Date(),
              }).catch(() => {});
            } else if (!delivery.emailResult?.skipped) {
              console.error('❌ Donation receipt email failed:', delivery.emailResult?.error);
            }

            if (delivery.whatsappResult?.success) {
              await DonationSchema.findByIdAndUpdate(donationConfirmation._id, {
                receiptWhatsappSentAt: new Date(),
              }).catch(() => {});
            } else if (!delivery.whatsappResult?.skipped) {
              console.error('❌ Donation receipt WhatsApp failed:', delivery.whatsappResult?.error);
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
