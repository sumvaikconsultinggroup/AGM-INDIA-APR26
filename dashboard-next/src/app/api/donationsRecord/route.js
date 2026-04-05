// pages/api/payments.js
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

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

    const allPayments = payments.items.map(payment => ({
      id: payment.id,
      amount: payment.amount / 100, // convert paise to INR
      currency: payment.currency,
      status: payment.status, // 'captured', 'failed', etc.
      method: payment.method, // card, upi, netbanking etc.
      email: payment.email,
      contact: payment.contact,
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
