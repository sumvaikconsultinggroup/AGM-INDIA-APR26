import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import SevaTask from '@/models/SevaTask';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const SevaTaskModel = SevaTask as any;
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid task ID' }, { status: 400 });
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {
      ...(body.title !== undefined && { title: String(body.title).trim() }),
      ...(body.description !== undefined && { description: String(body.description || '').trim() }),
      ...(body.sevaType !== undefined && { sevaType: body.sevaType }),
      ...(body.city !== undefined && { city: String(body.city || '').trim() }),
      ...(body.shift !== undefined && { shift: String(body.shift || '').trim() }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.assignedToType !== undefined && { assignedToType: body.assignedToType }),
      ...(body.assignedToId !== undefined && { assignedToId: body.assignedToId || '' }),
      ...(body.assignedToName !== undefined && { assignedToName: body.assignedToName || '' }),
      ...(body.completionNotes !== undefined && { completionNotes: String(body.completionNotes || '').trim() }),
      ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
    };

    const task = await SevaTaskModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true }
    ).lean();

    if (!task) {
      return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: task, message: 'Seva task updated successfully' });
  } catch (error) {
    console.error('PUT Seva task error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update seva task' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const SevaTaskModel = SevaTask as any;
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid task ID' }, { status: 400 });
    }

    const task = await SevaTaskModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    ).lean();

    if (!task) {
      return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: task, message: 'Seva task deleted successfully' });
  } catch (error) {
    console.error('DELETE Seva task error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete seva task' }, { status: 500 });
  }
}
