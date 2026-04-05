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
