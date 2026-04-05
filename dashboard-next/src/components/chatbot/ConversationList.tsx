// dashboard-next/src/components/chatbot/ConversationList.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleExpand(conv._id);
              }
            }}
            role="button"
            tabIndex={0}
            aria-expanded={expandedId === conv._id}
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
