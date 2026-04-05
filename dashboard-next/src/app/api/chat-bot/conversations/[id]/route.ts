// dashboard-next/src/app/api/chat-bot/conversations/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ChatConversation from '@/models/ChatConversation';
import { verifyJwtToken } from '@/utils/verifyJwtToken';
import { cookies } from 'next/headers';

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : undefined;

  const cookieStore = await cookies();
  const token = bearerToken || cookieStore.get('auth_token')?.value || cookieStore.get('token')?.value;

  const payload = token ? await verifyJwtToken(token).catch(() => null) : null;
  const role = (payload as { role?: string } | null)?.role;

  return role === 'admin' || role === 'superadmin';
}

/**
 * GET /api/chat-bot/conversations/[id]
 * Get full conversation with all messages.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await requireAdmin(req);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await params;

    const conversation = await ChatConversation.findOne({
      _id: id,
      isDeleted: { $ne: true },
    }).lean();

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation fetched successfully',
      data: conversation,
    });
  } catch (error) {
    console.error('GET Conversation Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch conversation',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chat-bot/conversations/[id]
 * Soft-delete a conversation.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await requireAdmin(req);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await params;

    const conversation = await ChatConversation.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    console.error('DELETE Conversation Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete conversation',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
