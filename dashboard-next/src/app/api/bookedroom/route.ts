import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import RoomsBooking from '@/models/RoomsBooking';
import User from '@/models/User'; // Assuming you have a User model

import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  validationErrors?: Record<string, string>;
};

const errorResponse = (message: string, error?: string, status = 500) => {
  return NextResponse.json({ success: false, message, error }, { status });
};

const successResponse = <T>(data: T, message: string, status = 200) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
};

/**
 * Helper function to validate required fields
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validateFields = (body: Record<string, any>, requiredFields: string[]) => {
  const errors: Record<string, string> = {};

  for (const field of requiredFields) {
    if (!body[field]) {
      errors[field] = `${field} is required`;
    }
  }

  return Object.keys(errors).length ? errors : null;
};

/**
 * Handle file upload
 */
async function saveFile(file: File): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  
  // Create directory if it doesn't exist
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  
  // Generate unique filename
  const timestamp = Date.now();
  const filename = `document-${timestamp}${path.extname(file.name)}`;
  const filepath = path.join(uploadDir, filename);
  
  // Read file as ArrayBuffer and write to disk
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filepath, buffer);
  
  return `/uploads/${filename}`; // Return relative path for storage
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    await connectDB();

    // Use formData to handle file uploads in Next.js
    const formData = await req.formData();
    
    // Extract file
    const documentFile = formData.get('document') as File | null;
    
    // Extract JSON data - convert form fields to JSON object
    const bookingData = {
      userId: formData.get('userId') as string,
      roomId: formData.get('roomId') as string,
      paymentId: formData.get('paymentId') as string,
      paymentAmount: formData.get('paymentAmount') as string,
      arrivalDate: formData.get('arrivalDate') as string,
      departureDate: formData.get('departureDate') as string,
    };
    
    // Validate required fields
    const requiredFields = ['userId', 'roomId', 'paymentId', 'paymentAmount', 'arrivalDate', 'departureDate'];
    const validationErrors = validateFields(bookingData, requiredFields);
    
    // Validate that dates are valid
    try {
      // Check if dates are valid
      if (bookingData.arrivalDate) new Date(bookingData.arrivalDate);
      if (bookingData.departureDate) new Date(bookingData.departureDate);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid date format',
          validationErrors: { date: 'Arrival or departure date is invalid' }
        },
        { status: 400 }
      );
    }

    if (validationErrors) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation error', 
          validationErrors 
        }, 
        { status: 400 }
      );
    }
    
    // Check if room exists and is available
    const room = await RoomsBooking.findById(bookingData.roomId);
    if (!room) {
      return errorResponse('Room not found', 'Invalid room ID', 404);
    }
    
    if (!room.available || room.isBooked) {
      return errorResponse('Room is not available for booking', 'Room already booked', 400);
    }
    
    // Check if user exists
    const user = await User.findById(bookingData.userId);
    if (!user) {
      return errorResponse('User not found', 'Invalid user ID', 404);
    }
    
    // Process document file if provided
    let documentPath = null;
    if (documentFile) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      documentPath = await saveFile(documentFile);
    }
    
    // Convert date strings to Date objects
    const arrivalDate = new Date(bookingData.arrivalDate);
    const departureDate = new Date(bookingData.departureDate);
    
    // Validate dates
    if (arrivalDate >= departureDate) {
      return errorResponse('Invalid dates', 'Departure date must be after arrival date', 400);
    }
    
    // Update room status
    const updatedRoom = await RoomsBooking.findByIdAndUpdate(
      bookingData.roomId,
      {
        isBooked: true,
        available: false,
        userId: bookingData.userId,
        // Store the booking time period with the dates
        $push: { 
          bookingPeriods: {
            arrivalDate,
            departureDate,
            bookedAt: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    );
    
    return successResponse(
      updatedRoom,
      'Room booked successfully',
      201
    );
    
  } catch (error) {
    console.error('Error creating room booking:', error);
    return errorResponse(
      'Failed to create room booking',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}


