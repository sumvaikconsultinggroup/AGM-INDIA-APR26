/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import RoomsBooking, { IRoomsBooking } from '@/models/RoomsBooking';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  validationErrors?: Record<string, string>;
};

export async function GET(){
  try {
    await connectDB();

    const rooms = await RoomsBooking.find({ isDeleted: false }).lean();

    if (!rooms?.length) {
      return NextResponse.json(
        {
          success: false,
          message: 'No room bookings found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Room bookings retrieved successfully',
        data: rooms,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching room bookings:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch room bookings',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<IRoomsBooking>>> {
  try {
    await connectDB();

    // Check if the request is multipart form-data
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData with images
      const formData = await req.formData();
      console.log('FormData fields:', [...formData.keys()]);

      // Extract basic room data
      const name = formData.get('name') as string;
      const place = formData.get('place') as string;
      const price = Number(formData.get('price'));
      const occupancy = Number(formData.get('occupancy'));
      const email = formData.get('email') as string;
      const available = formData.get('available') === 'true';
      const isBooked = formData.get('isBooked') === 'true';
      const description = formData.get('description') as string;

      // Extract dates array
      const dates: string[] = [];
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('date[') && key.endsWith(']')) {
          dates.push(value as string);
        }
      }

      // Extract amenities array
      const amenities: string[] = [];
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('amenities[') && key.endsWith(']')) {
          amenities.push(value as string);
        }
      }

      // Validate required fields
      const requiredFields = [
        { name: 'name', value: name },
        { name: 'place', value: place },
        { name: 'price', value: price && !isNaN(price) },
        { name: 'occupancy', value: occupancy && !isNaN(occupancy) },
        { name: 'email', value: email },
        { name: 'date', value: dates.length > 0 },
      ];

      const missingFields = requiredFields.filter(field => !field.value).map(field => field.name);

      if (missingFields.length) {
        return NextResponse.json(
          {
            success: false,
            message: `Missing required fields: ${missingFields.join(', ')}`,
          },
          { status: 400 }
        );
      }

      // Process image uploads
      const imageUrls: string[] = [];
      const uploadDir = path.join(process.cwd(), 'public/uploads/rooms');

      // Create upload directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Fix for multiple images: Check both array notation and multiple fields with the same name
      const imageFiles: File[] = [];

      // Method 1: Check for multiple fields with the same name
      const imageEntries = formData.getAll('images');
      console.log(`Found ${imageEntries.length} entries with name 'images'`);

      for (const entry of imageEntries) {
        if (entry instanceof File) {
          imageFiles.push(entry);
        }
      }

      // Method 2: Check for array notation in form data (if client is using indexed notation)
      let index = 0;
      while (true) {
        const file = formData.get(`images[${index}]`);
        if (!file) break;

        if (file instanceof File) {
          imageFiles.push(file);
        }
        index++;
      }

      console.log(`Total image files found: ${imageFiles.length}`);

      // Check image count
      if (imageFiles.length > 5) {
        return NextResponse.json(
          {
            success: false,
            message: 'Maximum 5 images allowed per room',
          },
          { status: 400 }
        );
      }

      // Process and save each image
      for (const file of imageFiles) {
        // Skip empty files
        if (file.size === 0) continue;

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${uuidv4()}-${file.name.replace(/\s+/g, '-')}`;
        const filePath = path.join(uploadDir, filename);

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          return NextResponse.json(
            {
              success: false,
              message: `Invalid file type: ${file.type}. Only jpg, png, gif, and webp are allowed.`,
            },
            { status: 400 }
          );
        }

        // Validate file size (max 5MB)
        if (buffer.length > 5 * 1024 * 1024) {
          return NextResponse.json(
            {
              success: false,
              message: 'Image size exceeds 5MB limit',
            },
            { status: 400 }
          );
        }

        // Write file to disk
        await writeFile(filePath, buffer);

        // Store the URL (relative to public directory)
        const imageUrl = `/uploads/rooms/${filename}`;
        imageUrls.push(imageUrl);
      }

      console.log(`Processed ${imageUrls.length} images with URLs:`, imageUrls);

      // Create room booking with image URLs
      const roomData: Partial<IRoomsBooking> = {
        name: name.trim(),
        place: place.trim(),
        price: price,
        date: dates.map(date => new Date(date)),
        occupancy: occupancy,
        email: email.trim(),
        available: available,
        isBooked: isBooked,
        description: description?.trim(),
        amenities: amenities,
        images: imageUrls,
      };

      const roomBooking = await RoomsBooking.create(roomData);

      return NextResponse.json(
        {
          success: true,
          message: 'Room booking created successfully',
          data: roomBooking,
        },
        { status: 201 }
      );
    } else {
      // Handle regular JSON requests (for backward compatibility)
      const body: IRoomsBooking = await req.json();

      // Validate required fields
      const requiredFields = ['name', 'place', 'price', 'date', 'occupancy', 'email'];
      for (const field of requiredFields) {
        if (!body[field as keyof IRoomsBooking]) {
          return NextResponse.json(
            {
              success: false,
              message: `${field} is required`,
            },
            { status: 400 }
          );
        }
      }

      // Make sure dates are converted to Date objects
      if (body.date && Array.isArray(body.date)) {
        body.date = body.date.map(date => new Date(date));
      }

      // Create new room booking
      const roomBooking = await RoomsBooking.create(body);

      return NextResponse.json(
        {
          success: true,
          message: 'Room booking created successfully',
          data: roomBooking,
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error('Error creating room booking:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors: Record<string, string> = {};

      Object.keys(error.errors).forEach(key => {
        validationErrors[key] = error.errors[key].message;
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          validationErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create room booking',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
