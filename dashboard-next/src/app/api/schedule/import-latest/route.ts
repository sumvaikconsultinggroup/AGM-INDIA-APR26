import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Schedule } from '@/models/Schedule';
import { latestPosterSchedule } from '@/lib/schedule/latestPosterSchedule';

export async function POST(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const replace = searchParams.get('replace') === '1';
    const existingCount = await Schedule.countDocuments({ isDeleted: { $ne: true } });

    if (existingCount > 0 && !replace) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Schedules already exist. Re-run import with explicit replacement confirmation to avoid overwriting live data.',
          data: {
            existingCount,
            requiresConfirmation: true,
          },
        },
        { status: 409 }
      );
    }

    if (replace) {
      await Schedule.deleteMany({});
    }

    const inserted = await Schedule.insertMany(latestPosterSchedule);

    return NextResponse.json(
      {
        success: true,
        message: replace
          ? 'Latest official poster schedule imported and replaced existing data successfully'
          : 'Latest official poster schedule imported successfully',
        data: {
          imported: inserted.length,
          replacedExisting: replace,
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
