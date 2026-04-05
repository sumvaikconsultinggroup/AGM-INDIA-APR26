import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

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

// Email sending function
async function sendEmail(to, subject, text, html) {
  try {
    // Create transporter with config from environment variables
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

    console.log('Email configuration:', {
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER ? 'Set' : 'Not set',
    });

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'SwamiG Dashboard',
        address: process.env.EMAIL_USER || '',
      },
      to,
      subject,
      text,
      ...(html && { html }), // Only include html if provided
    };

    console.log('Sending email to:', to);

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

export async function POST(req) {
  try {
    await connectDB();
    
    // Parse request body
    const body = await req.json();
    const { email } = body;

    // Validate email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return errorResponse("Please provide a valid email address", 400);
    }

    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    if (!user) {
      return errorResponse("User not found", 404);
    }

    // Check if previous OTP hasn't expired yet
    if (user.otpExpiry && user.otpExpiry > Date.now()) {
      const timeLeft = Math.ceil((user.otpExpiry - Date.now()) / 1000);
      return errorResponse(`Please wait ${timeLeft} seconds before requesting a new OTP`, 429);
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    // Save raw OTP and let the model pre-save hook hash it once.
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 mins
    await user.save();

    // Create HTML version of OTP email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Your OTP Verification Code</h2>
        <p>Your One-Time Password is:</p>
        <div style="background-color: #f7f7f7; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code is valid for 5 minutes.</p>
        <p style="color: #c00;"><strong>Do not share this code with anyone.</strong></p>
      </div>
    `;

    // Send email with OTP
    try {
      await sendEmail(
        email,
        "Your OTP Code",
        `Your OTP is: ${otp}\nValid for 5 minutes.\nDo not share this with anyone.`,
        htmlContent
      );
      
      return successResponse("OTP sent successfully");
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      
      // Revert OTP save if email fails
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
      
      return errorResponse("Failed to send OTP email", 500, emailError.message);
    }
  } catch (error) {
    console.error("OTP Generation Error:", error);
    return errorResponse(
      "Failed to send OTP", 
      500, 
      process.env.NODE_ENV === "development" ? error.message : undefined
    );
  }
}

// GET method not allowed
export async function GET() {
  return errorResponse("Method not allowed", 405);
}
