import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from '@/lib/mongodb';

// POST handler for login
export async function POST(req) {
  try {
    await connectDB();

    // Parse request body
    const body = await req.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role || "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Create a response
    const response = NextResponse.json(
      {
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
      maxAge: 3600,
      path: "/",
    };
    // Keep both cookie names for full app compatibility.
    response.cookies.set({ name: "token", value: token, ...cookieOptions });
    response.cookies.set({ name: "auth_token", value: token, ...cookieOptions });

    return response;
  } catch (error) {
    console.error("Server error during login:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
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
