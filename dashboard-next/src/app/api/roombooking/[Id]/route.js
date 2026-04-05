import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import RoomsBooking from '@/models/RoomsBooking';

// Utility: Error response
const errorResponse = (message, error, status = 500) => {
  return NextResponse.json({ success: false, message, error }, { status });
};

// Utility: Success response
const successResponse = (data, message, status = 200) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
};

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { Id } = params;
    if (!Id) {
      return errorResponse('Room booking ID is required', undefined, 400);
    }

    const roomBooking = await RoomsBooking.findByIdAndUpdate(
      Id,
      { isDeleted: true },
      { new: true }
    ).lean();

    if (!roomBooking) {
      return errorResponse('Room booking not found', undefined, 404);
    }

    return successResponse(roomBooking, 'Room booking deleted successfully', 200);
  } catch (error) {
    console.error('Error deleting room booking:', error);
    return errorResponse(
      'Failed to delete room booking',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { Id } = params;
    console.warn('Id:', Id);

    if (!Id) {
      return errorResponse('Room booking ID is required', undefined, 400);
    }

    const body = await req.json();
    console.log('Body:', body);

    if (!body) {
      return errorResponse('Room booking data is required', undefined, 400);
    }

    const requiredFields = ['name', 'place', 'price', 'date', 'available', 'occupancy', 'email'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return errorResponse(`Missing required fields: ${missingFields.join(', ')}`, undefined, 400);
    }

    if (body.date && Array.isArray(body.date)) {
      body.date = body.date.map(date => new Date(date));
    }

    const roomBooking = await RoomsBooking.findByIdAndUpdate(
      Id,
      {
        ...body,
        description: body.description || '',
      },
      { new: true }
    ).lean();

    if (!roomBooking) {
      return errorResponse('Room booking not found', undefined, 404);
    }

    return successResponse(roomBooking, 'Room booking updated successfully', 200);
  } catch (error) {
    console.error('Error updating room booking:', error);
    return errorResponse(
      'Failed to update room booking',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { Id } = params;
    if (!Id) {
      return errorResponse('Room booking ID is required', undefined, 400);
    }

    const roomBooking = await RoomsBooking.findById(Id).where({ isDeleted: false }).lean();

    if (!roomBooking) {
      return errorResponse('Room booking not found', undefined, 404);
    }

    return successResponse(roomBooking, 'Room booking retrieved successfully', 200);
  } catch (error) {
    console.error('Error retrieving room booking:', error);
    return errorResponse(
      'Failed to retrieve room booking',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}
