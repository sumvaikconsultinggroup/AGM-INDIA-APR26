import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ScheduleRegistration, { RegistrationStatus } from '@/models/ScheduleRegistration';
import { sendEmail } from '@/utils/sendEmail';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

const ScheduleRegistrationModel = ScheduleRegistration as any;

function getDateRange(mode: 'night' | 'morning') {
  const base = new Date();
  const target = new Date(base);
  if (mode === 'night') {
    target.setDate(target.getDate() + 1);
  }

  const start = new Date(target);
  start.setHours(0, 0, 0, 0);

  const end = new Date(target);
  end.setHours(23, 59, 59, 999);

  return { target, start, end };
}

function formatDate(value: Date, locale = 'en-IN') {
  return value.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function buildSummary(registrations: any[]) {
  return registrations
    .map((registration, index) => {
      const schedule = registration.requestedSchedule || {};
      const date = schedule.eventDate ? formatDate(new Date(schedule.eventDate)) : 'Date pending';
      const time = schedule.eventTime || registration.preferedTime || 'Time pending';
      const location = schedule.eventLocation || schedule.baseLocation || 'Location pending';

      return `${index + 1}. ${registration.name}
Purpose: ${registration.purpose}
Date: ${date}
Time: ${time}
Location: ${location}`;
    })
    .join('\n\n');
}

export async function POST(req: NextRequest) {
  try {
    const cronSecret = req.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET;
    if (expectedSecret && cronSecret !== expectedSecret) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const mode = (req.nextUrl.searchParams.get('mode') || 'night') as 'night' | 'morning';
    const { target, start, end } = getDateRange(mode);
    const reminderField = mode === 'night' ? 'nextDayReminderSentAt' : 'morningReminderSentAt';

    const registrations = await ScheduleRegistrationModel.find({
      isDeleted: { $ne: true },
      status: RegistrationStatus.APPROVED,
      [reminderField]: { $exists: false },
      'requestedSchedule.eventDate': {
        $gte: start,
        $lte: end,
      },
    }).lean();

    if (!registrations.length) {
      return NextResponse.json({
        success: true,
        message: 'No approved appointments found for reminder window',
        count: 0,
      });
    }

    const swamijiEmail = process.env.SWAMIJI_EMAIL;
    const swamijiWhatsapp = process.env.SWAMIJI_WHATSAPP_NUMBER;
    const summary = buildSummary(registrations);
    const label = mode === 'night' ? 'Tomorrow' : 'Today';
    const subject = `${label}'s Swami Ji appointment briefing - ${formatDate(target)}`;
    const text = `${label}'s approved appointments for Swami Ji\n\n${summary}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #7b1e1e;">${label}'s Swami Ji appointment briefing</h1>
        <p><strong>${formatDate(target)}</strong></p>
        ${registrations
          .map((registration: any, index: number) => {
            const schedule = registration.requestedSchedule || {};
            return `
              <div style="border: 1px solid #e7d4b4; border-radius: 16px; padding: 16px; margin-top: 12px; background: #fffaf2;">
                <h3 style="margin: 0 0 8px 0;">${index + 1}. ${registration.name}</h3>
                <p style="margin: 4px 0;"><strong>Purpose:</strong> ${registration.purpose}</p>
                <p style="margin: 4px 0;"><strong>Time:</strong> ${schedule.eventTime || registration.preferedTime || 'Pending'}</p>
                <p style="margin: 4px 0;"><strong>Location:</strong> ${schedule.eventLocation || schedule.baseLocation || 'Pending'}</p>
                <p style="margin: 4px 0;"><strong>Phone:</strong> ${registration.phone}</p>
              </div>
            `;
          })
          .join('')}
      </div>
    `;

    const results = {
      email: false,
      whatsapp: false,
    };

    if (swamijiEmail) {
      await sendEmail(swamijiEmail, subject, text, html);
      results.email = true;
    }

    if (swamijiWhatsapp) {
      const whatsappResult = await sendWhatsAppMessage(swamijiWhatsapp, text);
      results.whatsapp = whatsappResult.success;
    }

    await ScheduleRegistrationModel.updateMany(
      { _id: { $in: registrations.map((registration: any) => registration._id) } },
      { $set: { [reminderField]: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: 'Schedule reminders processed successfully',
      count: registrations.length,
      results,
    });
  } catch (error) {
    console.error('Schedule reminder cron failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process schedule reminders',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
