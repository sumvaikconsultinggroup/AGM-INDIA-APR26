import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from '@/lib/mongodb';
import { authLimiter, getClientIp } from '@/lib/rateLimiter';
import { checkAccountLockout, recordFailedAttempt, clearLockout, sanitizeString } from '@/lib/security';

// POST handler for login
export async function POST(req) {
  try {
    // Rate limiting
    const ip = getClientIp(req);
    const rateResult = authLimiter.check(`user:${ip}`);
    if (!rateResult.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many login attempts. Please try again later.", code: "RATE_LIMITED" },
        { status: 429, headers: { "Retry-After": String(rateResult.retryAfter || 60) } }
      );
    }

    await connectDB();

    const body = await req.json();
    const email = sanitizeString(body.email || '').toLowerCase();
    const password = body.password || '';

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Account lockout check
    const lockoutKey = `user:${email}`;
    const lockout = checkAccountLockout(lockoutKey);
    if (lockout.locked) {
      return NextResponse.json(
        { success: false, message: `Account temporarily locked. Try again in ${lockout.retryAfterSeconds} seconds.`, code: "ACCOUNT_LOCKED" },
        { status: 423 }
      );
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      recordFailedAttempt(lockoutKey);
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const lockResult = recordFailedAttempt(lockoutKey);
      const msg = lockResult.locked
        ? "Account locked due to too many failed attempts. Try again in 15 minutes."
        : `Invalid credentials. ${lockResult.remainingAttempts} attempts remaining.`;
      return NextResponse.json({ success: false, message: msg }, { status: 401 });
    }

    // Successful login — clear lockout
    clearLockout(lockoutKey);

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role || "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          name: user.name || user.profile?.fullName || user.username,
          role: user.role || "user",
        },
        token,
      },
      { status: 200 }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 24 hours
      path: "/",
    };
    response.cookies.set({ name: "token", value: token, ...cookieOptions });
    response.cookies.set({ name: "auth_token", value: token, ...cookieOptions });

    return response;
  } catch (error) {
    console.error("Server error during login:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// GET handler for verifying auth
export async function GET() {
  try {
    await connectDB();
    
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value || cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (!decoded.userId) {
      throw new Error("Invalid token payload");
    }

    // Find user
    const user = await User.findById(decoded.userId)
      .select("-password -__v")
      .lean(); // Use lean() for better performance

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Return user data
    return NextResponse.json({
      success: true,
      user,
    });
    
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 401 }
      );
    }
    if (error.name === "TokenExpiredError") {
      return NextResponse.json(
        {
          success: false,
          message: "Token expired",
        },
        { status: 401 }
      );
    }
    
    // Handle other errors
    console.error("Authentication error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Authentication error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
