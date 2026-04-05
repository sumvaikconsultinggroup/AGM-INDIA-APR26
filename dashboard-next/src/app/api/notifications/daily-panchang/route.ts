/**
 * Daily Panchang Push Notification Cron Endpoint
 * 
 * Called daily at Brahma Muhurta time (~4:30 AM IST) via external cron service
 * or internal scheduler. Sends daily Panchang summary + festival alerts to
 * all subscribed devotees in their chosen language.
 * 
 * Endpoint: POST /api/notifications/daily-panchang
 * Auth: Requires X-Cron-Secret header for security
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import NotificationPreference from '@/models/NotificationPreference';
import { buildObservationDate, buildPanchangData, resolveTimezone } from '@/lib/panchang/panchangService';
import { getUpcomingFixedFestivals } from '@/lib/panchang/festivals';
import admin from 'firebase-admin';

function ensureFirebaseAdmin() {
  if (admin.apps.length) return;
  const raw = process.env.FIREBASE_ADMIN_SDK_JSON;
  if (!raw) throw new Error('FIREBASE_ADMIN_SDK_JSON is not configured');
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
}

// i18n notification templates
const NOTIFICATION_TEMPLATES: Record<string, { title: string; bodyTemplate: string; festivalPrefix: string }> = {
  hi: {
    title: 'आज का पंचांग',
    bodyTemplate: 'तिथि: {tithi} ({paksha})\nनक्षत्र: {nakshatra}\nसूर्योदय: {sunrise}\nराहुकाल: {rahuKaal}',
    festivalPrefix: 'आज का त्योहार',
  },
  en: {
    title: "Today's Panchang",
    bodyTemplate: 'Tithi: {tithi} ({paksha})\nNakshatra: {nakshatra}\nSunrise: {sunrise}\nRahu Kaal: {rahuKaal}',
    festivalPrefix: "Today's Festival",
  },
  sa: {
    title: 'अद्य पञ्चाङ्गम्',
    bodyTemplate: 'तिथिः: {tithi} ({paksha})\nनक्षत्रम्: {nakshatra}\nसूर्योदयः: {sunrise}',
    festivalPrefix: 'अद्य उत्सवः',
  },
  gu: {
    title: 'આજનું પંચાંગ',
    bodyTemplate: 'તિથિ: {tithi} ({paksha})\nનક્ષત્ર: {nakshatra}\nસૂર્યોદય: {sunrise}\nરાહુ કાળ: {rahuKaal}',
    festivalPrefix: 'આજનો તહેવાર',
  },
  mr: {
    title: 'आजचे पंचांग',
    bodyTemplate: 'तिथी: {tithi} ({paksha})\nनक्षत्र: {nakshatra}\nसूर्योदय: {sunrise}\nराहुकाळ: {rahuKaal}',
    festivalPrefix: 'आजचा सण',
  },
  bn: {
    title: 'আজকের পঞ্চাঙ্গ',
    bodyTemplate: 'তিথি: {tithi} ({paksha})\nনক্ষত্র: {nakshatra}\nসূর্যোদয়: {sunrise}\nরাহুকাল: {rahuKaal}',
    festivalPrefix: 'আজকের উৎসব',
  },
  ta: {
    title: 'இன்றைய பஞ்சாங்கம்',
    bodyTemplate: 'திதி: {tithi} ({paksha})\nநட்சத்திரம்: {nakshatra}\nசூரிய உதயம்: {sunrise}\nராகு காலம்: {rahuKaal}',
    festivalPrefix: 'இன்றைய திருவிழா',
  },
  te: {
    title: 'నేటి పంచాంగం',
    bodyTemplate: 'తిథి: {tithi} ({paksha})\nనక్షత్రం: {nakshatra}\nసూర్యోదయం: {sunrise}\nరాహు కాలం: {rahuKaal}',
    festivalPrefix: 'నేటి పండుగ',
  },
  kn: {
    title: 'ಇಂದಿನ ಪಂಚಾಂಗ',
    bodyTemplate: 'ತಿಥಿ: {tithi} ({paksha})\nನಕ್ಷತ್ರ: {nakshatra}\nಸೂರ್ಯೋದಯ: {sunrise}\nರಾಹು ಕಾಲ: {rahuKaal}',
    festivalPrefix: 'ಇಂದಿನ ಹಬ್ಬ',
  },
  ml: {
    title: 'ഇന്നത്തെ പഞ്ചാംഗം',
    bodyTemplate: 'തിഥി: {tithi} ({paksha})\nനക്ഷത്രം: {nakshatra}\nസൂര്യോദയം: {sunrise}\nരാഹുകാലം: {rahuKaal}',
    festivalPrefix: 'ഇന്നത്തെ ഉത്സവം',
  },
  pa: {
    title: 'ਅੱਜ ਦਾ ਪੰਚਾਂਗ',
    bodyTemplate: 'ਤਿਥੀ: {tithi} ({paksha})\nਨਕਸ਼ਤਰ: {nakshatra}\nਸੂਰਜ ਚੜ੍ਹਨਾ: {sunrise}\nਰਾਹੁ ਕਾਲ: {rahuKaal}',
    festivalPrefix: 'ਅੱਜ ਦਾ ਤਿਉਹਾਰ',
  },
  or: {
    title: 'ଆଜିର ପଞ୍ଚାଙ୍ଗ',
    bodyTemplate: 'ତିଥି: {tithi} ({paksha})\nନକ୍ଷତ୍ର: {nakshatra}\nସୂର୍ଯ୍ୟୋଦୟ: {sunrise}\nରାହୁ କାଳ: {rahuKaal}',
    festivalPrefix: 'ଆଜିର ପର୍ବ',
  },
};

function buildNotificationBody(template: string, data: Record<string, string>): string {
  let body = template;
  for (const [key, value] of Object.entries(data)) {
    body = body.replace(`{${key}}`, value || '--');
  }
  return body;
}

export async function POST(req: NextRequest) {
  try {
    // Security: verify cron secret
    const cronSecret = req.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET;
    if (expectedSecret && cronSecret !== expectedSecret) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const today = new Date().toISOString().split('T')[0];

    // Get all active subscribers who haven't been notified today
    const subscribers = await NotificationPreference.find({
      isActive: true,
      dailyPanchang: true,
      $or: [
        { lastNotifiedDate: { $ne: today } },
        { lastNotifiedDate: { $exists: false } },
      ],
    }).lean();

    if (subscribers.length === 0) {
      return NextResponse.json({ success: true, message: 'No subscribers to notify', count: 0 });
    }

    // Group subscribers by location for efficient Panchang calculation
    const locationGroups = new Map<string, { lat: number; lng: number; cityName: string; timezone: string; subscribers: typeof subscribers }>();
    
    for (const sub of subscribers) {
      const key = `${sub.lat.toFixed(2)}_${sub.lng.toFixed(2)}`;
      if (!locationGroups.has(key)) {
        locationGroups.set(key, { lat: sub.lat, lng: sub.lng, cityName: sub.cityName, timezone: sub.timezone, subscribers: [] });
      }
      locationGroups.get(key)!.subscribers.push(sub);
    }

    let totalSent = 0;
    let totalFailed = 0;
    const errors: string[] = [];

    // Check today's festivals
    const todayFestivals = getUpcomingFixedFestivals(new Date(), 1);
    const todayFestival = todayFestivals.length > 0 && todayFestivals[0].date === today ? todayFestivals[0] : null;

    let firebaseAvailable = false;
    try {
      ensureFirebaseAdmin();
      firebaseAvailable = true;
    } catch (e) {
      errors.push(`Firebase unavailable: ${e instanceof Error ? e.message : 'Unknown'}`);
    }

    for (const [, group] of locationGroups) {
      // Calculate Panchang for this location
      const timezone = resolveTimezone(group.cityName, group.timezone);
      const date = buildObservationDate(null, timezone);
      
      let panchangData;
      try {
        panchangData = buildPanchangData({ date, lat: group.lat, lng: group.lng, cityName: group.cityName, timezone });
      } catch (e) {
        errors.push(`Panchang calc failed for ${group.cityName}: ${e instanceof Error ? e.message : 'Unknown'}`);
        continue;
      }

      for (const sub of group.subscribers) {
        const lang = sub.language || 'hi';
        const template = NOTIFICATION_TEMPLATES[lang] || NOTIFICATION_TEMPLATES['hi'];

        const notifBody = buildNotificationBody(template.bodyTemplate, {
          tithi: panchangData.tithi?.name || '--',
          paksha: panchangData.tithi?.paksha || '--',
          nakshatra: panchangData.nakshatra?.name || '--',
          sunrise: panchangData.sunrise || '--',
          rahuKaal: panchangData.rahuKaal ? `${panchangData.rahuKaal.start} - ${panchangData.rahuKaal.end}` : '--',
        });

        let title = template.title;
        if (todayFestival) {
          title = `${template.festivalPrefix}: ${todayFestival.name}`;
        }

        if (firebaseAvailable) {
          try {
            await admin.messaging().send({
              notification: { title, body: notifBody },
              data: {
                type: 'daily_panchang',
                date: today,
                tithi: panchangData.tithi?.name || '',
                nakshatra: panchangData.nakshatra?.name || '',
                hasFestival: todayFestival ? 'true' : 'false',
                festivalName: todayFestival?.name || '',
              },
              token: sub.pushToken,
              android: {
                priority: 'high',
                notification: {
                  channelId: 'panchang_daily',
                  priority: 'max',
                  sound: 'default',
                },
              },
              apns: {
                payload: { aps: { sound: 'default', badge: 1 } },
              },
            });
            totalSent++;
          } catch (sendError) {
            totalFailed++;
            // If token is invalid, deactivate it
            const errMsg = sendError instanceof Error ? sendError.message : '';
            if (errMsg.includes('not-registered') || errMsg.includes('invalid-registration-token')) {
              await NotificationPreference.updateOne({ pushToken: sub.pushToken }, { $set: { isActive: false } });
            }
          }
        }

        // Mark as notified regardless (for the date tracking)
        await NotificationPreference.updateOne(
          { pushToken: sub.pushToken },
          { $set: { lastNotifiedDate: today } }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        date: today,
        totalSubscribers: subscribers.length,
        locationGroups: locationGroups.size,
        sent: totalSent,
        failed: totalFailed,
        hasFestival: !!todayFestival,
        festivalName: todayFestival?.name || null,
        firebaseAvailable,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error('Daily Panchang notification error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
