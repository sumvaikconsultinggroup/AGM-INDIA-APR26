'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sunrise, Sunset, Moon, Sun, Star, Sparkles } from 'lucide-react';
import api from '@/lib/api';

interface PanchangData {
  tithi?: {
    name?: string;
    number?: number;
    paksha?: string;
    endTime?: string;
  };
  nakshatra?: {
    name?: string;
    deity?: string;
    endTime?: string;
  };
  yoga?: {
    name?: string;
    endTime?: string;
  };
  karana?: {
    name?: string;
    endTime?: string;
  };
  hinduMonth?: string;
  samvatYear?: number | string;
  samvat?: string;
  sunrise?: string;
  sunset?: string;
  moonrise?: string;
  moonset?: string;
  festivals?: Array<{ name: string; type?: string } | string>;
  date?: string;
}

interface TodayPanchangProps {
  lat: number;
  lng: number;
  cityName: string;
}

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

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gold-100/50 rounded-lg w-48 mx-auto mb-4" />
      <div className="h-6 bg-gold-100/50 rounded w-32 mx-auto mb-6" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-gold-100/30 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function TodayPanchang({ lat, lng, cityName }: TodayPanchangProps) {
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPanchang = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/panchang/today?lat=${lat}&lng=${lng}`);
        setPanchang(res.data?.data || res.data);
      } catch {
        setPanchang(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPanchang();
  }, [lat, lng]);

  const isEkadashi = panchang?.tithi?.number === 11;
  const isPurnima = panchang?.tithi?.number === 15;
  const isAmavasya = panchang?.tithi?.number === 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative overflow-hidden rounded-2xl shadow-temple ${
        isEkadashi ? 'ring-2 ring-gold-400 animate-glow-pulse' : ''
      }`}
      style={{
        background: 'linear-gradient(135deg, #FFFDF5 0%, #FFF8E7 40%, #FFECB3 100%)',
        border: '1px solid rgba(212, 160, 23, 0.25)',
      }}
    >
      {/* Top gold accent bar */}
      <div
        className="h-1"
        style={{ background: 'linear-gradient(90deg, #D4A017, #FF6B00, #D4A017)' }}
      />

      {/* Decorative Om */}
      <div className="absolute top-6 right-6 text-5xl text-gold-300/20 font-sanskrit select-none pointer-events-none">
        ॐ
      </div>

      <div className="p-6 md:p-8">
        {isLoading ? (
          <SkeletonCard />
        ) : !panchang ? (
          <div className="text-center py-8 text-spiritual-warmGray">
            <p className="font-spiritual text-lg">Unable to load Panchang data</p>
            <p className="text-sm mt-1">Please try again later</p>
          </div>
        ) : (
          <>
            {/* Header: Date + City */}
            <div className="text-center mb-6">
              <p className="text-xs text-spiritual-warmGray uppercase tracking-widest font-body mb-1">
                {cityName} &middot;{' '}
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>

              {/* Hindu Month + Samvat */}
              {(panchang.hinduMonth || panchang.samvatYear || panchang.samvat) && (
                <p className="text-sm text-spiritual-saffron font-spiritual mt-1">
                  {panchang.hinduMonth && <span>{panchang.hinduMonth}</span>}
                  {(panchang.samvatYear || panchang.samvat) && (
                    <span> &middot; {panchang.samvat || `विक्रम संवत ${panchang.samvatYear}`}</span>
                  )}
                </p>
              )}
            </div>

            {/* Tithi - Hero Display */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-2">
                {panchang.tithi?.paksha && (
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      panchang.tithi.paksha.toLowerCase() === 'shukla'
                        ? 'bg-gold-100 text-gold-600'
                        : 'bg-spiritual-maroon/10 text-spiritual-maroon'
                    }`}
                  >
                    {panchang.tithi.paksha} पक्ष
                  </span>
                )}
              </div>
              <h2 className="text-3xl md:text-4xl font-display text-spiritual-maroon font-bold">
                {panchang.tithi?.name || 'Tithi'}
              </h2>
              <p className="text-sm text-spiritual-warmGray mt-1 font-body">
                तिथि (Tithi)
                {panchang.tithi?.endTime && (
                  <span> &middot; ends {formatTime12h(panchang.tithi.endTime)}</span>
                )}
              </p>
            </div>

            {/* Nakshatra, Yoga, Karana */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Nakshatra */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gold-100/50">
                <Star className="w-5 h-5 text-spiritual-saffron mx-auto mb-1.5" />
                <p className="text-xs text-spiritual-warmGray mb-0.5">नक्षत्र (Nakshatra)</p>
                <p className="font-display text-spiritual-maroon font-semibold text-lg">
                  {panchang.nakshatra?.name || '--'}
                </p>
                {panchang.nakshatra?.deity && (
                  <p className="text-xs text-spiritual-warmGray/70 mt-0.5">
                    Deity: {panchang.nakshatra.deity}
                  </p>
                )}
              </div>

              {/* Yoga */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gold-100/50">
                <Sparkles className="w-5 h-5 text-gold-400 mx-auto mb-1.5" />
                <p className="text-xs text-spiritual-warmGray mb-0.5">योग (Yoga)</p>
                <p className="font-display text-spiritual-maroon font-semibold text-lg">
                  {panchang.yoga?.name || '--'}
                </p>
              </div>

              {/* Karana */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gold-100/50">
                <Moon className="w-5 h-5 text-spiritual-maroon/60 mx-auto mb-1.5" />
                <p className="text-xs text-spiritual-warmGray mb-0.5">करण (Karana)</p>
                <p className="font-display text-spiritual-maroon font-semibold text-lg">
                  {panchang.karana?.name || '--'}
                </p>
              </div>
            </div>

            {/* Sun & Moon Timings */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="flex items-center gap-2 bg-white/50 rounded-lg px-3 py-2.5 border border-gold-100/30">
                <Sunrise className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-spiritual-warmGray uppercase tracking-wider">Sunrise</p>
                  <p className="font-semibold text-spiritual-maroon text-sm">{formatTime12h(panchang.sunrise)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/50 rounded-lg px-3 py-2.5 border border-gold-100/30">
                <Sunset className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-spiritual-warmGray uppercase tracking-wider">Sunset</p>
                  <p className="font-semibold text-spiritual-maroon text-sm">{formatTime12h(panchang.sunset)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/50 rounded-lg px-3 py-2.5 border border-gold-100/30">
                <Moon className="w-4 h-4 text-blue-300 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-spiritual-warmGray uppercase tracking-wider">Moonrise</p>
                  <p className="font-semibold text-spiritual-maroon text-sm">{formatTime12h(panchang.moonrise)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/50 rounded-lg px-3 py-2.5 border border-gold-100/30">
                <Sun className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-spiritual-warmGray uppercase tracking-wider">Moonset</p>
                  <p className="font-semibold text-spiritual-maroon text-sm">{formatTime12h(panchang.moonset)}</p>
                </div>
              </div>
            </div>

            {/* Festivals */}
            {panchang.festivals && panchang.festivals.length > 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gold-200/50">
                <p className="text-xs text-spiritual-saffron uppercase tracking-widest font-semibold mb-2">
                  Today&apos;s Festivals
                </p>
                <div className="flex flex-wrap gap-2">
                  {panchang.festivals.map((festival, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-gold-50 to-gold-100 text-spiritual-maroon border border-gold-200/50"
                    >
                      <span className="text-gold-500">✦</span>
                      {typeof festival === 'string' ? festival : festival.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Special day indicators */}
            {(isEkadashi || isPurnima || isAmavasya) && (
              <div className="mt-4 text-center">
                <span
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${
                    isEkadashi
                      ? 'bg-gradient-to-r from-gold-200 to-gold-300 text-spiritual-maroon shadow-glow'
                      : isPurnima
                      ? 'bg-white/80 text-spiritual-saffron border border-gold-300'
                      : 'bg-spiritual-maroon/10 text-spiritual-maroon border border-spiritual-maroon/20'
                  }`}
                >
                  {isEkadashi && '🪔 एकादशी (Ekadashi) — Fasting Day'}
                  {isPurnima && '🌕 पूर्णिमा (Purnima) — Full Moon'}
                  {isAmavasya && '🌑 अमावस्या (Amavasya) — New Moon'}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
