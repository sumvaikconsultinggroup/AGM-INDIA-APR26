import { NextRequest, NextResponse } from 'next/server';
import Talk, { ITalk } from '@/models/Talks';
import { connectDB } from '@/lib/mongodb';
import getCloudinary from '@/utils/cloudinary';

type ApiResponse = {
  success: boolean;
  message: string;
  data?: ITalk | ITalk[] | null;
  error?: string;
};

// Define a type for Cloudinary upload response
interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  width: number;
  height: number;
  format: string;
  created_at: string;
  resource_type: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  url: string;
  secure_url: string;
  signature: string;
  original_filename: string;
  folder: string;
}

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    // Convert file to buffer for Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary with specific folder and options
    const cloudinary = getCloudinary();
    const cloudinaryResponse = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'talks',
            resource_type: 'image',
            transformation: [
              { width: 800, height: 450, crop: 'fill', gravity: 'auto' }, // 16:9 aspect ratio
              { quality: 'auto:good' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as unknown as CloudinaryUploadResponse);
          }
        )
        .end(buffer);
    });

    // Return the secure URL
    return cloudinaryResponse.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    // Simple query to get all non-deleted talks, sorted by date (newest first)
    const talks = await Talk.find({ isDeleted: false }).sort({ date: -1 }).lean();

    if (!talks?.length) {
      return NextResponse.json(
        {
          success: false,
          message: 'No talks found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Talks fetched successfully',
        data: talks as unknown as ITalk[],
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('GET Talks Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch talks',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST create new talk
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const formData = await req.formData();

    // Extract form data
    const institution = formData.get('institution') as string;
    const title = formData.get('title') as string;
    const dateString = formData.get('date') as string;
    const imageFile = formData.get('image') as File | null;
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;
    const videoUrl = formData.get('videoUrl') as string;
    const attendees = formData.get('attendees') ? Number(formData.get('attendees')) : undefined;

    // Validate required fields
    if (!institution) {
      return NextResponse.json(
        {
          success: false,
          message: 'Institution is required',
        },
        { status: 400 }
      );
    }

    // Parse date or use current date
    let date: Date;
    try {
      date = dateString ? new Date(dateString) : new Date();
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid date format',
          error: (error as Error).message,
        },
        { status: 400 }
      );
    }

    // Handle image upload if provided
    let imageUrl = '/placeholder.svg?height=360&width=480'; // Default
    if (imageFile && imageFile.size > 0) {
      try {
        // Validate file type
        if (!imageFile.type.startsWith('image/')) {
          return NextResponse.json(
            {
              success: false,
              message: 'Invalid file type. Only images are allowed.',
            },
            { status: 400 }
          );
        }

        // Upload to Cloudinary
        imageUrl = await uploadToCloudinary(imageFile);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return NextResponse.json(
          {
            success: false,
            message: 'Failed to upload image',
            error: uploadError instanceof Error ? uploadError.message : 'Unknown error',
          },
          { status: 500 }
        );
      }
    }

    // Create talk with all available fields
    const talk = new Talk({
      institution,
      title,
      date,
      image: imageUrl,
      location,
      description,
      videoUrl,
      attendees,
    });

    // Validate the model
    const validationError = talk.validateSync();
    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          error: validationError.message,
        },
        { status: 400 }
      );
    }

    await talk.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Talk created successfully',
        data: talk,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST Talk Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create talk',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}