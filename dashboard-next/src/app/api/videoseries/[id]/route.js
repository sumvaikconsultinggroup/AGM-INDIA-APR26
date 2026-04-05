import VideoSeries from '@/models/VideoSeries';
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

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (file, folder) => {
  try {
    // Convert file to buffer for Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary with specific folder and options
    const cloudinary = getCloudinary();
    const cloudinaryResponse = await new Promise((resolve, reject) => {
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
            else resolve(result);
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

// Function to extract Cloudinary public ID from URL
function getCloudinaryPublicId(url) {
  // Check if it's a Cloudinary URL
  if (!url || !url.includes('res.cloudinary.com')) {
    return null;
  }

  try {
    // Extract the public ID from the URL pattern
    const match = url.match(/\/upload\/[^/]+\/([^/]+\/[^.]+)/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting Cloudinary public ID:', error);
    return null;
  }
}

// Delete old image from Cloudinary
async function deleteCloudinaryImage(url) {
  try {
    // Skip if not a Cloudinary URL or placeholder
    if (!url || url.includes('placeholder') || !url.includes('res.cloudinary.com')) {
      return false;
    }

    const publicId = getCloudinaryPublicId(url);
    if (!publicId) {
      console.log("Not a Cloudinary image or couldn't extract ID:", url);
      return false;
    }

    // Delete the image from Cloudinary
    const cloudinary = getCloudinary();
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Cloudinary delete result for ${publicId}:`, result);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = params;

    if (!id) {
      return errorResponse('Video series ID is required', undefined, 400);
    }

    // Get current video series to access images
    const currentVideoSeries = await VideoSeries.findById(id).lean();
    if (!currentVideoSeries) {
      return errorResponse('Video series not found', undefined, 404);
    }

    // Delete series cover image from Cloudinary if it exists and is not a placeholder
    if (currentVideoSeries.coverImage && !currentVideoSeries.coverImage.includes('placeholder')) {
      await deleteCloudinaryImage(currentVideoSeries.coverImage);
    }

    // Delete individual video cover images if they exist
    if (currentVideoSeries.videos && currentVideoSeries.videos.length > 0) {
      for (const video of currentVideoSeries.videos) {
        if (video.coverImage && !video.coverImage.includes('placeholder')) {
          await deleteCloudinaryImage(video.coverImage);
        }
      }
    }

    // Perform soft delete
    const videoSeries = await VideoSeries.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    ).lean();

    return successResponse('Video series deleted successfully', videoSeries, 200);
  } catch (error) {
    return errorResponse('Failed to delete video series', error.message, 500);
  }
}

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = params;

    if (!id) {
      return errorResponse('Video series ID is required', undefined, 400);
    }

    const videoSeries = await VideoSeries.findById(id).where({ isDeleted: false }).lean();

    if (!videoSeries) {
      return errorResponse('Video series not found', undefined, 404);
    }

    return successResponse('Video series retrieved successfully', videoSeries, 200);
  } catch (error) {
    return errorResponse('Failed to fetch video series', error.message, 500);
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = params;

    if (!id) {
      return errorResponse('Video series ID is required', undefined, 400);
    }

    // Get current video series to check what needs to be updated
    const currentVideoSeries = await VideoSeries.findById(id).lean();
    if (!currentVideoSeries) {
      return errorResponse('Video series not found', undefined, 404);
    }

    // Parse form data for file uploads
    const formData = await req.formData();

    // Extract basic fields
    const title = formData.get('title');
    const description = formData.get('description');
    const thumbnail = formData.get('thumbnail');
    const category = formData.get('category');

    // Get coverImage - this will be either a URL string or a File object
    const coverImage = formData.get('coverImage');

    if (!title) {
      return errorResponse('Title is required', undefined, 400);
    }

    // Create update data object with basic fields
    const updateData = {
      title,
      description,
      thumbnail: thumbnail || currentVideoSeries.thumbnail,
      category,
    };

    // Handle coverImage - determine if it's a file or URL
    if (coverImage) {
      try {
        // Check if it's a file (has size property) or a string URL
        if (coverImage.size !== undefined && coverImage.size > 0) {
          // It's a file - upload to Cloudinary
          updateData.coverImage = await uploadToCloudinary(coverImage, 'videoseries/covers');

          // Delete old cover image if it exists and isn't a placeholder
          if (
            currentVideoSeries.coverImage &&
            !currentVideoSeries.coverImage.includes('placeholder')
          ) {
            await deleteCloudinaryImage(currentVideoSeries.coverImage);
          }
        } else if (typeof coverImage === 'string' && coverImage !== currentVideoSeries.coverImage) {
          // It's a URL string and it's different from the current one
          updateData.coverImage = coverImage;

          // Delete old cover image if needed
          if (
            currentVideoSeries.coverImage &&
            !currentVideoSeries.coverImage.includes('placeholder') &&
            !currentVideoSeries.coverImage.includes(coverImage)
          ) {
            await deleteCloudinaryImage(currentVideoSeries.coverImage);
          }
        }
      } catch (uploadError) {
        console.error('Error handling cover image:', uploadError);
        // Continue with update even if image handling fails
      }
    }

    // Don't touch videos array - preserve the existing videos
    const updatedVideoSeries = await VideoSeries.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedVideoSeries) {
      return errorResponse('Video series not found', undefined, 404);
    }

    return successResponse('Video series updated successfully', updatedVideoSeries, 200);
  } catch (error) {
    console.error('Error updating video series:', error);
    return errorResponse('Failed to update video series', error.message, 500);
  }
}
