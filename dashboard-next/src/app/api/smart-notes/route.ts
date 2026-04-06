import { NextRequest, NextResponse } from 'next/server';
import { Collection, Document } from 'mongodb';
import { connectDB } from '@/lib/mongodb';
import SmartNote from '@/models/SmartNote';
import SevaTask from '@/models/SevaTask';

async function getAdminCollection(): Promise<Collection<Document>> {
  const { connectDB: connectMongo } = await import('@/utils/mongodbConnect');
  const db = await connectMongo('DB', 'test');
  return db.collection('AdminAccess');
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function detectMentionedMembers(text: string) {
  const collection = await getAdminCollection();
  const teamMembers = await collection.find({ isActive: { $ne: false } }).project({
    _id: 1,
    name: 1,
    username: 1,
  }).toArray();

  const haystack = ` ${text.toLowerCase()} `;
  const matches = teamMembers.filter((member) => {
    const names = [member.name, member.username]
      .filter((value) => typeof value === 'string' && value.trim())
      .map((value) => value!.toLowerCase());

    return names.some((value) => new RegExp(`(^|\\s)${escapeRegex(value)}(?=\\s|$|[,.!?])`, 'i').test(haystack));
  });

  return matches.map((member) => ({
    memberId: String(member._id),
    name: String(member.name || member.username || 'Team Member'),
    username: String(member.username || ''),
  }));
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const SmartNoteModel = SmartNote as any;
    const url = new URL(req.url);
    const assignmentStatus = url.searchParams.get('assignmentStatus') || '';

    const filter: Record<string, unknown> = { isDeleted: false };
    if (assignmentStatus) filter.assignmentStatus = assignmentStatus;

    const notes = await SmartNoteModel.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: notes });
  } catch (error) {
    console.error('GET Smart notes error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch smart notes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const SmartNoteModel = SmartNote as any;
    const SevaTaskModel = SevaTask as any;
    const body = await req.json();
    if (!body.title || !body.body) {
      return NextResponse.json({ success: false, message: 'Title and note body are required' }, { status: 400 });
    }

    const title = String(body.title).trim();
    const noteBody = String(body.body).trim();
    const mentionedMembers = await detectMentionedMembers(`${title} ${noteBody}`);
    const primaryAssignee = mentionedMembers[0];

    const note = await SmartNoteModel.create({
      title,
      body: noteBody,
      tags: Array.isArray(body.tags) ? body.tags.map((tag: string) => String(tag).trim()).filter(Boolean) : [],
      assignedToId: body.assignedToId || primaryAssignee?.memberId,
      assignedToName: body.assignedToName || primaryAssignee?.name,
      mentionedMembers,
      assignmentStatus: primaryAssignee ? 'auto_assigned' : 'unassigned',
      createTask: body.createTask !== false,
      createdById: body.createdById,
      createdByName: body.createdByName,
    });

    if ((body.createTask !== false) && primaryAssignee) {
      const task = await SevaTaskModel.create({
        title,
        description: noteBody,
        sevaType: body.sevaType || 'social_media',
        priority: body.priority || 'medium',
        city: body.city || '',
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        assignedToType: 'team',
        assignedToId: primaryAssignee.memberId,
        assignedToName: primaryAssignee.name,
        status: 'assigned',
        createdById: body.createdById,
        createdByName: body.createdByName,
      });

      note.linkedSevaTaskId = String(task._id);
      await note.save();
    }

    return NextResponse.json({
      success: true,
      message: primaryAssignee
        ? `Smart note created and assigned to ${primaryAssignee.name}`
        : 'Smart note created successfully',
      data: note,
    }, { status: 201 });
  } catch (error) {
    console.error('POST Smart note error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create smart note' }, { status: 500 });
  }
}
