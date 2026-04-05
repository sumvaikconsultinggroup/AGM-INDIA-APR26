import { NextResponse, NextRequest } from 'next/server';
import { Schedule, ISchedule } from '@/models/Schedule';
import { connectDB } from '@/lib/mongodb';
import { sendEmail } from '@/utils/sendEmail';

// Improved type with generic
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

// Helper for error responses
const errorResponse = (message: string, error?: string, status = 500) => {
  return NextResponse.json({ success: false, message, error }, { status });
};

// Helper for success responses
const successResponse = <T>(data: T, message: string, status = 200) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
};

// Types for schedule creation - updated to match modified model
interface TimeSlot {
  period?: string; // Made optional
  startDate: string; // Still required
  endDate?: string; // Made optional
}

interface CreateScheduleBody {
  month: string;
  locations: string; // Changed from string[] to string to match model
  timeSlots?: TimeSlot[]; // Optional time slots
  appointment?: boolean; // Added appointment field
  maxPeople?: number; // Added maxPeople field
}

type ScheduleTimeSlot = {
  startDate: Date;
  endDate?: Date;
  period?: string;
};

type ScheduleData = {
  month: string;
  locations: string;
  timeSlots: ScheduleTimeSlot[];
  appointment?: boolean; // Added appointment field
  maxPeople?: number; // Added maxPeople field
};

// Helper function to get earliest date from time slots
function getEarliestDate(timeSlots?: ScheduleTimeSlot[] | TimeSlot[]): Date | null {
  if (!timeSlots || timeSlots.length === 0) return null;

  return timeSlots.reduce((earliest, slot) => {
    const date = new Date(slot.startDate);
    return !earliest || date < earliest ? date : earliest;
  }, null as Date | null);
}

// Helper function to get latest date from time slots
function getLatestDate(timeSlots?: ScheduleTimeSlot[] | TimeSlot[]): Date | null {
  if (!timeSlots || timeSlots.length === 0) return null;

  return timeSlots.reduce((latest, slot) => {
    // Use endDate if available, otherwise use startDate
    const date = slot.endDate ? new Date(slot.endDate) : new Date(slot.startDate);
    return !latest || date > latest ? date : latest;
  }, null as Date | null);
}

// Helper function to format date for display
function formatDate(date: Date | null): string {
  if (!date) return 'N/A';
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<ISchedule[]>>> {
  try {
    // Connect to database
    await connectDB();

    // Add query params support
    const searchParams = req.nextUrl.searchParams;
    const month = searchParams.get('month');
    const limit = Number(searchParams.get('limit')) || 10;
    const isDeleted = searchParams.get('includeDeleted') !== 'true'; // By default, exclude deleted
    const upcoming = searchParams.get('upcoming') === 'true'; // Filter for upcoming schedules
    const appointmentEnabled = searchParams.get('appointment') === 'true'; // Filter for appointment-enabled
    const minMaxPeople = Number(searchParams.get('minMaxPeople')) || 0; // Filter by minimum maxPeople value
    
    // Build query
    const query: {
      isDeleted?: { $ne: boolean };
      month?: string;
      appointment?: boolean;
      maxPeople?: { $gte: number };
    } = {};

    // Add filter for deleted status
    if (isDeleted) {
      query.isDeleted = { $ne: true };
    }

    // Add month filter if provided
    if (month) {
      query.month = month;
    }
    
    // Add appointment filter if requested
    if (appointmentEnabled) {
      query.appointment = true;
    }

    // Add maxPeople filter if requested
    if (minMaxPeople > 0) {
      query.maxPeople = { $gte: minMaxPeople };
    }

    const monthOrder = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const schedules = await Schedule.find(query)
      .sort({ createdAt: -1 }) // Sort by most recently created
      .limit(limit)
      .select('-__v')
      .lean();

    // Process and sort schedules with additional metadata
    const currentDate = new Date();
    const processedSchedules = schedules.map(item => {
      const earliestStartDate = getEarliestDate(item.timeSlots);
      const latestEndDate = getLatestDate(item.timeSlots);
      
      return {
        ...item,
        monthIndex: monthOrder.indexOf(item.month),
        earliestStartDate,
        latestEndDate,
        isUpcoming: earliestStartDate ? earliestStartDate >= currentDate : false,
        isPast: latestEndDate ? latestEndDate < currentDate : false,
        dateRange: `${formatDate(earliestStartDate)} - ${formatDate(latestEndDate)}`,
        maxPeople: item.maxPeople || 100, // Ensure maxPeople is returned with default value
      };
    });

    // Filter for upcoming schedules if requested
    const filteredSchedules = upcoming 
      ? processedSchedules.filter(schedule => schedule.isUpcoming)
      : processedSchedules;
      
    // Sort schedules by month and then earliest start date
    const sortedSchedules = filteredSchedules.sort((a, b) => {
      // First sort by month
      if (a.monthIndex !== b.monthIndex) {
        return a.monthIndex - b.monthIndex;
      }

      // Then sort by earliest start date
      const aDate = a.earliestStartDate;
      const bDate = b.earliestStartDate;
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return aDate.getTime() - bDate.getTime();
    });

    if (!sortedSchedules?.length) {
      return errorResponse('No schedules found', undefined, 404);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Schedules fetched successfully',
        data: sortedSchedules as unknown as ISchedule[],
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('GET Schedules Error:', error);
    return errorResponse(
      'Failed to fetch schedules',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export async function POST(req: Request): Promise<NextResponse<ApiResponse<ISchedule>>> {
  try {
    await connectDB();

    // Parse request body
    const body = (await req.json()) as CreateScheduleBody;
    const { month, locations, timeSlots, appointment, maxPeople } = body;

    // Validate required fields - timeSlots are now optional
    if (!month) {
      return errorResponse('Month is required', undefined, 400);
    }

    if (!locations) {
      return errorResponse('Locations are required', undefined, 400);
    }

    // Validate maxPeople if provided
    if (maxPeople !== undefined) {
      if (typeof maxPeople !== 'number') {
        return errorResponse('maxPeople must be a number', undefined, 400);
      }
      
      if (maxPeople < 1) {
        return errorResponse('maxPeople must be at least 1', undefined, 400);
      }
      
      if (maxPeople > 1000) {
        return errorResponse('maxPeople cannot exceed 1000', undefined, 400);
      }
    }

    // Only validate timeSlots if they're provided
    if (timeSlots && timeSlots.length > 0) {
      // Validate each timeSlot
      for (const slot of timeSlots) {
        // Only startDate is required
        if (!slot.startDate) {
          return errorResponse('Each time slot must include at least a startDate', undefined, 400);
        }

        const start = new Date(slot.startDate);

        // Check if startDate is valid
        if (isNaN(start.getTime())) {
          return errorResponse('Invalid startDate format', undefined, 400);
        }

        // Only validate endDate if it's provided
        if (slot.endDate) {
          const end = new Date(slot.endDate);

          if (isNaN(end.getTime())) {
            return errorResponse('Invalid endDate format', undefined, 400);
          }

          if (start >= end) {
            return errorResponse('Time slot endDate must be after startDate', undefined, 400);
          }
        }
      }
    }

    // Create schedule with optional timeSlots, appointment flag, and maxPeople
    const scheduleData: ScheduleData = {
      month,
      locations,
      timeSlots: [],
      appointment: appointment || false, // Default to false if not provided
      maxPeople: maxPeople || 100, // Default to 100 if not provided
    };
console.log('scheduleData',scheduleData)
    // Only add timeSlots if they exist
    if (timeSlots && timeSlots.length > 0) {
      scheduleData.timeSlots = timeSlots.map(slot => {
        const formattedSlot: ScheduleTimeSlot = {
          startDate: new Date(slot.startDate),
        };

        if (slot.period) {
          formattedSlot.period = slot.period;
        }

        if (slot.endDate) {
          formattedSlot.endDate = new Date(slot.endDate);
        }

        return formattedSlot;
      });
    }

    // Create schedule in database
    const schedule = await Schedule.create(scheduleData);
    
    // Get date information for notifications
    const earliestDate = getEarliestDate(scheduleData.timeSlots);
    const latestDate = getLatestDate(scheduleData.timeSlots);
    
    // Send notification email to admin about the new schedule
    try {
      const adminEmailSubject = `New Schedule Created for ${month}`;
      
      // Create formatted schedule information for email
      const locationsList = scheduleData.locations.split(/[,\n]/)
        .map(loc => loc.trim())
        .filter(loc => loc)
        .join(', ');
        
      const timeSlotsText = scheduleData.timeSlots.length > 0
        ? scheduleData.timeSlots.map((slot, index) => {
            const periodText = slot.period ? `${slot.period}: ` : '';
            const startDateText = formatDate(slot.startDate);
            const endDateText = slot.endDate ? ` to ${formatDate(slot.endDate)}` : '';
            return `  ${index + 1}. ${periodText}${startDateText}${endDateText}`;
          }).join('\n')
        : '  No time slots defined';
        
      // Plain text version
      const adminEmailText = `
        A new schedule has been created for ${month}.
        
        Schedule Details:
        - Month: ${month}
        - Locations: ${locationsList}
        - Date Range: ${formatDate(earliestDate)} - ${formatDate(latestDate)}
        
        Time Slots:
${timeSlotsText}
        
        View and manage this schedule in the dashboard.
      `;
      
      // HTML version
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f6df5;">New Schedule Created</h1>
          </div>
          
          <p>A new schedule has been created for <strong>${month}</strong>.</p>
          
          <div style="background-color: #f7f9fc; border-left: 4px solid #4f6df5; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Schedule Details:</h3>
            <p><strong>Month:</strong> ${month}</p>
            <p><strong>Locations:</strong> ${locationsList}</p>
            <p><strong>Date Range:</strong> ${formatDate(earliestDate)} - ${formatDate(latestDate)}</p>
            
            <div style="margin-top: 15px;">
              <p><strong>Time Slots:</strong></p>
              ${scheduleData.timeSlots.length > 0 
                ? `<ol style="margin-top: 5px;">
                    ${scheduleData.timeSlots.map(slot => {
                      const periodText = slot.period ? `<strong>${slot.period}:</strong> ` : '';
                      const startDateText = formatDate(slot.startDate);
                      const endDateText = slot.endDate ? ` to ${formatDate(slot.endDate)}` : '';
                      return `<li>${periodText}${startDateText}${endDateText}</li>`;
                    }).join('')}
                  </ol>`
                : '<p>No time slots defined</p>'
              }
            </div>
          </div>
          
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard/schedule" 
                style="display: inline-block; background-color: #4f6df5; color: white; padding: 10px 20px; 
                text-decoration: none; border-radius: 5px; margin-top: 10px;">
             Manage Schedules
          </a></p>
        </div>
      `;
      
      // Get admin email from environment variables
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
      
      if (adminEmail) {
        await sendEmail(
          adminEmail,
          adminEmailSubject,
          adminEmailText,
          adminEmailHtml
        );
        console.log('Schedule creation notification sent to admin:', adminEmail);
      } else {
        console.warn('Admin email not configured. Skipping admin notification.');
      }
      
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error('Error sending schedule creation notification:', emailError);
    }

    return successResponse(schedule, 'Schedule created successfully', 201);
  } catch (error) {
    console.error('Schedule creation error:', error);
    return errorResponse(
      'Failed to create schedule',
      process.env.NODE_ENV === 'development'
        ? error instanceof Error
          ? error.message
          : 'Unknown error'
        : undefined
    );
  }
}
