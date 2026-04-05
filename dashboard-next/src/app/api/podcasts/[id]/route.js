import Podcast from '@/models/Podcasts';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import getCloudinary from '@/utils/cloudinary';

const errorResponse = (message, error, status = 500) => {
  return NextResponse.json(
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

const successResponse = (message, data, status = 200) => {
  return NextResponse.json(
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

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = params;

    if (!id) {
      return errorResponse('Podcast ID is required', undefined, 400);
    }

    const podcast = await Podcast.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).lean();

    if (!podcast) {
      return errorResponse('Podcast not found', undefined, 404);
    }

    return successResponse('Podcast deleted successfully', podcast, 200);
  } catch (error) {
    return errorResponse(
      'Failed to delete podcast',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = params;

    if (!id) {
      return errorResponse('Podcast ID is required', undefined, 400);
    }

    const podcast = await Podcast.findById(id).lean();

    if (!podcast) {
      return errorResponse('Podcast not found', undefined, 404);
    }

    return successResponse('Podcast retrieved successfully', podcast, 200);
  } catch (error) {
    return errorResponse(
      'Failed to fetch podcast',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = params;

    if (!id) {
      return errorResponse('Podcast ID is required', undefined, 400);
    }

    // Get the existing podcast to check if we need to delete an old image
    const existingPodcast = await Podcast.findById(id);

    if (!existingPodcast) {
      return errorResponse('Podcast not found', undefined, 404);
    }

    // Parse form data instead of JSON
    const formData = await req.formData();

    // Extract text fields from form data
    const title = formData.get('title');
    const description = formData.get('description');
    const thumbnail = formData.get('thumbnail');
    const videoUrl = formData.get('videoUrl');
    const videoId = formData.get('videoId');
    const category = formData.get('category');
    const featured = formData.has('featured') ? formData.get('featured') === 'true' : undefined;
    const dateString = formData.get('date');
    const duration = formData.get('duration');

    // Get cover image file from form data
    const coverImageFile = formData.get('coverImage');

    if (!title || !videoUrl || !videoId) {
      return errorResponse('Title, video URL, and video ID are required', undefined, 400);
    }

    // Check if another podcast with this videoId already exists
    if (videoId !== existingPodcast.videoId) {
      const duplicatePodcast = await Podcast.findOne({
        videoId,
        _id: { $ne: id },
        isDeleted: false,
      });

      if (duplicatePodcast) {
        return errorResponse('Another podcast with this video ID already exists', undefined, 409);
      }
    }

    // Create update data object
    const updateData = {
      title,
      videoUrl,
      videoId,
    };

    // Add optional fields if provided
    if (description !== null) updateData.description = description;
    if (thumbnail !== null)
      updateData.thumbnail = thumbnail || 'assets/Podcast/podcast-placeholder.jpg';
    if (category !== null) updateData.category = category;
    if (featured !== undefined) updateData.featured = featured;
    if (duration !== null) updateData.duration = duration;

    // Parse date if provided
    if (dateString) {
      try {
        const parsedDate = new Date(dateString);
        if (isNaN(parsedDate.getTime())) {
          return errorResponse('Invalid date format', undefined, 400);
        }
        updateData.date = parsedDate;
      } catch {
        return errorResponse('Invalid date format', undefined, 400);
      }
    }

    // Handle cover image upload if provided
    if (coverImageFile && coverImageFile.size > 0) {
      try {
        // Convert file to buffer for Cloudinary
        const arrayBuffer = await coverImageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary with specific folder and options
        const cloudinary = getCloudinary();
        const cloudinaryResponse = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: 'podcasts/covers',
                resource_type: 'image',
                transformation: [
                  { width: 1280, height: 720, crop: 'limit' },
                  { quality: 'auto:good' },
                ],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(buffer);
        });

        // Update with new cover image URL
        updateData.coverImage = cloudinaryResponse.secure_url;

        // Delete the old image from Cloudinary if it exists
        // This would require extracting the public_id from the existing URL
        // and is optional - may cause orphaned images in Cloudinary
      } catch (uploadError) {
        console.error('Error uploading cover image:', uploadError);
        // Continue without changing cover image if upload fails
      }
    }

    const updatedPodcast = await Podcast.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    return successResponse('Podcast updated successfully', updatedPodcast, 200);
  } catch (error) {
    console.error('Error updating podcast:', error);

    if (error instanceof Error && error.name === 'ValidationError') {
      return errorResponse('Validation error', error.message, 400);
    }

    if (error instanceof Error && error.message.includes('duplicate key error')) {
      return errorResponse('Another podcast with this video ID already exists', error.message, 409);
    }

    return errorResponse(
      'Failed to update podcast',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}
