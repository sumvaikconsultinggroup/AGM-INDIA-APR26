import PrintMedia, { IPrintMedia } from '@/models/PrintMedia';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import getCloudinary from '@/utils/cloudinary';

type ApiResponse = {
  success: boolean;
  message: string;
  data?: IPrintMedia | IPrintMedia[] | null;
  error?: string;
  validationErrors?: Record<string, string>;
  statusCode?: number;
};

interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  url: string;
  secure_url: string;
  folder: string;
  original_filename?: string;
  api_key?: string;
}

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

const successResponse = (
  message: string,
  data?: IPrintMedia | IPrintMedia[] | null,
  status = 200
) => {
  return NextResponse.json<ApiResponse>(
    {
      success: true,
      message,
      data,
    },
    {
      status,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        'Surrogate-Control': 'max-age=300',
        Vary: 'Accept-Encoding, Cookie',
      },
    }
  );
};

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    // Convert file to buffer for Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary with specific folder and options
    const cloudinary = getCloudinary();
    const cloudinaryResponse = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'printmedia',
            resource_type: 'image',
            transformation: [
              { width: 800, crop: 'limit' }, // Appropriate size for print media thumbnails
              { quality: 'auto:good' }
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as unknown as CloudinaryUploadResult);
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

    const printMediaItems = await PrintMedia.find({ isDeleted: false }).lean();

    if (!printMediaItems?.length) {
      return errorResponse('No print media items found', undefined, 404);
    }

    return successResponse('Print media items retrieved successfully', printMediaItems as unknown as IPrintMedia[], 200);
  } catch (error) {
    console.error('Error fetching print media:', error);
    return errorResponse(
      'Failed to fetch print media',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    
    // Parse form data for file upload
    const formData = await request.formData();
    
    // Get form fields
    const title = formData.get('title') as string;
    const link = formData.get('link') as string;
    const description = formData.get('description') as string;
    const imageFile = formData.get('image') as File | null;
    
    // Handle cases where image is passed as a string URL instead of a file
    const imageUrl = formData.get('imageUrl') as string;

    if (!title || !link) {
      return errorResponse('Title and link are required', undefined, 400);
    }

    // Set default image path
    let finalImageUrl = 'assets/PrintMedia/print-media-placeholder.jpg';
    
    // If imageUrl is provided, use that
    if (imageUrl && imageUrl.trim() !== '') {
      finalImageUrl = imageUrl;
    } 
    // Otherwise, if an image file is uploaded, process that
    else if (imageFile && imageFile.size > 0) {
      try {
        // Validate file type
        if (!imageFile.type.startsWith('image/')) {
          return errorResponse('Image must be an image file', undefined, 400);
        }
        
        // Upload to Cloudinary
        finalImageUrl = await uploadToCloudinary(imageFile);
        // console.log('Print media image uploaded:', finalImageUrl);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return errorResponse(
          'Failed to upload image', 
          uploadError instanceof Error ? uploadError.message : 'Unknown error', 
          500
        );
      }
    }

    const newPrintMedia = new PrintMedia({
      title,
      image: finalImageUrl,
      link,
      description,
    });

    const savedPrintMedia = await newPrintMedia.save();

    return successResponse('Print media created successfully', savedPrintMedia, 201);
  } catch (error) {
    console.error('Error creating print media:', error);
    return errorResponse(
      'Failed to create print media',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}
