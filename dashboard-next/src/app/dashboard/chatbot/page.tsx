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
