import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ScheduleRegistration from '@/models/ScheduleRegistration';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { date } = await params;

    // Validate date parameter
    if (!date || typeof date !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid date parameter' },
        { status: 400 }
      );
    }

    let eventDate;

    // Handle different date formats
    if (date.includes('-')) {
      const parts = date.split('-');
      
      if (parts[0].length === 4) {
        // Format: YYYY-MM-DD
        eventDate = new Date(date + 'T00:00:00.000Z'); // Force UTC
      } else {
        // Format: DD-MM-YYYY
        const [day, month, year] = parts;
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        eventDate = new Date(isoDate + 'T00:00:00.000Z'); // Force UTC
      }
    } else {
      eventDate = new Date(date + 'T00:00:00.000Z'); // Force UTC
    }

    // Validate the constructed date
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD or DD-MM-YYYY' },
        { status: 400 }
      );
    }

    // Create broader date range to catch timezone variations
    const startOfDay = new Date(eventDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(eventDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    console.log('Search params:', {
      inputDate: date,
      parsedDate: eventDate.toISOString(),
      searchRange: {
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString()
      }
    });

    // Query with broader range and additional debug info
    const registrations = await ScheduleRegistration.find({
      isDeleted: { $ne: true },
      'requestedSchedule.eventDate': {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ createdAt: -1 });

    // Debug: Also try finding any registrations around this date
    const debugRegistrations = await ScheduleRegistration.find({
      isDeleted: { $ne: true },
      'requestedSchedule.eventDate': { $exists: true }
    }).limit(10);

    console.log('Debug - Sample registrations with their dates:', 
      debugRegistrations.map(reg => ({
        id: reg._id,
        eventDate: reg.requestedSchedule?.eventDate,
        name: reg.name
      }))
    );

    if (!registrations || registrations.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No registrations found for the specified date',
          debug: {
            searchedDate: eventDate.toISOString().split('T')[0],
            searchRange: {
              start: startOfDay.toISOString(),
              end: endOfDay.toISOString()
            },
            totalRegistrations: await ScheduleRegistration.countDocuments({ isDeleted: { $ne: true } })
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Registrations fetched successfully',
        data: registrations,
        searchDate: eventDate.toISOString().split('T')[0],
        debug: {
          searchRange: {
            start: startOfDay.toISOString(),
            end: endOfDay.toISOString()
          }
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registrations', details: error.message },
      { status: 500 }
    );
  }
}