import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import getCloudinary from '@/utils/cloudinary';
import { IVideo } from '@/models/VideoSeries';
import VideoSeries from '@/models/VideoSeries';

// Function to upload file to Cloudinary
const uploadToCloudinary = async (file: File, folderPath: string): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const base64Data = buffer.toString('base64');
  const dataURI = `data:${file.type};base64,${base64Data}`;

  const cloudinary = getCloudinary();
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: folderPath,
    resource_type: 'auto',
  });

  return result.secure_url;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data?: IVideo | IVideo[] | null;
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

const successResponse = (message: string, data?: IVideo | IVideo[] | null, status = 200) => {
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

// GET all videos for a specific series
export async function GET(req: NextRequest, { params }: { params: Promise<{ Id: string }> }) {
  try {
    await connectDB();

    const { Id } = await params;

    if (!Id) {
      return errorResponse('Series ID is required', undefined, 400);
    }

    const videoSeries = await VideoSeries.findById(Id).lean();
    if (!videoSeries) {
      return errorResponse('Video series not found', undefined, 404);
    }

    const videos = videoSeries.videos || [];
    return successResponse('Videos retrieved successfully', videos);
  } catch (error: unknown) {
    console.error('Error retrieving videos:', error);
    return errorResponse('Failed to retrieve videos', (error as Error).message);
  }
}

// POST to add a new video to a series
export async function POST(req: NextRequest, { params }: { params: Promise<{ Id: string }> }) {
  try {
    await connectDB();

    const { Id } = await params;

    if (!Id) {
      return errorResponse('Series ID is required', undefined, 400);
    }

    // Get the existing series
    const videoSeries = await VideoSeries.findById(Id);
    if (!videoSeries) {
      return errorResponse('Video series not found', undefined, 404);
    }

    // Parse form data
    const formData = await req.formData();

    // Extract basic video fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const thumbnail = formData.get('thumbnail') as string;
    const youtubeUrl = formData.get('youtubeUrl') as string;
    const videoId = formData.get('videoId') as string;
    const duration = formData.get('duration') as string;
    const publishedAt = formData.get('publishedAt') as string;

    // Get file upload for cover image
    const coverImageFile = formData.get('coverImage') as File | null;

    // Get existing coverImage URL if any
    const coverImageUrl = formData.get('coverImageUrl') as string;

    // Validate required fields
    if (!title || !youtubeUrl || !videoId) {
      return errorResponse('Title, YouTube URL, and Video ID are required', undefined, 400);
    }

    // Check if video ID already exists
    if (videoSeries.videos?.some(v => v.videoId === videoId)) {
      return errorResponse('A video with this ID already exists in this series', undefined, 400);
    }

    // Generate random realistic view count (between 10,000 and 500,000)
    const views = Math.floor(Math.random() * 490000) + 10000;
    
    // Calculate likes as approximately 3-8% of view count for realistic engagement
    const likePercentage = (Math.random() * 5) + 3; // 3-8%
    const likes = Math.floor(views * (likePercentage / 100));

    // Create the video object
    const videoData: IVideo = {
      videoId,
      title,
      thumbnail,
      youtubeUrl,
      description,
      duration,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      views,
      likes
    };

    // Handle cover image
    if (coverImageFile && coverImageFile.size > 0) {
      try {
        // Upload to Cloudinary
        const uploadedImageUrl = await uploadToCloudinary(
          coverImageFile,
          `videoseries/videos/${videoId}`
        );
        videoData.coverImage = uploadedImageUrl;
        console.log('Video cover image uploaded:', uploadedImageUrl);
      } catch (uploadError: unknown) {
        console.error('Error uploading cover image:', (uploadError as Error).message);
        // Continue even if image upload fails
      }
    } else if (coverImageUrl) {
      // Use provided URL
      videoData.coverImage = coverImageUrl;
    }

    // Add the new video to the array
    const updatedVideos = [...(videoSeries.videos || []), videoData as IVideo];
    videoSeries.videos = updatedVideos;
    videoSeries.videoCount = updatedVideos.length;
    await videoSeries.save();

    return successResponse('Video added successfully', videoData);
  } catch (error: unknown) {
    console.error('Error adding video:', (error as Error).message);
    return errorResponse('Failed to add video', (error as Error).message);
  }
}

// PUT to update an existing video in a series by ID
export async function PUT(req: NextRequest, { params }: { params: Promise<{ Id: string; videoId: string }> }) {
  try {
    await connectDB();

    const { Id, videoId } = await params;

    if (!Id || !videoId) {
      return errorResponse('Series ID and Video ID are required', undefined, 400);
    }

    // Get the existing series
    const videoSeries = await VideoSeries.findById(Id);
    if (!videoSeries) {
      return errorResponse('Video series not found', undefined, 404);
    }

    // Find the video in the array
    const videoIndex = videoSeries.videos?.findIndex(v => v.videoId === videoId);
    if (videoIndex === undefined || videoIndex === -1) {
      return errorResponse('Video not found in this series', undefined, 404);
    }

    // Parse form data
    const formData = await req.formData();

    // Extract basic video fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const thumbnail = formData.get('thumbnail') as string;
    const youtubeUrl = formData.get('youtubeUrl') as string;
    const duration = formData.get('duration') as string;
    const publishedAt = formData.get('publishedAt') as string;

    // Get file upload for cover image
    const coverImageFile = formData.get('coverImage') as File | null;

    // Get existing coverImage URL if any
    const coverImageUrl = formData.get('coverImageUrl') as string;

    // Validate required fields
    if (!title || !youtubeUrl) {
      return errorResponse('Title and YouTube URL are required', undefined, 400);
    }

    // Get existing video data to preserve fields we aren't updating
    const existingVideo = videoSeries.videos[videoIndex];

    // Create updated video object
    const updatedVideo: IVideo = {
      ...existingVideo, // Keep existing fields
      videoId, // Keep the original ID
      title,
      thumbnail,
      youtubeUrl,
      description,
      duration,
      publishedAt: publishedAt ? new Date(publishedAt) : existingVideo.publishedAt || new Date(),
      // Preserve existing views and likes
      views: existingVideo.views,
      likes: existingVideo.likes
    };

    // Handle cover image
    if (coverImageFile && coverImageFile.size > 0) {
      try {
        // Upload to Cloudinary
        const uploadedImageUrl = await uploadToCloudinary(
          coverImageFile,
          `videoseries/videos/${videoId}`
        );
        updatedVideo.coverImage = uploadedImageUrl;
        console.log('Video cover image uploaded:', uploadedImageUrl);

        // Delete old cover image if it exists and isn't a placeholder
        if (existingVideo.coverImage && !existingVideo.coverImage.includes('placeholder')) {
          try {
            const cloudinary = getCloudinary();
            await cloudinary.uploader.destroy(
              `videoseries/videos/${videoId}/${existingVideo.coverImage.split('/').pop()?.split('.')[0]}`
            );
            console.log('Old cover image deleted');
          } catch (deleteError) {
            console.error('Error deleting old cover image:', deleteError);
            // Continue even if old image deletion fails
          }
        }
      } catch (uploadError: unknown) {
        console.error('Error uploading cover image:', (uploadError as Error).message);
        // Continue even if image upload fails
      }
    } else if (coverImageUrl) {
      // Use provided URL if different from existing
      if (coverImageUrl !== existingVideo.coverImage) {
        updatedVideo.coverImage = coverImageUrl;
        
        // Delete old cover image if needed
        if (existingVideo.coverImage && !existingVideo.coverImage.includes('placeholder')) {
          try {
            const cloudinary = getCloudinary();
            await cloudinary.uploader.destroy(
              `videoseries/videos/${videoId}/${existingVideo.coverImage.split('/').pop()?.split('.')[0]}`
            );
            console.log('Old cover image deleted');
          } catch (deleteError) {
            console.error('Error deleting old cover image:', deleteError);
            // Continue even if old image deletion fails
          }
        }
      }
    }

    // Update the video in the array
    videoSeries.videos[videoIndex] = updatedVideo;
    await videoSeries.save();

    return successResponse('Video updated successfully', updatedVideo);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error updating video:', errorMessage);
    return errorResponse('Failed to update video', errorMessage);
}
}
