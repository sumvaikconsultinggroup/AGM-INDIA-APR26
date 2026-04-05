'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import api from '@/lib/api';

interface DayPanchang {
  date: string;
  tithi?: {
    name?: string;
    number?: number;
    paksha?: string;
  };
  nakshatra?: {
    name?: string;
    deity?: string;
  };
  yoga?: { name?: string };
  karana?: { name?: string };
  festivals?: Array<{ name: string; type?: string } | string>;
  sunrise?: string;
  sunset?: string;
}

interface MonthlyCalendarProps {
  lat: number;
  lng: number;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatTime12h(timeStr?: string): string {
  if (!timeStr || timeStr === 'N/A') return '--:--';
  try {
    const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(timeStr.trim());
    if (!match) return timeStr;
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    if (Number.isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  } catch {
    return timeStr;
  }
}

function SkeletonCalendar() {
  return (
    <div className="animate-pulse p-4">
      <div className="h-6 bg-gold-100/50 rounded w-40 mx-auto mb-4" />
      <div className="grid grid-cols-7 gap-1">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="h-16 bg-gold-100/20 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function MonthlyCalendar({ lat, lng }: MonthlyCalendarProps) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [monthData, setMonthData] = useState<DayPanchang[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayPanchang | null>(null);

  useEffect(() => {
    const fetchMonth = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(
          `/panchang/month?month=${month}&year=${year}&lat=${lat}&lng=${lng}`
        );
        const data = res.data?.data || res.data || [];
        setMonthData(Array.isArray(data) ? data : []);
      } catch {
        setMonthData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMonth();
  }, [month, year, lat, lng]);

  const goToPrevMonth = useCallback(() => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }, [month]);

  const goToNextMonth = useCallback(() => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setMonth(today.getMonth() + 1);
    setYear(today.getFullYear());
  }, []);

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const monthName = new Date(year, month - 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  // Map monthData by day
  const panchangByDay: Record<number, DayPanchang> = {};
  monthData.forEach((day) => {
    if (day.date) {
      const d = parseInt(day.date.split('-')[2], 10);
      if (!Number.isNaN(d)) {
        panchangByDay[d] = day;
      }
    }
  });

  const isCurrentMonth =
    month === now.getMonth() + 1 && year === now.getFullYear();
  const todayDate = now.getDate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="rounded-2xl overflow-hidden shadow-card-ornate"
      style={{
        background: 'linear-gradient(180deg, #FFFDF5, #FFF8E7)',
        border: '1px solid rgba(212, 160, 23, 0.2)',
      }}
    >
      {/* Month navigation */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-gold-100/50">
        <button
          onClick={goToPrevMonth}
          className="p-2 rounded-lg hover:bg-gold-50 text-spiritual-maroon transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h3 className="font-display text-lg text-spiritual-maroon font-semibold">
            {monthName}
          </h3>
          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              className="text-xs text-spiritual-saffron hover:underline font-medium"
            >
              Go to today
            </button>
          )}
        </div>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-gold-50 text-spiritual-maroon transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {isLoading ? (
        <SkeletonCalendar />
      ) : (
        <div className="p-3 md:p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-bold text-spiritual-warmGray uppercase tracking-wider py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayData = panchangByDay[dayNum];
              const isToday = isCurrentMonth && dayNum === todayDate;
              const isEkadashi = dayData?.tithi?.number === 11;
              const isPurnima = dayData?.tithi?.number === 15;
              const isAmavasya = dayData?.tithi?.number === 30;
              const hasFestival = dayData?.festivals && dayData.festivals.length > 0;
              const isShukla = dayData?.tithi?.paksha?.toLowerCase() === 'shukla';

              return (
                <button
                  key={dayNum}
                  onClick={() => dayData && setSelectedDay(dayData)}
                  className={`aspect-square rounded-lg p-0.5 md:p-1 flex flex-col items-center justify-center relative transition-all duration-200 text-center group ${
                    isToday
                      ? 'bg-spiritual-saffron text-white shadow-warm ring-2 ring-spiritual-saffron/30'
                      : isEkadashi
                      ? 'bg-gold-50 border-2 border-gold-300 hover:bg-gold-100'
                      : 'hover:bg-white/60 border border-transparent hover:border-gold-100/40'
                  } ${dayData ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {/* Gregorian date */}
                  <span
                    className={`text-xs md:text-sm font-semibold leading-none ${
                      isToday ? 'text-white' : 'text-spiritual-maroon'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {/* Tithi number */}
                  {dayData?.tithi?.number && (
                    <span
                      className={`text-[9px] md:text-[10px] leading-none mt-0.5 ${
                        isToday ? 'text-white/80' : 'text-spiritual-warmGray/70'
                      }`}
                    >
                      {dayData.tithi.number}
                    </span>
                  )}

                  {/* Paksha dot */}
                  {dayData?.tithi?.paksha && (
                    <span
                      className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${
                        isShukla ? 'bg-gold-300' : 'bg-spiritual-maroon/40'
                      }`}
                    />
                  )}

                  {/* Festival dot */}
                  {hasFestival && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-spiritual-saffron" />
                  )}

                  {/* Purnima / Amavasya icon */}
                  {isPurnima && !isToday && (
                    <span className="absolute top-0 left-0.5 text-[8px]">
                      🌕
                    </span>
                  )}
                  {isAmavasya && !isToday && (
                    <span className="absolute top-0 left-0.5 text-[8px]">
                      🌑
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gold-100/30 text-[10px] text-spiritual-warmGray">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gold-300" /> Shukla
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-spiritual-maroon/40" /> Krishna
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-spiritual-saffron" /> Festival
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 border-2 border-gold-300 rounded" /> Ekadashi
            </span>
          </div>
        </div>
      )}

      {/* Day Detail Modal */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-spiritual-maroon/50 backdrop-blur-sm"
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl overflow-hidden shadow-temple"
              style={{
                background: 'linear-gradient(180deg, #FFFDF5, #FFF8E7)',
                border: '1px solid rgba(212, 160, 23, 0.3)',
              }}
            >
              {/* Gold accent */}
              <div
                className="h-1"
                style={{ background: 'linear-gradient(90deg, #D4A017, #FF6B00, #D4A017)' }}
              />

              <div className="p-5">
                {/* Close button */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-spiritual-warmGray">
                      {selectedDay.date &&
                        new Date(selectedDay.date).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                    </p>
                    <h4 className="font-display text-xl text-spiritual-maroon font-bold mt-1">
                      {selectedDay.tithi?.name || 'Tithi'}
                    </h4>
                    {selectedDay.tithi?.paksha && (
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedDay.tithi.paksha.toLowerCase() === 'shukla'
                            ? 'bg-gold-100 text-gold-600'
                            : 'bg-spiritual-maroon/10 text-spiritual-maroon'
                        }`}
                      >
                        {selectedDay.tithi.paksha} Paksha
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="p-1.5 rounded-lg hover:bg-gold-50 text-spiritual-warmGray"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Details grid */}
                <div className="space-y-2.5 text-sm">
                  {selectedDay.nakshatra?.name && (
                    <div className="flex justify-between items-center">
                      <span className="text-spiritual-warmGray">नक्षत्र (Nakshatra)</span>
                      <span className="font-semibold text-spiritual-maroon">
                        {selectedDay.nakshatra.name}
                        {selectedDay.nakshatra.deity && (
                          <span className="text-xs text-spiritual-warmGray/70 ml-1">
                            ({selectedDay.nakshatra.deity})
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  {selectedDay.yoga?.name && (
                    <div className="flex justify-between items-center">
                      <span className="text-spiritual-warmGray">योग (Yoga)</span>
                      <span className="font-semibold text-spiritual-maroon">
                        {selectedDay.yoga.name}
                      </span>
                    </div>
                  )}
                  {selectedDay.karana?.name && (
                    <div className="flex justify-between items-center">
                      <span className="text-spiritual-warmGray">करण (Karana)</span>
                      <span className="font-semibold text-spiritual-maroon">
                        {selectedDay.karana.name}
                      </span>
                    </div>
                  )}
                  {selectedDay.sunrise && (
                    <div className="flex justify-between items-center">
                      <span className="text-spiritual-warmGray">Sunrise / Sunset</span>
                      <span className="font-semibold text-spiritual-maroon">
                        {formatTime12h(selectedDay.sunrise)} / {formatTime12h(selectedDay.sunset)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Festivals */}
                {selectedDay.festivals && selectedDay.festivals.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gold-100/50">
                    <p className="text-xs text-spiritual-saffron font-semibold uppercase tracking-wider mb-2">
                      Festivals
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDay.festivals.map((f, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-gold-50 text-spiritual-maroon border border-gold-200/50"
                        >
                          {typeof f === 'string' ? f : f.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
