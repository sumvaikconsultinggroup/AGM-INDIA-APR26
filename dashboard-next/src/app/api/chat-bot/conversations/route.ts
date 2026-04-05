// dashboard-next/src/app/api/chat-bot/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ChatConversation from '@/models/ChatConversation';
import { verifyJwtToken } from '@/utils/verifyJwtToken';

/**
 * GET /api/chat-bot/conversations?sessionId=xxx
 * List conversations for a session.
 * If sessionId=all, returns recent conversations across all sessions (admin view).
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const sessionId = req.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'sessionId query parameter is required' },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : undefined;
    const token = bearerToken || req.cookies.get('auth_token')?.value || req.cookies.get('token')?.value;
    const payload = token ? await verifyJwtToken(token).catch(() => null) : null;
    const role = (payload as { role?: string } | null)?.role;
    const isAdmin = role === 'admin' || role === 'superadmin';

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    const filter: Record<string, unknown> = {
      isDeleted: { $ne: true },
    };

    // Admin view: show all or scoped conversations.
    if (sessionId !== 'all') {
      filter.sessionId = sessionId;
    }

    const conversations = await ChatConversation.find(filter)
      .select('title messageCount lastMessageAt createdAt sessionId')
      .sort({ lastMessageAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Conversations fetched successfully',
      data: conversations,
    });
  } catch (error) {
    console.error('GET Conversations Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch conversations',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
