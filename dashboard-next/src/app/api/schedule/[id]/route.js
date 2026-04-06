import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Schedule } from '@/models/Schedule';
import ScheduleRegistration, { RegistrationStatus } from '@/models/ScheduleRegistration';
import { connectDB } from '@/lib/mongodb';
import { sendEmail } from '@/utils/sendEmail';
import { notifyApprovedDevoteesOfScheduleUpdate } from '@/lib/scheduleNotifications';

const CONTENT_LANGUAGES = ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as'];

function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function normalizeLocalizedText(value) {
  if (!value || typeof value !== 'object') return undefined;

  const normalized = {};
  for (const language of CONTENT_LANGUAGES) {
    const entry = value?.[language];
    if (typeof entry === 'string' && entry.trim()) {
      normalized[language] = entry.trim();
    }
  }

  return Object.keys(normalized).length ? normalized : undefined;
}

function getEarliestDate(timeSlots) {
  if (!timeSlots?.length) return null;
  return timeSlots.reduce((earliest, slot) => {
    const date = new Date(slot.startDate);
    return !earliest || date < earliest ? date : earliest;
  }, null);
}

function getLatestDate(timeSlots) {
  if (!timeSlots?.length) return null;
  return timeSlots.reduce((latest, slot) => {
    const date = slot.endDate ? new Date(slot.endDate) : new Date(slot.startDate);
    return !latest || date > latest ? date : latest;
  }, null);
}

function getSlotDateKey(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
}

function shouldTriggerUrgentNotification(originalSchedule, payload, updatedSchedule) {
  if (payload.isLastMinuteUpdate === true) return true;
  if (payload.changeNote && payload.changeNote !== originalSchedule.changeNote) return true;
  if (payload.locations && payload.locations !== originalSchedule.locations) return true;
  if (payload.baseLocation && payload.baseLocation !== originalSchedule.baseLocation) return true;
  if (payload.timeSlots) return true;
  return Boolean(updatedSchedule?.isLastMinuteUpdate && updatedSchedule?.changeNote);
}

function deriveBaseLocation(baseLocation, locations) {
  if (baseLocation) return baseLocation;
  const normalizedLocations = (locations || '').toLowerCase();
  if (normalizedLocations.includes('haridwar') || normalizedLocations.includes('हरिद्वार')) {
    return 'Haridwar Ashram';
  }
  if (normalizedLocations.includes('delhi') || normalizedLocations.includes('दिल्ली')) {
    return 'Delhi Ashram';
  }
  return 'Other';
}

const validatePartialScheduleUpdate = (data) => {
  const { timeSlots, maxPeople } = data;

  if (maxPeople !== undefined) {
    if (typeof maxPeople !== 'number') {
      return 'Daily appointment capacity must be a number';
    }

    if (maxPeople < 1) {
      return 'Daily appointment capacity must be at least 1';
    }

    if (maxPeople > 1000) {
      return 'Daily appointment capacity cannot exceed 1000';
    }
  }

  if (timeSlots) {
    for (const slot of timeSlots) {
      if (!slot.startDate) {
        return 'Each time slot must include at least a startDate';
      }

      const start = new Date(slot.startDate);
      if (Number.isNaN(start.getTime())) {
        return 'Invalid startDate format';
      }

      if (slot.endDate) {
        const end = new Date(slot.endDate);
        if (Number.isNaN(end.getTime())) {
          return 'Invalid endDate format';
        }

        if (start >= end) {
          return 'Time slot endDate must be after startDate';
        }
      }

      if (slot.slotCapacity !== undefined) {
        if (
          typeof slot.slotCapacity !== 'number' ||
          slot.slotCapacity < 1 ||
          slot.slotCapacity > 1000
        ) {
          return 'Slot capacity must be a number between 1 and 1000';
        }
      }
    }
  }

  return null;
};

async function buildScheduleWithStats(schedule) {
  const scheduleId = String(schedule._id);
  const registrations = await ScheduleRegistration.find({
    isDeleted: { $ne: true },
    status: { $ne: RegistrationStatus.REJECTED },
    'requestedSchedule.scheduleId': scheduleId,
  })
    .select('requestedSchedule')
    .lean();

  const countMap = new Map();
  registrations.forEach((registration) => {
    const key = `${scheduleId}:${getSlotDateKey(registration.requestedSchedule?.eventDate) || 'unspecified'}`;
    countMap.set(key, (countMap.get(key) || 0) + 1);
  });

  const currentDate = new Date();
  const earliestStartDate = getEarliestDate(schedule.timeSlots);
  const latestEndDate = getLatestDate(schedule.timeSlots);
  const defaultCapacity = schedule.maxPeople || 100;

  const slotStats = (schedule.timeSlots || []).map((slot) => {
    const dateKey = getSlotDateKey(slot.startDate);
    const slotCapacity = slot.slotCapacity || defaultCapacity;
    const bookedCount = countMap.get(`${scheduleId}:${dateKey || 'unspecified'}`) || 0;
    const remainingCapacity = Math.max(slotCapacity - bookedCount, 0);

    return {
      ...slot,
      slotCapacity,
      bookedCount,
      remainingCapacity,
      isBlocked: schedule.appointment ? remainingCapacity <= 0 : false,
      dateKey,
    };
  });

  const totalCapacity = slotStats.length
    ? slotStats.reduce((sum, slot) => sum + (slot.slotCapacity || defaultCapacity), 0)
    : defaultCapacity;
  const currentAppointments = slotStats.length
    ? slotStats.reduce((sum, slot) => sum + (slot.bookedCount || 0), 0)
    : Array.from(countMap.values()).reduce((sum, value) => sum + value, 0);
  const remainingCapacity = Math.max(totalCapacity - currentAppointments, 0);

  return {
    ...schedule,
    earliestStartDate,
    latestEndDate,
    isUpcoming: earliestStartDate ? earliestStartDate >= currentDate : false,
    isPast: latestEndDate ? latestEndDate < currentDate : false,
    dateRange: `${formatDate(earliestStartDate)} - ${formatDate(latestEndDate)}`,
    totalCapacity,
    currentAppointments,
    remainingCapacity,
    isBlocked: schedule.appointment
      ? slotStats.length > 0
        ? slotStats.every((slot) => slot.isBlocked)
        : remainingCapacity <= 0
      : false,
    slotStats,
  };
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid Schedule ID' }, { status: 400 });
    }

    const deletedSchedule = await Schedule.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedSchedule) {
      return NextResponse.json({ success: false, message: 'Schedule not found' }, { status: 404 });
    }

    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
      if (adminEmail) {
        await sendEmail(
          adminEmail,
          `Schedule for ${deletedSchedule.month} Deleted`,
          `The schedule for ${deletedSchedule.month} has been deleted.`,
          `<div style="font-family: Arial, sans-serif;"><h1>Schedule Deleted</h1><p>The schedule for <strong>${deletedSchedule.month}</strong> has been deleted.</p></div>`
        );
      }
    } catch (emailError) {
      console.error('Error sending schedule deletion notification:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Schedule marked as deleted',
        data: deletedSchedule,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Schedule soft delete error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to mark schedule as deleted',
        error: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid Schedule ID' }, { status: 400 });
    }

    const originalSchedule = await Schedule.findById(id).lean();
    if (!originalSchedule) {
      return NextResponse.json({ success: false, message: 'Schedule not found' }, { status: 404 });
    }

    const data = await req.json();
    const validationError = validatePartialScheduleUpdate(data);
    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    if (data.timeSlots) {
      data.timeSlots = data.timeSlots.map((slot) => ({
        startDate: new Date(slot.startDate),
        endDate: slot.endDate ? new Date(slot.endDate) : undefined,
        period: slot.period,
        slotCapacity: slot.slotCapacity,
      }));
    }

    if (data.maxPeople === undefined && originalSchedule.maxPeople !== undefined) {
      data.maxPeople = originalSchedule.maxPeople;
    }

    if (data.appointment === undefined && originalSchedule.appointment !== undefined) {
      data.appointment = originalSchedule.appointment;
    }

    if (data.locations && data.baseLocation === undefined) {
      data.baseLocation = deriveBaseLocation(originalSchedule.baseLocation, data.locations);
    } else if (data.baseLocation === undefined) {
      data.baseLocation = originalSchedule.baseLocation || deriveBaseLocation(undefined, originalSchedule.locations);
    }

    if (data.publicTitle) {
      data.publicTitle = normalizeLocalizedText(data.publicTitle);
    }
    if (data.publicLocation) {
      data.publicLocation = normalizeLocalizedText(data.publicLocation);
    }
    if (data.publicNotes) {
      data.publicNotes = normalizeLocalizedText(data.publicNotes);
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedSchedule) {
      return NextResponse.json({ success: false, message: 'Schedule not found' }, { status: 404 });
    }

    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
      if (adminEmail) {
        const earliestDate = getEarliestDate(updatedSchedule.timeSlots);
        const latestDate = getLatestDate(updatedSchedule.timeSlots);
        await sendEmail(
          adminEmail,
          `Schedule for ${updatedSchedule.month} Updated`,
          `The schedule for ${updatedSchedule.month} has been updated.\nDate Range: ${formatDate(earliestDate)} - ${formatDate(latestDate)}`,
          `<div style="font-family: Arial, sans-serif;"><h1>Schedule Updated</h1><p><strong>${updatedSchedule.month}</strong> was updated.</p><p>Date Range: ${formatDate(earliestDate)} - ${formatDate(latestDate)}</p></div>`
        );
      }
    } catch (emailError) {
      console.error('Error sending schedule update notification:', emailError);
    }

    if (shouldTriggerUrgentNotification(originalSchedule, data, updatedSchedule)) {
      try {
        const now = new Date();
        const approvedRegistrations = await ScheduleRegistration.find({
          isDeleted: { $ne: true },
          status: RegistrationStatus.APPROVED,
          'requestedSchedule.scheduleId': String(updatedSchedule._id),
          'requestedSchedule.eventDate': { $gte: now },
        }).lean();

        if (approvedRegistrations.length) {
          await notifyApprovedDevoteesOfScheduleUpdate(updatedSchedule, approvedRegistrations);
        }
      } catch (notifyError) {
        console.error('Failed to notify approved devotees about schedule update:', notifyError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Schedule updated successfully',
        data: updatedSchedule,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Schedule update error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update schedule',
        error: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid Schedule ID' }, { status: 400 });
    }

    const schedule = await Schedule.findOne({
      _id: id,
      isDeleted: { $ne: true },
    }).lean();

    if (!schedule) {
      return NextResponse.json(
        { success: false, message: 'Schedule not found or has been deleted' },
        { status: 404 }
      );
    }

    const enhancedSchedule = await buildScheduleWithStats(schedule);

    return NextResponse.json(
      {
        success: true,
        message: 'Schedule fetched successfully',
        data: enhancedSchedule,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=15',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch schedule',
        error: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}
