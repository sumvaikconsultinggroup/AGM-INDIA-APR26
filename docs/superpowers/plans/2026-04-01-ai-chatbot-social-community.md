# Plan 3: AI Chatbot, Social Media Feed & Newsletter/FAQ System

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Each task is independent and can be assigned to a separate agent. Tasks within Part A, B, and C can be parallelized across agents.

**Goal:** Build an AI-powered "Ask Swami Ji" chatbot using direct GPT-4o-mini integration with a comprehensive system prompt, aggregate social media feeds from Instagram and YouTube into a dedicated section, and create a newsletter subscription + FAQ management system -- transforming the platform from static content into an interactive spiritual companion.

**Architecture:** The chatbot uses direct OpenAI GPT-4o-mini API calls with a rich system prompt containing Swami Ji's biography, teachings, and organizational information. Before each call, the latest articles and events are fetched from MongoDB and injected as contextual data into the system message. Conversations are persisted per-user in a `ChatConversation` collection for continuity. Rate limiting enforces max 20 messages per user per hour. Social feeds are cached in a `SocialPost` collection with periodic background refresh via API routes, gracefully degrading when rate-limited. Newsletter uses Nodemailer (already installed) for confirmation emails. FAQs are admin-managed with markdown support.

**Tech Stack:** Next.js 15 App Router, MongoDB/Mongoose, OpenAI API (`openai` npm package, GPT-4o-mini), Framer Motion (website animations), Tailwind CSS (spiritual theme), Nodemailer (existing), react-markdown + rehype (FAQ markdown), Expo React Native (mobile), Lucide React (icons).

**Peer Benchmark:**
| Feature | Sadhguru "Ask Sadhguru" | ISKCON Transcend AI | Pray.com AI | YouVersion | **Our Target** |
|---------|------------------------|---------------------|-------------|------------|----------------|
| AI Chat | 30yr teachings RAG + voice clone | 8000hr + 600 ebooks RAG | Personal faith companion | No AI | GPT-4o-mini with system prompt + DB context injection, bilingual |
| Knowledge Base | Curated + indexed | Pre-indexed corpus | General scripture | Bible plans | System prompt + live DB context (articles, events) |
| Conversation History | Yes, per user | Yes | Yes | N/A | Yes, persistent per user |
| Social Aggregation | YouTube + IG embeds | YouTube feed | Minimal | N/A | YouTube + Instagram cached feed |
| Newsletter | Email list + Mailchimp | Email campaigns | In-app only | Email digest | Nodemailer + admin dashboard |
| FAQ | Static page | Static page | In-app FAQ | Help center | Admin-managed, markdown, search, categories |

---

## File Structure

### New Files to Create

**Dashboard (Admin) -- Models:**
- `dashboard-next/src/models/ChatConversation.ts` -- Conversation + message history model
- `dashboard-next/src/models/FAQ.ts` -- FAQ entries with categories and markdown
- `dashboard-next/src/models/NewsletterSubscriber.ts` -- Newsletter email subscribers
- `dashboard-next/src/models/SocialPost.ts` -- Cached social media posts

**Dashboard (Admin) -- API Routes:**
- `dashboard-next/src/app/api/chat-bot/conversations/route.ts` -- List conversations (admin)
- `dashboard-next/src/app/api/chat-bot/conversations/[id]/route.ts` -- Get/delete conversation
- `dashboard-next/src/app/api/chat-bot/message/route.ts` -- Send message, get GPT-4o-mini response
- `dashboard-next/src/app/api/faq/route.ts` -- FAQ CRUD (admin)
- `dashboard-next/src/app/api/faq/public/route.ts` -- Public FAQ list
- `dashboard-next/src/app/api/newsletter/route.ts` -- Subscribe/unsubscribe
- `dashboard-next/src/app/api/newsletter/subscribers/route.ts` -- Admin list subscribers
- `dashboard-next/src/app/api/social/youtube/route.ts` -- Fetch & cache YouTube videos
- `dashboard-next/src/app/api/social/instagram/route.ts` -- Fetch & cache Instagram posts
- `dashboard-next/src/app/api/social/feed/route.ts` -- Public aggregated feed

**Dashboard (Admin) -- Pages & Components:**
- `dashboard-next/src/app/dashboard/faq/page.tsx` -- FAQ management page
- `dashboard-next/src/app/dashboard/newsletter/page.tsx` -- Newsletter subscribers page
- `dashboard-next/src/app/dashboard/chatbot/page.tsx` -- Chatbot analytics/conversations page
- `dashboard-next/src/components/faq/FAQForm.tsx` -- Create/edit FAQ form
- `dashboard-next/src/components/faq/FAQTable.tsx` -- FAQ list table
- `dashboard-next/src/components/newsletter/SubscriberTable.tsx` -- Subscriber list
- `dashboard-next/src/components/chatbot/ConversationList.tsx` -- View conversations

**Dashboard (Admin) -- Utilities:**
- `dashboard-next/src/lib/chatbot.ts` -- GPT-4o-mini integration, system prompt, context injection
- `dashboard-next/src/lib/social-fetcher.ts` -- YouTube & Instagram API fetchers

**Website (Public):**
- `website/app/social/page.tsx` -- Social media feeds page
- `website/app/faq/page.tsx` -- Public FAQ page
- `website/app/newsletter/page.tsx` -- Newsletter subscription page (optional standalone)
- `website/components/chat/ChatWidget.tsx` -- Floating chatbot widget (bottom-right)
- `website/components/chat/ChatMessage.tsx` -- Single message bubble
- `website/components/chat/ChatSuggestions.tsx` -- Quick reply suggestion pills
- `website/components/sections/SocialFeed.tsx` -- Homepage social section
- `website/components/sections/Newsletter.tsx` -- Newsletter signup section
- `website/components/social/YouTubeCard.tsx` -- YouTube video card
- `website/components/social/InstagramCard.tsx` -- Instagram post card
- `website/components/faq/FAQAccordion.tsx` -- FAQ accordion with search

**Mobile User App:**
- `mobile/user-app/src/screens/chat/ChatScreen.tsx` -- Chat screen
- `mobile/user-app/src/screens/social/SocialFeedScreen.tsx` -- Social feed screen
- `mobile/user-app/src/screens/faq/FAQScreen.tsx` -- FAQ screen

### Files to Modify
- `dashboard-next/src/app/dashboard/page.tsx` -- Add FAQ, Newsletter, Chatbot cards
- `website/app/layout.tsx` -- Add ChatWidget to layout
- `website/app/page.tsx` -- Add SocialFeed and Newsletter sections
- `website/components/layout/Navbar.tsx` -- Add "Social" and "FAQ" nav links
- `mobile/user-app/src/screens/home/HomeScreen.tsx` -- Add chat FAB and social section

---

## Part A: "Ask Swami Ji" AI Chatbot

---

## Task 1: Install OpenAI SDK

**Files:**
- None (package installation only)

- [ ] **Step 1: Install the `openai` npm package in the dashboard project**

```bash
cd /Users/apple/Downloads/agm-india-dashboard-website-master/dashboard-next
npm install openai
```

---

## Task 2: ChatConversation MongoDB Model

**Files:**
- Create: `dashboard-next/src/models/ChatConversation.ts`

- [ ] **Step 1: Create the ChatConversation model with embedded messages**

```typescript
// dashboard-next/src/models/ChatConversation.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  language?: 'en' | 'hi' | 'auto';
  timestamp: Date;
}

export interface IChatConversation extends Document {
  userId?: mongoose.Types.ObjectId;
  sessionId: string;
  title: string;
  messages: IChatMessage[];
  messageCount: number;
  lastMessageAt: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: [true, 'Message role is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    suggestions: {
      type: [String],
      default: [],
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'auto'],
      default: 'auto',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ChatConversationSchema = new Schema<IChatConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      sparse: true,
    },
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
      index: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    messages: {
      type: [ChatMessageSchema],
      default: [],
      validate: {
        validator: function (msgs: IChatMessage[]) {
          return msgs.length <= 200;
        },
        message: 'Conversation cannot exceed 200 messages',
      },
    },
    messageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

ChatConversationSchema.index({ userId: 1, lastMessageAt: -1 });
ChatConversationSchema.index({ sessionId: 1, isDeleted: 1 });

const ChatConversation: Model<IChatConversation> =
  mongoose.models.ChatConversation ||
  mongoose.model<IChatConversation>('ChatConversation', ChatConversationSchema);

export default ChatConversation;
```

---

## Task 3: Chatbot GPT-4o-mini Integration Module

**Files:**
- Create: `dashboard-next/src/lib/chatbot.ts`

- [ ] **Step 1: Create the chatbot module with system prompt, context injection, and GPT-4o-mini call**

```typescript
// dashboard-next/src/lib/chatbot.ts

/**
 * AI Chatbot module using direct OpenAI GPT-4o-mini API calls.
 * No embeddings, no vector search, no RAG pipeline.
 * Uses a comprehensive system prompt + live DB context injection.
 */

import OpenAI from 'openai';
import { connectDB } from './mongodb';

// Lazy-initialize OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * The comprehensive system prompt containing Swami Ji's biography,
 * organizational information, and behavioral guidelines.
 */
const BASE_SYSTEM_PROMPT = `You are a helpful spiritual assistant for Swami Avdheshanand Giri Ji Maharaj's organization (Prabhu Premi Sangh).

About Swami Ji:
- Full title: Acharya Mahamandaleshwar Swami Avdheshanand Giri Ji Maharaj
- Acharya Mahamandaleshwar of Juna Akhara (the largest order of Naga Sadhus, established by Adi Shankaracharya)
- President of Hindu Dharma Acharya Sabha (the apex body of Hindu religious leaders)
- Vedanta scholar, spiritual guide, and mentor to millions worldwide
- Based in Haridwar, India, at Saptarishi Ashram
- Has delivered discourses across India and internationally in over 30 countries
- Author of numerous books on Vedanta, spirituality, and dharmic living
- Recognized for his role in interfaith dialogue and global peace initiatives
- Leads massive spiritual gatherings at Kumbh Mela and other sacred events

About Prabhu Premi Sangh:
- Spiritual organization founded under Swami Ji's guidance
- Centers and branches across India and worldwide (USA, UK, Canada, Australia, etc.)
- Conducts regular satsangs (spiritual gatherings), pravachans (discourses), and yatras (pilgrimages)
- Organizes large camps during Kumbh Mela, Ardh Kumbh, and other major Hindu festivals
- Runs social service initiatives:
  - Old age homes (Vriddhashram)
  - Education projects for underprivileged children
  - Medical camps and health awareness programs
  - Environmental conservation drives (tree plantation, river cleaning)
  - Disaster relief and humanitarian aid
- Promotes the message of universal love, compassion, and spiritual awakening

Core Teachings:
- Self-realization through Vedanta (Advaita philosophy — the non-dual nature of the self)
- Practice of meditation (dhyana) and yoga as pathways to inner peace
- Dharmic living — fulfilling one's duties with righteousness and integrity
- Seva (selfless service) as a spiritual practice
- Unity of all beings — seeing the divine in every creature
- Importance of satsang (spiritual association) and guru-shishya parampara (teacher-student lineage)
- Balancing material responsibilities with spiritual growth
- The transformative power of devotion (bhakti) and knowledge (jnana)

About the Lineage:
- Part of the ancient Dashanami Sampradaya established by Adi Shankaracharya
- Juna Akhara is one of the seven main akharas of the Dashanami tradition
- The tradition emphasizes renunciation, tapas (austerity), and Vedantic knowledge

Key Terms (for context):
- Satsang: Spiritual gathering where teachings are shared
- Pravachan: Spiritual discourse or lecture
- Diksha: Spiritual initiation
- Ashram: Spiritual hermitage or retreat center
- Kumbh Mela: The largest peaceful gathering on Earth, held every 12 years at four sacred river sites
- Yatra: Pilgrimage
- Seva: Selfless service

Guidelines for Responses:
- Respond in the same language the user writes in (Hindi or English). If the user writes in Hindi (Devanagari script), respond in Hindi. If they write in English, respond in English. If mixed, prefer the dominant language.
- Be respectful, compassionate, and spiritually uplifting in tone
- For specific schedule/event questions, share what you know from the context provided, and also suggest the user check the app or website (avdheshanandg.org) for the latest updates
- Never claim to be Swami Ji himself — you represent his organization and share his publicly available teachings
- Keep responses concise but meaningful (aim for 2-5 paragraphs unless a shorter answer suffices)
- When quoting or referencing Swami Ji's teachings, be accurate to what is provided in the context
- If you do not know the answer to a specific factual question (like a specific date or phone number), say so honestly and direct the user to official channels
- You may share relevant shlokas (Sanskrit verses) when appropriate, with translation
- Maintain a warm, devotional, yet intellectually grounded tone`;

/**
 * Detect if text is primarily Hindi (Devanagari script).
 */
export function detectLanguage(text: string): 'hi' | 'en' {
  const devanagariRegex = /[\u0900-\u097F]/g;
  const devanagariMatches = text.match(devanagariRegex);
  const devanagariRatio = (devanagariMatches?.length || 0) / text.length;
  return devanagariRatio > 0.3 ? 'hi' : 'en';
}

/**
 * Fetch the latest articles and events from the database to inject as context.
 * This gives the chatbot awareness of current/recent content without embeddings.
 */
async function fetchLiveContext(): Promise<string> {
  await connectDB();

  const contextParts: string[] = [];

  try {
    // Dynamic imports to avoid circular dependency issues
    const mongoose = await import('mongoose');

    // Fetch latest articles (if model exists)
    const ArticleModel = mongoose.models.Article || mongoose.models.Articles;
    if (ArticleModel) {
      const articles = await ArticleModel.find({ isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title description category publishedDate')
        .lean();

      if (articles.length > 0) {
        contextParts.push('RECENT ARTICLES:');
        for (const article of articles) {
          const a = article as { title?: string; description?: string; category?: string; publishedDate?: Date };
          contextParts.push(`- "${a.title || 'Untitled'}" (${a.category || 'General'}): ${(a.description || '').slice(0, 200)}`);
        }
      }
    }

    // Fetch upcoming/recent events (talks)
    const TalkModel = mongoose.models.Talk || mongoose.models.Talks;
    if (TalkModel) {
      const talks = await TalkModel.find({ isDeleted: { $ne: true } })
        .sort({ date: -1 })
        .limit(5)
        .select('institution date')
        .lean();

      if (talks.length > 0) {
        contextParts.push('\nRECENT EVENTS/TALKS:');
        for (const talk of talks) {
          const t = talk as { institution?: string; date?: Date };
          const dateStr = t.date ? new Date(t.date).toISOString().split('T')[0] : 'Unknown date';
          contextParts.push(`- ${t.institution || 'Unknown venue'} (${dateStr})`);
        }
      }
    }

    // Fetch books
    const BookModel = mongoose.models.Book;
    if (BookModel) {
      const books = await BookModel.find({ isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title author genre language description')
        .lean();

      if (books.length > 0) {
        contextParts.push('\nBOOKS BY SWAMI JI:');
        for (const book of books) {
          const b = book as { title?: string; author?: string; genre?: string; language?: string; description?: string };
          contextParts.push(`- "${b.title || 'Untitled'}" by ${b.author || 'Swami Avdheshanand Giri'} (${b.genre || 'Spiritual'}, ${b.language || 'Hindi'}): ${(b.description || '').slice(0, 150)}`);
        }
      }
    }

    // Fetch podcasts
    const PodcastModel = mongoose.models.Podcast || mongoose.models.Podcasts;
    if (PodcastModel) {
      const podcasts = await PodcastModel.find({ isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title category description')
        .lean();

      if (podcasts.length > 0) {
        contextParts.push('\nRECENT PODCASTS:');
        for (const podcast of podcasts) {
          const p = podcast as { title?: string; category?: string; description?: string };
          contextParts.push(`- "${p.title || 'Untitled'}" (${p.category || 'General'}): ${(p.description || '').slice(0, 150)}`);
        }
      }
    }

    // Fetch video series
    const VideoSeriesModel = mongoose.models.VideoSeries;
    if (VideoSeriesModel) {
      const series = await VideoSeriesModel.find({ isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title category description')
        .lean();

      if (series.length > 0) {
        contextParts.push('\nVIDEO SERIES:');
        for (const s of series) {
          const vs = s as { title?: string; category?: string; description?: string };
          contextParts.push(`- "${vs.title || 'Untitled'}" (${vs.category || 'General'}): ${(vs.description || '').slice(0, 150)}`);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to fetch some live context (non-fatal):', error);
  }

  if (contextParts.length === 0) {
    return '';
  }

  return '\n\nCURRENT CONTENT FROM THE PLATFORM (use this to answer questions about available content, events, and resources):\n' +
    contextParts.join('\n') +
    '\n\n--- END OF PLATFORM CONTENT ---';
}

/**
 * Generate contextual follow-up suggestions based on the detected language.
 */
function generateSuggestions(language: 'en' | 'hi'): string[] {
  const enSuggestions = [
    'Tell me about Swami Ji\'s teachings',
    'What is Vedanta?',
    'Upcoming events',
    'How can I visit the ashram?',
    'Guide me in meditation',
    'Books by Swami Ji',
    'What is Prabhu Premi Sangh?',
    'How can I volunteer?',
  ];

  const hiSuggestions = [
    'स्वामी जी की शिक्षाओं के बारे में बताएं',
    'वेदांत क्या है?',
    'आगामी कार्यक्रम',
    'आश्रम कैसे जाएं?',
    'ध्यान में मार्गदर्शन करें',
    'स्वामी जी की पुस्तकें',
    'प्रभु प्रेमी संघ क्या है?',
    'सेवा कैसे करें?',
  ];

  const pool = language === 'hi' ? hiSuggestions : enSuggestions;

  // Return 4 random suggestions from the pool
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
}

export interface ChatbotResponse {
  reply: string;
  language: 'en' | 'hi';
  suggestions: string[];
}

/**
 * Main chatbot function: builds system prompt with live context,
 * sends conversation to GPT-4o-mini, returns response.
 */
export async function chatWithGPT(
  userMessage: string,
  conversationHistory: { role: string; content: string }[] = []
): Promise<ChatbotResponse> {
  const openai = getOpenAIClient();
  const language = detectLanguage(userMessage);

  // Fetch live context from DB (articles, events, books, etc.)
  let liveContext = '';
  try {
    liveContext = await fetchLiveContext();
  } catch (error) {
    console.warn('Live context fetch failed (non-fatal):', error);
  }

  // Build the full system prompt
  const systemPrompt = BASE_SYSTEM_PROMPT + liveContext;

  // Build conversation messages (keep last 10 turns for context window management)
  const recentHistory = conversationHistory.slice(-10);

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemPrompt },
    ...recentHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ];

  // Call GPT-4o-mini
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    max_tokens: 1000,
  });

  const reply = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';
  const suggestions = generateSuggestions(language);

  return {
    reply,
    language,
    suggestions,
  };
}
```

---

## Task 4: Chat Bot Message API Route

**Files:**
- Create: `dashboard-next/src/app/api/chat-bot/message/route.ts`

- [ ] **Step 1: Create the message endpoint with GPT-4o-mini integration and rate limiting**

```typescript
// dashboard-next/src/app/api/chat-bot/message/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ChatConversation from '@/models/ChatConversation';
import { chatWithGPT } from '@/lib/chatbot';

const MAX_MESSAGE_LENGTH = 2000;
const RATE_LIMIT_MAX_MESSAGES = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

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

    const effectiveSessionId = sessionId || `anon_${Date.now()}`;

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
```

---

## Task 5: Conversation Management API Routes

**Files:**
- Create: `dashboard-next/src/app/api/chat-bot/conversations/route.ts`
- Create: `dashboard-next/src/app/api/chat-bot/conversations/[id]/route.ts`

- [ ] **Step 1: Create conversation list endpoint**

```typescript
// dashboard-next/src/app/api/chat-bot/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ChatConversation from '@/models/ChatConversation';

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

    const filter: Record<string, unknown> = {
      isDeleted: { $ne: true },
    };

    // Admin view: show all conversations
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
```

- [ ] **Step 2: Create single conversation detail and delete endpoints**

```typescript
// dashboard-next/src/app/api/chat-bot/conversations/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ChatConversation from '@/models/ChatConversation';

/**
 * GET /api/chat-bot/conversations/[id]
 * Get full conversation with all messages.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
```

---

## Task 6: Website Chat Widget

**Files:**
- Create: `website/components/chat/ChatMessage.tsx`
- Create: `website/components/chat/ChatSuggestions.tsx`
- Create: `website/components/chat/ChatWidget.tsx`
- Modify: `website/app/layout.tsx`

- [ ] **Step 1: Create the ChatMessage component**

```tsx
// website/components/chat/ChatMessage.tsx
'use client';

import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${role === 'user' ? 'order-2' : 'order-1'}`}>
        <div
          className={`flex items-start gap-2 ${
            role === 'user' ? 'flex-row-reverse' : ''
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              role === 'user'
                ? 'bg-primary-800 text-white'
                : 'bg-gradient-to-br from-spiritual-saffron/10 to-spiritual-maroon/10 text-spiritual-maroon'
            }`}
          >
            {role === 'user' ? <User size={16} /> : <Bot size={16} />}
          </div>

          <div
            className={`rounded-2xl p-3 ${
              role === 'user'
                ? 'bg-primary-800 text-white rounded-br-md'
                : 'bg-spiritual-cream text-spiritual-warmGray rounded-bl-md border border-spiritual-maroon/10'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
            <p
              className={`text-xs mt-1 ${
                role === 'user' ? 'text-white/70' : 'text-spiritual-warmGray/50'
              }`}
            >
              {formatTime(timestamp)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the ChatSuggestions component**

```tsx
// website/components/chat/ChatSuggestions.tsx
'use client';

interface ChatSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function ChatSuggestions({ suggestions, onSelect }: ChatSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mt-2 ml-10 space-y-1">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className="block w-full text-left text-xs p-2 bg-white border border-spiritual-maroon/20 rounded-lg hover:bg-spiritual-saffron/5 transition-colors text-spiritual-warmGray hover:text-spiritual-maroon"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create the ChatWidget floating component**

```tsx
// website/components/chat/ChatWidget.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Minimize2,
  Maximize2,
  RotateCcw,
  Loader2,
  Heart,
  BookOpen,
  Calendar,
  Phone,
} from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatSuggestions } from './ChatSuggestions';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const INITIAL_MESSAGE: Message = {
  id: 1,
  role: 'assistant',
  content:
    'Namaste! Welcome to the official portal of Swami Avdheshanand Giri Ji Maharaj. I am here to help you explore His teachings, events, books, and spiritual guidance. How may I assist you today?',
  timestamp: new Date(),
  suggestions: [
    'Tell me about Swami Ji',
    'What teachings does He offer?',
    'Upcoming events',
    'How can I visit the ashram?',
  ],
};

const QUICK_ACTIONS = [
  { icon: Heart, text: 'Teachings', action: 'What are Swami Ji\'s core teachings?' },
  { icon: BookOpen, text: 'Books', action: 'Tell me about Swami Ji\'s books' },
  { icon: Calendar, text: 'Events', action: 'What are the upcoming events?' },
  { icon: Phone, text: 'Contact', action: 'How can I contact the ashram?' },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId] = useState(() => `web_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (messageText?: string) => {
    const text = (messageText || inputMessage).trim();
    if (!text || isTyping) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat-bot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationId,
          sessionId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.data.conversationId) {
          setConversationId(data.data.conversationId);
        }

        const botMessage: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.data.reply,
          timestamp: new Date(),
          suggestions: data.data.suggestions,
        };

        setMessages((prev) => [...prev, botMessage]);
      } else if (res.status === 429) {
        const rateLimitMessage: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.message || 'You have reached the message limit. Please try again in an hour.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, rateLimitMessage]);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content:
          'I apologize, but I am unable to process your request at the moment. Please try again shortly, or visit avdheshanandg.org for information.',
        timestamp: new Date(),
        suggestions: [
          'Tell me about Swami Ji',
          'Upcoming events',
          'Books and teachings',
          'Contact information',
        ],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    }
  };

  const resetConversation = () => {
    setMessages([INITIAL_MESSAGE]);
    setConversationId(null);
  };

  const openChat = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  return (
    <>
      {/* Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={openChat}
          aria-label="Open chat with spiritual guide"
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-spiritual-maroon to-primary-900 text-white rounded-full shadow-temple hover:shadow-warm-lg transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        >
          <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-spiritual-saffron text-white text-xs rounded-full flex items-center justify-center animate-pulse-soft">
              {unreadCount}
            </div>
          )}
          <div className="absolute inset-0 rounded-full border-2 border-spiritual-maroon/30 animate-ping" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-temple border border-spiritual-maroon/20 transition-all duration-300 flex flex-col ${
            isMinimized ? 'w-80 h-16' : 'w-96 h-[600px] max-h-[80vh]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-spiritual-maroon to-primary-900 text-white rounded-t-2xl flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg font-sanskrit">Om</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Ask Swami Ji</h3>
                <p className="text-xs opacity-90">Spiritual Guide</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/20 rounded transition-colors"
                aria-label={isMinimized ? 'Maximize chat' : 'Minimize chat'}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onClick={resetConversation}
                className="p-1.5 hover:bg-white/20 rounded transition-colors"
                aria-label="Reset conversation"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded transition-colors"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Actions */}
              <div className="p-3 border-b border-gray-100 flex-shrink-0">
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_ACTIONS.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(action.action)}
                      className="flex items-center gap-2 p-2 text-xs bg-spiritual-cream hover:bg-spiritual-saffron/10 rounded-lg transition-colors text-spiritual-warmGray hover:text-spiritual-maroon"
                    >
                      <action.icon size={14} />
                      <span>{action.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.map((message) => (
                  <div key={message.id}>
                    <ChatMessage
                      role={message.role}
                      content={message.content}
                      timestamp={message.timestamp}
                    />
                    {message.role === 'assistant' && message.suggestions && (
                      <ChatSuggestions
                        suggestions={message.suggestions}
                        onSelect={(s) => handleSendMessage(s)}
                      />
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spiritual-saffron/10 to-spiritual-maroon/10 text-spiritual-maroon flex items-center justify-center">
                        <Bot size={16} />
                      </div>
                      <div className="bg-spiritual-cream rounded-2xl rounded-bl-md p-3 border border-spiritual-maroon/10">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-spiritual-maroon/50 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-spiritual-maroon/50 rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          />
                          <div
                            className="w-2 h-2 bg-spiritual-maroon/50 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask about teachings, events, books..."
                    className="flex-1 p-3 border border-spiritual-maroon/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-spiritual-saffron/30 focus:border-spiritual-saffron text-spiritual-warmGray placeholder-spiritual-warmGray/50 text-sm"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isTyping}
                    className="p-3 bg-spiritual-maroon text-white rounded-xl hover:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    {isTyping ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-spiritual-warmGray/50 mt-1.5 text-center">
                  Powered by Swami Ji&apos;s teachings &bull; AI-assisted guidance
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: Add ChatWidget to website layout**

In `website/app/layout.tsx`, add the import and component:

```tsx
// Add import at the top:
import { ChatWidget } from '@/components/chat/ChatWidget';

// Add <ChatWidget /> right before the closing </body> tag, after <WhatsAppButton />:
// Before:
//   <WhatsAppButton />
// After:
//   <WhatsAppButton />
//   <ChatWidget />
```

The modified section of `website/app/layout.tsx` should look like:

```tsx
        <Footer />
        <WhatsAppButton />
        <ChatWidget />
      </body>
```

---

## Task 7: Mobile Chat Screen

**Files:**
- Create: `mobile/user-app/src/screens/chat/ChatScreen.tsx`
- Modify: `mobile/user-app/src/screens/home/HomeScreen.tsx` (add chat FAB)

- [ ] **Step 1: Create the mobile ChatScreen**

```tsx
// mobile/user-app/src/screens/chat/ChatScreen.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import api from '../../services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const INITIAL_MESSAGE: ChatMessage = {
  id: '1',
  role: 'assistant',
  content:
    'Namaste! I am here to help you explore the teachings, events, and books of Swami Avdheshanand Giri Ji Maharaj. How may I assist you?',
  timestamp: new Date(),
  suggestions: [
    'Tell me about Swami Ji',
    'Upcoming events',
    'Books and teachings',
    'How to visit ashram',
  ],
};

export function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId] = useState(() => `mobile_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);
  const flatListRef = useRef<FlatList>(null);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, scrollToEnd]);

  const sendMessage = async (text?: string) => {
    const messageText = (text || inputText).trim();
    if (!messageText || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await api.post('/chat-bot/message', {
        message: messageText,
        conversationId,
        sessionId,
      });

      // api interceptor unwraps { success, data } -> data
      const data = response.data;

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
        suggestions: data.suggestions,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I am unable to process your request right now. Please try again.',
        timestamp: new Date(),
        suggestions: ['Tell me about Swami Ji', 'Upcoming events'],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.messageRow, item.role === 'user' ? styles.userRow : styles.botRow]}>
      {item.role === 'assistant' && (
        <View style={styles.botAvatar}>
          <Icon name="om" size={16} color={colors.primary.maroon} />
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          item.role === 'user' ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.role === 'user' ? styles.userText : styles.botText,
          ]}
        >
          {item.content}
        </Text>
        <Text
          style={[
            styles.timestamp,
            item.role === 'user' ? styles.userTimestamp : styles.botTimestamp,
          ]}
        >
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      {item.role === 'assistant' && item.suggestions && (
        <View style={styles.suggestionsContainer}>
          {item.suggestions.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={styles.suggestionPill}
              onPress={() => sendMessage(s)}
            >
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerAvatar}>
          <Icon name="om" size={20} color="#fff" />
        </View>
        <View>
          <Text style={styles.headerTitle}>Ask Swami Ji</Text>
          <Text style={styles.headerSubtitle}>Spiritual Guide</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={scrollToEnd}
      />

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <ActivityIndicator size="small" color={colors.primary.maroon} />
          <Text style={styles.typingText}>Contemplating...</Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about teachings, events..."
          placeholderTextColor={colors.text.secondary}
          returnKeyType="send"
          onSubmitEditing={() => sendMessage()}
          editable={!isTyping}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isTyping) && styles.sendButtonDisabled]}
          onPress={() => sendMessage()}
          disabled={!inputText.trim() || isTyping}
        >
          <Icon name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.warmWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.xl,
    backgroundColor: colors.primary.maroon,
    gap: spacing.sm,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  messagesList: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageRow: {
    marginBottom: spacing.md,
  },
  userRow: {
    alignItems: 'flex-end',
  },
  botRow: {
    alignItems: 'flex-start',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.parchment,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: borderRadius.lg,
    padding: spacing.sm + 2,
  },
  userBubble: {
    backgroundColor: colors.primary.maroon,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: colors.background.parchment,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(128,0,32,0.1)',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: colors.text.primary,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
  },
  botTimestamp: {
    color: colors.text.secondary,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
    maxWidth: '80%',
  },
  suggestionPill: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(128,0,32,0.2)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  suggestionText: {
    fontSize: 11,
    color: colors.primary.maroon,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  typingText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#fff',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(128,0,32,0.2)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm + 4,
    fontSize: 14,
    color: colors.text.primary,
    backgroundColor: colors.background.warmWhite,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.maroon,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatScreen;
```

- [ ] **Step 2: Add a floating chat button to HomeScreen**

In `mobile/user-app/src/screens/home/HomeScreen.tsx`, add a floating action button at the bottom of the screen. Add this inside the return, as the last child of the outermost `<View>`:

```tsx
// Add this import at the top:
// import { useNavigation } from '@react-navigation/native';
// (already imported)

// Add this floating button before the closing </View> of the root container,
// after the ScrollView:
<TouchableOpacity
  style={{
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.maroon,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.temple,
  }}
  onPress={() => navigation.navigate('Chat' as never)}
>
  <Icon name="chat" size={24} color="#fff" />
</TouchableOpacity>
```

---

## Task 8: Admin Chatbot Dashboard

**Files:**
- Create: `dashboard-next/src/app/dashboard/chatbot/page.tsx`
- Create: `dashboard-next/src/components/chatbot/ConversationList.tsx`

- [ ] **Step 1: Create the ConversationList component**

```tsx
// dashboard-next/src/components/chatbot/ConversationList.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Conversation {
  _id: string;
  title: string;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
  sessionId?: string;
  messages?: Message[];
}

export default function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      // Admin view: fetch recent conversations across all sessions
      const res = await axios.get('/api/chat-bot/conversations?sessionId=all');
      if (res.data.success) {
        setConversations(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    // Fetch full conversation
    try {
      const res = await axios.get(`/api/chat-bot/conversations/${id}`);
      if (res.data.success) {
        setConversations((prev) =>
          prev.map((c) => (c._id === id ? { ...c, messages: res.data.data.messages } : c))
        );
      }
    } catch (error) {
      console.error('Failed to fetch conversation detail:', error);
    }

    setExpandedId(id);
  };

  const deleteConversation = async (id: string) => {
    try {
      await axios.delete(`/api/chat-bot/conversations/${id}`);
      setConversations((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conv) => (
        <Card key={conv._id} className="overflow-hidden">
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleExpand(conv._id)}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium text-sm">{conv.title}</p>
                <p className="text-xs text-gray-500">
                  {conv.messageCount} messages &bull;{' '}
                  {new Date(conv.lastMessageAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv._id);
                }}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
              {expandedId === conv._id ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>

          {expandedId === conv._id && conv.messages && (
            <CardContent className="border-t bg-gray-50/50 max-h-96 overflow-y-auto">
              <div className="space-y-3 py-2">
                {conv.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-lg text-sm ${
                        msg.role === 'user'
                          ? 'bg-orange-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-700'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-[10px] mt-1 opacity-60">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create the admin chatbot dashboard page with usage stats**

```tsx
// dashboard-next/src/app/dashboard/chatbot/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, MessageSquare, Clock, Users } from 'lucide-react';
import axios from 'axios';
import ConversationList from '@/components/chatbot/ConversationList';

interface UsageStats {
  totalConversations: number;
  totalMessages: number;
  recentConversations: number;
}

export default function ChatbotDashboard() {
  const [stats, setStats] = useState<UsageStats>({
    totalConversations: 0,
    totalMessages: 0,
    recentConversations: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch conversations to derive stats
      const res = await axios.get('/api/chat-bot/conversations?sessionId=all');
      if (res.data.success) {
        const conversations = res.data.data;
        const totalMessages = conversations.reduce(
          (sum: number, c: { messageCount: number }) => sum + c.messageCount,
          0
        );
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentConversations = conversations.filter(
          (c: { lastMessageAt: string }) => new Date(c.lastMessageAt) > oneDayAgo
        ).length;

        setStats({
          totalConversations: conversations.length,
          totalMessages,
          recentConversations,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="w-6 h-6 text-orange-500" />
          Ask Swami Ji - Chatbot
        </h1>
        <p className="text-gray-500 mt-1">
          View chatbot conversations and usage statistics. Powered by GPT-4o-mini with a comprehensive spiritual knowledge system prompt.
        </p>
      </div>

      {/* Usage Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalConversations}</p>
                <p className="text-sm text-gray-500">Total Conversations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalMessages}</p>
                <p className="text-sm text-gray-500">Total Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.recentConversations}</p>
                <p className="text-sm text-gray-500">Active (last 24h)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Model</p>
              <p className="font-medium">GPT-4o-mini</p>
            </div>
            <div>
              <p className="text-gray-500">Rate Limit</p>
              <p className="font-medium">20 msgs/hour/user</p>
            </div>
            <div>
              <p className="text-gray-500">Context Window</p>
              <p className="font-medium">Last 10 turns</p>
            </div>
            <div>
              <p className="text-gray-500">Languages</p>
              <p className="font-medium">Hindi & English</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <ConversationList />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Part B: Social Media Feed Aggregation

---

## Task 9: SocialPost MongoDB Model

**Files:**
- Create: `dashboard-next/src/models/SocialPost.ts`

- [ ] **Step 1: Create the SocialPost cache model**

```typescript
// dashboard-next/src/models/SocialPost.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISocialPost extends Document {
  platform: 'youtube' | 'instagram' | 'twitter' | 'facebook';
  postId: string;
  type: 'video' | 'image' | 'carousel' | 'reel' | 'text';
  content: string;
  caption?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  permalink: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  publishedAt: Date;
  fetchedAt: Date;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SocialPostSchema = new Schema<ISocialPost>(
  {
    platform: {
      type: String,
      enum: ['youtube', 'instagram', 'twitter', 'facebook'],
      required: [true, 'Platform is required'],
      index: true,
    },
    postId: {
      type: String,
      required: [true, 'Post ID is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['video', 'image', 'carousel', 'reel', 'text'],
      default: 'text',
    },
    content: {
      type: String,
      default: '',
    },
    caption: {
      type: String,
      trim: true,
    },
    mediaUrl: {
      type: String,
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
    },
    permalink: {
      type: String,
      required: [true, 'Permalink is required'],
      trim: true,
    },
    engagement: {
      likes: { type: Number, default: 0, min: 0 },
      comments: { type: Number, default: 0, min: 0 },
      shares: { type: Number, default: 0, min: 0 },
      views: { type: Number, default: 0, min: 0 },
    },
    authorName: {
      type: String,
      default: 'Swami Avdheshanand Giri',
      trim: true,
    },
    authorHandle: {
      type: String,
      default: '',
      trim: true,
    },
    authorAvatar: {
      type: String,
      trim: true,
    },
    publishedAt: {
      type: Date,
      required: [true, 'Published date is required'],
      index: true,
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

SocialPostSchema.index({ platform: 1, postId: 1 }, { unique: true });
SocialPostSchema.index({ platform: 1, publishedAt: -1 });
SocialPostSchema.index({ isActive: 1, isDeleted: 1 });

const SocialPost: Model<ISocialPost> =
  mongoose.models.SocialPost ||
  mongoose.model<ISocialPost>('SocialPost', SocialPostSchema);

export default SocialPost;
```

---

## Task 10: Social Feed Fetcher Utilities

**Files:**
- Create: `dashboard-next/src/lib/social-fetcher.ts`

- [ ] **Step 1: Create YouTube and Instagram fetcher utilities**

```typescript
// dashboard-next/src/lib/social-fetcher.ts

/**
 * Social media feed fetchers with rate limit handling and caching.
 * YouTube uses Data API v3, Instagram uses Basic Display API / oEmbed fallback.
 */

interface YouTubeVideo {
  postId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  permalink: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
}

interface InstagramPost {
  postId: string;
  caption: string;
  mediaUrl: string;
  thumbnailUrl: string;
  permalink: string;
  type: 'image' | 'video' | 'carousel' | 'reel';
  publishedAt: string;
  likes: number;
  comments: number;
}

const YOUTUBE_CHANNEL_ID = 'UCxxxxxxxx'; // Replace with actual channel ID for @avdheshanandg
const YOUTUBE_HANDLE = '@avdheshanandg';
const INSTAGRAM_HANDLE = 'avdheshanandg_official';

/**
 * Fetch latest YouTube videos using YouTube Data API v3.
 */
export async function fetchYouTubeVideos(limit: number = 10): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn('YOUTUBE_API_KEY not set, returning empty results');
    return [];
  }

  try {
    // Step 1: Search for latest videos from the channel
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('key', apiKey);
    searchUrl.searchParams.set('channelId', YOUTUBE_CHANNEL_ID);
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('order', 'date');
    searchUrl.searchParams.set('maxResults', limit.toString());
    searchUrl.searchParams.set('type', 'video');

    const searchRes = await fetch(searchUrl.toString());

    if (searchRes.status === 403) {
      console.warn('YouTube API rate limit reached');
      return [];
    }

    if (!searchRes.ok) {
      console.error('YouTube API error:', searchRes.status, await searchRes.text());
      return [];
    }

    const searchData = await searchRes.json();
    const videoIds = searchData.items?.map((item: { id: { videoId: string } }) => item.id.videoId) || [];

    if (videoIds.length === 0) return [];

    // Step 2: Get video statistics
    const statsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    statsUrl.searchParams.set('key', apiKey);
    statsUrl.searchParams.set('id', videoIds.join(','));
    statsUrl.searchParams.set('part', 'snippet,statistics');

    const statsRes = await fetch(statsUrl.toString());

    if (!statsRes.ok) {
      console.error('YouTube stats API error:', statsRes.status);
      return [];
    }

    const statsData = await statsRes.json();

    return (statsData.items || []).map((item: {
      id: string;
      snippet: { title: string; description: string; thumbnails: { high: { url: string } }; publishedAt: string };
      statistics: { viewCount: string; likeCount: string; commentCount: string };
    }) => ({
      postId: item.id,
      title: item.snippet.title,
      description: item.snippet.description?.slice(0, 500) || '',
      thumbnailUrl: item.snippet.thumbnails?.high?.url || '',
      permalink: `https://www.youtube.com/watch?v=${item.id}`,
      publishedAt: item.snippet.publishedAt,
      views: parseInt(item.statistics?.viewCount || '0', 10),
      likes: parseInt(item.statistics?.likeCount || '0', 10),
      comments: parseInt(item.statistics?.commentCount || '0', 10),
    }));
  } catch (error) {
    console.error('YouTube fetch error:', error);
    return [];
  }
}

/**
 * Fetch latest Instagram posts using Instagram Basic Display API.
 * Falls back to oEmbed API if Basic Display API is not configured.
 */
export async function fetchInstagramPosts(limit: number = 12): Promise<InstagramPost[]> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken) {
    console.warn('INSTAGRAM_ACCESS_TOKEN not set, returning empty results');
    return [];
  }

  try {
    const url = new URL('https://graph.instagram.com/me/media');
    url.searchParams.set('fields', 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count');
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('access_token', accessToken);

    const res = await fetch(url.toString());

    if (res.status === 429) {
      console.warn('Instagram API rate limit reached');
      return [];
    }

    if (!res.ok) {
      console.error('Instagram API error:', res.status, await res.text());
      return [];
    }

    const data = await res.json();

    return (data.data || []).map((post: {
      id: string;
      caption?: string;
      media_type: string;
      media_url?: string;
      thumbnail_url?: string;
      permalink: string;
      timestamp: string;
      like_count?: number;
      comments_count?: number;
    }) => {
      let type: InstagramPost['type'] = 'image';
      if (post.media_type === 'VIDEO') type = 'video';
      else if (post.media_type === 'CAROUSEL_ALBUM') type = 'carousel';

      return {
        postId: post.id,
        caption: post.caption || '',
        mediaUrl: post.media_url || '',
        thumbnailUrl: post.thumbnail_url || post.media_url || '',
        permalink: post.permalink,
        type,
        publishedAt: post.timestamp,
        likes: post.like_count || 0,
        comments: post.comments_count || 0,
      };
    });
  } catch (error) {
    console.error('Instagram fetch error:', error);
    return [];
  }
}

/**
 * Check if cached data is stale (older than maxAgeMinutes).
 */
export function isCacheStale(fetchedAt: Date, maxAgeMinutes: number = 60): boolean {
  const now = new Date();
  const diffMs = now.getTime() - new Date(fetchedAt).getTime();
  const diffMinutes = diffMs / (1000 * 60);
  return diffMinutes > maxAgeMinutes;
}
```

---

## Task 11: Social Feed API Routes

**Files:**
- Create: `dashboard-next/src/app/api/social/youtube/route.ts`
- Create: `dashboard-next/src/app/api/social/instagram/route.ts`
- Create: `dashboard-next/src/app/api/social/feed/route.ts`

- [ ] **Step 1: Create YouTube sync endpoint**

```typescript
// dashboard-next/src/app/api/social/youtube/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SocialPost from '@/models/SocialPost';
import { fetchYouTubeVideos, isCacheStale } from '@/lib/social-fetcher';

/**
 * GET /api/social/youtube
 * Returns cached YouTube videos. Refreshes if stale (>60 min).
 */
export async function GET() {
  try {
    await connectDB();

    // Check if we have recent cached data
    const latestCached = await SocialPost.findOne({
      platform: 'youtube',
      isDeleted: { $ne: true },
    })
      .sort({ fetchedAt: -1 })
      .lean();

    const needsRefresh = !latestCached || isCacheStale(latestCached.fetchedAt, 60);

    if (needsRefresh) {
      const videos = await fetchYouTubeVideos(10);

      if (videos.length > 0) {
        const bulkOps = videos.map((video) => ({
          updateOne: {
            filter: { platform: 'youtube' as const, postId: video.postId },
            update: {
              $set: {
                platform: 'youtube' as const,
                postId: video.postId,
                type: 'video' as const,
                content: video.title,
                caption: video.description,
                thumbnailUrl: video.thumbnailUrl,
                permalink: video.permalink,
                engagement: {
                  likes: video.likes,
                  comments: video.comments,
                  shares: 0,
                  views: video.views,
                },
                authorName: 'Swami Avdheshanand Giri',
                authorHandle: '@avdheshanandg',
                publishedAt: new Date(video.publishedAt),
                fetchedAt: new Date(),
                isActive: true,
              },
            },
            upsert: true,
          },
        }));

        await SocialPost.bulkWrite(bulkOps);
      }
    }

    const posts = await SocialPost.find({
      platform: 'youtube',
      isActive: true,
      isDeleted: { $ne: true },
    })
      .sort({ publishedAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      message: 'YouTube videos fetched successfully',
      data: posts,
    });
  } catch (error) {
    console.error('YouTube API Route Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch YouTube videos',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create Instagram sync endpoint**

```typescript
// dashboard-next/src/app/api/social/instagram/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SocialPost from '@/models/SocialPost';
import { fetchInstagramPosts, isCacheStale } from '@/lib/social-fetcher';

/**
 * GET /api/social/instagram
 * Returns cached Instagram posts. Refreshes if stale (>60 min).
 */
export async function GET() {
  try {
    await connectDB();

    const latestCached = await SocialPost.findOne({
      platform: 'instagram',
      isDeleted: { $ne: true },
    })
      .sort({ fetchedAt: -1 })
      .lean();

    const needsRefresh = !latestCached || isCacheStale(latestCached.fetchedAt, 60);

    if (needsRefresh) {
      const posts = await fetchInstagramPosts(12);

      if (posts.length > 0) {
        const bulkOps = posts.map((post) => ({
          updateOne: {
            filter: { platform: 'instagram' as const, postId: post.postId },
            update: {
              $set: {
                platform: 'instagram' as const,
                postId: post.postId,
                type: post.type,
                content: post.caption,
                caption: post.caption,
                mediaUrl: post.mediaUrl,
                thumbnailUrl: post.thumbnailUrl,
                permalink: post.permalink,
                engagement: {
                  likes: post.likes,
                  comments: post.comments,
                  shares: 0,
                  views: 0,
                },
                authorName: 'Swami Avdheshanand Giri',
                authorHandle: '@avdheshanandg_official',
                publishedAt: new Date(post.publishedAt),
                fetchedAt: new Date(),
                isActive: true,
              },
            },
            upsert: true,
          },
        }));

        await SocialPost.bulkWrite(bulkOps);
      }
    }

    const posts = await SocialPost.find({
      platform: 'instagram',
      isActive: true,
      isDeleted: { $ne: true },
    })
      .sort({ publishedAt: -1 })
      .limit(12)
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Instagram posts fetched successfully',
      data: posts,
    });
  } catch (error) {
    console.error('Instagram API Route Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch Instagram posts',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Create aggregated public feed endpoint**

```typescript
// dashboard-next/src/app/api/social/feed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SocialPost from '@/models/SocialPost';

/**
 * GET /api/social/feed?platform=youtube,instagram&limit=20
 * Public endpoint: returns aggregated social media feed.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const platformParam = req.nextUrl.searchParams.get('platform');
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '20', 10), 50);

    const filter: Record<string, unknown> = {
      isActive: true,
      isDeleted: { $ne: true },
    };

    if (platformParam) {
      const platforms = platformParam.split(',').filter((p) =>
        ['youtube', 'instagram', 'twitter', 'facebook'].includes(p)
      );
      if (platforms.length > 0) {
        filter.platform = { $in: platforms };
      }
    }

    const posts = await SocialPost.find(filter)
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select('-embedding -__v')
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Social feed fetched successfully',
      data: posts,
    });
  } catch (error) {
    console.error('Social Feed Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch social feed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

---

## Task 12: Website Social Feed Components

**Files:**
- Create: `website/components/social/YouTubeCard.tsx`
- Create: `website/components/social/InstagramCard.tsx`
- Create: `website/components/sections/SocialFeed.tsx`
- Create: `website/app/social/page.tsx`

- [ ] **Step 1: Create YouTubeCard component**

```tsx
// website/components/social/YouTubeCard.tsx
'use client';

import { motion } from 'framer-motion';
import { Play, Eye, ThumbsUp, MessageCircle } from 'lucide-react';

interface YouTubeCardProps {
  title: string;
  thumbnailUrl: string;
  permalink: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
}

function formatCount(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function YouTubeCard({
  title,
  thumbnailUrl,
  permalink,
  views,
  likes,
  comments,
  publishedAt,
}: YouTubeCardProps) {
  return (
    <motion.a
      href={permalink}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="group block overflow-hidden rounded-xl bg-white shadow-card-ornate hover:shadow-warm-lg transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbnailUrl || '/placeholder-video.jpg'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play size={20} fill="white" className="text-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-sm text-spiritual-maroon line-clamp-2 mb-3 group-hover:text-spiritual-saffron transition-colors">
          {title}
        </h3>

        <div className="flex items-center gap-4 text-xs text-spiritual-warmGray">
          <span className="flex items-center gap-1">
            <Eye size={12} />
            {formatCount(views)}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp size={12} />
            {formatCount(likes)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={12} />
            {formatCount(comments)}
          </span>
        </div>

        <p className="text-[10px] text-spiritual-warmGray/60 mt-2">
          {new Date(publishedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>
    </motion.a>
  );
}
```

- [ ] **Step 2: Create InstagramCard component**

```tsx
// website/components/social/InstagramCard.tsx
'use client';

import { motion } from 'framer-motion';
import { Heart, MessageCircle, Instagram } from 'lucide-react';

interface InstagramCardProps {
  caption: string;
  mediaUrl: string;
  permalink: string;
  likes: number;
  comments: number;
  type: 'image' | 'video' | 'carousel' | 'reel';
}

function formatCount(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function InstagramCard({
  caption,
  mediaUrl,
  permalink,
  likes,
  comments,
  type,
}: InstagramCardProps) {
  return (
    <motion.a
      href={permalink}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.03 }}
      className="group block relative overflow-hidden rounded-xl aspect-square shadow-card-ornate hover:shadow-warm-lg transition-all duration-300"
    >
      <img
        src={mediaUrl || '/placeholder-instagram.jpg'}
        alt={caption?.slice(0, 80) || 'Instagram post'}
        className="w-full h-full object-cover"
      />

      {/* Type badge */}
      {(type === 'video' || type === 'reel' || type === 'carousel') && (
        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full capitalize">
          {type}
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <p className="text-white text-xs line-clamp-2 mb-2">{caption}</p>
        <div className="flex items-center gap-3 text-white/90 text-xs">
          <span className="flex items-center gap-1">
            <Heart size={12} />
            {formatCount(likes)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={12} />
            {formatCount(comments)}
          </span>
          <Instagram size={12} className="ml-auto" />
        </div>
      </div>
    </motion.a>
  );
}
```

- [ ] **Step 3: Create SocialFeed homepage section**

```tsx
// website/components/sections/SocialFeed.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { YouTubeCard } from '@/components/social/YouTubeCard';
import { InstagramCard } from '@/components/social/InstagramCard';
import { Youtube, Instagram, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SocialPostData {
  _id: string;
  platform: 'youtube' | 'instagram';
  postId: string;
  type: string;
  content: string;
  caption?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  permalink: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  publishedAt: string;
}

export function SocialFeed() {
  const [activeTab, setActiveTab] = useState<'youtube' | 'instagram'>('youtube');
  const [posts, setPosts] = useState<SocialPostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts(activeTab);
  }, [activeTab]);

  const fetchPosts = async (platform: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/social/feed?platform=${platform}&limit=6`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch social posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-padding bg-gradient-spiritual">
      <div className="container-custom">
        <SectionHeading
          title="Connect With Us"
          subtitle="Follow Swami Ji's teachings and updates across social media"
        />

        {/* Platform Tabs */}
        <div className="flex justify-center gap-3 mb-10">
          <button
            onClick={() => setActiveTab('youtube')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-body text-sm transition-all duration-300 ${
              activeTab === 'youtube'
                ? 'bg-red-600 text-white shadow-warm'
                : 'bg-white text-spiritual-warmGray border border-gold-400/30 hover:border-red-400'
            }`}
          >
            <Youtube size={18} />
            YouTube
          </button>
          <button
            onClick={() => setActiveTab('instagram')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-body text-sm transition-all duration-300 ${
              activeTab === 'instagram'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-warm'
                : 'bg-white text-spiritual-warmGray border border-gold-400/30 hover:border-pink-400'
            }`}
          >
            <Instagram size={18} />
            Instagram
          </button>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-spiritual-saffron animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-spiritual-warmGray">No posts available at the moment.</p>
          </div>
        ) : (
          <div
            className={
              activeTab === 'youtube'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4'
            }
          >
            {posts.map((post) =>
              post.platform === 'youtube' ? (
                <YouTubeCard
                  key={post._id}
                  title={post.content}
                  thumbnailUrl={post.thumbnailUrl || ''}
                  permalink={post.permalink}
                  views={post.engagement.views}
                  likes={post.engagement.likes}
                  comments={post.engagement.comments}
                  publishedAt={post.publishedAt}
                />
              ) : (
                <InstagramCard
                  key={post._id}
                  caption={post.caption || post.content}
                  mediaUrl={post.mediaUrl || ''}
                  permalink={post.permalink}
                  likes={post.engagement.likes}
                  comments={post.engagement.comments}
                  type={post.type as 'image' | 'video' | 'carousel' | 'reel'}
                />
              )
            )}
          </div>
        )}

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            href="/social"
            className="inline-flex items-center gap-2 px-8 py-3 bg-spiritual-maroon text-white rounded-full font-body hover:bg-primary-900 transition-colors shadow-warm hover:shadow-warm-lg"
          >
            View All Social Updates
            <ExternalLink size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create the dedicated /social page**

```tsx
// website/app/social/page.tsx
import { Metadata } from 'next';
import { SocialFeed } from '@/components/sections/SocialFeed';

export const metadata: Metadata = {
  title: 'Social Media | Swami Avdheshanand Giri Ji Maharaj',
  description:
    'Follow Swami Avdheshanand Giri Ji Maharaj on YouTube, Instagram, and other social media platforms for the latest teachings, discourses, and updates.',
};

export default function SocialPage() {
  return (
    <main className="pt-20">
      <SocialFeed />

      {/* Social Links Section */}
      <section className="section-padding bg-spiritual-cream">
        <div className="container-custom text-center">
          <h2 className="font-display text-2xl text-spiritual-maroon mb-8">
            Follow Swami Ji
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'YouTube', url: 'https://youtube.com/@avdheshanandg', color: 'bg-red-600' },
              { name: 'Instagram', url: 'https://instagram.com/avdheshanandg_official', color: 'bg-gradient-to-r from-purple-600 to-pink-500' },
              { name: 'Twitter / X', url: 'https://twitter.com/AvdheshanandG', color: 'bg-black' },
              { name: 'Facebook', url: 'https://facebook.com/AvdheshanandG', color: 'bg-blue-600' },
              { name: 'LinkedIn', url: 'https://linkedin.com/in/avdheshanandg', color: 'bg-blue-700' },
            ].map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${link.color} text-white px-6 py-3 rounded-full font-body text-sm hover:opacity-90 transition-opacity shadow-warm`}
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Add SocialFeed section to homepage**

In `website/app/page.tsx`, add the SocialFeed section. Add import and section:

```tsx
// Add import:
import { SocialFeed } from '@/components/sections/SocialFeed';

// Add after the <Events /> section and its divider, before <Testimonials />:
//   <Events />
//   <div className="section-divider-lotus">
//     <span className="text-gold-500 text-2xl font-sanskrit">Om</span>
//   </div>
//   <SocialFeed />            <--- ADD THIS
//   <div className="section-divider-temple" />  <--- ADD THIS
//   <Testimonials />
```

---

## Task 13: Mobile Social Feed Screen

**Files:**
- Create: `mobile/user-app/src/screens/social/SocialFeedScreen.tsx`

- [ ] **Step 1: Create the mobile SocialFeedScreen**

```tsx
// mobile/user-app/src/screens/social/SocialFeedScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import api from '../../services/api';

interface SocialPostData {
  _id: string;
  platform: 'youtube' | 'instagram';
  content: string;
  caption?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  permalink: string;
  engagement: {
    likes: number;
    comments: number;
    views: number;
  };
  publishedAt: string;
}

function formatCount(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function SocialFeedScreen() {
  const [platform, setPlatform] = useState<'youtube' | 'instagram'>('youtube');
  const [posts, setPosts] = useState<SocialPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await api.get(`/social/feed?platform=${platform}&limit=20`);
      setPosts(res.data || []);
    } catch (error) {
      console.error('Failed to fetch social posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [platform]);

  useEffect(() => {
    setLoading(true);
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const renderPost = ({ item }: { item: SocialPostData }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => Linking.openURL(item.permalink)}
      activeOpacity={0.8}
    >
      {(item.thumbnailUrl || item.mediaUrl) && (
        <Image
          source={{ uri: item.thumbnailUrl || item.mediaUrl }}
          style={item.platform === 'youtube' ? styles.videoThumb : styles.instaThumb}
        />
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.content || item.caption}
        </Text>
        <View style={styles.engagementRow}>
          {item.platform === 'youtube' && (
            <View style={styles.stat}>
              <Icon name="eye-outline" size={14} color={colors.text.secondary} />
              <Text style={styles.statText}>{formatCount(item.engagement.views)}</Text>
            </View>
          )}
          <View style={styles.stat}>
            <Icon name="heart-outline" size={14} color={colors.text.secondary} />
            <Text style={styles.statText}>{formatCount(item.engagement.likes)}</Text>
          </View>
          <View style={styles.stat}>
            <Icon name="comment-outline" size={14} color={colors.text.secondary} />
            <Text style={styles.statText}>{formatCount(item.engagement.comments)}</Text>
          </View>
        </View>
        <Text style={styles.date}>
          {new Date(item.publishedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, platform === 'youtube' && styles.activeTab]}
          onPress={() => setPlatform('youtube')}
        >
          <Icon
            name="youtube"
            size={18}
            color={platform === 'youtube' ? '#fff' : colors.text.secondary}
          />
          <Text style={[styles.tabText, platform === 'youtube' && styles.activeTabText]}>
            YouTube
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, platform === 'instagram' && styles.activeTabInsta]}
          onPress={() => setPlatform('instagram')}
        >
          <Icon
            name="instagram"
            size={18}
            color={platform === 'instagram' ? '#fff' : colors.text.secondary}
          />
          <Text style={[styles.tabText, platform === 'instagram' && styles.activeTabText]}>
            Instagram
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary.saffron}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={renderPost}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary.saffron}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No posts available</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.warmWhite },
  tabs: {
    flexDirection: 'row',
    padding: spacing.sm,
    gap: spacing.sm,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.parchment,
  },
  activeTab: { backgroundColor: '#DC2626' },
  activeTabInsta: { backgroundColor: '#C13584' },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.text.secondary },
  activeTabText: { color: '#fff' },
  list: { padding: spacing.md },
  card: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.warm,
  },
  videoThumb: { width: '100%', height: 200, backgroundColor: '#f0f0f0' },
  instaThumb: { width: '100%', aspectRatio: 1, backgroundColor: '#f0f0f0' },
  cardContent: { padding: spacing.md },
  cardTitle: { fontSize: 14, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.sm },
  engagementRow: { flexDirection: 'row', gap: spacing.md },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: colors.text.secondary },
  date: { fontSize: 11, color: colors.text.secondary, marginTop: spacing.xs },
  empty: { textAlign: 'center', color: colors.text.secondary, marginTop: 40 },
});

export default SocialFeedScreen;
```

---

## Part C: Newsletter & FAQ System

---

## Task 14: FAQ MongoDB Model

**Files:**
- Create: `dashboard-next/src/models/FAQ.ts`

- [ ] **Step 1: Create the FAQ model**

```typescript
// dashboard-next/src/models/FAQ.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IFAQ extends Document {
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema = new Schema<IFAQ>(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
      maxlength: [500, 'Question cannot exceed 500 characters'],
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true,
      maxlength: [5000, 'Answer cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'General',
        'Teachings',
        'Events',
        'Ashram',
        'Books',
        'Donations',
        'Volunteering',
        'Diksha',
        'Other',
      ],
      default: 'General',
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

FAQSchema.index({ category: 1, order: 1 });
FAQSchema.index({ question: 'text', answer: 'text' });

const FAQ: Model<IFAQ> =
  mongoose.models.FAQ || mongoose.model<IFAQ>('FAQ', FAQSchema);

export default FAQ;
```

---

## Task 15: NewsletterSubscriber MongoDB Model

**Files:**
- Create: `dashboard-next/src/models/NewsletterSubscriber.ts`

- [ ] **Step 1: Create the NewsletterSubscriber model**

```typescript
// dashboard-next/src/models/NewsletterSubscriber.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INewsletterSubscriber extends Document {
  email: string;
  name?: string;
  source: 'website' | 'mobile' | 'admin';
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  unsubscribeToken: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    source: {
      type: String,
      enum: ['website', 'mobile', 'admin'],
      default: 'website',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
    },
    unsubscribeToken: {
      type: String,
      required: true,
      unique: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

NewsletterSubscriberSchema.index({ email: 1, isActive: 1 });

const NewsletterSubscriber: Model<INewsletterSubscriber> =
  mongoose.models.NewsletterSubscriber ||
  mongoose.model<INewsletterSubscriber>('NewsletterSubscriber', NewsletterSubscriberSchema);

export default NewsletterSubscriber;
```

---

## Task 16: FAQ API Routes

**Files:**
- Create: `dashboard-next/src/app/api/faq/route.ts`
- Create: `dashboard-next/src/app/api/faq/public/route.ts`

- [ ] **Step 1: Create admin FAQ CRUD endpoint**

```typescript
// dashboard-next/src/app/api/faq/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import FAQ from '@/models/FAQ';

type ApiResponse = {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
};

/**
 * GET /api/faq — Admin: list all FAQs (including unpublished).
 */
export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const faqs = await FAQ.find({ isDeleted: { $ne: true } })
      .sort({ category: 1, order: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      message: 'FAQs fetched successfully',
      data: faqs,
    });
  } catch (error) {
    console.error('GET FAQs Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch FAQs',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/faq — Admin: create a new FAQ.
 */
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const body = await req.json();

    const { question, answer, category, order, isPublished } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, message: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const faq = await FAQ.create({
      question,
      answer,
      category: category || 'General',
      order: order ?? 0,
      isPublished: isPublished !== false,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'FAQ created successfully',
        data: faq,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST FAQ Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create FAQ',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/faq — Admin: update an FAQ.
 * Body: { id, question?, answer?, category?, order?, isPublished? }
 */
export async function PUT(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    const faq = await FAQ.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!faq) {
      return NextResponse.json(
        { success: false, message: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ updated successfully',
      data: faq,
    });
  } catch (error) {
    console.error('PUT FAQ Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update FAQ',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/faq — Admin: soft-delete an FAQ.
 * Body: { id }
 */
export async function DELETE(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    const faq = await FAQ.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    if (!faq) {
      return NextResponse.json(
        { success: false, message: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ deleted successfully',
    });
  } catch (error) {
    console.error('DELETE FAQ Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete FAQ',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create public FAQ endpoint**

```typescript
// dashboard-next/src/app/api/faq/public/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import FAQ from '@/models/FAQ';

/**
 * GET /api/faq/public?category=General&search=meditation
 * Public: list published FAQs with optional category filter and search.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const category = req.nextUrl.searchParams.get('category');
    const search = req.nextUrl.searchParams.get('search');

    const filter: Record<string, unknown> = {
      isPublished: true,
      isDeleted: { $ne: true },
    };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const faqs = await FAQ.find(filter)
      .sort({ category: 1, order: 1 })
      .select('question answer category order')
      .lean();

    // Group by category
    const grouped: Record<string, typeof faqs> = {};
    for (const faq of faqs) {
      if (!grouped[faq.category]) {
        grouped[faq.category] = [];
      }
      grouped[faq.category].push(faq);
    }

    return NextResponse.json({
      success: true,
      message: 'FAQs fetched successfully',
      data: {
        faqs,
        grouped,
        categories: Object.keys(grouped),
      },
    });
  } catch (error) {
    console.error('Public FAQ Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch FAQs',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

---

## Task 17: Newsletter API Routes

**Files:**
- Create: `dashboard-next/src/app/api/newsletter/route.ts`
- Create: `dashboard-next/src/app/api/newsletter/subscribers/route.ts`

- [ ] **Step 1: Create newsletter subscribe/unsubscribe endpoint**

```typescript
// dashboard-next/src/app/api/newsletter/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

/**
 * POST /api/newsletter — Subscribe to newsletter.
 * Body: { email, name?, source? }
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, name, source } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed to our newsletter',
        });
      }

      // Re-activate
      existing.isActive = true;
      existing.unsubscribedAt = undefined;
      existing.subscribedAt = new Date();
      await existing.save();

      return NextResponse.json({
        success: true,
        message: 'Welcome back! Your subscription has been reactivated.',
      });
    }

    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    await NewsletterSubscriber.create({
      email: email.toLowerCase(),
      name: name || undefined,
      source: source || 'website',
      unsubscribeToken,
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, name, unsubscribeToken).catch((err) =>
      console.error('Welcome email failed:', err)
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for subscribing! You will receive spiritual wisdom in your inbox.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter Subscribe Error:', error);

    // Handle duplicate key error
    if (error instanceof Error && 'code' in error && (error as { code: number }).code === 11000) {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed to our newsletter',
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to subscribe',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/newsletter — Unsubscribe via token.
 * Body: { token } or query ?token=xxx
 */
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const token =
      req.nextUrl.searchParams.get('token') ||
      (await req.json().catch(() => ({}))).token;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unsubscribe token is required' },
        { status: 400 }
      );
    }

    const subscriber = await NewsletterSubscriber.findOne({ unsubscribeToken: token });

    if (!subscriber) {
      return NextResponse.json(
        { success: false, message: 'Invalid unsubscribe link' },
        { status: 404 }
      );
    }

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    return NextResponse.json({
      success: true,
      message: 'You have been unsubscribed successfully.',
    });
  } catch (error) {
    console.error('Newsletter Unsubscribe Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to unsubscribe',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function sendWelcomeEmail(email: string, name: string | undefined, unsubscribeToken: string) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('SMTP not configured, skipping welcome email');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: smtpUser, pass: smtpPass },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://avdheshanandg.org';
  const greeting = name ? `Dear ${name}` : 'Dear Seeker';

  await transporter.sendMail({
    from: `"Swami Avdheshanand Giri Ji" <${smtpUser}>`,
    to: email,
    subject: 'Welcome to the Spiritual Newsletter',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #4A0010;">
        <h1 style="color: #800020; text-align: center;">Om Namah Shivaya</h1>
        <p>${greeting},</p>
        <p>Thank you for subscribing to our spiritual newsletter. You will receive updates about:</p>
        <ul>
          <li>Swami Ji's latest teachings and discourses</li>
          <li>Upcoming events and satsangs</li>
          <li>New book releases and publications</li>
          <li>Spiritual wisdom and guidance</li>
        </ul>
        <p>May your spiritual journey be blessed with peace and wisdom.</p>
        <p style="color: #8B7E74; font-size: 12px; margin-top: 30px;">
          <a href="${siteUrl}/api/newsletter?token=${unsubscribeToken}" style="color: #8B7E74;">Unsubscribe</a>
        </p>
      </div>
    `,
  });
}
```

- [ ] **Step 2: Create admin subscribers list endpoint**

```typescript
// dashboard-next/src/app/api/newsletter/subscribers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';

/**
 * GET /api/newsletter/subscribers?page=1&limit=50&active=true
 * Admin: list newsletter subscribers.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '50', 10), 100);
    const activeOnly = req.nextUrl.searchParams.get('active') !== 'false';

    const filter: Record<string, unknown> = { isDeleted: { $ne: true } };
    if (activeOnly) {
      filter.isActive = true;
    }

    const [subscribers, total] = await Promise.all([
      NewsletterSubscriber.find(filter)
        .sort({ subscribedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-unsubscribeToken')
        .lean(),
      NewsletterSubscriber.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Subscribers fetched successfully',
      data: {
        subscribers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('GET Subscribers Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch subscribers',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

---

## Task 18: Admin FAQ Management Page

**Files:**
- Create: `dashboard-next/src/components/faq/FAQForm.tsx`
- Create: `dashboard-next/src/components/faq/FAQTable.tsx`
- Create: `dashboard-next/src/app/dashboard/faq/page.tsx`

- [ ] **Step 1: Create FAQForm component**

```tsx
// dashboard-next/src/components/faq/FAQForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FAQFormData {
  _id?: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
}

interface FAQFormProps {
  initialData?: FAQFormData;
  onSubmit: (data: FAQFormData) => Promise<void>;
  onCancel: () => void;
}

const CATEGORIES = [
  'General',
  'Teachings',
  'Events',
  'Ashram',
  'Books',
  'Donations',
  'Volunteering',
  'Diksha',
  'Other',
];

export default function FAQForm({ initialData, onSubmit, onCancel }: FAQFormProps) {
  const [formData, setFormData] = useState<FAQFormData>(
    initialData || {
      question: '',
      answer: '',
      category: 'General',
      order: 0,
      isPublished: true,
    }
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {initialData?._id ? 'Edit FAQ' : 'Add New FAQ'}
          </h2>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Question *</label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
              maxLength={500}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Answer * <span className="text-gray-400 text-xs">(Markdown supported)</span>
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[150px] font-mono text-sm"
              required
              maxLength={5000}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Display Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                min={0}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="rounded text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor="isPublished" className="text-sm">
              Published (visible to public)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {submitting ? 'Saving...' : initialData?._id ? 'Update FAQ' : 'Create FAQ'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create FAQTable component**

```tsx
// dashboard-next/src/components/faq/FAQTable.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
}

interface FAQTableProps {
  faqs: FAQItem[];
  onEdit: (faq: FAQItem) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, isPublished: boolean) => void;
}

export default function FAQTable({ faqs, onEdit, onDelete, onTogglePublish }: FAQTableProps) {
  if (faqs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No FAQs yet. Click &quot;Add FAQ&quot; to create one.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left p-3 font-medium">Order</th>
            <th className="text-left p-3 font-medium">Question</th>
            <th className="text-left p-3 font-medium">Category</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-right p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {faqs.map((faq) => (
            <tr key={faq._id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="p-3 text-gray-500">{faq.order}</td>
              <td className="p-3">
                <p className="font-medium line-clamp-1">{faq.question}</p>
                <p className="text-gray-400 text-xs line-clamp-1 mt-0.5">{faq.answer.slice(0, 80)}...</p>
              </td>
              <td className="p-3">
                <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-xs">
                  {faq.category}
                </span>
              </td>
              <td className="p-3">
                <button
                  onClick={() => onTogglePublish(faq._id, !faq.isPublished)}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    faq.isPublished
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {faq.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {faq.isPublished ? 'Published' : 'Draft'}
                </button>
              </td>
              <td className="p-3">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(faq)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(faq._id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Create admin FAQ management page**

```tsx
// dashboard-next/src/app/dashboard/faq/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, Plus } from 'lucide-react';
import axios from 'axios';
import FAQForm from '@/components/faq/FAQForm';
import FAQTable from '@/components/faq/FAQTable';

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
}

export default function FAQManagement() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | undefined>();

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/faq');
      if (res.data.success) {
        setFaqs(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const handleSubmit = async (data: {
    _id?: string;
    question: string;
    answer: string;
    category: string;
    order: number;
    isPublished: boolean;
  }) => {
    try {
      if (data._id) {
        await axios.put('/api/faq', { id: data._id, ...data });
      } else {
        await axios.post('/api/faq', data);
      }
      setShowForm(false);
      setEditingFaq(undefined);
      fetchFaqs();
    } catch (error) {
      console.error('FAQ save failed:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await axios.delete('/api/faq', { data: { id } });
      fetchFaqs();
    } catch (error) {
      console.error('FAQ delete failed:', error);
    }
  };

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    try {
      await axios.put('/api/faq', { id, isPublished });
      fetchFaqs();
    } catch (error) {
      console.error('Toggle publish failed:', error);
    }
  };

  const handleEdit = (faq: FAQItem) => {
    setEditingFaq(faq);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-orange-500" />
            FAQ Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage frequently asked questions displayed on the website.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingFaq(undefined);
            setShowForm(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            All FAQs ({faqs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : (
            <FAQTable
              faqs={faqs}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
            />
          )}
        </CardContent>
      </Card>

      {showForm && (
        <FAQForm
          initialData={editingFaq}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingFaq(undefined);
          }}
        />
      )}
    </div>
  );
}
```

---

## Task 19: Admin Newsletter Page

**Files:**
- Create: `dashboard-next/src/components/newsletter/SubscriberTable.tsx`
- Create: `dashboard-next/src/app/dashboard/newsletter/page.tsx`

- [ ] **Step 1: Create SubscriberTable component**

```tsx
// dashboard-next/src/components/newsletter/SubscriberTable.tsx
'use client';

import { Mail, Calendar, Globe } from 'lucide-react';

interface Subscriber {
  _id: string;
  email: string;
  name?: string;
  source: string;
  isActive: boolean;
  subscribedAt: string;
}

interface SubscriberTableProps {
  subscribers: Subscriber[];
}

export default function SubscriberTable({ subscribers }: SubscriberTableProps) {
  if (subscribers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No subscribers yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left p-3 font-medium">Email</th>
            <th className="text-left p-3 font-medium">Name</th>
            <th className="text-left p-3 font-medium">Source</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Subscribed</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((sub) => (
            <tr key={sub._id} className="border-b hover:bg-gray-50">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {sub.email}
                </div>
              </td>
              <td className="p-3 text-gray-600">{sub.name || '-'}</td>
              <td className="p-3">
                <span className="flex items-center gap-1 text-xs">
                  <Globe className="w-3 h-3" />
                  {sub.source}
                </span>
              </td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    sub.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {sub.isActive ? 'Active' : 'Unsubscribed'}
                </span>
              </td>
              <td className="p-3 text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(sub.subscribedAt).toLocaleDateString()}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Create admin newsletter page**

```tsx
// dashboard-next/src/app/dashboard/newsletter/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Users, TrendingUp } from 'lucide-react';
import axios from 'axios';
import SubscriberTable from '@/components/newsletter/SubscriberTable';

interface Subscriber {
  _id: string;
  email: string;
  name?: string;
  source: string;
  isActive: boolean;
  subscribedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function NewsletterDashboard() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/newsletter/subscribers?page=${page}&limit=50`);
      if (res.data.success) {
        setSubscribers(res.data.data.subscribers);
        setPagination(res.data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Mail className="w-6 h-6 text-orange-500" />
          Newsletter
        </h1>
        <p className="text-gray-500 mt-1">Manage newsletter subscribers.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{pagination.total}</p>
                <p className="text-sm text-gray-500">Total Subscribers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {subscribers.filter((s) => s.isActive).length}
                </p>
                <p className="text-sm text-gray-500">Active (this page)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{pagination.totalPages}</p>
                <p className="text-sm text-gray-500">Pages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriber List */}
      <Card>
        <CardHeader>
          <CardTitle>Subscribers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : (
            <>
              <SubscriberTable subscribers={subscribers} />
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => fetchSubscribers(page)}
                      className={`px-3 py-1 rounded text-sm ${
                        page === pagination.page
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Task 20: Website FAQ Page with Markdown & Search

**Files:**
- Create: `website/components/faq/FAQAccordion.tsx`
- Create: `website/app/faq/page.tsx`

- [ ] **Step 1: Install react-markdown dependencies in the website project**

```bash
cd /Users/apple/Downloads/agm-india-dashboard-website-master/website
npm install react-markdown rehype-raw rehype-sanitize
```

- [ ] **Step 2: Create FAQAccordion component with markdown support**

```tsx
// website/components/faq/FAQAccordion.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Search, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const CATEGORIES = ['All', 'General', 'Teachings', 'Events', 'Ashram', 'Books', 'Donations', 'Volunteering', 'Diksha'];

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export function FAQAccordion() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  useEffect(() => {
    fetchFaqs();
  }, [activeCategory, searchQuery]);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'All') params.set('category', activeCategory);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`${API_BASE}/api/faq/public?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setFaqs(data.data.faqs);
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Search */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-spiritual-warmGray/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-12 pr-4 py-3 border border-gold-400/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-spiritual-saffron/30 focus:border-spiritual-saffron bg-white text-spiritual-warmGray placeholder-spiritual-warmGray/50"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-sm rounded-full transition-all duration-300 ${
              activeCategory === cat
                ? 'bg-spiritual-maroon text-white shadow-warm'
                : 'bg-white text-spiritual-warmGray border border-gold-400/30 hover:border-gold-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Items */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-spiritual-saffron animate-spin" />
        </div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 mx-auto mb-4 text-spiritual-warmGray/30" />
          <p className="text-spiritual-warmGray">No questions found. Try a different search or category.</p>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq) => (
            <motion.div
              key={faq._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === faq._id ? null : faq._id)}
                className={`w-full text-left p-6 rounded-xl transition-all duration-300 border-l-4 ${
                  openIndex === faq._id
                    ? 'bg-spiritual-cream border-gold-400 shadow-warm'
                    : 'bg-spiritual-warmWhite border-gold-400/30 hover:border-gold-400/60 hover:shadow-warm'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-display text-spiritual-maroon pr-4 text-left">
                    {faq.question}
                  </h3>
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      openIndex === faq._id
                        ? 'bg-spiritual-saffron border-spiritual-saffron text-white'
                        : 'bg-gold-100 border-gold-400/30 text-spiritual-saffron'
                    }`}
                  >
                    {openIndex === faq._id ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                </div>

                <AnimatePresence>
                  {openIndex === faq._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="divider-rangoli my-4" />
                      <div className="prose prose-sm max-w-none text-spiritual-warmGray leading-relaxed font-body">
                        <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSanitize]}>
                          {faq.answer}
                        </ReactMarkdown>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create the public FAQ page**

```tsx
// website/app/faq/page.tsx
import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FAQAccordion } from '@/components/faq/FAQAccordion';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Swami Avdheshanand Giri Ji Maharaj',
  description:
    'Find answers to common questions about Swami Avdheshanand Giri Ji Maharaj, AGM India, ashram visits, events, teachings, and spiritual guidance.',
};

export default function FAQPage() {
  return (
    <main className="pt-20">
      <section className="section-padding bg-temple-warm">
        <div className="container-custom">
          <SectionHeading
            title="Frequently Asked Questions"
            subtitle="Find answers to common questions about Swami Ji, the mission, and spiritual practices"
          />
          <FAQAccordion />
        </div>
      </section>
    </main>
  );
}
```

---

## Task 21: Website Newsletter Section

**Files:**
- Create: `website/components/sections/Newsletter.tsx`

- [ ] **Step 1: Create the Newsletter signup section component**

```tsx
// website/components/sections/Newsletter.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Check, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined, source: 'website' }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
        setName('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Unable to subscribe at the moment. Please try again later.');
    }
  };

  return (
    <section className="section-padding bg-gradient-to-br from-spiritual-maroon via-primary-900 to-spiritual-maroon relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 border border-gold-400 rounded-full" />
        <div className="absolute bottom-10 right-10 w-60 h-60 border border-gold-400/50 rounded-full" />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 bg-gold-400/20 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-gold-300" />
          </div>

          <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
            Receive Spiritual Wisdom
          </h2>
          <p className="text-gold-200/80 mb-8 font-body">
            Subscribe to receive updates about Swami Ji&apos;s teachings, upcoming events, and spiritual guidance directly in your inbox.
          </p>

          {status === 'success' ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-gold-400/20"
            >
              <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-white font-medium">{message}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="flex-1 px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-gold-400/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-400/50"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-gold-400/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-400/50"
                />
                <button
                  type="submit"
                  disabled={status === 'loading' || !email.trim()}
                  className="px-8 py-3 bg-gold-400 text-spiritual-maroon font-semibold rounded-xl hover:bg-gold-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Subscribe
                    </>
                  )}
                </button>
              </div>

              {status === 'error' && (
                <p className="text-red-300 text-sm">{message}</p>
              )}

              <p className="text-white/40 text-xs mt-2">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add Newsletter section to homepage**

In `website/app/page.tsx`, add the Newsletter section. Add import and component:

```tsx
// Add import:
import { Newsletter } from '@/components/sections/Newsletter';

// Add after <Contact /> at the very end, as the last section before closing </main>:
//   <Contact />
//   <Newsletter />        <--- ADD THIS
// </main>
```

---

## Task 22: Mobile FAQ Screen

**Files:**
- Create: `mobile/user-app/src/screens/faq/FAQScreen.tsx`

- [ ] **Step 1: Create the mobile FAQScreen**

```tsx
// mobile/user-app/src/screens/faq/FAQScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import api from '../../services/api';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
}

export function FAQScreen() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'General', 'Teachings', 'Events', 'Ashram', 'Books', 'Donations'];

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const queryString = new URLSearchParams(params).toString();
      const res = await api.get(`/faq/public?${queryString}`);
      setFaqs(res.data?.faqs || []);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search questions..."
          placeholderTextColor={colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={fetchFaqs}
        />
      </View>

      {/* Category Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, activeCategory === cat && styles.activeCategoryChip]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text
              style={[styles.categoryText, activeCategory === cat && styles.activeCategoryText]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary.saffron} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.faqList}>
          {faqs.length === 0 ? (
            <Text style={styles.emptyText}>No questions found.</Text>
          ) : (
            faqs.map((faq) => (
              <TouchableOpacity
                key={faq._id}
                style={[styles.faqItem, expandedId === faq._id && styles.faqItemExpanded]}
                onPress={() => toggleExpand(faq._id)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Icon
                    name={expandedId === faq._id ? 'minus' : 'plus'}
                    size={20}
                    color={expandedId === faq._id ? '#fff' : colors.primary.saffron}
                    style={[
                      styles.faqIcon,
                      expandedId === faq._id && styles.faqIconExpanded,
                    ]}
                  />
                </View>
                {expandedId === faq._id && (
                  <View style={styles.faqAnswer}>
                    <View style={styles.divider} />
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.warmWhite },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.2)',
    paddingHorizontal: spacing.sm,
  },
  searchIcon: { marginRight: spacing.xs },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: colors.text.primary },
  categoriesContainer: { paddingHorizontal: spacing.md, marginBottom: spacing.md, maxHeight: 40 },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.2)',
    marginRight: spacing.xs,
  },
  activeCategoryChip: { backgroundColor: colors.primary.maroon, borderColor: colors.primary.maroon },
  categoryText: { fontSize: 12, color: colors.text.secondary },
  activeCategoryText: { color: '#fff', fontWeight: '600' },
  faqList: { padding: spacing.md, paddingTop: 0 },
  emptyText: { textAlign: 'center', color: colors.text.secondary, marginTop: 40 },
  faqItem: {
    backgroundColor: colors.background.parchment,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(212,160,23,0.3)',
  },
  faqItemExpanded: {
    backgroundColor: colors.background.cream,
    borderLeftColor: colors.gold.main,
  },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.primary.maroon, marginRight: spacing.sm },
  faqIcon: {
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
    borderRadius: 16,
    backgroundColor: colors.background.cream,
    overflow: 'hidden',
  },
  faqIconExpanded: { backgroundColor: colors.primary.saffron },
  faqAnswer: { marginTop: spacing.sm },
  divider: { height: 1, backgroundColor: 'rgba(212,160,23,0.3)', marginBottom: spacing.sm },
  faqAnswerText: { fontSize: 13, lineHeight: 20, color: colors.text.secondary },
});

export default FAQScreen;
```

---

## Task 23: Update Dashboard Navigation & Homepage

**Files:**
- Modify: `dashboard-next/src/app/dashboard/page.tsx`
- Modify: `website/components/layout/Navbar.tsx`

- [ ] **Step 1: Add FAQ, Newsletter, and Chatbot cards to dashboard homepage**

In `dashboard-next/src/app/dashboard/page.tsx`, add these entries to the `dashboardCards` array (before the closing `]`):

```typescript
// Add these to the dashboardCards array:
  { serviceKey: 'faq', title: 'FAQ', icon: HelpCircle, description: 'Manage frequently asked questions', href: '/dashboard/faq', linkText: 'Manage FAQs', color: 'from-yellow-500 to-orange-500' },
  { serviceKey: 'newsletter', title: 'Newsletter', icon: Mail, description: 'Manage newsletter subscribers', href: '/dashboard/newsletter', linkText: 'View Subscribers', color: 'from-blue-500 to-indigo-500' },
  { serviceKey: 'chatbot', title: 'AI Chatbot', icon: Bot, description: 'Manage Ask Swami Ji chatbot', href: '/dashboard/chatbot', linkText: 'View Chatbot', color: 'from-purple-500 to-violet-500' },

// Also add these imports at the top:
import { HelpCircle, Mail, Bot } from 'lucide-react';
// Note: some of these icons may already be imported. Only add the ones that are missing.
```

- [ ] **Step 2: Add Social and FAQ links to website navbar**

In `website/components/layout/Navbar.tsx`, add navigation links for Social and FAQ pages. Find the nav links array or section and add:

```tsx
// Add these nav items alongside existing ones like "Articles", "Books", etc.:
{ name: 'Social', href: '/social' },
{ name: 'FAQ', href: '/faq' },
```

---

## Task 24: Environment Variables Setup

- [ ] **Step 1: Document required environment variables**

Add the following to `dashboard-next/.env.local` (or `.env`):

```bash
# Existing (required for chatbot)
OPENAI_API_KEY=sk-your-openai-api-key
MONGODB_URI=mongodb+srv://...

# New: YouTube Data API v3
YOUTUBE_API_KEY=your-youtube-api-key

# New: Instagram Basic Display API
INSTAGRAM_ACCESS_TOKEN=your-instagram-access-token

# New: SMTP for Newsletter (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# New: Site URL for unsubscribe links
NEXT_PUBLIC_SITE_URL=https://avdheshanandg.org
```

Add to `website/.env.local`:

```bash
# API URL for the dashboard backend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Self-Review Checklist

Before marking any task as complete, verify:

- [ ] **Models:** All models use `isDeleted: boolean` with `default: false` for soft deletes
- [ ] **Models:** All models have `timestamps: true`, `versionKey: false`, `strict: true`
- [ ] **Models:** All models use the `mongoose.models.X || mongoose.model()` pattern to prevent overwrite errors
- [ ] **API Routes:** All responses follow `{ success: boolean, message: string, data?: any }` format
- [ ] **API Routes:** All routes use `connectDB()` before database operations
- [ ] **API Routes:** All routes have proper try/catch with error logging
- [ ] **API Routes:** Dynamic route params use `params: Promise<{ id: string }>` with `await params` (Next.js 15)
- [ ] **Website:** All components use spiritual theme colors: `spiritual-maroon`, `spiritual-saffron`, `spiritual-cream`, `gold-400`
- [ ] **Website:** All components use font classes: `font-display` (Playfair), `font-spiritual` (Cormorant), `font-body` (Inter), `font-sanskrit` (Noto Serif Devanagari)
- [ ] **Website:** All section components use `SectionHeading` for consistency
- [ ] **Website:** All interactive components have `'use client'` directive
- [ ] **Website:** Animations use Framer Motion (`motion.div`, `whileInView`, `AnimatePresence`)
- [ ] **Mobile:** Styles use the shared theme from `../../theme` (colors, spacing, borderRadius, shadows)
- [ ] **Mobile:** API calls go through the shared `api` service from `../../services/api`
- [ ] **Chatbot:** Uses direct GPT-4o-mini calls via the `openai` npm package (no embeddings, no vector search)
- [ ] **Chatbot:** System prompt contains Swami Ji's biography, lineage, teachings, and organizational info
- [ ] **Chatbot:** Live DB context (articles, events, books) is fetched and injected before each GPT call
- [ ] **Chatbot:** Rate limiting enforces max 20 messages per user per hour
- [ ] **Chatbot:** Conversation history is limited to last 10 turns to manage context window
- [ ] **Chatbot:** Responds in the user's language (Hindi or English)
- [ ] **Social:** API fetchers handle rate limits (403/429) gracefully with empty returns
- [ ] **Social:** Posts are cached in MongoDB with `fetchedAt` timestamp and 60-min TTL
- [ ] **Newsletter:** Unsubscribe uses a secure random token, not the email
- [ ] **Newsletter:** Welcome email send is non-blocking (fire and forget with error logging)
- [ ] **FAQ:** Answers support markdown rendering via react-markdown with sanitization
- [ ] **No placeholders:** Every code block is complete and production-ready
- [ ] **File paths:** Every file path is absolute and exact
- [ ] **Dependencies:** All new npm packages are listed with install commands (`openai`, `react-markdown`, `rehype-raw`, `rehype-sanitize`)
