import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Glimpse, { IGlimpse } from '@/models/Glimpse';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

type ApiResponse = {
  success: boolean;
  message: string;
  data?: IGlimpse[] | IGlimpse | null;
  error?: string;
  statusCode?: number;
};

const errorResponse = (message: string, error?: string, status = 500) => {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      message,
      error,
    },
    {
      status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
};

const successResponse = (message: string, data?: IGlimpse[] | IGlimpse | null, status = 200) => {
  return NextResponse.json<ApiResponse>(
    {
      success: true,
      message,
      data,
    },
    {
      status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
};

// Helper function to upload to Cloudinary
const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
  try {
    // Convert file to buffer for Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary with specific folder and options
    const cloudinaryResponse = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 675, crop: 'fill', gravity: 'auto' }, // 16:9 aspect ratio
              { quality: 'auto:good' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as CloudinaryUploadResult);
          }
        )
        .end(buffer);
    });

    // Return the secure URL
    return cloudinaryResponse.secure_url;
  } catch (error) {
    console.error(`Error uploading to Cloudinary (${folder}):`, error);
    throw error;
  }
};

// Helper function to handle API errors with proper typing
function handleApiError(error: Error | unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      code: error instanceof Error ? 500 : 400,
    };
  }
  return {
    name: 'UnknownError',
    message: String(error),
    code: 500,
  };
}

// GET all glimpses

export async function GET() {
  try {
    await connectDB();

    // Fetch all non-deleted glimpses, newest first
    const glimpses = await Glimpse.find({ isdeleted: false }).sort({ createdAt: -1 }).lean();

    return successResponse('Glimpses retrieved successfully', glimpses as IGlimpse[]);
  } catch (error) {
    const apiError = handleApiError(error);
    console.error('Error retrieving glimpses:', apiError);
    return errorResponse('Failed to retrieve glimpses', apiError.message);
  }
}

// POST a new glimpse
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile || !imageFile.size) {
      return errorResponse('Image file is required', undefined, 400);
    }

    if (!imageFile.type.startsWith('image/')) {
      return errorResponse('File must be an image', undefined, 400);
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      return errorResponse('Image file size must be less than 5MB', undefined, 400);
    }

    const imageUrl = await uploadToCloudinary(imageFile, 'glimpses');

    const newGlimpse = new Glimpse({ image: imageUrl });
    const savedGlimpse = await newGlimpse.save();

    return successResponse('Image uploaded successfully', savedGlimpse.toObject() as IGlimpse, 201);
  } catch (error) {
    console.error('Error in POST route:', error);

    if (
      error instanceof Error &&
      'name' in error &&
      error.name === 'MongoServerError' &&
      'code' in error &&
      error.code === 11000
    ) {
      return errorResponse('This image appears to be a duplicate', undefined, 409);
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse('Server error', message, 500);
  }
}
