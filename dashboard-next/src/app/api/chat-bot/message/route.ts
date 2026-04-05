// dashboard-next/src/app/api/chat-bot/message/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ChatConversation from '@/models/ChatConversation';
import { chatWithGPT } from '@/lib/chatbot';
import { randomUUID } from 'crypto';

const MAX_MESSAGE_LENGTH = 2000;
const RATE_LIMIT_MAX_MESSAGES = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const SESSION_ID_REGEX = /^[a-zA-Z0-9_-]{12,128}$/;

/**
 * Simple in-memory rate limiter.
 * In production, use Redis or a dedicated rate limiting service.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(sessionId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(sessionId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(sessionId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_MESSAGES - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX_MESSAGES) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX_MESSAGES - entry.count };
}

function getSessionId(candidate: unknown): string {
  if (typeof candidate === 'string' && SESSION_ID_REGEX.test(candidate)) {
    return candidate;
  }

  const generated = randomUUID().replace(/-/g, '');
  return `anon_${generated}`;
}

// Clean up stale rate limit entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { message, conversationId, sessionId } = body;

    // Input validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { success: false, message: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` },
        { status: 400 }
      );
    }

    const effectiveSessionId = getSessionId(sessionId);

    // Rate limiting: max 20 messages per user per hour
    const rateCheck = checkRateLimit(effectiveSessionId);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'You have reached the maximum number of messages per hour. Please try again later.',
          data: { rateLimited: true, remaining: 0 },
        },
        { status: 429 }
      );
    }

    // Find or create conversation
    let conversation;
    if (conversationId) {
      conversation = await ChatConversation.findOne({
        _id: conversationId,
        sessionId: effectiveSessionId,
        isDeleted: { $ne: true },
      });
    }

    if (!conversation) {
      conversation = await ChatConversation.create({
        sessionId: effectiveSessionId,
        title: message.slice(0, 100),
        messages: [],
        messageCount: 0,
      });
    }

    // Get conversation history for context
    const historyMessages = conversation.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Call GPT-4o-mini with system prompt + live DB context
    const chatResult = await chatWithGPT(message, historyMessages);

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message.trim(),
      language: chatResult.language,
      timestamp: new Date(),
    });

    // Add assistant message
    conversation.messages.push({
      role: 'assistant',
      content: chatResult.reply,
      suggestions: chatResult.suggestions,
      language: chatResult.language,
      timestamp: new Date(),
    });

    conversation.messageCount = conversation.messages.length;
    conversation.lastMessageAt = new Date();

    // Update title from first user message if it is a new conversation
    if (conversation.messages.filter((m) => m.role === 'user').length === 1) {
      conversation.title = message.slice(0, 100);
    }

    await conversation.save();

    return NextResponse.json({
      success: true,
      data: {
        conversationId: conversation._id,
        sessionId: effectiveSessionId,
        reply: chatResult.reply,
        suggestions: chatResult.suggestions,
        language: chatResult.language,
        remaining: rateCheck.remaining,
      },
    });
  } catch (error) {
    console.error('Chat Message Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process message',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
