import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import NotificationPreference from '@/models/NotificationPreference';

// Register or update notification preferences
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const { pushToken, deviceId, platform, language, cityName, lat, lng, timezone, dailyPanchang, festivalAlerts, brahmaMuhurtaAlert, alertTimeMinutes, userId } = body;

    if (!pushToken) {
      return NextResponse.json({ success: false, message: 'Push token is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      isActive: true,
      ...(deviceId && { deviceId }),
      ...(platform && { platform }),
      ...(language && { language }),
      ...(cityName && { cityName }),
      ...(lat !== undefined && { lat }),
      ...(lng !== undefined && { lng }),
      ...(timezone && { timezone }),
      ...(dailyPanchang !== undefined && { dailyPanchang }),
      ...(festivalAlerts !== undefined && { festivalAlerts }),
      ...(brahmaMuhurtaAlert !== undefined && { brahmaMuhurtaAlert }),
      ...(alertTimeMinutes !== undefined && { alertTimeMinutes }),
      ...(userId && { userId }),
    };

    const preference = await NotificationPreference.findOneAndUpdate(
      { pushToken },
      { $set: updateData },
      { upsert: true, new: true, projection: { _id: 0, __v: 0 } }
    );

    return NextResponse.json({ success: true, data: preference });
  } catch (error) {
    console.error('Notification preference error:', error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Failed to save preferences' }, { status: 500 });
  }
}

// Get notification preferences by push token
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const pushToken = searchParams.get('pushToken');

    if (!pushToken) {
      return NextResponse.json({ success: false, message: 'Push token is required' }, { status: 400 });
    }

    const preference = await NotificationPreference.findOne(
      { pushToken },
      { _id: 0, __v: 0 }
    ).lean();

    if (!preference) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: preference });
  } catch (error) {
    console.error('Get notification preference error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch preferences' }, { status: 500 });
  }
}

// Deactivate notifications
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const pushToken = searchParams.get('pushToken');

    if (!pushToken) {
      return NextResponse.json({ success: false, message: 'Push token is required' }, { status: 400 });
    }

    await NotificationPreference.findOneAndUpdate(
      { pushToken },
      { $set: { isActive: false } }
    );

    return NextResponse.json({ success: true, message: 'Notifications deactivated' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to deactivate' }, { status: 500 });
  }
}
