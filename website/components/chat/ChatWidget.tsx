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

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');

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
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-16 h-16 bg-gradient-to-br from-spiritual-maroon to-primary-900 text-white rounded-full shadow-temple hover:shadow-warm-lg transition-all duration-300 hover:scale-110 flex items-center justify-center group"
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
          className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 bg-white rounded-2xl shadow-temple border border-spiritual-maroon/20 transition-all duration-300 flex flex-col ${
            isMinimized ? 'w-[calc(100vw-2rem)] sm:w-80 h-16' : 'w-[calc(100vw-2rem)] sm:w-96 h-[70vh] sm:h-[600px] max-h-[80vh]'
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
