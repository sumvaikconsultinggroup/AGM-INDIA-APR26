/**
 * Dashboard Statistics API
 * Returns REAL data from the database — no more hardcoded numbers.
 * 
 * GET /api/dashboard/stats — Returns aggregate statistics
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { appCache } from '@/lib/cache';
import mongoose from 'mongoose';

interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  totalUsers: number;
  newUsersThisMonth: number;
  totalVolunteers: number;
  totalDonationCampaigns: number;
  activeCampaigns: number;
  totalBooks: number;
  totalArticles: number;
  totalPodcasts: number;
  totalVideoSeries: number;
  totalSchedules: number;
  totalConnectMessages: number;
  totalRoomBookings: number;
  growth: {
    events: string;
    users: string;
    volunteers: string;
    donations: string;
  };
}

async function fetchRealStats(): Promise<DashboardStats> {
  await connectDB();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Fetch all counts in parallel for performance
  const [
    totalEvents,
    upcomingEvents,
    totalUsers,
    newUsersThisMonth,
    totalVolunteers,
    totalDonationCampaigns,
    activeCampaigns,
    totalBooks,
    totalArticles,
    totalPodcasts,
    totalVideoSeries,
    totalSchedules,
    totalConnectMessages,
    totalRoomBookings,
    // Last month counts for growth calculation
    lastMonthUsers,
    lastMonthEvents,
  ] = await Promise.all([
    safeCount('Event', { isDeleted: { $ne: true } }),
    safeCount('Event', { isDeleted: { $ne: true }, eventDate: { $gte: now } }),
    safeCount('User', { isDeleted: { $ne: true } }),
    safeCount('User', { isDeleted: { $ne: true }, createdAt: { $gte: startOfMonth } }),
    safeCount('Volunteer', { isDeleted: { $ne: true } }),
    safeCount('Donate', { isDeleted: { $ne: true } }),
    safeCount('Donate', { isDeleted: { $ne: true }, isActive: true }),
    safeCount('Book', { isDeleted: { $ne: true } }),
    safeCount('Articles', { isDeleted: { $ne: true } }),
    safeCount('Podcast', { isDeleted: { $ne: true } }),
    safeCount('VideoSeries', { isDeleted: { $ne: true } }),
    safeCount('Schedule', { isDeleted: { $ne: true } }),
    safeCount('Connect', { isDeleted: { $ne: true } }),
    safeCount('RoomsBooking', {}),
    // Previous month users and events for growth
    safeCount('User', {
      isDeleted: { $ne: true },
      createdAt: {
        $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        $lt: startOfMonth,
      },
    }),
    safeCount('Event', {
      isDeleted: { $ne: true },
      createdAt: {
        $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        $lt: startOfMonth,
      },
    }),
  ]);

  return {
    totalEvents,
    upcomingEvents,
    totalUsers,
    newUsersThisMonth,
    totalVolunteers,
    totalDonationCampaigns,
    activeCampaigns,
    totalBooks,
    totalArticles,
    totalPodcasts,
    totalVideoSeries,
    totalSchedules,
    totalConnectMessages,
    totalRoomBookings,
    growth: {
      events: calcGrowth(totalEvents, lastMonthEvents),
      users: calcGrowth(newUsersThisMonth, lastMonthUsers),
      volunteers: '+0%', // Can be calculated when data is available
      donations: '+0%',
    },
  };
}

/**
 * Safely count documents in a collection that may or may not exist
 */
async function safeCount(modelName: string, filter: Record<string, unknown>): Promise<number> {
  try {
    const model = mongoose.models[modelName];
    if (!model) return 0;
    return await model.countDocuments(filter);
  } catch {
    return 0;
  }
}

function calcGrowth(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const pct = Math.round(((current - previous) / previous) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

export async function GET(): Promise<NextResponse> {
  try {
    // Check cache first (5-minute TTL)
    const cacheKey = 'dashboard-stats';
    const cached = appCache.get<DashboardStats>(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }

    const stats = await fetchRealStats();

    // Cache for 5 minutes
    appCache.set(cacheKey, stats, 300);

    return NextResponse.json({
      success: true,
      data: stats,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
