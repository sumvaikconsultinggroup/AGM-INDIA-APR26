import { NextResponse } from 'next/server';
import Volunteer from '@/models/Volunteer';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload file to Cloudinary
async function uploadToCloudinary(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'volunteer-profiles',
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'webp'],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}

// Helper function to delete file from Cloudinary
async function deleteFromCloudinary(imageUrl) {
  try {
    const urlParts = imageUrl.split('/');
    const fileWithExtension = urlParts[urlParts.length - 1];
    const publicId = `volunteer-profiles/${fileWithExtension.split('.')[0]}`;

    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
}

// GET a single volunteer by ID
export async function GET(req, { params }) {
  try {
    await connectDB();

    const id = params.id;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid volunteer ID format',
        },
        { status: 400 }
      );
    }

    // Find volunteer by ID, excluding deleted ones
    const volunteer = await Volunteer.findOne({ _id: id, isDeleted: false });

    if (!volunteer) {
      return NextResponse.json(
        {
          success: false,
          message: 'Volunteer not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Volunteer fetched successfully',
        data: volunteer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET Volunteer By ID Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch volunteer',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT/UPDATE a volunteer by ID
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const id = params.id;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid volunteer ID format' },
        { status: 400 }
      );
    }

    const existingVolunteer = await Volunteer.findOne({ _id: id, isDeleted: false });

    if (!existingVolunteer) {
      return NextResponse.json({ success: false, message: 'Volunteer not found' }, { status: 404 });
    }

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const profileFile = formData.get('profile');

      if (profileFile && profileFile.size > 0) {
        if (profileFile.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { success: false, message: 'Profile file size must be less than 5MB' },
            { status: 400 }
          );
        }

        const allowedTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'application/pdf',
        ];
        if (!allowedTypes.includes(profileFile.type)) {
          return NextResponse.json(
            {
              success: false,
              message: 'Profile must be an image (JPG, PNG, WEBP) or PDF file',
            },
            { status: 400 }
          );
        }

        try {
          if (existingVolunteer.profile) {
            await deleteFromCloudinary(existingVolunteer.profile);
          }
          const profileUrl = await uploadToCloudinary(profileFile);
          existingVolunteer.profile = profileUrl;
        } catch (uploadError) {
          console.error('Cloudinary upload error:', uploadError);
          return NextResponse.json(
            { success: false, message: 'Failed to upload profile file' },
            { status: 500 }
          );
        }
      }

      const updateFields = [
        'fullName',
        'email',
        'phone',
        'location',
        'age',
        'occupationType',
        'occupation',
        'motivation',
        'experience',
        'city',
        'state',
        'country',
        'zip',
        'maritalStatus',
        'gender',
        'highestEducation',
        'hoursAvailable',
      ];

      for (const field of updateFields) {
        const value = formData.get(field);
        if (value !== null && value !== undefined) {
          if (field === 'age') {
            const age = Number(value);
            if (!isNaN(age) && age >= 18 && age <= 100) {
              existingVolunteer.age = age;
            }
          } else if (field === 'hoursAvailable') {
            const hoursAvailableStr = formData.get('hoursAvailable');
            if (hoursAvailableStr) {
              try {
                const parsed = JSON.parse(hoursAvailableStr);
                if (parsed.hours !== undefined && parsed.period) {
                  existingVolunteer.hoursAvailable = parsed;
                }
              } catch {
                console.error('Could not parse hoursAvailable JSON string:', hoursAvailableStr);
              }
            }
          } else {
            existingVolunteer[field] = typeof value === 'string' ? value.trim() : value;
          }
        }
      }

      const availabilityStr = formData.get('availability');
      if (availabilityStr) {
        try {
          const availability = JSON.parse(availabilityStr);
          if (Array.isArray(availability) && availability.length > 0) {
            existingVolunteer.availability = availability;
          }
        } catch {
          console.error('Error parsing availability');
        }
      }

      const skillsStr = formData.get('skills');
      if (skillsStr) {
        try {
          const skills = JSON.parse(skillsStr);
          if (Array.isArray(skills) && skills.length > 0) {
            existingVolunteer.skills = skills;
          }
        } catch {
          console.error('Error parsing skills');
        }
      }

      const availableFromStr = formData.get('availableFrom');
      if (availableFromStr) {
        existingVolunteer.availableFrom = new Date(availableFromStr);
      }

      const availableUntilStr = formData.get('availableUntil');
      if (availableUntilStr) {
        existingVolunteer.availableUntil = new Date(availableUntilStr);
      }

      const isApprovedStr = formData.get('isApproved');
      if (isApprovedStr !== null) {
        existingVolunteer.isApproved = isApprovedStr === 'true';
      }

      const consentStr = formData.get('consent');
      if (consentStr !== null) {
        existingVolunteer.consent = consentStr === 'true';
      }
    } else {
      const updateData = await req.json();

      const allowedFields = [
        'fullName',
        'email',
        'phone',
        'location',
        'age',
        'occupationType',
        'occupation',
        'availability',
        'availableFrom',
        'availableUntil',
        'skills',
        'motivation',
        'experience',
        'isApproved',
        'consent',
        'city',
        'state',
        'country',
        'zip',
        'maritalStatus',
        'gender',
        'highestEducation',
        'hoursAvailable',
      ];

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          if (field === 'age') {
            const age = Number(updateData[field]);
            if (!isNaN(age) && age >= 18 && age <= 100) {
              existingVolunteer.age = age;
            }
          } else if (field === 'hoursAvailable') {
            const { hours, period } = updateData.hoursAvailable;
            
            if (
              typeof hours === 'number' && 
              hours >= 0 && 
              ['day', 'week', 'month'].includes(period)
            ) {
              existingVolunteer.hoursAvailable = {
                hours,
                period
              };
            }
          } else if (field === 'availableFrom' || field === 'availableUntil') {
            if (updateData[field]) {
              existingVolunteer[field] = new Date(updateData[field]);
            }
          } else if (field === 'availability' || field === 'skills') {
            if (Array.isArray(updateData[field]) && updateData[field].length > 0) {
              existingVolunteer[field] = updateData[field];
            }
          } else if (field === 'isApproved' || field === 'consent') {
            if (typeof updateData[field] === 'boolean') {
              existingVolunteer[field] = updateData[field];
            }
          } else {
            existingVolunteer[field] = updateData[field];
          }
        }
      }

      if (updateData.deleteProfile === true && existingVolunteer.profile) {
        await deleteFromCloudinary(existingVolunteer.profile);
        existingVolunteer.profile = undefined;
      }
    }

    if (existingVolunteer.motivation && existingVolunteer.motivation.length < 50) {
      return NextResponse.json(
        { success: false, message: 'Motivation should be at least 50 characters long' },
        { status: 400 }
      );
    }

    if (existingVolunteer.availableFrom && existingVolunteer.availableUntil) {
      if (existingVolunteer.availableUntil <= existingVolunteer.availableFrom) {
        return NextResponse.json(
          { success: false, message: 'Available until date must be after available from date' },
          { status: 400 }
        );
      }
    }

    if (existingVolunteer.isModified && existingVolunteer.isModified('email')) {
      const emailConflict = await Volunteer.findOne({
        email: existingVolunteer.email,
        _id: { $ne: id },
        isDeleted: false,
      });

      if (emailConflict) {
        return NextResponse.json(
          { success: false, message: 'A volunteer with this email already exists' },
          { status: 409 }
        );
      }
    }

    await existingVolunteer.save();

    return NextResponse.json(
      { success: true, message: 'Volunteer updated successfully', data: existingVolunteer },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT Volunteer Error:', error);

    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, message: 'Validation error', error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update volunteer',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE a volunteer by ID (soft delete)
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const id = params.id;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid volunteer ID format',
        },
        { status: 400 }
      );
    }

    // Find the volunteer first to check if it exists and isn't already deleted
    const existingVolunteer = await Volunteer.findOne({ _id: id, isDeleted: false });

    if (!existingVolunteer) {
      return NextResponse.json(
        {
          success: false,
          message: 'Volunteer not found or already deleted',
        },
        { status: 404 }
      );
    }

    // Perform a soft delete by setting isDeleted flag
    existingVolunteer.isDeleted = true;
    await existingVolunteer.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Volunteer deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE Volunteer Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete volunteer',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
