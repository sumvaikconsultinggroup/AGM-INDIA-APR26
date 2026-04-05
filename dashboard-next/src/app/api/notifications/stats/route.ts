import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import NotificationPreference from '@/models/NotificationPreference';

// Get notification statistics for admin dashboard
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const [total, active, dailyPanchang, festivalAlerts, brahmaMuhurta] = await Promise.all([
      NotificationPreference.countDocuments(),
      NotificationPreference.countDocuments({ isActive: true }),
      NotificationPreference.countDocuments({ isActive: true, dailyPanchang: true }),
      NotificationPreference.countDocuments({ isActive: true, festivalAlerts: true }),
      NotificationPreference.countDocuments({ isActive: true, brahmaMuhurtaAlert: true }),
    ]);

    // Language distribution
    const languageDistribution = await NotificationPreference.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, language: '$_id', count: 1 } },
    ]);

    // Platform distribution
    const platformDistribution = await NotificationPreference.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$platform', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, platform: '$_id', count: 1 } },
    ]);

    // Top cities
    const topCities = await NotificationPreference.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$cityName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, city: '$_id', count: 1 } },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        subscriptions: { dailyPanchang, festivalAlerts, brahmaMuhurta },
        languageDistribution,
        platformDistribution,
        topCities,
      },
    });
  } catch (error) {
    console.error('Notification stats error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
