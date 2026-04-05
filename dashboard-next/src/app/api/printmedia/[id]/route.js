import PrintMedia from '@/models/PrintMedia';
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

// Function to extract Cloudinary public ID from URL
function getCloudinaryPublicId(url) {
  if (!url || !url.includes('res.cloudinary.com')) {
    return null;
  }

  try {
    const match = url.match(/\/upload\/[^/]+\/([^/]+\/[^.]+)/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting Cloudinary public ID:', error);
    return null;
  }
}

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async file => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const cloudinary = getCloudinary();
    const cloudinaryResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'printmedia',
            resource_type: 'image',
            transformation: [{ width: 800, crop: 'limit' }, { quality: 'auto:good' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return cloudinaryResponse.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Delete image from Cloudinary
async function deleteCloudinaryImage(url) {
  try {
    if (!url || url.includes('placeholder') || !url.includes('res.cloudinary.com')) {
      return false;
    }

    const publicId = getCloudinaryPublicId(url);
    if (!publicId) {
      // console.log("Not a Cloudinary image or couldn't extract ID:", url);
      return false;
    }

    const cloudinary = getCloudinary();
    const result = await cloudinary.uploader.destroy(publicId);
    // console.log(`Cloudinary delete result for ${publicId}:`, result);
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
      return errorResponse('Print media ID is required', undefined, 400);
    }

    const printMedia = await PrintMedia.findById(id).lean();
    if (!printMedia) {
      return errorResponse('Print media not found', undefined, 404);
    }

    if (printMedia.image && printMedia.image.includes('res.cloudinary.com')) {
      await deleteCloudinaryImage(printMedia.image);
    }

    const updatedPrintMedia = await PrintMedia.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    ).lean();

    return successResponse('Print media deleted successfully', updatedPrintMedia, 200);
  } catch (error) {
    return errorResponse(
      'Failed to delete print media',
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
      return errorResponse('Print media ID is required', undefined, 400);
    }

    const printMedia = await PrintMedia.findById(id).lean();

    if (!printMedia) {
      return errorResponse('Print media not found', undefined, 404);
    }

    return successResponse('Print media retrieved successfully', printMedia, 200);
  } catch (error) {
    return errorResponse(
      'Failed to fetch print media',
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
      return errorResponse('Print media ID is required', undefined, 400);
    }

    const existingPrintMedia = await PrintMedia.findById(id).lean();
    if (!existingPrintMedia) {
      return errorResponse('Print media not found', undefined, 404);
    }

    const formData = await req.formData();

    const title = formData.get('title');
    const link = formData.get('link');
    const description = formData.get('description');
    const imageFile = formData.get('image');

    if (!title || !link) {
      return errorResponse('Title and link are required', undefined, 400);
    }

    const updateData = {
      title,
      link,
      description,
    };

    if (imageFile && imageFile.size > 0) {
      try {
        if (!imageFile.type.startsWith('image/')) {
          return errorResponse('Image must be an image file', undefined, 400);
        }

        const newImageUrl = await uploadToCloudinary(imageFile);
        updateData.image = newImageUrl;

        if (existingPrintMedia.image && existingPrintMedia.image.includes('res.cloudinary.com')) {
          await deleteCloudinaryImage(existingPrintMedia.image);
        }
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return errorResponse('Failed to upload image', uploadError.message, 500);
      }
    }

    const updatedPrintMedia = await PrintMedia.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean();

    if (!updatedPrintMedia) {
      return errorResponse('Print media not found', undefined, 404);
    }

    return successResponse('Print media updated successfully', updatedPrintMedia, 200);
  } catch (error) {
    return errorResponse(
      'Failed to update print media',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}
