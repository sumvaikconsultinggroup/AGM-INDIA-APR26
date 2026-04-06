import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { connectDB } from '@/lib/mongodb';
import NotificationPreference from '@/models/NotificationPreference';
import Volunteer from '@/models/Volunteer';
import Event from '@/models/Event';
import { sendWhatsAppMessage, sendWhatsAppTemplateMessage } from '@/lib/whatsapp';

const NotificationPreferenceModel = NotificationPreference as any;

function ensureFirebaseAdmin() {
  if (admin.apps.length) return;
  const raw = process.env.FIREBASE_ADMIN_SDK_JSON;
  if (!raw) throw new Error('FIREBASE_ADMIN_SDK_JSON is not configured');
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const mode = body.mode || 'push';

    if (mode === 'push') {
      if (!body.title || !body.body) {
        return NextResponse.json({ success: false, message: 'Title and body are required' }, { status: 400 });
      }

      const preferenceFilter: Record<string, unknown> = { isActive: true };
      if (body.audience === 'city_followers' && body.cityName) {
        preferenceFilter.cityName = new RegExp(String(body.cityName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      }

      const preferences = await NotificationPreferenceModel.find(preferenceFilter).lean();
      const tokens = preferences
        .map((item: any) => (typeof item.pushToken === 'string' ? item.pushToken : null))
        .filter((token: string | null): token is string => Boolean(token));

      if (!tokens.length) {
        return NextResponse.json({
          success: true,
          message: 'No follower devices matched the selected audience',
          data: { audienceCount: 0, pushSent: 0 },
        });
      }

      ensureFirebaseAdmin();
      let successCount = 0;

      for (const tokenChunk of chunk<string>(tokens as string[], 500)) {
        const result = await admin.messaging().sendEachForMulticast({
          tokens: tokenChunk,
          notification: {
            title: String(body.title),
            body: String(body.body),
            ...(body.imageUrl ? { imageUrl: String(body.imageUrl) } : {}),
          },
          data: body.data && typeof body.data === 'object' ? body.data : {},
          android: {
            priority: 'high',
            notification: {
              channelId: 'general_announcements',
              priority: 'max',
              sound: 'default',
            },
          },
          apns: {
            payload: { aps: { sound: 'default', badge: 1 } },
          },
        });
        successCount += result.successCount;
      }

      return NextResponse.json({
        success: true,
        message: 'Push broadcast sent successfully',
        data: {
          audienceCount: tokens.length,
          pushSent: successCount,
          audience: body.audience || 'all_followers',
          cityName: body.cityName || null,
        },
      });
    }

    if (mode === 'volunteer_whatsapp') {
      const cityName = String(body.cityName || '').trim();
      const customMessage = String(body.message || '').trim();

      if (!cityName) {
        return NextResponse.json({ success: false, message: 'City is required for volunteer outreach' }, { status: 400 });
      }

      let event = null;
      if (body.eventId) {
        event = await Event.findOne({ _id: body.eventId, isDeleted: { $ne: true } }).lean();
      }

      const volunteers = await Volunteer.find({
        isDeleted: false,
        isApproved: true,
        city: new RegExp(cityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
      }).lean();

      if (!volunteers.length) {
        return NextResponse.json({
          success: true,
          message: 'No approved volunteers found for the selected city',
          data: { cityName, matchedVolunteers: 0, whatsappSent: 0 },
        });
      }

      const templateName = process.env.WHATSAPP_VOLUNTEER_EVENT_TEMPLATE;
      let sent = 0;
      const failures: string[] = [];

      for (const volunteer of volunteers) {
        const eventDate = body.eventDate || event?.eventDate;
        const eventLocation = body.eventLocation || event?.eventLocation || cityName;
        const eventName = body.eventName || event?.eventName || 'Ashram Seva';
        const message = customMessage || `Hari Om ${volunteer.fullName}. With blessings, you are requested to be present for ${eventName}${eventDate ? ` on ${new Date(eventDate).toLocaleString('en-IN')}` : ''} at ${eventLocation}. Kindly confirm your availability with the Ashram team. Pranams, AvdheshanandG Mission Team`;

        const result = templateName
          ? await sendWhatsAppTemplateMessage({
              to: volunteer.phone,
              templateName,
              bodyValues: [
                volunteer.fullName,
                eventName,
                eventDate ? new Date(eventDate).toLocaleString('en-IN') : 'the scheduled time',
                eventLocation,
              ],
              callbackData: 'volunteer_city_event_broadcast',
            })
          : await sendWhatsAppMessage(volunteer.phone, message);

        if (result.success) {
          sent += 1;
        } else {
          failures.push(`${volunteer.fullName}: ${result.error || 'send-failed'}`);
        }
      }

      return NextResponse.json({
        success: true,
        message: sent ? 'Volunteer WhatsApp outreach queued successfully' : 'Volunteer outreach could not be delivered',
        data: {
          cityName,
          matchedVolunteers: volunteers.length,
          whatsappSent: sent,
          failures,
        },
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid broadcast mode' }, { status: 400 });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send broadcast',
      },
      { status: 500 }
    );
  }
}
