import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

// Helper functions for API responses
function errorResponse(message, status = 500, errors) {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return NextResponse.json(response, { status });
}

function successResponse(message, data, status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      user: data,
    },
    { status }
  );
}

// Helper to find user by ID or UID (for OAuth users)
async function findUserByIdentifier(identifier) {
  // First try to find by MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const user = await User.findById(identifier);
    if (user) return user;
  }

  // If not found or not a valid ObjectId, try by uid (for OAuth users)
  return await User.findOne({ uid: identifier });
}

export async function POST(req, { params }) {
  try {
    await connectDB();

    const { userId } = await params;

    const data = await req.json();
    const user = await findUserByIdentifier(userId);

    if (!user) {
      return errorResponse('User not found', 404);
    }

    const profileData = data.profile || data;

    if (!user.profile) {
      user.profile = {};
    }

    if (profileData.profileImage !== undefined) {
      user.profile.profileImage = profileData.profileImage;
      if (user.authMethod === 'oauth') {
        user.picture = profileData.profileImage;
      }
    }

    if (profileData.fullName !== undefined) {
      user.profile.fullName = profileData.fullName;
      if (user.authMethod === 'oauth') {
        user.name = profileData.fullName;
      }
    }

    if (profileData.contact !== undefined) {
      user.profile.contact = profileData.contact;
    }

    if (profileData.dikshaPlace !== undefined) {
      user.profile.dikshaPlace = profileData.dikshaPlace;
    }

    if (profileData.address !== undefined) {
      user.profile.address = profileData.address;
    }

    if (profileData.wishes !== undefined) {
      user.profile.wishes = profileData.wishes;
    }

    if (profileData.personalStory !== undefined) {
      user.profile.personalStory = profileData.personalStory;
    }

    if (profileData.maritalStatus !== undefined) {
      user.profile.maritalStatus = profileData.maritalStatus;
    }

    if (profileData.age !== undefined) {
      user.profile.age = profileData.age !== null ? parseInt(profileData.age, 10) : null;
    }

    if (profileData.dob !== undefined) {
      user.profile.dob = profileData.dob ? new Date(profileData.dob) : null;
    }

    if (profileData.anniversary !== undefined) {
      user.profile.anniversary = profileData.anniversary ? new Date(profileData.anniversary) : null;
    } else if (profileData.maritalStatus === 'Unmarried') {
      user.profile.anniversary = null;
    }

    if (profileData.swamijiImages !== undefined) {
      if (Array.isArray(profileData.swamijiImages)) {
        user.profile.swamijiImages = profileData.swamijiImages
          .filter(img => img && typeof img === 'string' && img.trim() !== '')
          .slice(0, 6);
      } else if (typeof profileData.swamijiImages === 'string') {
        try {
          const parsed = JSON.parse(profileData.swamijiImages);
          if (Array.isArray(parsed)) {
            user.profile.swamijiImages = parsed
              .filter(img => img && typeof img === 'string' && img.trim() !== '')
              .slice(0, 6);
          } else {
            user.profile.swamijiImages = [profileData.swamijiImages].slice(0, 6);
          }
        } catch  {
          user.profile.swamijiImages = [profileData.swamijiImages].slice(0, 6);
        }
      } else if (profileData.swamijiImages === null || profileData.swamijiImages === '') {
        user.profile.swamijiImages = [];
      } else {
        user.profile.swamijiImages = [String(profileData.swamijiImages)].slice(0, 6);
      }
    }

    if (profileData.gender !== undefined) {
      user.profile.gender = profileData.gender;
    }

    if (profileData.familyMembers !== undefined) {
      // Ensure familyMembers is an array and validate each member
      if (Array.isArray(profileData.familyMembers)) {
        user.profile.familyMembers = profileData.familyMembers.map(member => ({
          age: typeof member.age === 'number' ? member.age : parseInt(member.age, 10),
          relation: member.relation?.trim(),
          name: member.name?.trim(),  // Add name field
          contact: member.contact?.trim()  // Add contact field
        })).filter(member => 
          member.age >= 0 && 
          member.age <= 120 && 
          member.relation && 
          member.relation.length <= 50 &&
          (!member.name || member.name.length <= 50) && // Validate name length
          (!member.contact || /^[0-9]{10}$/.test(member.contact)) // Validate contact format
        );
      } else {
        user.profile.familyMembers = [];
      }
    }

    // Make sure to mark these new fields as modified
    if (user.markModified) {
      user.markModified('profile.gender');
      user.markModified('profile.familyMembers');
    }

    const updateFields = {
      profile: user.profile,
      ...(user.authMethod === 'oauth' && {
        name: user.name,
        picture: user.picture,
      }),
    };

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    if (!updatedUser) {
      return errorResponse('Failed to update user profile', 500);
    }

    const userObject = updatedUser.toObject ? updatedUser.toObject() : { ...updatedUser };
    delete userObject.password;
    delete userObject.otp;
    delete userObject.otpExpiry;

    return successResponse('Profile updated successfully', userObject);
  } catch (error) {
    console.error('Profile update error:', error);

    if (error.name === 'ValidationError') {
      const errorMessages = {};
      if (error.errors) {
        Object.keys(error.errors).forEach(key => {
          errorMessages[key] = error.errors[key].message;
        });
      }
      return errorResponse('Validation failed', 400, errorMessages);
    }

    if (error.name === 'CastError') {
      return errorResponse('Invalid data format', 400);
    }

    return errorResponse(
      'Server error during profile update',
      500,
      process.env.NODE_ENV === 'development' ? error.message : undefined
    );
  }
}

// GET endpoint to fetch user profile
export async function GET(req, { params }) {
  try {
    await connectDB();

    const { userId } = await params;

    // Find user by either _id or uid
    const user = await findUserByIdentifier(userId);

    if (!user) {
      return errorResponse('User not found', 404);
    }

    const userObject = user.toObject ? user.toObject() : { ...user };
    delete userObject.password;
    delete userObject.otp;
    delete userObject.otpExpiry;

    return NextResponse.json(
      {
        success: true,
        _id: user._id,
        authMethod: user.authMethod,
        profile: user.profile || {},
        user: userObject,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse('Server error fetching profile', 500);
  }
}
