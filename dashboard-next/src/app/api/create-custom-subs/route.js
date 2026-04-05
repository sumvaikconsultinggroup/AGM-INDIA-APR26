// src/app/api/create-subscription/route.ts
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export async function POST(req) {
  try {
    const razorpay = getRazorpay();
    const { amount, interval, customerEmail } = await req.json();

    if (!amount || amount < 100) {
      return NextResponse.json({ error: 'Amount must be at least ₹100' }, { status: 400 });
    }

    const plan = await razorpay.plans.create({
      period: interval || 'monthly', // "monthly", "weekly", "yearly"
      interval: 1,
      item: {
        name: `Donation Plan - ₹${amount}`,
        amount: amount * 100, // Convert to paise
        currency: 'INR',
      },
    });

    console.log('Created plan:', plan);

    const subscription = await razorpay.subscriptions.create({
      plan_id: plan.id,
      total_count: 12,
      customer_notify: 1,
      notes: {
        email: customerEmail,
        purpose: 'Custom Donation',
      },
    });
    console.log('Created subscription:', subscription);

    return NextResponse.json({ subscriptionId: subscription.id });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}
