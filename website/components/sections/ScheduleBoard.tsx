'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Clock3, MapPin, Users, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchData } from '@/lib/api';
import { SectionHeading } from '@/components/ui/SectionHeading';

type LocalizedText = {
  [key: string]: string | undefined;
  en?: string;
  hi?: string;
};

type TimeSlot = {
  startDate: string;
  endDate?: string;
  period?: string;
  slotCapacity?: number;
  bookedCount?: number;
  remainingCapacity?: number;
  isBlocked?: boolean;
};

type Schedule = {
  _id: string;
  month: string;
  locations: string;
  baseLocation?: 'Haridwar Ashram' | 'Delhi Ashram' | 'Other';
  publicTitle?: LocalizedText;
  publicLocation?: LocalizedText;
  publicNotes?: LocalizedText;
  changeNote?: string;
  dateRange?: string;
  appointment?: boolean;
  maxPeople?: number;
  totalCapacity?: number;
  remainingCapacity?: number;
  isBlocked?: boolean;
  slotStats?: TimeSlot[];
};

function pickLocalizedText(
  language: string | undefined,
  localized?: LocalizedText,
  fallback?: string
) {
  const code = language?.split('-')[0] || 'en';
  return localized?.[code] || localized?.en || localized?.hi || fallback || '';
}

export function ScheduleBoard() {
  const { t, i18n } = useTranslation('schedule');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchData<Schedule[]>('/schedule').then((data) => {
      if (!mounted) return;
      setSchedules(Array.isArray(data) ? data : []);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const groupedSchedules = useMemo(() => {
    const groups = new Map<string, Schedule[]>();
    schedules.forEach((schedule) => {
      const existing = groups.get(schedule.month) || [];
      existing.push(schedule);
      groups.set(schedule.month, existing);
    });
    return Array.from(groups.entries());
  }, [schedules]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-parchment to-white py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(163,70,47,0.08),_transparent_55%)]" />
      <div className="container relative z-10">
        <SectionHeading
          eyebrow={t('schedulePriorityEyebrow', 'Daily Darshan Schedule')}
          title={t('schedulePriorityTitle', 'Schedule comes first')}
          subtitle={t(
            'schedulePriorityDescription',
            'Delhi Ashram and Haridwar Ashram updates appear here first so devotees can plan around Swami Ji’s confirmed movement.'
          )}
          align="left"
        />

        {loading ? (
          <div className="mt-10 rounded-3xl border border-temple-gold/25 bg-white/80 p-8 text-sm text-maroon-700 shadow-soft">
            {t('loadingSchedules', 'Loading the latest schedule...')}
          </div>
        ) : groupedSchedules.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-temple-gold/25 bg-white/80 p-8 text-sm text-maroon-700 shadow-soft">
            {t('noSchedules', 'No schedules are available right now.')}
          </div>
        ) : (
          <div className="mt-10 space-y-10">
            {groupedSchedules.map(([month, items]) => (
              <div key={month} className="space-y-5">
                <div className="inline-flex items-center rounded-full border border-temple-gold/30 bg-white/80 px-5 py-2 text-sm font-semibold text-maroon-700 shadow-soft">
                  {month}
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  {items.map((schedule) => {
                    const title = pickLocalizedText(i18n.language, schedule.publicTitle, schedule.locations);
                    const location = pickLocalizedText(
                      i18n.language,
                      schedule.publicLocation,
                      schedule.locations
                    );
                    const notes = pickLocalizedText(i18n.language, schedule.publicNotes);

                    return (
                      <article
                        key={schedule._id}
                        className="rounded-[28px] border border-temple-gold/20 bg-white/90 p-6 shadow-soft transition-transform duration-300 hover:-translate-y-1"
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center rounded-full bg-maroon-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cream">
                            {schedule.baseLocation || 'Ashram'}
                          </span>
                          {schedule.appointment ? (
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                schedule.isBlocked
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {schedule.isBlocked
                                ? t('fullyBooked', 'Appointments Full')
                                : t('appointmentsOpen', 'Appointments Open')}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="mt-5 text-2xl font-semibold text-maroon-900">{title}</h3>

                        <div className="mt-5 space-y-3 text-sm text-maroon-700">
                          <div className="flex items-start gap-3">
                            <CalendarDays className="mt-0.5 h-4 w-4 text-saffron-600" />
                            <span>{schedule.dateRange}</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 h-4 w-4 text-saffron-600" />
                            <span>{location}</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <Users className="mt-0.5 h-4 w-4 text-saffron-600" />
                            <span>
                              {t('availability', 'Availability')}: {schedule.remainingCapacity ?? schedule.maxPeople ?? 0}
                              {' / '}
                              {schedule.totalCapacity ?? schedule.maxPeople ?? 0}
                            </span>
                          </div>
                        </div>

                        {schedule.slotStats?.length ? (
                          <div className="mt-5 grid gap-3">
                            {schedule.slotStats.map((slot) => (
                              <div
                                key={`${schedule._id}-${slot.startDate}`}
                                className="rounded-2xl border border-temple-gold/15 bg-parchment/70 px-4 py-3"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-maroon-900">
                                      {new Date(slot.startDate).toLocaleDateString(
                                        i18n.language?.startsWith('hi') ? 'hi-IN' : 'en-IN',
                                        {
                                          weekday: 'long',
                                          day: 'numeric',
                                          month: 'long',
                                          year: 'numeric',
                                        }
                                      )}
                                    </p>
                                    <p className="mt-1 flex items-center gap-2 text-xs text-maroon-700">
                                      <Clock3 className="h-3.5 w-3.5" />
                                      {slot.period || t('dayWindow', 'Day schedule')}
                                    </p>
                                  </div>
                                  <div className="text-right text-xs font-semibold text-maroon-700">
                                    {slot.remainingCapacity ?? slot.slotCapacity ?? 0} {t('openSlots', 'open')}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        {schedule.changeNote ? (
                          <div className="mt-5 flex gap-3 rounded-2xl border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{schedule.changeNote}</span>
                          </div>
                        ) : null}

                        {notes ? <p className="mt-5 text-sm leading-7 text-maroon-700">{notes}</p> : null}
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/live"
            className="inline-flex items-center rounded-full bg-maroon-900 px-5 py-3 text-sm font-semibold text-cream transition hover:bg-maroon-800"
          >
            {t('viewLive', 'View Live Updates')}
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full border border-temple-gold/30 bg-white/80 px-5 py-3 text-sm font-semibold text-maroon-800 transition hover:border-saffron-500 hover:text-saffron-600"
          >
            {t('contactSevaTeam', 'Contact Seva Team')}
          </Link>
        </div>
      </div>
    </section>
  );
}
