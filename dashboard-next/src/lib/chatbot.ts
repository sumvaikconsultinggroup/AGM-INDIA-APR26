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
