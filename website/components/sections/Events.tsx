'use client';

import { motion } from 'framer-motion';
import { SectionHeading } from '../ui/SectionHeading';
import { Calendar, MapPin, ArrowRight, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useTranslation } from 'react-i18next';

// Fallback events data
const fallbackEvents = [
  {
    id: 1,
    title: 'Satsang & Meditation',
    date: 'Every Sunday',
    time: '6:00 AM - 8:00 AM',
    location: 'Kankhal Ashram, Haridwar',
    description: 'Weekly gathering for spiritual discourse and guided meditation.',
    attendees: '200+',
  },
  {
    id: 2,
    title: 'Vedanta Discourse',
    date: 'January 15, 2025',
    time: '5:00 PM - 7:00 PM',
    location: 'Delhi Ashram',
    description: 'Deep dive into the philosophy of Advaita Vedanta.',
    attendees: '500+',
  },
  {
    id: 3,
    title: 'Youth Spiritual Camp',
    date: 'February 1-7, 2025',
    time: 'Full Day',
    location: 'Haridwar',
    description: 'A transformative week-long program for young seekers.',
    attendees: '100+',
  },
];

interface EventItem {
  _id?: string;
  id?: string | number;
  title: string;
  date?: string;
  startDate?: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  venue?: string;
  description?: string;
  attendees?: string;
  attendeeCount?: number;
}

interface EventsProps {
  events?: EventItem[];
}

export function Events({ events: propEvents }: EventsProps) {
  const { t } = useTranslation('schedule');
  const { t: tCommon } = useTranslation('common');
  const [events, setEvents] = useState<EventItem[]>(propEvents || []);
  const [loading, setLoading] = useState(!propEvents);

  useEffect(() => {
    if (propEvents && propEvents.length > 0) {
      setEvents(propEvents);
      setLoading(false);
      return;
    }

    // Try to fetch from events API first, then schedule
    api.get('/events')
      .then(r => {
        const data = r.data?.data || r.data || [];
        if (data.length > 0) {
          setEvents(data);
        } else {
          // Fallback to schedule API
          return api.get('/schedule').then(r2 => {
            const scheduleData = r2.data?.data || r2.data || [];
            setEvents(scheduleData.length > 0 ? scheduleData : fallbackEvents);
          });
        }
      })
      .catch(() => {
        setEvents(fallbackEvents);
      })
      .finally(() => setLoading(false));
  }, [propEvents]);

  const formatDate = (event: EventItem) => {
    if (event.date) return event.date;
    if (event.startDate) {
      try {
        return new Date(event.startDate).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      } catch {
        return event.startDate;
      }
    }
    return 'TBD';
  };

  const formatTime = (event: EventItem) => {
    if (event.time) return event.time;
    if (event.startTime && event.endTime) {
      return `${event.startTime} - ${event.endTime}`;
    }
    if (event.startTime) return event.startTime;
    return '';
  };

  const getLocation = (event: EventItem) => {
    return event.location || event.venue || 'TBD';
  };

  const getAttendees = (event: EventItem) => {
    if (event.attendees) return event.attendees;
    if (event.attendeeCount) return `${event.attendeeCount}+`;
    return '';
  };

  return (
    <section id="events" className="section-padding bg-temple-warm">
      <div className="container-custom">
        <SectionHeading
          title={t('upcomingEvents')}
          subtitle={t('hero.subtitle')}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-spiritual-saffron animate-spin mb-4" />
            <p className="text-spiritual-warmGray font-body">{tCommon('loading')}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-gold-400 mx-auto mb-4" />
            <h3 className="font-display text-2xl text-spiritual-maroon mb-2">{t('noEvents')}</h3>
            <p className="text-spiritual-warmGray"></p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && events.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {events.map((event, index) => (
              <motion.div
                key={event._id || event.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="card-temple p-6 flex flex-col bg-spiritual-cream hover:shadow-glow transition-all duration-300"
              >
                {/* Date Badge with Mandala Circle */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative">
                    {/* Decorative mandala ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-gold-400/30 animate-pulse-soft" />
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-spiritual-saffron to-primary-600 flex items-center justify-center text-white shadow-warm">
                      <Calendar className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <p className="font-display text-spiritual-maroon">{formatDate(event)}</p>
                    {formatTime(event) && (
                      <p className="text-sm text-spiritual-warmGray">{formatTime(event)}</p>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-display text-xl text-spiritual-maroon mb-3">
                  {event.title}
                </h3>

                {/* Description */}
                <p className="text-spiritual-warmGray text-sm mb-4 flex-grow font-body">
                  {event.description || ''}
                </p>

                {/* Location & Attendees */}
                <div className="flex items-center justify-between text-sm text-spiritual-warmGray mb-5 pb-4 border-b border-gold-400/20">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-spiritual-saffron" />
                    {getLocation(event)}
                  </span>
                  {getAttendees(event) && (
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-gold-500" />
                      {getAttendees(event)}
                    </span>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href="/schedule"
                  className="btn-gold w-full justify-center group"
                >
                  {t('registerNow')}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Events */}
        {!loading && events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/schedule" className="btn-primary">
              {tCommon('viewAll')} {t('upcomingEvents')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
