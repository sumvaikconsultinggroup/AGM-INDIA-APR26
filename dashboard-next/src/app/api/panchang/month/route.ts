// dashboard-next/src/app/api/panchang/month/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  buildObservationDate,
  buildPanchangData,
  resolveTimezone,
} from '@/lib/panchang/panchangService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const lat = parseFloat(searchParams.get('lat') || '29.9457');
    const lng = parseFloat(searchParams.get('lng') || '78.1642');
    const city = searchParams.get('city') || 'Haridwar';
    const timezone = resolveTimezone(city, searchParams.get('timezone') || searchParams.get('tz'));

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12 || year < 1900 || year > 2200) {
      return NextResponse.json(
        { success: false, message: 'Invalid year or month' },
        { status: 400 }
      );
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { success: false, message: 'Invalid coordinates. Latitude must be -90..90 and longitude -180..180.' },
        { status: 400 }
      );
    }

    const daysInMonth = new Date(year, month, 0).getDate();

    const dayPromises = Array.from({ length: daysInMonth }, async (_, i) => {
      const day = i + 1;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      try {
        const date = buildObservationDate(dateStr, timezone);
        return buildPanchangData({
          date,
          lat,
          lng,
          cityName: city,
          timezone,
        });
      } catch {
        return null;
      }
    });

    const results = await Promise.all(dayPromises);
    const failedDays = results.filter((day) => !day).length;
    const days = results.filter(Boolean);

    return NextResponse.json({
      success: true,
      data: days,
      month,
      year,
      timezone,
      partial: failedDays > 0,
      failedDays,
    });
  } catch (error) {
    console.error('Monthly Panchang Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to compute monthly Panchang' },
      { status: 500 }
    );
  }
}
