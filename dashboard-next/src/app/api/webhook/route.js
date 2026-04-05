import DonationSchema from '../../../models/Donations';
import { connectDB } from '@/lib/mongodb';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

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
            donationConfirmation = await DonationSchema.create({
              amount,
              email,
              name,
              phone,
              address,
              nationality,
              campaignId,
              paymentId: payment.id,
              currency: payment.currency || 'INR',
              paymentStatus: 'completed',
              donatedAt: new Date(),
            });
            isNewDonation = true;
          }
        } catch (dbErr) {
          console.error('❌ Error saving donation to DB:', dbErr);
        }

        if (donationConfirmation && isNewDonation) {
          try {
            await sendEmail(
              email,
              'Thank You for Your Generous Donation!',
              `Dear ${name || 'Donor'},

We would like to extend our heartfelt gratitude for your generous donation of ₹${(amount / 100).toFixed(2)}.

Your support plays a vital role in helping us continue our mission. Contributions like yours make it possible for us to provide essential services and support to those in need.

We truly appreciate your kindness and generosity.

With gratitude,  
Swami AvdheshanandG Mission Team  
https://www.avdheshanandgmission.org`
            );
          } catch (mailErr) {
            console.error('❌ Error sending thank-you email:', mailErr);
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
