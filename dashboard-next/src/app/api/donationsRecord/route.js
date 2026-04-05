// pages/api/payments.js
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { connectDB } from '@/lib/mongodb';
import Donation from '@/models/Donations';

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export async function GET(req) {
  try {
    const countParam = Number(req.nextUrl.searchParams.get('count') || 10);
    const count = Number.isFinite(countParam)
      ? Math.min(Math.max(Math.trunc(countParam), 1), 50)
      : 10;

    const razorpay = getRazorpay();
    const payments = await razorpay.payments.all({ count });
    const paymentIds = payments.items.map((payment) => payment.id).filter(Boolean);

    let storedDonationsByPaymentId = new Map();
    if (paymentIds.length > 0) {
      await connectDB();
      const storedDonations = await (Donation)
        .find({ paymentId: { $in: paymentIds } })
        .select('_id paymentId receiptNumber receiptEmailSentAt receiptWhatsappSentAt')
        .lean();
      storedDonationsByPaymentId = new Map(
        storedDonations.map((donation) => [donation.paymentId, donation])
      );
    }

    const allPayments = payments.items.map(payment => ({
      donationId: storedDonationsByPaymentId.get(payment.id)?._id?.toString?.() || null,
      hasReceipt: Boolean(storedDonationsByPaymentId.get(payment.id)?.receiptNumber),
      receiptNumber: storedDonationsByPaymentId.get(payment.id)?.receiptNumber || null,
      receiptEmailSentAt: storedDonationsByPaymentId.get(payment.id)?.receiptEmailSentAt || null,
      receiptWhatsappSentAt: storedDonationsByPaymentId.get(payment.id)?.receiptWhatsappSentAt || null,
      id: payment.id,
      amount: payment.amount / 100, // convert paise to INR
      currency: payment.currency,
      status: payment.status, // 'captured', 'failed', etc.
      method: payment.method, // card, upi, netbanking etc.
      paymentMethod: payment.method,
      email: payment.email,
      contact: payment.contact,
      customer: payment.email || payment.contact || '',
      created: payment.created_at,
      description: payment.description || '',
    }));

    return NextResponse.json({
      success: true,
      message: 'Payments fetched successfully',
      data: allPayments,
      allPayments, // Backward-compatible key for existing clients.
    });
  } catch (error) {
    console.error('Razorpay fetch error:', error.message);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
