import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SevaTask from '@/models/SevaTask';
import { notifyAdminSevaTaskDue } from '@/lib/adminTaskNotifications';

const SevaTaskModel = SevaTask as any;

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const hoursAhead = Number(url.searchParams.get('hoursAhead') || 12);
    const reminderCooldownHours = Number(url.searchParams.get('cooldownHours') || 6);

    const now = new Date();
    const windowEnd = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
    const reminderCutoff = new Date(now.getTime() - reminderCooldownHours * 60 * 60 * 1000);

    const tasks = await SevaTaskModel.find({
      isDeleted: false,
      status: { $in: ['assigned', 'in_progress'] },
      assignedToId: { $exists: true, $ne: '' },
      dueDate: { $exists: true, $ne: null, $lte: windowEnd },
      $or: [
        { dueReminderSentAt: { $exists: false } },
        { dueReminderSentAt: null },
        { dueReminderSentAt: { $lte: reminderCutoff } },
      ],
    }).lean();

    let sent = 0;
    const notifiedTaskIds: string[] = [];

    for (const task of tasks) {
      const overdue = task.dueDate ? new Date(task.dueDate).getTime() < now.getTime() : false;
      const result = await notifyAdminSevaTaskDue({
        assignedToId: task.assignedToId,
        assignedToName: task.assignedToName,
        taskId: String(task._id),
        taskTitle: task.title,
        dueDate: task.dueDate,
        overdue,
      });

      if (result.sent > 0) {
        sent += result.sent;
        notifiedTaskIds.push(String(task._id));
        await SevaTaskModel.updateOne({ _id: task._id }, { $set: { dueReminderSentAt: new Date() } });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Admin task reminder run completed',
      data: {
        matchedTasks: tasks.length,
        notificationsSent: sent,
        notifiedTaskIds,
      },
    });
  } catch (error) {
    console.error('POST admin task reminders error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send admin task reminders' }, { status: 500 });
  }
}
