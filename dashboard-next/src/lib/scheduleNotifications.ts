import admin from 'firebase-admin';
import NotificationPreference from '@/models/NotificationPreference';
import { sendEmail } from '@/utils/sendEmail';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

const NotificationPreferenceModel = NotificationPreference as any;

function ensureFirebaseAdmin() {
  if (admin.apps.length) return;
  const raw = process.env.FIREBASE_ADMIN_SDK_JSON;
  if (!raw) return;
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
}

function formatDate(value?: string | Date | null, locale = 'en-IN') {
  if (!value) return 'To be confirmed';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'To be confirmed';
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

async function sendPushToUserId(userId: string | undefined, title: string, body: string, data: Record<string, string>) {
  if (!userId) return { success: false, skipped: true, reason: 'missing-user-id' };

  const preferences = await NotificationPreferenceModel.find({
    userId,
    isActive: true,
  }).lean();

  if (!preferences.length) {
    return { success: false, skipped: true, reason: 'no-push-preferences' };
  }

  try {
    ensureFirebaseAdmin();
    if (!admin.apps.length) {
      return { success: false, skipped: true, reason: 'firebase-not-configured' };
    }

    const tokens = preferences.map((preference: any) => preference.pushToken).filter(Boolean);
    if (!tokens.length) {
      return { success: false, skipped: true, reason: 'no-tokens' };
    }

    await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data,
      android: {
        priority: 'high',
        notification: {
          channelId: 'schedule_updates',
          priority: 'max',
          sound: 'default',
        },
      },
      apns: {
        payload: { aps: { sound: 'default', badge: 1 } },
      },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      skipped: true,
      reason: error instanceof Error ? error.message : 'push-failed',
    };
  }
}

function approvalTemplate(registration: any) {
  const schedule = registration.requestedSchedule || {};
  const base = schedule.baseLocation || 'Ashram';
  const date = formatDate(schedule.eventDate);
  const time = schedule.eventTime || registration.preferedTime || 'To be confirmed';
  const location = schedule.eventLocation || 'To be confirmed';

  return {
    subject: 'Hari Om 🙏 Your appointment with Swami Ji is confirmed',
    text: `Hari Om, ${registration.name}

Your appointment request has been approved.

Confirmed meeting details:
- Base: ${base}
- Date: ${date}
- Time: ${time}
- Location: ${location}

Please arrive a little early and keep this message for reference.
`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #7b1e1e;">Hari Om 🙏 Appointment Confirmed</h1>
        <p>Dear <strong>${registration.name}</strong>, your request to meet Pujya Swami Avdheshanand Giri Ji Maharaj has been approved.</p>
        <div style="margin-top: 20px; padding: 16px; border-radius: 16px; background: #fff6ea; border: 1px solid #f0d2a4;">
          <p><strong>Base:</strong> ${base}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Location:</strong> ${location}</p>
        </div>
      </div>
    `,
    pushTitle: 'Appointment confirmed',
    pushBody: `${date} • ${time} • ${location}`,
    whatsapp: `Hari Om, ${registration.name}. Your meeting with Swami Ji is confirmed for ${date} at ${time}. Location: ${location}.`,
  };
}

function rejectionTemplate(registration: any) {
  return {
    subject: 'Hari Om 🙏 Update on your appointment request',
    text: `Hari Om, ${registration.name}

At the moment, your appointment request could not be confirmed. This is usually due to schedule constraints or last-minute changes.

You may submit a fresh request for another available date.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #7b1e1e;">Hari Om 🙏 Appointment update</h1>
        <p>Dear <strong>${registration.name}</strong>, at the moment your appointment request could not be confirmed.</p>
        <p>You may submit a fresh request for another available date.</p>
      </div>
    `,
    pushTitle: 'Appointment request update',
    pushBody: 'Your request could not be confirmed for the selected day.',
    whatsapp: `Hari Om, ${registration.name}. Your appointment request could not be confirmed for the selected day. Please submit a new request for another available date.`,
  };
}

function rescheduleTemplate(registration: any) {
  const schedule = registration.requestedSchedule || {};
  const date = formatDate(schedule.eventDate);
  const time = schedule.eventTime || registration.preferedTime || 'To be confirmed';
  const location = schedule.eventLocation || 'To be confirmed';

  return {
    subject: 'Hari Om 🙏 Your Swami Ji appointment has been rescheduled',
    text: `Hari Om, ${registration.name}

Your appointment has been updated.

New confirmed details:
- Date: ${date}
- Time: ${time}
- Location: ${location}
`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #7b1e1e;">Hari Om 🙏 Appointment rescheduled</h1>
        <p>Dear <strong>${registration.name}</strong>, your appointment has been updated.</p>
        <div style="margin-top: 20px; padding: 16px; border-radius: 16px; background: #fff6ea; border: 1px solid #f0d2a4;">
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Location:</strong> ${location}</p>
        </div>
      </div>
    `,
    pushTitle: 'Appointment rescheduled',
    pushBody: `${date} • ${time} • ${location}`,
    whatsapp: `Hari Om, ${registration.name}. Your meeting with Swami Ji has been rescheduled to ${date} at ${time}. Location: ${location}.`,
  };
}

export async function sendRegistrationLifecycleNotifications(
  registration: any,
  type: 'approved' | 'rejected' | 'rescheduled'
) {
  const template =
    type === 'approved'
      ? approvalTemplate(registration)
      : type === 'rejected'
        ? rejectionTemplate(registration)
        : rescheduleTemplate(registration);

  const results = {
    email: false,
    whatsapp: false,
    push: false,
  };

  if (registration.email) {
    try {
      await sendEmail(registration.email, template.subject, template.text, template.html);
      results.email = true;
    } catch (error) {
      console.error('Failed to send lifecycle email:', error);
    }
  }

  if (registration.phone) {
    try {
      const whatsappResult = await sendWhatsAppMessage(registration.phone, template.whatsapp);
      results.whatsapp = whatsappResult.success;
    } catch (error) {
      console.error('Failed to send lifecycle WhatsApp:', error);
    }
  }

  const pushResult = await sendPushToUserId(registration.userId, template.pushTitle, template.pushBody, {
    type: `schedule_${type}`,
    registrationId: String(registration._id),
  });
  results.push = Boolean(pushResult.success);

  return results;
}

export async function notifyApprovedDevoteesOfScheduleUpdate(
  schedule: any,
  registrations: any[]
) {
  const title = 'Schedule updated';
  const body = schedule.changeNote
    ? schedule.changeNote
    : 'Swami Ji schedule has been updated. Please check your confirmed appointment details.';

  const pushRecipients = registrations.filter((registration) => registration.userId);

  for (const registration of pushRecipients) {
    await sendPushToUserId(registration.userId, title, body, {
      type: 'schedule_last_minute_update',
      scheduleId: String(schedule._id),
      registrationId: String(registration._id),
    });
  }

  for (const registration of registrations) {
    if (registration.email) {
      try {
        await sendEmail(
          registration.email,
          'Hari Om 🙏 Schedule update for your confirmed appointment',
          `${body}\n\nDate: ${formatDate(registration.requestedSchedule?.eventDate)}\nLocation: ${registration.requestedSchedule?.eventLocation || schedule.locations}`,
          `<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;"><h1 style="color: #7b1e1e;">Schedule update</h1><p>${body}</p><p><strong>Date:</strong> ${formatDate(registration.requestedSchedule?.eventDate)}</p><p><strong>Location:</strong> ${registration.requestedSchedule?.eventLocation || schedule.locations}</p></div>`
        );
      } catch (error) {
        console.error('Failed to send schedule update email:', error);
      }
    }
  }
}
