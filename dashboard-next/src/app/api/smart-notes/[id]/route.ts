import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import SmartNote from '@/models/SmartNote';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const SmartNoteModel = SmartNote as any;
    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid note ID' }, { status: 400 });
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {
      ...(body.title !== undefined && { title: String(body.title).trim() }),
      ...(body.body !== undefined && { body: String(body.body).trim() }),
      ...(body.tags !== undefined && { tags: Array.isArray(body.tags) ? body.tags : [] }),
      ...(body.assignedToId !== undefined && { assignedToId: body.assignedToId || '' }),
      ...(body.assignedToName !== undefined && { assignedToName: body.assignedToName || '' }),
      ...(body.assignmentStatus !== undefined && { assignmentStatus: body.assignmentStatus }),
    };

    const note = await SmartNoteModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true }
    ).lean();

    if (!note) {
      return NextResponse.json({ success: false, message: 'Smart note not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: note, message: 'Smart note updated successfully' });
  } catch (error) {
    console.error('PUT Smart note error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update smart note' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const SmartNoteModel = SmartNote as any;
    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid note ID' }, { status: 400 });
    }

    const note = await SmartNoteModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    ).lean();

    if (!note) {
      return NextResponse.json({ success: false, message: 'Smart note not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: note, message: 'Smart note deleted successfully' });
  } catch (error) {
    console.error('DELETE Smart note error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete smart note' }, { status: 500 });
  }
}
