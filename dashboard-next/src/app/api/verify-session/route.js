import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req) {
  try {
    await connectDB();
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : undefined;
    const cookieStore = await cookies();
    const token = bearerToken || cookieStore.get('token')?.value || cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const userId = decoded?.userId || decoded?.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Invalid token payload' }, { status: 401 });
    }

    const user = await User.findById(userId).select('-password -otp -otpExpiry -__v').lean();
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Session verified', data: { user }, user });
  } catch {
    return NextResponse.json({ success: false, message: 'Authentication error' }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (sign === razorpay_signature) {
      return NextResponse.json({
        success: true,
        status: 'success',
        message: 'Payment signature verified',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          status: 'failure',
          message: 'Invalid payment signature',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
