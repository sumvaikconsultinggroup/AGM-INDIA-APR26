'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface PanchangSummaryData {
  locationName?: string;
  tithi?: {
    name?: string;
    paksha?: string;
  };
  nakshatra?: {
    name?: string;
  };
}

interface FestivalItem {
  name: string;
  date: string;
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function PanchangSummary() {
  const [panchang, setPanchang] = useState<PanchangSummaryData | null>(null);
  const [nextFestival, setNextFestival] = useState<FestivalItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [panchangRes, festivalRes] = await Promise.allSettled([
          api.get('/panchang/today?lat=29.9457&lng=78.1642&city=Haridwar'),
          api.get('/panchang/festivals?upcoming=true&limit=1'),
        ]);

        if (panchangRes.status === 'fulfilled') {
          setPanchang((panchangRes.value.data as any)?.data || panchangRes.value.data);
          setError(null);
        } else {
          setError('Panchang service is currently unavailable.');
        }

        if (festivalRes.status === 'fulfilled') {
          const festivals = (festivalRes.value.data as any)?.data || festivalRes.value.data || [];
          if (Array.isArray(festivals) && festivals.length > 0) {
            setNextFestival(festivals[0]);
          }
        }
      } catch {
        setError('Panchang service is currently unavailable.');
      }
    };

    fetchData();
  }, []);

  if (!panchang && !error) return null;

  const festivalDays = nextFestival ? daysUntil(nextFestival.date) : null;

  return (
    <section className="bg-temple-warm py-10">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="card-temple mx-auto max-w-5xl p-7 md:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-spiritual-saffron">
                Panchang
              </p>
              <h2 className="mt-3 font-display text-3xl text-spiritual-maroon">
                Today’s spiritual calendar
              </h2>
              <p className="mt-3 text-base leading-relaxed text-spiritual-warmGray">
                Real-time tithi, nakshatra, and upcoming observances for daily planning and spiritual practice.
              </p>
            </div>

            <Link href="/panchang" className="btn-secondary whitespace-nowrap">
              View full Panchang
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-[rgba(122,86,26,0.12)] bg-white/75 p-5">
              <div className="flex items-center gap-2 text-spiritual-saffron">
                <MapPin className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.24em]">Location</span>
              </div>
              <p className="mt-3 font-display text-xl text-spiritual-maroon">
                {panchang?.locationName || 'Haridwar'}
              </p>
            </div>

            <div className="rounded-[24px] border border-[rgba(122,86,26,0.12)] bg-white/75 p-5">
              <div className="flex items-center gap-2 text-spiritual-saffron">
                <Star className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.24em]">Today</span>
              </div>
              <p className="mt-3 font-display text-xl text-spiritual-maroon">
                {panchang?.tithi?.name || 'Unavailable'}
              </p>
              <p className="mt-1 text-sm text-spiritual-warmGray">
                {panchang?.nakshatra?.name ? `Nakshatra: ${panchang.nakshatra.name}` : error || 'Awaiting live data'}
              </p>
            </div>

            <div className="rounded-[24px] border border-[rgba(122,86,26,0.12)] bg-white/75 p-5">
              <div className="flex items-center gap-2 text-spiritual-saffron">
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.24em]">Upcoming</span>
              </div>
              <p className="mt-3 font-display text-xl text-spiritual-maroon">
                {nextFestival?.name || 'No festival loaded'}
              </p>
              <p className="mt-1 text-sm text-spiritual-warmGray">
                {festivalDays === null ? 'Syncing observances' : festivalDays === 0 ? 'Today' : `In ${festivalDays} day${festivalDays === 1 ? '' : 's'}`}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
