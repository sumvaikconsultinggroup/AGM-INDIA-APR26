// dashboard-next/src/app/api/panchang/festivals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUpcomingFixedFestivals } from '@/lib/panchang/festivals';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const count = parseInt(searchParams.get('count') || searchParams.get('limit') || '20');

    const festivals = getUpcomingFixedFestivals(new Date(), count);

    return NextResponse.json({
      success: true,
      data: festivals,
    });
  } catch (error) {
    console.error('Festivals API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch festivals' },
      { status: 500 }
    );
  }
}
