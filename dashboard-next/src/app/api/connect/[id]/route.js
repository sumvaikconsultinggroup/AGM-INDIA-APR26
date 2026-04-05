import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Connect from '@/models/Connect';
import mongoose from 'mongoose';

/**
 * GET handler for fetching a single contact submission by ID
 */
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid ID format',
        },
        { status: 400 }
      );
    }

    // Find the contact submission by ID
    const submission = await Connect.findOne({
      _id: id,
      isDeleted: { $ne: true },
    }).lean();

    // Return 404 if not found
    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          message: 'Contact submission not found',
        },
        { status: 404 }
      );
    }

    // Return the found submission
    return NextResponse.json(
      {
        success: true,
        message: 'Contact submission retrieved successfully',
        data: submission,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching contact submission:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve contact submission',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
