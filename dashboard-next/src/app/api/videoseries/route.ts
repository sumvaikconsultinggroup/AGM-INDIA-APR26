import VideoSeries, { IVideoSeries, IVideoSeriesBase } from '@/models/VideoSeries';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import getCloudinary from '@/utils/cloudinary';

type ApiResponse = {
  success: boolean;
  message: string;
  data?: IVideoSeries | IVideoSeries[] | null;
  error?: string;
  validationErrors?: Record<string, string>;
  statusCode?: number;
};

// Define a type for Cloudinary upload result
interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  result?: string;
  [key: string]: unknown;
}

// Define a type for video objects
interface VideoItem {
  videoId: string;
  title: string;
  thumbnail: string;
  youtubeUrl: string;
  coverImage?: string;
  [key: string]: unknown;
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
  data?: IVideoSeries | IVideoSeries[] | null,
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
const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
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

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const videoSeries = await VideoSeries.find({ isDeleted: false }).lean();

    if (!videoSeries?.length) {
      return errorResponse('No video series found', undefined, 404);
    }

    return successResponse('Video series retrieved successfully', videoSeries as unknown as IVideoSeries[], 200);
  } catch (error) {
    console.error('Error fetching video series:', error);
    return errorResponse(
      'Failed to fetch video series',
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

    // Get text fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const thumbnail = formData.get('thumbnail') as string; // Keep as URL
    const category = formData.get('category') as string;

    // Get cover image file
    const coverImageFile = formData.get('coverImage') as File | null;

    // Get videos data (as JSON string that needs to be parsed)
    const videosJson = formData.get('videos') as string;
    let videos: VideoItem[] = [];

    try {
      videos = videosJson ? (JSON.parse(videosJson) as VideoItem[]) : [];
    } catch (parseError) {
      console.error('Error parsing videos JSON:', parseError);
      return errorResponse('Invalid videos data. Must be valid JSON', undefined, 400);
    }

    if (!title) {
      return errorResponse('Title is required', undefined, 400);
    }

    // Calculate videoCount from the videos array
    const videoCount = videos.length;

    // Validate that required fields exist in each video
    if (videos.length > 0) {
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        if (!video.videoId || !video.title || !video.thumbnail || !video.youtubeUrl) {
          return errorResponse(
            `Video at index ${i} is missing required fields (videoId, title, thumbnail, youtubeUrl)`,
            undefined,
            400
          );
        }

        // Handle video cover images if they exist as separate files
        const videoCoverImageFile = formData.get(`videoCoverImage_${i}`) as File | null;
        if (videoCoverImageFile && videoCoverImageFile.size > 0) {
          try {
            // Upload cover image for this video
            video.coverImage = await uploadToCloudinary(
              videoCoverImageFile,
              `videoseries/videos/${video.videoId}`
            );
          } catch (uploadError) {
            console.error(`Failed to upload cover image for video ${i}:`, uploadError);
            // Continue without setting coverImage
          }
        }
      }
    }

    // Handle series cover image upload
    let coverImageUrl: string | undefined = undefined;
    if (coverImageFile && coverImageFile.size > 0) {
      try {
        // Validate file type
        if (!coverImageFile.type.startsWith('image/')) {
          return errorResponse('Cover image must be an image file', undefined, 400);
        }

        // Upload to Cloudinary
        coverImageUrl = await uploadToCloudinary(coverImageFile, 'videoseries/covers');
        console.log('Cover image uploaded:', coverImageUrl);
      } catch (uploadError) {
        console.error('Error uploading cover image:', uploadError);
        return errorResponse(
          'Failed to upload cover image',
          uploadError instanceof Error ? uploadError.message : 'Unknown error',
          500
        );
      }
    }

    // Create a properly typed object for the new video series
    const videoSeriesData: IVideoSeriesBase = {
      title,
      description,
      thumbnail: thumbnail || 'assets/VideoSeries/video-placeholder.jpg',
      coverImage: coverImageUrl || 'assets/VideoSeries/cover-placeholder.jpg',
      category,
      videoCount,
      videos,
      isDeleted: false, // Ensuring this is set explicitly
    };

    const newVideoSeries = new VideoSeries(videoSeriesData);
    const savedVideoSeries = await newVideoSeries.save();

    return successResponse('Video series created successfully', savedVideoSeries, 201);
  } catch (error) {
    console.error('Error creating video series:', error);
    return errorResponse(
      'Failed to create video series',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}
