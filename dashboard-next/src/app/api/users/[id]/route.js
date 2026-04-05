import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import getCloudinary from '@/utils/cloudinary';

/**
 * GET handler for retrieving a specific user by ID
 */
export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;

    // Check if we're looking up by uid (for OAuth users) or by _id
    let user;
    
    // First try to find by _id (MongoDB ObjectId)
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findOne({ _id: id, isDeleted: { $ne: true } })
        .select('-password -otp -otpExpiry')
        .lean();
    }
    
    // If not found, try to find by uid (OAuth identifier)
    if (!user) {
      user = await User.findOne({ uid: id, isDeleted: { $ne: true } })
        .select('-password -otp -otpExpiry')
        .lean();
    }
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'User fetched successfully',
      data: user
    }, {
      status: 200,
      headers: {
        // Cache for 1 minute, allow revalidation for 30 seconds
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=30'
      }
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * PUT handler for updating a specific user by ID
 */
export async function PUT(req, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    console.log('Updating user with ID:', id);
    
    // Find user to update - check both _id and uid fields
    let existingUser;
    
    // First try to find by _id (MongoDB ObjectId)
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      existingUser = await User.findOne({ _id: id, isDeleted: { $ne: true } });
    }
    
    // If not found, try to find by uid (OAuth identifier)
    if (!existingUser) {
      existingUser = await User.findOne({ uid: id, isDeleted: { $ne: true } });
    }
    
    if (!existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }
    
    // Get form data
    const formData = await req.formData();
    console.log('Form data received');
    
    // Build update object
    const updateData = {};

    // Core user properties - be careful with auth method-specific fields
    const authMethod = existingUser.authMethod; // Get the existing auth method
    console.log('Auth method:', authMethod);
    
    // Handle fields based on auth method
    if (authMethod === 'normal') {
      // Username can only be updated for normal auth users
      const username = formData.get('username');
      if (username) {
        // Check if username is taken by another user
        const usernameExists = await User.findOne({ 
          _id: { $ne: existingUser._id }, 
          username, 
          isDeleted: { $ne: true } 
        });
        
        if (usernameExists) {
          return NextResponse.json({
            success: false,
            message: 'Username is already taken'
          }, { status: 409 });
        }
        
        updateData.username = username;
      }
      
      // Password update for normal auth users
      const password = formData.get('password');
      if (password) {
        // Password will be hashed by the pre-save hook
        updateData.password = password;
      }
    } 
    else if (authMethod === 'oauth') {
      // Name field can be updated for OAuth users
      const name = formData.get('name');
      if (name) {
        updateData.name = name;
      }
      
      // Picture URL can be updated for OAuth users
      const picture = formData.get('picture');
      if (picture) {
        updateData.picture = picture;
      }
    }
    
    // Common fields that can be updated for any user type
    const email = formData.get('email');
    const status = formData.get('status');
    const role = formData.get('role');
    
    if (email) {
      // Check if email is taken by another user
      const emailExists = await User.findOne({ 
        _id: { $ne: existingUser._id }, 
        email, 
        isDeleted: { $ne: true } 
      });
      
      if (emailExists) {
        return NextResponse.json({
          success: false,
          message: 'Email is already taken'
        }, { status: 409 });
      }
      
      updateData.email = email;
    }
    
    if (status && ['active', 'inactive', 'suspended'].includes(status)) {
      updateData.status = status;
    }
    
    if (role && ['user', 'admin', 'editor', 'moderator'].includes(role)) {
      updateData.role = role;
    }
    
    // Profile properties - these work the same for both auth methods
    const fullName = formData.get('fullName');
    const age = formData.has('age') ? parseInt(formData.get('age')) : null;
    const contact = formData.get('contact');
    const dikshaPlace = formData.get('dikshaPlace');
    const address = formData.get('address');
    const wishes = formData.get('wishes');
    const personalStory = formData.get('personalStory');
    const maritalStatus = formData.get('maritalStatus');
    
    // Handle dates
    const dob = formData.get('dob');
    const anniversary = formData.get('anniversary');
    
    // Profile image handling
    const profileImage = formData.get('profileImage');
    
    // Initialize profile update if needed
    if (fullName || age !== null || contact || dikshaPlace || address || 
        wishes || personalStory || maritalStatus || dob || anniversary || profileImage) {
      updateData.profile = updateData.profile || {};
      
      // Add profile fields if provided
      if (fullName) updateData.profile.fullName = fullName;
      if (age !== null) updateData.profile.age = age;
      if (contact) updateData.profile.contact = contact;
      if (dikshaPlace) updateData.profile.dikshaPlace = dikshaPlace;
      if (address) updateData.profile.address = address;
      if (wishes) updateData.profile.wishes = wishes;
      if (personalStory) updateData.profile.personalStory = personalStory;
      if (maritalStatus && (maritalStatus === "Married" || maritalStatus === "Unmarried")) {
        updateData.profile.maritalStatus = maritalStatus;
        
        // Reset anniversary date if unmarried
        if (maritalStatus === "Unmarried") {
          updateData.profile.anniversary = null;
        }
      }
      
      // Parse dates
      if (dob) {
        try {
          updateData.profile.dob = new Date(dob);
        } catch (e) {
          console.error('Error parsing date of birth:', e);
          return NextResponse.json({
            success: false,
            message: 'Invalid date format for date of birth'
          }, { status: 400 });
        }
      }
      
      if (anniversary) {
        try {
          updateData.profile.anniversary = new Date(anniversary);
        } catch (e) {
          console.error('Error parsing anniversary date:', e);
          return NextResponse.json({
            success: false,
            message: 'Invalid date format for anniversary'
          }, { status: 400 });
        }
      }
      
      // Handle profile image upload
      if (profileImage && profileImage instanceof File && profileImage.size > 0) {
        // Upload image to Cloudinary
        try {
          const arrayBuffer = await profileImage.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          const cloudinary = getCloudinary();
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                folder: 'users/profiles',
                transformation: [{ width: 400, height: 400, crop: 'fill' }]
              },
              (err, result) => {
                if (err) reject(err);
                else resolve(result);
              }
            ).end(buffer);
          });
          
          // Update profile image URL
          updateData.profile.profileImage = result.secure_url;
          
          // If OAuth user, also update the main picture field
          if (authMethod === 'oauth') {
            updateData.picture = result.secure_url;
          }
        } catch (err) {
          console.error('Error uploading image:', err);
          // Continue without updating image
        }
      }
      
      // Handle swamijiImages array
      const swamijiImagesCount = parseInt(formData.get('swamijiImagesCount') || '0');
      if (swamijiImagesCount > 0) {
        const swamijiImages = [];
        
        // Get existing images to preserve
        const existingImagesToKeep = JSON.parse(formData.get('existingImagesToKeep') || '[]');
        swamijiImages.push(...existingImagesToKeep);
        
        // Process new images
        for (let i = 0; i < swamijiImagesCount; i++) {
          const imageFile = formData.get(`swamijiImage${i}`);
          if (imageFile && imageFile instanceof File && imageFile.size > 0) {
            try {
              const arrayBuffer = await imageFile.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              
              const cloudinary = getCloudinary();
              const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                  {
                    folder: 'users/swamiji-images',
                    transformation: [{ width: 800, height: 800, crop: 'limit' }]
                  },
                  (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                  }
                ).end(buffer);
              });
              
              swamijiImages.push(result.secure_url);
            } catch (err) {
              console.error('Error uploading swamiji image:', err);
            }
          }
        }
        
        // Validate maximum images
        if (swamijiImages.length > 6) {
          return NextResponse.json({
            success: false,
            message: 'You can upload a maximum of 6 Swamiji images'
          }, { status: 400 });
        }
        
        // Only update if we have any images
        if (swamijiImages.length > 0) {
          updateData.profile.swamijiImages = swamijiImages;
        }
      }
    }
    
    // Check if we have any data to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No data provided for update'
      }, { status: 400 });
    }
    
    console.log('Updating user with data:', JSON.stringify(updateData));
    
    // Use the correct ID field based on auth method
    const updateQuery = authMethod === 'oauth' ? { uid: existingUser.uid } : { _id: existingUser._id };
    
    // Update the user with runValidators to ensure validation runs
    const updatedUser = await User.findOneAndUpdate(
      updateQuery,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpiry').lean();
    
    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        error: error.message
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to update user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * DELETE handler for soft-deleting a user by ID
 */
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Find user to delete - check both _id and uid fields
    let existingUser;
    
    // First try to find by _id (MongoDB ObjectId)
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      existingUser = await User.findOne({ _id: id, isDeleted: { $ne: true } });
    }
    
    // If not found, try to find by uid (OAuth identifier)
    if (!existingUser) {
      existingUser = await User.findOne({ uid: id, isDeleted: { $ne: true } });
    }
    
    if (!existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }
    
    // Use the correct ID field based on auth method
    const updateQuery = existingUser.authMethod === 'oauth' ? { uid: existingUser.uid } : { _id: existingUser._id };
    
    // Perform soft delete by setting isDeleted flag
    const user = await User.findOneAndUpdate(
      updateQuery,
      { isDeleted: true, status: 'suspended' },
      { new: true }
    ).select('-password -otp -otpExpiry').lean();
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      data: user
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}