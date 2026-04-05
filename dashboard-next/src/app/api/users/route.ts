import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User, { IUser } from '@/models/User';
import getCloudinary from '@/utils/cloudinary';
import { UploadApiResponse } from 'cloudinary';
import { FilterQuery } from 'mongoose';

// Simple API response type
type ApiResponse = {
  success: boolean;
  message: string;
  data?: IUser | IUser[] | null;
  error?: string;
};

type NewUserInput = {
  email: string;
  authMethod: string | null;
  role?: FormDataEntryValue | string;
  status?: FormDataEntryValue | string;
  isOTPVerified?: boolean;
  username?: string;
  password?: string;
  uid?: string;
  name?: string;
  picture?: string;
  profile: {
    profileImage?: string;
    fullName?: string;
    age?: string;
    contact?: string;
    dikshaPlace?: string;
    address?: string;
    wishes?: string;
    personalStory?: string;
    maritalStatus?: string;
    dob?: Date;
    anniversary?: Date;
  };
};


/**
 * GET handler for retrieving users
 */
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    // Get search parameters
    const url = new URL(req.url);
    const searchTerm = url.searchParams.get('search');
    const authMethod = url.searchParams.get('authMethod'); // Filter by auth method

    // Basic filter to exclude deleted users
 const filter:FilterQuery<IUser> = { isDeleted: { $ne: true } };

    // Add auth method filter if provided
    if (authMethod && ['normal', 'oauth'].includes(authMethod)) {
      filter.authMethod = authMethod;
    }

    // Add search functionality if search term provided
    if (searchTerm) {
      filter.$or = [
        { email: { $regex: searchTerm, $options: 'i' } },
        { 'profile.fullName': { $regex: searchTerm, $options: 'i' } },
      ];

      // Add auth-specific search fields
      if (!authMethod || authMethod === 'normal') {
        filter.$or.push({ username: { $regex: searchTerm, $options: 'i' } });
      }

      if (!authMethod || authMethod === 'oauth') {
        filter.$or.push({ name: { $regex: searchTerm, $options: 'i' } });
        filter.$or.push({ uid: { $regex: searchTerm, $options: 'i' } });
      }
    }

    // Fetch users - exclude sensitive fields
    const users = await User.find(filter)
      .select('-password -otp -otpExpiry')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Users fetched successfully',
      data: users as unknown as IUser[],
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch users',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new normal auth user
 */
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();


    // Parse form data
    const formData = await req.formData();


    const authMethod = (formData.get('authMethod') as string) || 'normal';

    if (!['normal', 'oauth'].includes(authMethod)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid authentication method',
        },
        { status: 400 }
      );
    }

    // Extract user info based on auth method
    const userData: NewUserInput = {
      email: formData.get('email') as string,
      authMethod,
      role: formData.get('role') || 'user',
      status: formData.get('status') || 'active',
      username: formData.get('username') as string,
      isOTPVerified: false,
      profile: {}
    };

    // Handle normal auth users
    if (authMethod === 'normal') {
      const username = formData.get('username') as string;
      const password = formData.get('password') as string;

      // Validate required fields for normal auth
      if (!username || !password) {
        return NextResponse.json(
          {
            success: false,
            message: 'Username and password are required for normal authentication',
          },
          { status: 400 }
        );
      }

      // Add normal-specific fields
      userData.username = username;
      userData.password = password;

      // Check if username already exists
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return NextResponse.json(
          {
            success: false,
            message: 'Username already taken',
          },
          { status: 409 }
        );
      }
    }
    // Handle OAuth users
    else if (authMethod === 'oauth') {
      const uid = formData.get('uid') as string;
      const name = formData.get('name') as string;
      const picture = formData.get('picture') as string;

      // Validate required fields for OAuth
      if (!uid || !name) {
        return NextResponse.json(
          {
            success: false,
            message: 'UID and name are required for OAuth authentication',
          },
          { status: 400 }
        );
      }

      // Add OAuth-specific fields
      userData.uid = uid;
      userData.name = name;
      if (picture) {
        userData.picture = picture;
      }

      // Check if uid already exists
      const existingUid = await User.findOne({ uid });
      if (existingUid) {
        return NextResponse.json(
          {
            success: false,
            message: 'User with this UID already exists',
          },
          { status: 409 }
        );
      }
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: userData.email });
    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email address already in use',
        },
        { status: 409 }
      );
    }

    // Handle profile data
    userData.profile = {};

    // Get and process profile image if provided
    const profileImage = formData.get('profileImage') as File | null;

    // If profile image not provided, use picture for OAuth users or default placeholder
    if (!profileImage && authMethod === 'oauth' && userData.picture) {
      userData.profile.profileImage = userData.picture;
    } else {
      userData.profile.profileImage = '/placeholder.svg';
    }

    // Upload profile image if provided
    if (profileImage && profileImage instanceof File && profileImage.size > 0) {
      try {
        const arrayBuffer = await profileImage.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const cloudinary = getCloudinary();
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: 'users/profiles',
                transformation: [{ width: 400, height: 400, crop: 'fill' }],
              },
              (err, result) => {
                if (err) reject(err);
                else resolve(result as UploadApiResponse);
              }
            )
            .end(buffer);
        });

        userData.profile.profileImage = result.secure_url;
      } catch (err) {
        console.error('Error uploading image:', err);
        // Continue with default image or OAuth picture
      }
    }

    // Set fullName based on auth method
    userData.profile.fullName =
      (formData.get('fullName') as string) ||
      (authMethod === 'oauth' ? userData.name : userData.username);

    // Add additional profile fields if provided
    const optionalProfileFields = [
      'age',
      'contact',
      'dikshaPlace',
      'address',
      'wishes',
      'personalStory',
      'maritalStatus',
      'dob',
    ];

    for (const field of optionalProfileFields) {
      const value = formData.get(field);
      if (value) {
        userData.profile[field] = field === 'dob' ? new Date(value as string) : value;
      }
    }

    // Handle anniversary date for married users
    if (userData.profile.maritalStatus === 'Married') {
      const anniversary = formData.get('anniversary');
      if (anniversary) {
        userData.profile.anniversary = new Date(anniversary as string);
      }
    }

    // Create new user
    const newUser = new User(userData);
    await newUser.save();

    // Remove sensitive data from response
    const responseUser = newUser.toObject();
    delete responseUser.password;
    delete responseUser.otp;
    delete responseUser.otpExpiry;

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        data: responseUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);

    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
