import { NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from '../../../lib/prompt';

// TODO: Add rate limiting and authentication for production use
const MAX_MESSAGE_LENGTH = 2000;

export async function POST(req) {
  try {
    const body = await req.json();
    const { message } = body;

    // Input validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: message is required and must be a string' },
        { status: 400 }
      );
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid input: message cannot be empty' },
        { status: 400 }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Invalid input: message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API Error:', data);
      return NextResponse.json(
        { error: data.error?.message || 'API request failed' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      reply: data.choices[0].message.content,
    });
  } catch (err) {
    console.error('Server Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
