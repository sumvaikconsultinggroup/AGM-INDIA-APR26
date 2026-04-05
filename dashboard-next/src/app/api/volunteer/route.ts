import { NextRequest, NextResponse } from 'next/server';
import Volunteer, { IVolunteer } from '@/models/Volunteer';
import { connectDB } from '@/lib/mongodb';
import { sendEmail } from '@/utils/sendEmail';
import { v2 as cloudinary } from 'cloudinary';

type ApiResponse = {
  success: boolean;
  message: string;
  data?: IVolunteer | IVolunteer[] | null;
  error?: string;
  validationErrors?: Record<string, string>;
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'volunteer-profiles',
        resource_type: 'auto', // Supports images and PDFs
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'webp'],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    // Simple query to get all non-deleted volunteers, newest first
    const volunteers = await Volunteer.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();

    if (!volunteers?.length) {
      return NextResponse.json(
        {
          success: false,
          message: 'No volunteers found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Volunteers fetched successfully',
        data: volunteers as unknown as IVolunteer[],
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('GET Volunteers Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch volunteers',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST create new volunteer
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const formData = await req.formData();

    console.log('Form Data:', formData);
    // Extract file if present
    const profileFile = formData.get('profile') as File | null;
    let profileUrl: string | undefined;

    // Upload profile to Cloudinary if provided
    if (profileFile && profileFile.size > 0) {
      // Validate file size (e.g., max 5MB)
      if (profileFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            success: false,
            message: 'Profile file size must be less than 5MB',
          },
          { status: 400 }
        );
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
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
        profileUrl = await uploadToCloudinary(profileFile);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return NextResponse.json(
          {
            success: false,
            message: 'Failed to upload profile file',
          },
          { status: 500 }
        );
      }
    }

    // Extract other form data
    const data = {
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      age: formData.get('age') as string,
      occupationType: formData.get('occupationType') as string,
      occupation: formData.get('occupation') as string,
      availability: JSON.parse(formData.get('availability') as string || '[]'),
      availableFrom: formData.get('availableFrom') as string,
      availableUntil: formData.get('availableUntil') as string,
      skills: JSON.parse(formData.get('skills') as string || '[]'),
      motivation: formData.get('motivation') as string,
      experience: formData.get('experience') as string,
      consent: formData.get('consent') === 'true',
      profile: profileUrl,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      country: formData.get('country') as string,
      zip: formData.get('zip') as string,
      maritalStatus: formData.get('maritalStatus') as string,
      gender: formData.get('gender') as string,
      highestEducation: formData.get('highestEducation') as string,
      hoursAvailable: formData.get('hoursAvailable') as string | null,
    };

    // Required fields validation
    const requiredFields = [
      'fullName',
      'email',
      'phone',
      'age',
      'occupationType',
      'availability',
      'skills',
      'motivation',
      'consent',
    ];

    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate consent
    if (data.consent !== true) {
      return NextResponse.json(
        {
          success: false,
          message: 'Consent is required to proceed',
        },
        { status: 400 }
      );
    }

    // Validate age
    const age = Number(data.age);
    if (isNaN(age) || age < 18 || age > 100) {
      return NextResponse.json(
        {
          success: false,
          message: 'Age must be between 18 and 100',
        },
        { status: 400 }
      );
    }

    // Validate motivation length
    if (data.motivation.length < 50) {
      return NextResponse.json(
        {
          success: false,
          message: 'Motivation should be at least 50 characters long',
        },
        { status: 400 }
      );
    }

    // Validate availability array
    if (!Array.isArray(data.availability) || data.availability.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'At least one availability option must be selected',
        },
        { status: 400 }
      );
    }

    // Validate skills array
    if (!Array.isArray(data.skills) || data.skills.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'At least one skill must be selected',
        },
        { status: 400 }
      );
    }

    // Validate occupation based on occupationType
    if (
      data.occupationType &&
      data.occupationType !== 'unemployed' &&
      data.occupationType !== 'retired' &&
      data.occupationType !== 'student'
    ) {
      if (!data.occupation || data.occupation.trim() === '') {
        return NextResponse.json(
          {
            success: false,
            message: 'Occupation is required unless occupation type is unemployed, retired, or student',
          },
          { status: 400 }
        );
      }
    }

    // Parse dates if provided
    let availableFrom: Date | undefined;
    let availableUntil: Date | undefined;

    if (data.availableFrom) {
      availableFrom = new Date(data.availableFrom);
      if (availableFrom < new Date()) {
        return NextResponse.json(
          {
            success: false,
            message: 'Available from date cannot be in the past',
          },
          { status: 400 }
        );
      }
    }

    if (data.availableUntil) {
      availableUntil = new Date(data.availableUntil);
      if (availableFrom && availableUntil <= availableFrom) {
        return NextResponse.json(
          {
            success: false,
            message: 'Available until date must be after available from date',
          },
          { status: 400 }
        );
      }
    }

    // Check if email already exists
    const existingVolunteer = await Volunteer.findOne({ 
      email: data.email, 
      isDeleted: false 
    });
    
    if (existingVolunteer) {
      return NextResponse.json(
        {
          success: false,
          message: 'A volunteer with this email already exists',
        },
        { status: 409 }
      );
    }

    // Extract and validate hoursAvailable
    let hoursAvailableObj: { hours: number; period: 'day' | 'week' | 'month' } | undefined;
    if (data.hoursAvailable) {
      try {
        const parsed = JSON.parse(data.hoursAvailable);
        if (parsed.hours !== undefined && parsed.period) {
          hoursAvailableObj = {
            hours: Number(parsed.hours),
            period: parsed.period,
          };
        }
      } catch {
        console.error('Could not parse hoursAvailable JSON string:', data.hoursAvailable);
      }
    }


    // Create volunteer
    const volunteer = new Volunteer({
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      age: data.age,
      profile: profileUrl, // Store Cloudinary URL
      occupationType: data.occupationType.trim(),
      occupation: data.occupation ? data.occupation.trim() : undefined,
      availability: data.availability,
      availableFrom: availableFrom,
      availableUntil: availableUntil,
      skills: data.skills,
      motivation: data.motivation.trim(),
      experience: data.experience ? data.experience.trim() : undefined,
      consent: data.consent,
      city: data.city ? data.city.trim() : undefined,
      state: data.state ? data.state.trim() : undefined,
      country: data.country ? data.country.trim() : undefined,
      zip: data.zip ? data.zip.trim() : undefined,
      maritalStatus: data.maritalStatus ? data.maritalStatus.trim() : undefined,
      gender: data.gender ? data.gender.trim() : undefined,
      highestEducation: data.highestEducation ? data.highestEducation.trim() : undefined,
      hoursAvailable: hoursAvailableObj, // Add the new field
    });

    // Save to database
    await volunteer.save();

    // Send confirmation email
    try {
      const confirmationEmailSubject = "Thank you for your volunteer application";
      const locationParts = [volunteer.city, volunteer.state, volunteer.country].filter(Boolean);
      const fullLocation = locationParts.join(', ');
      
      const confirmationEmailText = `
        Dear ${volunteer.fullName},
        
        Thank you for submitting your volunteer application. We appreciate your interest in joining our team.
        
        Your application has been received and is under review. We will contact you shortly to discuss next steps.
        
        Details of your application:
        - Name: ${volunteer.fullName}
        - Email: ${volunteer.email}
        - Phone: ${volunteer.phone}
        - Location: ${fullLocation}
        - Skills: ${volunteer.skills.join(', ')}
        
        If you have any questions, please don't hesitate to contact us.
        
        Best regards,
        The Volunteer Coordination Team
      `;

      const confirmationEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f6df5;">Thank You for Your Application</h1>
          </div>
          
          <p>Dear <strong>${volunteer.fullName}</strong>,</p>
          
          <p>Thank you for submitting your volunteer application. We appreciate your interest in joining our team.</p>
          
          <p>Your application has been received and is under review. We will contact you shortly to discuss next steps.</p>
          
          <div style="background-color: #f7f9fc; border-left: 4px solid #4f6df5; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Application Details:</h3>
            <p><strong>Name:</strong> ${volunteer.fullName}</p>
            <p><strong>Email:</strong> ${volunteer.email}</p>
            <p><strong>Phone:</strong> ${volunteer.phone}</p>
            <p><strong>Location:</strong> ${fullLocation}</p>
            <p><strong>Skills:</strong> ${volunteer.skills.join(', ')}</p>
          </div>
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br />The Volunteer Coordination Team</p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      `;
      
      await sendEmail(
        volunteer.email,
        confirmationEmailSubject,
        confirmationEmailText,
        confirmationEmailHtml
      );
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Volunteer application submitted successfully',
        data: volunteer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST Volunteer Error:', error);

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
        message: 'Failed to submit volunteer application',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
