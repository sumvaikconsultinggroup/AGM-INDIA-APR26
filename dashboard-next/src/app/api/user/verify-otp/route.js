import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Helper functions for API responses
function errorResponse(message, status = 500, error) {
  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error;
  }

  return NextResponse.json(response, { status });
}

function successResponse(message, data = null, status = 200) {
  const response = {
    success: true,
    message,
  };

  if (data) {
    response.data = data;
  }

  return NextResponse.json(response, { status });
}

export async function POST(req) {
  try {
    await connectDB();
    
    // Parse request body
    const body = await req.json();
    const { email, otp } = body;

    // Validate input
    if (!email || !otp) {
      return errorResponse("Email and OTP are required", 400);
    }

    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    if (!user) {
      return errorResponse("User not found", 404);
    }

    const normalizedOtp = String(otp).trim();
    if (!/^\d{6}$/.test(normalizedOtp)) {
      return errorResponse("OTP must be a 6-digit code", 400);
    }

    if (!user.otp || !user.otpExpiry || user.otpExpiry < Date.now()) {
      return errorResponse("Invalid or expired OTP", 400);
    }

    // Prefer the model method (bcrypt compare for current format),
    // then fallback to legacy sha256+bcrypt migration path.
    let isValidOtp = false;
    if (typeof user.verifyOTP === 'function') {
      isValidOtp = await user.verifyOTP(normalizedOtp);
    }
    if (!isValidOtp) {
      const legacyOtpHash = crypto.createHash("sha256").update(normalizedOtp).digest("hex");
      isValidOtp = await bcrypt.compare(legacyOtpHash, user.otp);
    }

    if (!isValidOtp) {
      return errorResponse("Invalid or expired OTP", 400);
    }

    // Mark verified by clearing OTP
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.isOTPVerified = true;

    await user.save();
    
    console.log(`OTP verified successfully for user: ${user._id}`);

    return successResponse("OTP verified successfully");
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return errorResponse(
      "Failed to verify OTP", 
      500, 
      process.env.NODE_ENV === "development" ? error.message : undefined
    );
  }
}

// GET method not allowed
export async function GET() {
  return errorResponse("Method not allowed", 405);
}
