'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, CalendarDays, ArrowRight, Moon, Sun, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface PanchangSummaryData {
  tithi?: { name?: string; paksha?: string; endTime?: string };
  nakshatra?: { name?: string; deity?: string };
  sunrise?: string;
  sunset?: string;
  dayQuality?: { score?: number; label?: string; color?: string };
  moonRashi?: { name?: string; nameHindi?: string };
  festival?: string | null;
  festivals?: string[];
  hinduMonth?: string;
  dayNameHindi?: string;
  muhurta?: {
    brahmaMuhurta?: { start?: string; end?: string };
    rahuKaal?: { start?: string; end?: string };
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
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function PanchangSummary() {
  const [panchang, setPanchang] = useState<PanchangSummaryData | null>(null);
  const [nextFestival, setNextFestival] = useState<FestivalItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [panchangRes, festivalRes] = await Promise.allSettled([
          api.get('/panchang/today?lat=29.9457&lng=78.1642'),
          api.get('/panchang/festivals?upcoming=true&limit=1'),
        ]);

        if (panchangRes.status === 'fulfilled') {
          setPanchang(panchangRes.value.data?.data || panchangRes.value.data);
        }

        if (festivalRes.status === 'fulfilled') {
          const festivals = festivalRes.value.data?.data || festivalRes.value.data || [];
          if (Array.isArray(festivals) && festivals.length > 0) {
            setNextFestival(festivals[0]);
          }
        }
      } catch {
        // Silently fail -- section won't render
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading || !panchang) return null;

  const days = nextFestival ? daysUntil(nextFestival.date) : null;
  const primaryFestival = panchang.festival || panchang.festivals?.[0];
  const dayQuality = panchang.dayQuality;

  return (
    <section className="py-12 bg-gradient-to-b from-spiritual-cream/50 to-spiritual-warmWhite">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/panchang" className="block group">
            <div
              className="relative overflow-hidden rounded-2xl shadow-card-ornate transition-all duration-300 group-hover:shadow-temple group-hover:-translate-y-0.5 max-w-3xl mx-auto"
              style={{
                background: 'linear-gradient(135deg, #FFFDF5 0%, #FFF8E7 40%, #FFECB3 100%)',
                border: '1px solid rgba(212, 160, 23, 0.25)',
              }}
            >
              {/* Top gold accent */}
              <div
                className="h-1"
                style={{ background: 'linear-gradient(90deg, #D4A017, #FF6B00, #D4A017)' }}
              />

              {/* Decorative Om */}
              <div className="absolute top-4 right-6 text-4xl text-gold-300/15 font-sanskrit select-none pointer-events-none">
                &#x0950;
              </div>

              <div className="p-5 md:p-6">
                {/* Section Label & Day Quality */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[11px] text-spiritual-saffron uppercase tracking-[0.2em] font-semibold">
                      आज का पंचांग &middot; Today&apos;s Panchang
                    </p>
                    {panchang.dayNameHindi && panchang.hinduMonth && (
                      <p className="text-xs text-spiritual-warmGray mt-0.5">
                        {panchang.dayNameHindi} &middot; {panchang.hinduMonth}
                      </p>
                    )}
                  </div>
                  {dayQuality && dayQuality.score && (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 10 }, (_, i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: i < (dayQuality.score || 0) ? (dayQuality.color || '#CA8A04') : '#E5E7EB' }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold" style={{ color: dayQuality.color || '#CA8A04' }}>
                        {dayQuality.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Festival Banner */}
                {primaryFestival && (
                  <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-gradient-to-r from-gold-100/60 to-gold-200/40 border border-gold-300/30">
                    <Sparkles className="w-4 h-4 text-spiritual-saffron flex-shrink-0" />
                    <span className="text-sm font-semibold text-spiritual-maroon">{primaryFestival}</span>
                  </div>
                )}

                {/* Main Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {/* Tithi */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-3.5 h-3.5 text-gold-400" />
                      <span className="text-[10px] text-spiritual-warmGray uppercase tracking-wider">तिथि</span>
                    </div>
                    <p className="font-display text-spiritual-maroon font-semibold text-sm">
                      {panchang.tithi?.name || '--'}
                    </p>
                    {panchang.tithi?.paksha && (
                      <span className="text-[10px] text-gold-600 font-medium">{panchang.tithi.paksha}</span>
                    )}
                  </div>

                  {/* Nakshatra */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CalendarDays className="w-3.5 h-3.5 text-gold-400" />
                      <span className="text-[10px] text-spiritual-warmGray uppercase tracking-wider">नक्षत्र</span>
                    </div>
                    <p className="font-display text-spiritual-maroon font-semibold text-sm">
                      {panchang.nakshatra?.name || '--'}
                    </p>
                    {panchang.nakshatra?.deity && (
                      <span className="text-[10px] text-gold-600 font-medium">{panchang.nakshatra.deity}</span>
                    )}
                  </div>

                  {/* Sunrise/Sunset */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Sun className="w-3.5 h-3.5 text-gold-400" />
                      <span className="text-[10px] text-spiritual-warmGray uppercase tracking-wider">Sunrise</span>
                    </div>
                    <p className="font-display text-spiritual-maroon font-semibold text-sm">
                      {panchang.sunrise || '--:--'}
                    </p>
                    {panchang.sunset && (
                      <span className="text-[10px] text-gold-600 font-medium">Sunset {panchang.sunset}</span>
                    )}
                  </div>

                  {/* Moon Rashi */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Moon className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-[10px] text-spiritual-warmGray uppercase tracking-wider">Moon Rashi</span>
                    </div>
                    <p className="font-display text-spiritual-maroon font-semibold text-sm">
                      {panchang.moonRashi?.name || '--'}
                    </p>
                    {panchang.moonRashi?.nameHindi && (
                      <span className="text-[10px] text-gold-600 font-medium">{panchang.moonRashi.nameHindi}</span>
                    )}
                  </div>
                </div>

                {/* Auspicious/Inauspicious Timings */}
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                  {panchang.muhurta?.brahmaMuhurta && (
                    <div className="flex items-center gap-2 flex-1 px-3 py-1.5 rounded-md bg-green-50/60 border border-green-200/30">
                      <Clock className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-green-700 font-medium block">Brahma Muhurta</span>
                        <span className="text-xs text-green-800 font-semibold">
                          {panchang.muhurta.brahmaMuhurta.start} - {panchang.muhurta.brahmaMuhurta.end}
                        </span>
                      </div>
                    </div>
                  )}
                  {panchang.muhurta?.rahuKaal && (
                    <div className="flex items-center gap-2 flex-1 px-3 py-1.5 rounded-md bg-red-50/60 border border-red-200/30">
                      <Clock className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-red-700 font-medium block">Rahu Kaal</span>
                        <span className="text-xs text-red-800 font-semibold">
                          {panchang.muhurta.rahuKaal.start} - {panchang.muhurta.rahuKaal.end}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Next Festival + CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-gold-100/50">
                  {nextFestival && (
                    <div className="flex-1">
                      <p className="text-xs text-spiritual-warmGray">Next Festival</p>
                      <p className="font-display text-spiritual-maroon font-semibold text-sm">
                        {nextFestival.name}
                      </p>
                      {days !== null && (
                        <p className="text-xs text-spiritual-saffron font-medium">
                          {days === 0 ? 'Today!' : `in ${days} day${days !== 1 ? 's' : ''}`}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-sm text-spiritual-saffron font-medium group-hover:text-spiritual-maroon transition-colors">
                    View Full Panchang
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
