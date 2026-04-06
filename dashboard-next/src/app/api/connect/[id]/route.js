import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Connect from '@/models/Connect';
import mongoose from 'mongoose';
import { sendEmail } from '@/utils/sendEmail';

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

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID format' }, { status: 400 });
    }

    const body = await request.json();
    const updateData = {
      ...(body.status && { status: body.status }),
      ...(body.assignedTo !== undefined && { assignedTo: body.assignedTo || '' }),
      ...(body.assignedToName !== undefined && { assignedToName: body.assignedToName || '' }),
      ...(body.internalNotes !== undefined && { internalNotes: body.internalNotes || '' }),
      ...(body.responseText !== undefined && { responseText: body.responseText || '' }),
      lastActionAt: new Date(),
      ...(body.status === 'responded' && { respondedAt: new Date() }),
    };

    const updated = await Connect.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { $set: updateData },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Contact submission not found' }, { status: 404 });
    }

    if (body.sendResponse && body.responseText && updated.email) {
      try {
        const subject = `Hari Om - Update on your prayer request${updated.subject ? `: ${updated.subject}` : ''}`;
        const text = `Hari Om ${updated.fullName},\n\n${body.responseText}\n\nWith regards,\nAvdheshanandG Mission Team`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7b1e1e;">Hari Om</h1>
            <p>Dear <strong>${updated.fullName}</strong>,</p>
            <p>${String(body.responseText).replace(/\n/g, '<br />')}</p>
            <p style="margin-top: 24px;">With regards,<br />AvdheshanandG Mission Team</p>
          </div>
        `;
        await sendEmail(updated.email, subject, text, html);
      } catch (error) {
        console.error('Error sending connect response email:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Contact submission updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating contact submission:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update contact submission',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID format' }, { status: 400 });
    }

    const deleted = await Connect.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, lastActionAt: new Date(), status: 'archived' } },
      { new: true }
    ).lean();

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Contact submission not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Contact submission archived successfully',
      data: deleted,
    });
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete contact submission',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
