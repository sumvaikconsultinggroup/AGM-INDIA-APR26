'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, CalendarDays, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface PanchangSummaryData {
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
        // Default: Haridwar coordinates
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
              className="relative overflow-hidden rounded-2xl shadow-card-ornate transition-all duration-300 group-hover:shadow-temple group-hover:-translate-y-0.5 max-w-2xl mx-auto"
              style={{
                background: 'linear-gradient(135deg, #FFFDF5 0%, #FFF8E7 40%, #FFECB3 100%)',
                border: '1px solid rgba(212, 160, 23, 0.25)',
              }}
            >
              {/* Top gold accent */}
              <div
                className="h-0.5"
                style={{ background: 'linear-gradient(90deg, #D4A017, #FF6B00, #D4A017)' }}
              />

              {/* Decorative Om */}
              <div className="absolute top-4 right-6 text-4xl text-gold-300/15 font-sanskrit select-none pointer-events-none">
                ॐ
              </div>

              <div className="p-5 md:p-6">
                {/* Section label */}
                <p className="text-[11px] text-spiritual-saffron uppercase tracking-[0.2em] font-semibold mb-3">
                  आज का पंचांग &middot; Today&apos;s Panchang
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Tithi + Nakshatra */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-gold-400 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-spiritual-warmGray">तिथि</span>
                        <p className="font-display text-spiritual-maroon font-semibold">
                          {panchang.tithi?.name || '--'}
                          {panchang.tithi?.paksha && (
                            <span className="text-xs text-spiritual-warmGray font-normal ml-1.5">
                              ({panchang.tithi.paksha} Paksha)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-gold-400 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-spiritual-warmGray">नक्षत्र</span>
                        <p className="font-display text-spiritual-maroon font-semibold">
                          {panchang.nakshatra?.name || '--'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Next festival */}
                  {nextFestival && (
                    <div className="sm:border-l sm:border-gold-200/50 sm:pl-4">
                      <p className="text-xs text-spiritual-warmGray mb-0.5">Next Festival</p>
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

                  {/* Arrow */}
                  <div className="hidden sm:flex items-center">
                    <ArrowRight className="w-5 h-5 text-gold-400 group-hover:text-spiritual-saffron group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>

                {/* Mobile CTA */}
                <div className="sm:hidden mt-3 pt-3 border-t border-gold-100/50 flex items-center justify-center gap-1 text-sm text-spiritual-saffron font-medium">
                  View Full Panchang
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
