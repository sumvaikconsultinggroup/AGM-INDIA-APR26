import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Schedule } from '@/models/Schedule';
import { latestPosterSchedule } from '@/lib/schedule/latestPosterSchedule';

export async function POST() {
  try {
    await connectDB();

    await Schedule.deleteMany({});
    const inserted = await Schedule.insertMany(latestPosterSchedule);

    return NextResponse.json(
      {
        success: true,
        message: 'Latest official poster schedule imported successfully',
        data: {
          imported: inserted.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to import latest poster schedule:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to import latest poster schedule',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
