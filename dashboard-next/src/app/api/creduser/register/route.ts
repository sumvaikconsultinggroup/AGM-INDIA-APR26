import { NextResponse } from 'next/server';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';

type ApiResponse = {
  success: boolean;
  message: string;
  user?: unknown;
  error?: string;
};

export async function POST(req: Request): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    // Parse request body
    const body = await req.json();
    const { email, password } = body;
    const username = (body.username || body.name || '').trim();

    // Validate input
    if (!email || !password || !username) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'All fields are required' 
        }, 
        { status: 400 }
      );
    }

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          message: 'User with this email already exists' 
        },
        { status: 409 } // 409 Conflict
      );
    }

    // Check if username is taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json(
        {
          success: false,
          message: 'Username is already taken'
        },
        { status: 409 }
      );
    }

    // Create new user with normal auth method
    const newUser = new User({
      email,
      password,
      username,
      authMethod: 'normal', // Explicitly set auth method
      isOTPVerified: false,
      status: 'active',
      role: 'user',
      profile: {
        fullName: username, // Default to username for fullName
        profileImage: '/placeholder.svg'
      }
    });
    
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id, 
        email: newUser.email,
        role: newUser.role,
        authMethod: 'normal'
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    // Create response object without sensitive data
    const userResponse = {
      _id: newUser._id,
      name: newUser.profile?.fullName || newUser.username,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      profile: newUser.profile,
      authMethod: 'normal',
      createdAt: newUser.createdAt
    };

    // Create response with cookies
    const response = NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        user: userResponse,
        token,
      },
      { status: 201 }
    );

    const cookieOptions = {
      httpOnly: true as const,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 3600,
      path: '/',
    };
    response.cookies.set({ name: 'token', value: token, ...cookieOptions });
    response.cookies.set({ name: 'auth_token', value: token, ...cookieOptions });

    return response;
  } catch (error) {
    console.error('Server error during registration:', error);
    
    // Check for validation errors from mongoose
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          error: error.message
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Server error during registration',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
