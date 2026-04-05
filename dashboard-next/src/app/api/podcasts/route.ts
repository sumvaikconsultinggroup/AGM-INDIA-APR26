import Podcast, { IPodcast } from '@/models/Podcasts';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import getCloudinary from '@/utils/cloudinary';
import { UploadApiResponse } from 'cloudinary';

type ApiResponse = {
  success: boolean;
  message: string;
  data?: IPodcast | IPodcast[] | null;
  error?: string;
  validationErrors?: Record<string, string>;
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

const successResponse = (message: string, data?: IPodcast | IPodcast[] | null, status = 200) => {
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

// Helper function to upload image from URL to Cloudinary
async function uploadImageFromUrl(imageUrl: string, videoId: string): Promise<string | null> {
  try {
    // Upload directly from URL to Cloudinary
    const cloudinary = getCloudinary();
    const cloudinaryResponse = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload(
        imageUrl,
        {
          folder: 'podcasts/covers',
          resource_type: 'image',
          public_id: `podcast-cover-${videoId}`, // Use videoId for unique naming
          transformation: [
            { width: 1280, height: 720, crop: 'limit' },
            { quality: 'auto:good' },
            { format: 'jpg' },
          ],
          overwrite: true, // Overwrite if exists
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result as UploadApiResponse);
          }
        }
      );
    });

    return cloudinaryResponse.secure_url;
  } catch (error) {
    console.error('Error uploading image from URL to Cloudinary:', error);
    return null;
  }
}

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const podcasts = await Podcast.find({ isDeleted: false })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    if (!podcasts?.length) {
      return errorResponse('No podcasts found', undefined, 404);
    }

    return successResponse('Podcasts retrieved successfully', podcasts as unknown as IPodcast[], 200);
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    return errorResponse(
      'Failed to fetch podcasts',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    // Parse form data to handle file uploads
    const formData = await request.formData();

    // Extract text fields from form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const thumbnail = formData.get('thumbnail') as string;
    const videoUrl = formData.get('videoUrl') as string;
    const videoId = formData.get('videoId') as string;
    const category = formData.get('category') as string;
    const featured = formData.get('featured') === 'true';
    const dateString = formData.get('date') as string;
    const duration = formData.get('duration') as string;

    // Get cover image - could be a File or URL string
    const coverImageData = formData.get('coverImage');

    if (!title || !videoUrl || !videoId) {
      return errorResponse('Title, video URL, and video ID are required', undefined, 400);
    }

    // Check if a podcast with this videoId already exists
    const existingPodcast = await Podcast.findOne({ videoId, isDeleted: false });
    if (existingPodcast) {
      return errorResponse('A podcast with this video ID already exists', undefined, 409);
    }

    // Parse date if provided
    let parsedDate;
    if (dateString) {
      try {
        parsedDate = new Date(dateString);
        if (isNaN(parsedDate.getTime())) {
          return errorResponse('Invalid date format', undefined, 400);
        }
      } catch {
        return errorResponse('Invalid date format', undefined, 400);
      }
    }

    // Handle cover image upload
    let coverImageUrl;

    if (coverImageData) {
      if (coverImageData instanceof File && coverImageData.size > 0) {
        // Handle file upload
        try {
          const arrayBuffer = await coverImageData.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          const cloudinary = getCloudinary();
          const cloudinaryResponse = await new Promise<UploadApiResponse>((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  folder: 'podcasts/covers',
                  resource_type: 'image',
                  public_id: `podcast-cover-${videoId}`,
                  transformation: [
                    { width: 1280, height: 720, crop: 'limit' },
                    { quality: 'auto:good' },
                  ],
                  overwrite: true,
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result as UploadApiResponse);
                }
              )
              .end(buffer);
          });

          coverImageUrl = cloudinaryResponse.secure_url;
        } catch (uploadError) {
          console.error('Error uploading cover image file:', uploadError);
        }
      } else if (typeof coverImageData === 'string' && coverImageData.trim()) {
        // Handle URL string (like YouTube thumbnail)
        // console.log('Uploading cover image from URL:', coverImageData);
        coverImageUrl = await uploadImageFromUrl(coverImageData, videoId);

        if (!coverImageUrl) {
          console.warn('Failed to upload cover image from URL, using original URL');
          coverImageUrl = coverImageData; // Fallback to original URL
        } else {
          // console.log('Successfully uploaded to Cloudinary:', coverImageUrl);
        }
      }
    }

    // Create new podcast with uploaded image URL
    const newPodcast = new Podcast({
      title,
      description,
      thumbnail: thumbnail || 'assets/Podcast/podcast-placeholder.jpg',
      videoUrl,
      videoId,
      coverImage: coverImageUrl,
      category,
      featured: featured || false,
      date: parsedDate,
      duration,
    });

    const savedPodcast = await newPodcast.save();

    return successResponse('Podcast created successfully', savedPodcast, 201);
  } catch (error) {
    console.error('Error creating podcast:', error);

    // Handle validation errors specifically
    if (error instanceof Error && error.name === 'ValidationError') {
      return errorResponse('Validation error', error.message, 400);
    }

    // Handle duplicate key errors (e.g., videoId uniqueness)
    if (error instanceof Error && error.message.includes('duplicate key error')) {
      return errorResponse('A podcast with this video ID already exists', error.message, 409);
    }

    return errorResponse(
      'Failed to create podcast',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}
