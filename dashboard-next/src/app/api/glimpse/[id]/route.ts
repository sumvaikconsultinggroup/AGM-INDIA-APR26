import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Glimpse, { IGlimpse } from '@/models/Glimpse';
import mongoose from 'mongoose';

type ApiResponse = {
  success: boolean;
  message: string;
  data?: IGlimpse | null;
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

const successResponse = (message: string, data?: IGlimpse | null, status = 200) => {
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

// Helper function to handle API errors with proper typing
function handleApiError(error: Error | unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message
    };
  }
  return {
    name: 'UnknownError',
    message: String(error)
  };
}

// DELETE (soft delete) a glimpse by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ID format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid glimpse ID format', undefined, 400);
    }

    // Find the glimpse first to check if it exists
    const glimpse = await Glimpse.findById(id);

    if (!glimpse) {
      return errorResponse('Glimpse not found', undefined, 404);
    }

    if (glimpse.isdeleted) {
      return errorResponse('Glimpse already deleted', undefined, 400);
    }

    // Soft delete - update isdeleted flag to true
    glimpse.isdeleted = true;
    await glimpse.save();

    return successResponse('Glimpse deleted successfully', null);
  } catch (error) {
    const apiError = handleApiError(error);
    console.error('Error deleting glimpse:', apiError);
    return errorResponse('Failed to delete glimpse', apiError.message);
  }
}


// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     await connectDB();

//     const { id } = params;

//     // Validate ID format
//     if (!id || !mongoose.Types.ObjectId.isValid(id)) {
//       return errorResponse('Invalid glimpse ID format', undefined, 400);
//     }

//     // Check query parameter for permanent delete
//     const url = new URL(req.url);
//     const permanent = url.searchParams.get('permanent') === 'true';

//     // Authorization check (this should be expanded with proper auth)
//     // const isAdmin = req.headers.get('x-role') === 'admin';
//     // if (permanent && !isAdmin) {
//     //   return errorResponse('Unauthorized: Admin privileges required', undefined, 403);
//     // }

//     if (permanent) {
//       // Permanently delete the glimpse
//       const result = await Glimpse.findByIdAndDelete(id);
      
//       if (!result) {
//         return errorResponse('Glimpse not found', undefined, 404);
//       }
      
//       // TODO: If using Cloudinary, you may also want to delete the image
//       // const imageUrl = result.image;
//       // const publicId = imageUrl.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.lastIndexOf('.'));
//       // await cloudinary.uploader.destroy(`glimpses/${publicId}`);
      
//       return successResponse('Glimpse permanently deleted', null);
//     } else {
//       // Restore a soft-deleted glimpse
//       const glimpse = await Glimpse.findById(id);
      
//       if (!glimpse) {
//         return errorResponse('Glimpse not found', undefined, 404);
//       }
      
//       if (!glimpse.isdeleted) {
//         return errorResponse('Glimpse is not deleted', undefined, 400);
//       }
      
//       glimpse.isdeleted = false;
//       await glimpse.save();
      
//       return successResponse('Glimpse restored successfully', glimpse);
//     }
//   } catch (error) {
//     const apiError = handleApiError(error);
//     console.error('Error modifying glimpse:', apiError);
//     return errorResponse('Failed to modify glimpse', apiError.message);
//   }
// }