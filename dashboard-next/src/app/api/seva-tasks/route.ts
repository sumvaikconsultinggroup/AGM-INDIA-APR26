import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SevaTask from '@/models/SevaTask';
import { notifyAdminSevaTaskAssigned } from '@/lib/adminTaskNotifications';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const SevaTaskModel = SevaTask as any;
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || '';
    const city = url.searchParams.get('city') || '';
    const assignedToId = url.searchParams.get('assignedToId') || '';

    const filter: Record<string, unknown> = { isDeleted: false };
    if (status) filter.status = status;
    if (city) filter.city = new RegExp(city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (assignedToId) filter.assignedToId = assignedToId;

    const tasks = await SevaTaskModel.find(filter).sort({ dueDate: 1, createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('GET Seva tasks error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch seva tasks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const SevaTaskModel = SevaTask as any;
    const body = await req.json();

    if (!body.title) {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
    }

    const task = await SevaTaskModel.create({
      title: String(body.title).trim(),
      description: String(body.description || '').trim(),
      sevaType: body.sevaType || 'other',
      city: String(body.city || '').trim(),
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      shift: String(body.shift || '').trim(),
      priority: body.priority || 'medium',
      status: body.status || (body.assignedToId ? 'assigned' : 'open'),
      assignedToType: body.assignedToType,
      assignedToId: body.assignedToId,
      assignedToName: body.assignedToName,
      linkedNoteId: body.linkedNoteId,
      createdById: body.createdById,
      createdByName: body.createdByName,
    });

    if (task.assignedToId || task.assignedToName) {
      try {
        await notifyAdminSevaTaskAssigned({
          assignedToId: task.assignedToId,
          assignedToName: task.assignedToName,
          taskId: String(task._id),
          taskTitle: task.title,
          dueDate: task.dueDate,
          priority: task.priority,
          city: task.city,
        });
        await SevaTaskModel.updateOne({ _id: task._id }, { $set: { assignmentNotifiedAt: new Date() } });
      } catch (notificationError) {
        console.error('Error sending seva task assignment notification:', notificationError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Seva task created successfully',
      data: task,
    }, { status: 201 });
  } catch (error) {
    console.error('POST Seva task error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create seva task' }, { status: 500 });
  }
}
