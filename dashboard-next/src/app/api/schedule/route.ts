import { NextResponse, NextRequest } from 'next/server';
import { Schedule, ISchedule } from '@/models/Schedule';
import ScheduleRegistration, { RegistrationStatus } from '@/models/ScheduleRegistration';
import { connectDB } from '@/lib/mongodb';
import { sendEmail } from '@/utils/sendEmail';

const ScheduleRegistrationModel = ScheduleRegistration as any;

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

const CONTENT_LANGUAGES = ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as'] as const;
type LocalizedInput = Partial<Record<(typeof CONTENT_LANGUAGES)[number], string>>;

type TimeSlot = {
  period?: string;
  startDate: string;
  endDate?: string;
  slotCapacity?: number;
};

interface CreateScheduleBody {
  month: string;
  locations: string;
  timeSlots?: TimeSlot[];
  appointment?: boolean;
  maxPeople?: number;
  baseLocation?: 'Haridwar Ashram' | 'Delhi Ashram' | 'Other';
  publicTitle?: LocalizedInput;
  publicLocation?: LocalizedInput;
  publicNotes?: LocalizedInput;
  internalNotes?: string;
  changeNote?: string;
  isLastMinuteUpdate?: boolean;
}

type ScheduleTimeSlot = {
  startDate: Date;
  endDate?: Date;
  period?: string;
  slotCapacity?: number;
};

type ScheduleData = {
  month: string;
  locations: string;
  timeSlots: ScheduleTimeSlot[];
  appointment: boolean;
  maxPeople: number;
  baseLocation: 'Haridwar Ashram' | 'Delhi Ashram' | 'Other';
  publicTitle?: LocalizedInput;
  publicLocation?: LocalizedInput;
  publicNotes?: LocalizedInput;
  internalNotes?: string;
  changeNote?: string;
  isLastMinuteUpdate?: boolean;
};

const MONTH_ORDER = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const errorResponse = (message: string, error?: string, status = 500) => {
  return NextResponse.json({ success: false, message, error }, { status });
};

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

function getEarliestDate(timeSlots?: ScheduleTimeSlot[] | TimeSlot[]): Date | null {
  if (!timeSlots?.length) return null;

  return timeSlots.reduce((earliest, slot) => {
    const date = new Date(slot.startDate);
    return !earliest || date < earliest ? date : earliest;
  }, null as Date | null);
}

function getLatestDate(timeSlots?: ScheduleTimeSlot[] | TimeSlot[]): Date | null {
  if (!timeSlots?.length) return null;

  return timeSlots.reduce((latest, slot) => {
    const date = slot.endDate ? new Date(slot.endDate) : new Date(slot.startDate);
    return !latest || date > latest ? date : latest;
  }, null as Date | null);
}

function formatDate(date: Date | null): string {
  if (!date) return 'N/A';
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function normalizeLocalizedText(value?: LocalizedInput) {
  if (!value) return undefined;

  const normalized = CONTENT_LANGUAGES.reduce<LocalizedInput>((acc, language) => {
    const entry = value?.[language];
    if (typeof entry === 'string' && entry.trim()) {
      acc[language] = entry.trim();
    }
    return acc;
  }, {});

  return Object.keys(normalized).length ? normalized : undefined;
}

function getSlotDateKey(value?: string | Date | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
}

function deriveBaseLocation(
  baseLocation: CreateScheduleBody['baseLocation'],
  locations: string
): 'Haridwar Ashram' | 'Delhi Ashram' | 'Other' {
  if (baseLocation) return baseLocation;
  const normalizedLocations = locations.toLowerCase();
  if (normalizedLocations.includes('haridwar') || normalizedLocations.includes('हरिद्वार')) {
    return 'Haridwar Ashram';
  }
  if (normalizedLocations.includes('delhi') || normalizedLocations.includes('दिल्ली')) {
    return 'Delhi Ashram';
  }
  return 'Other';
}

async function getRegistrationCountMap(scheduleIds: string[]) {
  if (!scheduleIds.length) {
    return new Map<string, number>();
  }

  const registrations = await ScheduleRegistrationModel.find({
    isDeleted: { $ne: true },
    status: { $ne: RegistrationStatus.REJECTED },
    'requestedSchedule.scheduleId': { $in: scheduleIds },
  })
    .select('requestedSchedule')
    .lean();

  const counts = new Map<string, number>();

  for (const registration of registrations) {
    const scheduleId = registration.requestedSchedule?.scheduleId;
    const dateKey = getSlotDateKey(registration.requestedSchedule?.eventDate);
    if (!scheduleId) continue;

    const key = `${scheduleId}:${dateKey || 'unspecified'}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return counts;
}

function getBookedCountForSchedule(
  countMap: Map<string, number>,
  scheduleId: string,
  dateKey?: string | null
) {
  const directKey = `${scheduleId}:${dateKey || 'unspecified'}`;
  if (countMap.has(directKey)) {
    return countMap.get(directKey) || 0;
  }

  let count = 0;
  for (const [key, value] of countMap.entries()) {
    if (key.startsWith(`${scheduleId}:`)) {
      count += value;
    }
  }
  return count;
}

async function enrichSchedules(rawSchedules: any[]) {
  const currentDate = new Date();
  const countMap = await getRegistrationCountMap(rawSchedules.map((item) => String(item._id)));

  return rawSchedules
    .map((item) => {
      const earliestStartDate = getEarliestDate(item.timeSlots);
      const latestEndDate = getLatestDate(item.timeSlots);
      const defaultCapacity = item.maxPeople || 100;
      const slotStats = (item.timeSlots || []).map((slot: any) => {
        const dateKey = getSlotDateKey(slot.startDate);
        const slotCapacity = slot.slotCapacity || defaultCapacity;
        const bookedCount = getBookedCountForSchedule(countMap, String(item._id), dateKey);
        const remainingCapacity = Math.max(slotCapacity - bookedCount, 0);

        return {
          ...slot,
          slotCapacity,
          bookedCount,
          remainingCapacity,
          isBlocked: item.appointment ? remainingCapacity <= 0 : false,
          dateKey,
        };
      });

      const totalCapacity = slotStats.length
        ? slotStats.reduce((sum: number, slot: any) => sum + (slot.slotCapacity || defaultCapacity), 0)
        : defaultCapacity;

      const currentAppointments = slotStats.length
        ? slotStats.reduce((sum: number, slot: any) => sum + (slot.bookedCount || 0), 0)
        : getBookedCountForSchedule(countMap, String(item._id));

      const remainingCapacity = Math.max(totalCapacity - currentAppointments, 0);
      const isBlocked = item.appointment
        ? slotStats.length > 0
          ? slotStats.every((slot: any) => slot.isBlocked)
          : remainingCapacity <= 0
        : false;

      return {
        ...item,
        monthIndex: MONTH_ORDER.indexOf(item.month),
        earliestStartDate,
        latestEndDate,
        isUpcoming: earliestStartDate ? earliestStartDate >= currentDate : false,
        isPast: latestEndDate ? latestEndDate < currentDate : false,
        dateRange: `${formatDate(earliestStartDate)} - ${formatDate(latestEndDate)}`,
        maxPeople: defaultCapacity,
        currentAppointments,
        totalCapacity,
        remainingCapacity,
        isBlocked,
        slotStats,
      };
    })
    .sort((a, b) => {
      const aTime = a.earliestStartDate ? new Date(a.earliestStartDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.earliestStartDate ? new Date(b.earliestStartDate).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
}

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<ISchedule[]>>> {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const month = searchParams.get('month');
    const limit = Number(searchParams.get('limit')) || 50;
    const excludeDeleted = searchParams.get('includeDeleted') !== 'true';
    const upcoming = searchParams.get('upcoming') === 'true';
    const appointmentEnabled = searchParams.get('appointment') === 'true';
    const minMaxPeople = Number(searchParams.get('minMaxPeople')) || 0;
    const baseLocation = searchParams.get('baseLocation');

    const query: Record<string, any> = {};

    if (excludeDeleted) {
      query.isDeleted = { $ne: true };
    }

    if (month) {
      query.month = month;
    }

    if (appointmentEnabled) {
      query.appointment = true;
    }

    if (minMaxPeople > 0) {
      query.maxPeople = { $gte: minMaxPeople };
    }

    if (baseLocation) {
      query.baseLocation = baseLocation;
    }

    const schedules = await Schedule.find(query).sort({ createdAt: -1 }).limit(limit).select('-__v').lean();
    const enrichedSchedules = await enrichSchedules(schedules);
    const filteredSchedules = upcoming
      ? enrichedSchedules.filter((schedule) => !schedule.isPast)
      : enrichedSchedules;

    return NextResponse.json(
      {
        success: true,
        message: filteredSchedules.length
          ? 'Schedules fetched successfully'
          : 'No schedules found',
        data: filteredSchedules as unknown as ISchedule[],
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

    const body = (await req.json()) as CreateScheduleBody;
    const {
      month,
      locations,
      timeSlots,
      appointment,
      maxPeople,
      baseLocation,
      publicTitle,
      publicLocation,
      publicNotes,
      internalNotes,
      changeNote,
      isLastMinuteUpdate,
    } = body;

    if (!month) {
      return errorResponse('Month is required', undefined, 400);
    }

    if (!locations?.trim()) {
      return errorResponse('Locations are required', undefined, 400);
    }

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

    if (timeSlots?.length) {
      for (const slot of timeSlots) {
        if (!slot.startDate) {
          return errorResponse('Each time slot must include at least a startDate', undefined, 400);
        }

        const start = new Date(slot.startDate);
        if (Number.isNaN(start.getTime())) {
          return errorResponse('Invalid startDate format', undefined, 400);
        }

        if (slot.endDate) {
          const end = new Date(slot.endDate);
          if (Number.isNaN(end.getTime())) {
            return errorResponse('Invalid endDate format', undefined, 400);
          }

          if (start >= end) {
            return errorResponse('Time slot endDate must be after startDate', undefined, 400);
          }
        }

        if (slot.slotCapacity !== undefined) {
          if (typeof slot.slotCapacity !== 'number' || slot.slotCapacity < 1 || slot.slotCapacity > 1000) {
            return errorResponse('slotCapacity must be a number between 1 and 1000', undefined, 400);
          }
        }
      }
    }

    const scheduleData: ScheduleData = {
      month,
      locations: locations.trim(),
      appointment: appointment || false,
      maxPeople: maxPeople || 100,
      baseLocation: deriveBaseLocation(baseLocation, locations),
      timeSlots: [],
      publicTitle: normalizeLocalizedText(publicTitle),
      publicLocation: normalizeLocalizedText(publicLocation),
      publicNotes: normalizeLocalizedText(publicNotes),
      internalNotes: internalNotes?.trim() || undefined,
      changeNote: changeNote?.trim() || undefined,
      isLastMinuteUpdate: Boolean(isLastMinuteUpdate),
    };

    if (timeSlots?.length) {
      scheduleData.timeSlots = timeSlots.map((slot) => ({
        startDate: new Date(slot.startDate),
        endDate: slot.endDate ? new Date(slot.endDate) : undefined,
        period: slot.period,
        slotCapacity: slot.slotCapacity,
      }));
    }

    const schedule = await Schedule.create(scheduleData);

    const earliestDate = getEarliestDate(scheduleData.timeSlots);
    const latestDate = getLatestDate(scheduleData.timeSlots);

    try {
      const adminEmailSubject = `New Schedule Created for ${month}`;
      const locationsList = scheduleData.locations
        .split(/[,\n]/)
        .map((loc) => loc.trim())
        .filter(Boolean)
        .join(', ');

      const timeSlotsText = scheduleData.timeSlots.length
        ? scheduleData.timeSlots
            .map((slot, index) => {
              const periodText = slot.period ? `${slot.period}: ` : '';
              const startDateText = formatDate(slot.startDate);
              const endDateText = slot.endDate ? ` to ${formatDate(slot.endDate)}` : '';
              const capacityText = slot.slotCapacity ? ` (capacity ${slot.slotCapacity})` : '';
              return `  ${index + 1}. ${periodText}${startDateText}${endDateText}${capacityText}`;
            })
            .join('\n')
        : '  No time slots defined';

      const adminEmailText = `
        A new schedule has been created for ${month}.

        Schedule Details:
        - Month: ${month}
        - Base Location: ${scheduleData.baseLocation}
        - Locations: ${locationsList}
        - Date Range: ${formatDate(earliestDate)} - ${formatDate(latestDate)}
        - Appointment Enabled: ${scheduleData.appointment ? 'Yes' : 'No'}
        - Daily Capacity: ${scheduleData.maxPeople}

        Time Slots:
${timeSlotsText}
      `;

      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #4f6df5;">New Schedule Created</h1>
          <p>A new schedule has been created for <strong>${month}</strong>.</p>
          <div style="background-color: #f7f9fc; border-left: 4px solid #4f6df5; padding: 15px; margin: 20px 0;">
            <p><strong>Base Location:</strong> ${scheduleData.baseLocation}</p>
            <p><strong>Locations:</strong> ${locationsList}</p>
            <p><strong>Date Range:</strong> ${formatDate(earliestDate)} - ${formatDate(latestDate)}</p>
            <p><strong>Appointment Enabled:</strong> ${scheduleData.appointment ? 'Yes' : 'No'}</p>
            <p><strong>Daily Capacity:</strong> ${scheduleData.maxPeople}</p>
          </div>
        </div>
      `;

      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
      if (adminEmail) {
        await sendEmail(adminEmail, adminEmailSubject, adminEmailText, adminEmailHtml);
      }
    } catch (emailError) {
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
