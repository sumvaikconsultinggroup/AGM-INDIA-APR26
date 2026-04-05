import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import MantraDiksha, { IMantraDiksha } from '@/models/MantraDiksha';
import getCloudinary from '@/utils/cloudinary';

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: IMantraDiksha[] | Partial<IMantraDiksha>[];
  error?: string;
}

interface ExistingRegistrationQuery {
  mobileNumber: string;
  isDeleted: boolean;
  $or?: Array<{ mobileNumber: string } | { aadhaarNumber: string } | { passportNumber: string } | { email: string }>;
}

interface RegistrationData {
  fullName: string;
  dateOfBirth: Date;
  gender: string;
  nationality: string;
  mobileNumber: string;
  email: string | null;
  whatsappNumber: string | null;
  spiritualIntent?: string | null;
  spiritualPath?: string | null;
  previousDiksha?: string | null;
  recentPhoto: string | null;
  registrationDate: Date;
  aadhaarNumber?: string;
  aadhaarDocument?: string | null;
  passportNumber?: string;
  passportDocument?: string | null;
}

// Helper function to send congratulations email
async function sendCongratulationsEmail(
  email: string,
  fullName: string,
  registrationDate: Date
): Promise<boolean> {
  try {
    const emailPayload = {
      to: email,
      subject: '🙏 Congratulations! Your Mantra Diksha Registration is Complete',
      text: `
Dear ${fullName},

Namaste! 🙏

Congratulations on successfully registering for Mantra Diksha. Your spiritual journey with us begins now.

Registration Details:
- Name: ${fullName}
- Registration Date: ${registrationDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })}
- Registration Time: ${registrationDate.toLocaleTimeString('en-IN')}

What's Next:
- Our team will review your application within 2-3 business days
- You will receive further instructions via email once your application is approved
- Please keep your mobile phone accessible as we may contact you for any clarifications

Important Notes:
- Please arrive 30 minutes early on the day of your diksha
- Bring a clean white cloth and some flowers as offerings
- Maintain a peaceful and receptive state of mind
- Avoid non-vegetarian food and alcohol 24 hours before the ceremony

Spiritual Guidelines:
- Practice daily meditation and prayer
- Read spiritual texts to prepare your mind
- Maintain purity in thoughts, words, and actions
- Approach the diksha with complete faith and devotion

May this sacred initiation bring you peace, wisdom, and spiritual enlightenment.

Om Shanti Shanti Shanti 🕉️

With Divine Blessings,
SwamiG Spiritual Center

For any queries, please contact us:
📞 Phone: [Your Contact Number]
📧 Email: [Your Email]
🌐 Website: [Your Website]

Note: This is an automated message. Please do not reply to this email.
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mantra Diksha Registration Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            🙏 Mantra Diksha Registration
        </h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">
            Congratulations ${fullName}!
        </p>
    </div>
    
    <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 48px; margin-bottom: 10px;">🕉️</div>
            <h2 style="color: #B82A1E; margin: 0;">Namaste!</h2>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            We are delighted to confirm that your registration for <strong>Mantra Diksha</strong> has been successfully completed. 
            Your spiritual journey with us begins now.
        </p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #B82A1E;">
            <h3 style="color: #B82A1E; margin-top: 0;">📋 Registration Details</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${fullName}</p>
            <p style="margin: 5px 0;"><strong>Registration Date:</strong> ${registrationDate.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}</p>
            <p style="margin: 5px 0;"><strong>Registration Time:</strong> ${registrationDate.toLocaleTimeString('en-IN')}</p>
        </div>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">✨ What's Next?</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Our team will review your application within <strong>2-3 business days</strong></li>
                <li>You will receive further instructions via email once approved</li>
                <li>Keep your mobile phone accessible for any clarifications</li>
            </ul>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">📝 Important Guidelines</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Arrive <strong>30 minutes early</strong> on the day of diksha</li>
                <li>Bring a clean white cloth and fresh flowers as offerings</li>
                <li>Avoid non-vegetarian food and alcohol <strong>24 hours before</strong> the ceremony</li>
                <li>Maintain purity in thoughts, words, and actions</li>
            </ul>
        </div>
        
        <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
            <h3 style="color: #004085; margin-top: 0;">🧘‍♀️ Spiritual Preparation</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Practice daily meditation and prayer</li>
                <li>Read spiritual texts to prepare your mind</li>
                <li>Approach the diksha with complete faith and devotion</li>
                <li>Maintain a peaceful and receptive state of mind</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #ff6b35, #f7931e); border-radius: 8px;">
            <p style="color: white; font-size: 18px; margin: 0; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
                May this sacred initiation bring you peace, wisdom, and spiritual enlightenment.
            </p>
            <p style="color: white; font-size: 20px; margin: 10px 0 0 0; font-weight: bold;">
                Om Shanti Shanti Shanti 🕉️
            </p>
        </div>
        
        <div style="border-top: 2px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="margin: 10px 0; color: #666;">
                <strong>With Divine Blessings,</strong><br>
                SwamiG Spiritual Center
            </p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p style="margin: 5px 0; font-size: 14px; color: #666;">
                    <strong>Contact Us:</strong><br>
                    📞 Phone: [Your Contact Number]<br>
                    📧 Email: [Your Email]<br>
                    🌐 Website: [Your Website]
                </p>
            </div>
            
            <p style="font-size: 12px; color: #999; margin-top: 20px; text-align: center;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
      `,
    };

    // Call the email API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sendemail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await response.json();
    
    if (result.success) {
      // console.log('Congratulations email sent successfully to:', email);
      return true;
    } else {
      console.error('Failed to send congratulations email:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Error sending congratulations email:', error);
    return false;
  }
}

// Helper function to upload file to Cloudinary
async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const cloudinary = getCloudinary();
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: 'auto',
          folder: `mantra-diksha/${folder}`,
          transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto:good' }],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result?.secure_url || '');
          }
        }
      )
      .end(buffer);
  });
}

// GET - Fetch all Mantra Diksha registrations
export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const registrations = await MantraDiksha.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: registrations as unknown as IMantraDiksha[],
    });
  } catch (error) {
    console.error('Error fetching mantra diksha registrations:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch registrations',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST - Create new Mantra Diksha registration with file uploads
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const formData = await request.formData();
    // console.log('Received form data:', formData);

    // Extract common form data
    const fullName = formData.get('fullName') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const gender = formData.get('gender') as string;
    const nationality = (formData.get('nationality') as string) || 'Indian';
    const mobileNumber = formData.get('mobileNumber') as string;
    const email = formData.get('email') as string;

    // Extract optional spiritual form data
    const spiritualIntent = formData.get('spiritualIntent') as string;
    const spiritualPath = formData.get('spiritualPath') as string;
    const previousDiksha = formData.get('previousDiksha') as string;

    // Extract optional form data
    const whatsappNumber = formData.get('whatsappNumber') as string;
    const aadhaarNumber = formData.get('aadhaarNumber') as string;
    const passportNumber = formData.get('passportNumber') as string;

    // Get files
    const aadhaarDocument = formData.get('aadhaarDocument') as File | null;
    const passportDocument = formData.get('passportDocument') as File | null;
    const recentPhoto = formData.get('recentPhoto') as File | null;

    // Debug log to check nationality value
    // console.log('Nationality received:', nationality, 'Type:', typeof nationality);

    // Validate common required fields
    const commonRequiredFields = {
      fullName,
      dateOfBirth,
      gender,
      mobileNumber,
      email,
    };

    const missingCommonFields = Object.entries(commonRequiredFields)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingCommonFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
          error: `Missing: ${missingCommonFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Normalize nationality for comparison
    const normalizedNationality = nationality.trim().toLowerCase();
    const isIndian = normalizedNationality === 'indian' || normalizedNationality === 'india';

    // console.log('Normalized nationality:', normalizedNationality, 'Is Indian:', isIndian);

    // Validate nationality-specific required fields
    if (isIndian) {
      const indianRequiredFields = {
        aadhaarNumber,
      };

      const missingIndianFields = Object.entries(indianRequiredFields)
        .filter(([, value]) => !value)
        .map(([key]) => key);

      if (missingIndianFields.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'Missing required fields for Indian nationality',
            error: `Missing: ${missingIndianFields.join(', ')}`,
          },
          { status: 400 }
        );
      }

      if (!aadhaarDocument || aadhaarDocument.size === 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'Aadhaar document is required for Indian nationality',
          },
          { status: 400 }
        );
      }
    } else {
      // Non-Indian nationality
      if (!passportNumber) {
        return NextResponse.json(
          {
            success: false,
            message: 'Passport number is required for non-Indian nationality',
          },
          { status: 400 }
        );
      }

      if (!passportDocument || passportDocument.size === 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'Passport document is required for non-Indian nationality',
          },
          { status: 400 }
        );
      }
    }

    // Check if registration already exists
    const existingQuery: ExistingRegistrationQuery = { mobileNumber, isDeleted: false };

    if (isIndian && aadhaarNumber) {
      existingQuery.$or = [
        { mobileNumber },
        { aadhaarNumber },
        { email }
      ];
    } else if (!isIndian && passportNumber) {
      existingQuery.$or = [
        { mobileNumber },
        { passportNumber },
        { email }
      ];
    } else {
      existingQuery.$or = [
        { mobileNumber },
        { email }
      ];
    }

    const existingRegistration = await MantraDiksha.findOne(existingQuery);

    if (existingRegistration) {
      let conflictMessage = 'Registration already exists with this mobile number';
      if (isIndian) {
        conflictMessage += ', Aadhaar number, or email address';
      } else {
        conflictMessage += ', passport number, or email address';
      }
      
      return NextResponse.json(
        {
          success: false,
          message: conflictMessage,
        },
        { status: 409 }
      );
    }

    // Upload files to Cloudinary
    let aadhaarDocumentUrl = '';
    let passportDocumentUrl = '';
    let recentPhotoUrl = '';

    try {
      // Upload Aadhaar document for Indian nationality
      if (isIndian && aadhaarDocument && aadhaarDocument.size > 0) {
        aadhaarDocumentUrl = await uploadToCloudinary(aadhaarDocument, 'aadhaar-documents');
      }

      // Upload passport document for non-Indian nationality
      if (!isIndian && passportDocument && passportDocument.size > 0) {
        passportDocumentUrl = await uploadToCloudinary(passportDocument, 'passport-documents');
      }

      // Upload recent photo (optional for all)
      if (recentPhoto && recentPhoto.size > 0) {
        recentPhotoUrl = await uploadToCloudinary(recentPhoto, 'photos');
      }
    } catch (uploadError) {
      console.error('Error uploading files:', uploadError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to upload documents',
          error: uploadError instanceof Error ? uploadError.message : 'Upload error',
        },
        { status: 500 }
      );
    }

    // Prepare registration data
    const registrationData: RegistrationData = {
      fullName,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      nationality: isIndian ? 'Indian' : nationality,
      mobileNumber,
      email: email || null,
      whatsappNumber: whatsappNumber || null,
      spiritualIntent: spiritualIntent || null,
      spiritualPath: spiritualPath || null,
      previousDiksha: previousDiksha || null,
      recentPhoto: recentPhotoUrl || null,
      registrationDate: new Date(),
    };

    // Add nationality-specific fields
    if (isIndian) {
      registrationData.aadhaarNumber = aadhaarNumber;
      registrationData.aadhaarDocument = aadhaarDocumentUrl || null;
    } else {
      registrationData.passportNumber = passportNumber;
      registrationData.passportDocument = passportDocumentUrl || null;
    }

    // Create new registration
    const newRegistration = new MantraDiksha(registrationData);
    const savedRegistration = await newRegistration.save();

    // Send congratulations email (don't block the response if email fails)
    if (email) {
      sendCongratulationsEmail(email, fullName, registrationData.registrationDate)
        .then((success) => {
          if (success) {
            console.log('✅ Congratulations email sent successfully');
          } else {
            console.log('⚠️ Failed to send congratulations email, but registration was successful');
          }
        })
        .catch((error) => {
          console.error('❌ Error in email sending process:', error);
        });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Registration submitted successfully! A confirmation email has been sent to your email address.',
        data: [savedRegistration],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating mantra diksha registration:', error);

    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create registration',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
