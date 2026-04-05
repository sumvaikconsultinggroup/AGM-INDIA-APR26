import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

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
    const { email, newPassword } = body;

    // Validate input
    if (!email || !newPassword) {
      return errorResponse("Email and new password are required", 400);
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return errorResponse("Password must be at least 8 characters long", 400);
    }

    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    // Check if user is verified
    if (!user.isOTPVerified) {
      return errorResponse("OTP verification required before resetting password", 403);
    }

    // Set new password and clear OTP data
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.isOTPVerified = false;

    await user.save();
    
    console.log(`Password reset successfully for user: ${user._id}`);

    return successResponse("Password reset successfully");
  } catch (error) {
    console.error("Password Reset Error:", error);
    return errorResponse(
      "Failed to reset password", 
      500, 
      process.env.NODE_ENV === "development" ? error.message : undefined
    );
  }
}

// GET method not allowed
export async function GET() {
  return errorResponse("Method not allowed", 405);
}