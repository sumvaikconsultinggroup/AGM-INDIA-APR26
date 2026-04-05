'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle, Timer } from 'lucide-react';
import api from '@/lib/api';

interface TimePeriod {
  name: string;
  start: string;
  end: string;
  label?: string;
}

interface ChoghadiyaPeriod {
  name: string;
  start: string;
  end: string;
  type: 'good' | 'bad' | 'neutral';
}

interface MuhurtaData {
  auspicious?: {
    brahmaMuhurta?: TimePeriod;
    abhijitMuhurta?: TimePeriod;
    others?: TimePeriod[];
  };
  inauspicious?: {
    rahuKaal?: TimePeriod;
    yamaghanda?: TimePeriod;
    gulikaKaal?: TimePeriod;
  };
  choghadiya?: {
    day?: ChoghadiyaPeriod[];
    night?: ChoghadiyaPeriod[];
  };
}

interface MuhurtaTimingsProps {
  panchangData?: MuhurtaData | null;
  lat?: number;
  lng?: number;
}

interface ApiTimePeriod {
  start?: string;
  end?: string;
  name?: string;
  nature?: string;
}

interface ApiPanchangMuhurtaPayload {
  muhurta?: {
    brahmaMuhurta?: ApiTimePeriod;
    abhijitMuhurta?: ApiTimePeriod;
    rahuKaal?: ApiTimePeriod;
    yamaghanda?: ApiTimePeriod;
    gulikaKaal?: ApiTimePeriod;
  };
  brahmaMuhurta?: ApiTimePeriod;
  abhijitMuhurta?: ApiTimePeriod;
  rahuKaal?: ApiTimePeriod;
  yamaghanda?: ApiTimePeriod;
  gulikaKaal?: ApiTimePeriod;
  choghadiya?: {
    day?: ApiTimePeriod[];
    night?: ApiTimePeriod[];
  };
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

function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr || timeStr === 'N/A') return null;
  try {
    const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(timeStr.trim());
    if (!match) return null;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  } catch {
    return null;
  }
}

function getTimingStatus(start?: string, end?: string): { isActive: boolean; label: string } {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMin = parseTimeToMinutes(start);
  const endMin = parseTimeToMinutes(end);

  if (startMin === null || endMin === null) {
    return { isActive: false, label: '' };
  }

  if (currentMinutes >= startMin && currentMinutes < endMin) {
    return { isActive: true, label: 'Active now' };
  }

  if (currentMinutes < startMin) {
    const diff = startMin - currentMinutes;
    if (diff <= 60) {
      return { isActive: false, label: `Starts in ${diff} min` };
    }
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return { isActive: false, label: `Starts in ${hours}h ${mins}m` };
  }

  return { isActive: false, label: 'Passed' };
}

function TimingRow({
  name,
  start,
  end,
  label,
  variant,
}: {
  name: string;
  start?: string;
  end?: string;
  label?: string;
  variant: 'auspicious' | 'inauspicious';
}) {
  const status = getTimingStatus(start, end);

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
        status.isActive
          ? variant === 'auspicious'
            ? 'bg-green-50 border border-green-200 shadow-sm'
            : 'bg-red-50 border border-red-200 shadow-sm'
          : 'bg-white/50 border border-gold-100/30'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            status.isActive
              ? variant === 'auspicious'
                ? 'bg-green-500 animate-pulse'
                : 'bg-red-500 animate-pulse'
              : variant === 'auspicious'
              ? 'bg-green-300'
              : 'bg-red-300'
          }`}
        />
        <div>
          <p className="font-display text-spiritual-maroon font-semibold text-sm">
            {name}
          </p>
          {label && (
            <p className="text-[11px] text-spiritual-warmGray">{label}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-spiritual-maroon">
          {formatTime12h(start)} - {formatTime12h(end)}
        </p>
        {status.label && (
          <p
            className={`text-[11px] font-medium ${
              status.isActive
                ? variant === 'auspicious'
                  ? 'text-green-600'
                  : 'text-red-600'
                : 'text-spiritual-warmGray/70'
            }`}
          >
            {status.isActive && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1 align-middle" />
            )}
            {status.label}
          </p>
        )}
      </div>
    </div>
  );
}

const CHOGHADIYA_COLORS: Record<string, string> = {
  good: 'bg-green-50 text-green-800 border-green-200',
  bad: 'bg-red-50 text-red-800 border-red-200',
  neutral: 'bg-yellow-50 text-yellow-800 border-yellow-200',
};

function toChoghadiyaType(nature?: string): 'good' | 'bad' | 'neutral' {
  if (!nature) return 'neutral';
  if (['shubh', 'amrit', 'labh'].includes(nature.toLowerCase())) return 'good';
  if (['rog', 'kaal', 'udveg'].includes(nature.toLowerCase())) return 'bad';
  return 'neutral';
}

function mapApiDataToMuhurta(apiData: unknown): MuhurtaData | null {
  if (!apiData) return null;

  const payload = apiData as ApiPanchangMuhurtaPayload;
  const source = payload.muhurta || payload;
  const day = Array.isArray(payload.choghadiya?.day)
    ? payload.choghadiya!.day!.map((period) => ({
        name: period.name,
        start: period.start,
        end: period.end,
        type: toChoghadiyaType(period.nature),
      }))
    : [];
  const night = Array.isArray(payload.choghadiya?.night)
    ? payload.choghadiya!.night!.map((period) => ({
        name: period.name,
        start: period.start,
        end: period.end,
        type: toChoghadiyaType(period.nature),
      }))
    : [];

  return {
    auspicious: {
      brahmaMuhurta: source.brahmaMuhurta
        ? { name: 'Brahma Muhurta', start: source.brahmaMuhurta.start, end: source.brahmaMuhurta.end }
        : undefined,
      abhijitMuhurta: source.abhijitMuhurta
        ? { name: 'Abhijit Muhurta', start: source.abhijitMuhurta.start, end: source.abhijitMuhurta.end }
        : undefined,
    },
    inauspicious: {
      rahuKaal: source.rahuKaal ? { name: 'Rahu Kaal', start: source.rahuKaal.start, end: source.rahuKaal.end } : undefined,
      yamaghanda: source.yamaghanda ? { name: 'Yamaghanda', start: source.yamaghanda.start, end: source.yamaghanda.end } : undefined,
      gulikaKaal: source.gulikaKaal ? { name: 'Gulika Kaal', start: source.gulikaKaal.start, end: source.gulikaKaal.end } : undefined,
    },
    choghadiya: { day, night },
  };
}

export default function MuhurtaTimings({ panchangData, lat, lng }: MuhurtaTimingsProps) {
  const [, setTick] = useState(0);
  const [fetchedData, setFetchedData] = useState<MuhurtaData | null>(null);

  // Re-render every minute for real-time "Active now" updates
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (panchangData || !lat || !lng) return;

    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/panchang/today?lat=${lat}&lng=${lng}`);
        if (!mounted) return;
        const payload = res.data?.data || res.data;
        setFetchedData(mapApiDataToMuhurta(payload));
      } catch {
        if (!mounted) return;
        setFetchedData(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [panchangData, lat, lng]);

  const muhurta = panchangData || fetchedData;

  const hasAuspicious = useMemo(
    () =>
      muhurta?.auspicious?.brahmaMuhurta ||
      muhurta?.auspicious?.abhijitMuhurta ||
      (muhurta?.auspicious?.others && muhurta.auspicious.others.length > 0),
    [muhurta]
  );

  const hasInauspicious = useMemo(
    () =>
      muhurta?.inauspicious?.rahuKaal ||
      muhurta?.inauspicious?.yamaghanda ||
      muhurta?.inauspicious?.gulikaKaal,
    [muhurta]
  );

  const hasChoghadiya = useMemo(
    () =>
      (muhurta?.choghadiya?.day && muhurta.choghadiya.day.length > 0) ||
      (muhurta?.choghadiya?.night && muhurta.choghadiya.night.length > 0),
    [muhurta]
  );

  if (!muhurta || (!hasAuspicious && !hasInauspicious && !hasChoghadiya)) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="rounded-2xl overflow-hidden shadow-card-ornate"
      style={{
        background: 'linear-gradient(180deg, #FFFDF5, #FFF8E7)',
        border: '1px solid rgba(212, 160, 23, 0.2)',
      }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gold-100/50">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-spiritual-saffron" />
          <h3 className="font-display text-xl text-spiritual-maroon font-semibold">
            मुहूर्त (Muhurta Timings)
          </h3>
        </div>
        <p className="text-xs text-spiritual-warmGray mt-0.5 font-body">
          Auspicious and inauspicious periods for today
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Auspicious Timings */}
        {hasAuspicious && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <h4 className="font-display text-spiritual-maroon font-semibold text-sm uppercase tracking-wider">
                Auspicious (शुभ मुहूर्त)
              </h4>
            </div>
            <div className="space-y-2">
              {muhurta.auspicious?.brahmaMuhurta && (
                <TimingRow
                  name="Brahma Muhurta"
                  start={muhurta.auspicious.brahmaMuhurta.start}
                  end={muhurta.auspicious.brahmaMuhurta.end}
                  label="Best for meditation & prayer"
                  variant="auspicious"
                />
              )}
              {muhurta.auspicious?.abhijitMuhurta && (
                <TimingRow
                  name="Abhijit Muhurta"
                  start={muhurta.auspicious.abhijitMuhurta.start}
                  end={muhurta.auspicious.abhijitMuhurta.end}
                  label="Best for important decisions"
                  variant="auspicious"
                />
              )}
              {muhurta.auspicious?.others?.map((period, i) => (
                <TimingRow
                  key={i}
                  name={period.name}
                  start={period.start}
                  end={period.end}
                  label={period.label}
                  variant="auspicious"
                />
              ))}
            </div>
          </div>
        )}

        {/* Inauspicious Timings */}
        {hasInauspicious && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h4 className="font-display text-spiritual-maroon font-semibold text-sm uppercase tracking-wider">
                Inauspicious (अशुभ काल)
              </h4>
            </div>
            <div className="space-y-2">
              {muhurta.inauspicious?.rahuKaal && (
                <TimingRow
                  name="Rahu Kaal (राहु काल)"
                  start={muhurta.inauspicious.rahuKaal.start}
                  end={muhurta.inauspicious.rahuKaal.end}
                  label="Avoid new beginnings"
                  variant="inauspicious"
                />
              )}
              {muhurta.inauspicious?.yamaghanda && (
                <TimingRow
                  name="Yamaghanda (यमघण्ट)"
                  start={muhurta.inauspicious.yamaghanda.start}
                  end={muhurta.inauspicious.yamaghanda.end}
                  label="Avoid important activities"
                  variant="inauspicious"
                />
              )}
              {muhurta.inauspicious?.gulikaKaal && (
                <TimingRow
                  name="Gulika Kaal (गुलिक काल)"
                  start={muhurta.inauspicious.gulikaKaal.start}
                  end={muhurta.inauspicious.gulikaKaal.end}
                  label="Avoid auspicious work"
                  variant="inauspicious"
                />
              )}
            </div>
          </div>
        )}

        {/* Choghadiya */}
        {hasChoghadiya && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Timer className="w-4 h-4 text-gold-400" />
              <h4 className="font-display text-spiritual-maroon font-semibold text-sm uppercase tracking-wider">
                Choghadiya (चौघड़िया)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Day Choghadiya */}
              {muhurta.choghadiya?.day && muhurta.choghadiya.day.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-spiritual-warmGray mb-2 uppercase tracking-wider">
                    Day (दिन)
                  </p>
                  <div className="space-y-1.5">
                    {muhurta.choghadiya.day.map((period, i) => {
                      const status = getTimingStatus(period.start, period.end);
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs border ${
                            CHOGHADIYA_COLORS[period.type] || CHOGHADIYA_COLORS.neutral
                          } ${status.isActive ? 'ring-1 ring-current shadow-sm' : ''}`}
                        >
                          <span className="font-semibold">{period.name}</span>
                          <span>
                            {formatTime12h(period.start)} - {formatTime12h(period.end)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Night Choghadiya */}
              {muhurta.choghadiya?.night && muhurta.choghadiya.night.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-spiritual-warmGray mb-2 uppercase tracking-wider">
                    Night (रात)
                  </p>
                  <div className="space-y-1.5">
                    {muhurta.choghadiya.night.map((period, i) => {
                      const status = getTimingStatus(period.start, period.end);
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs border ${
                            CHOGHADIYA_COLORS[period.type] || CHOGHADIYA_COLORS.neutral
                          } ${status.isActive ? 'ring-1 ring-current shadow-sm' : ''}`}
                        >
                          <span className="font-semibold">{period.name}</span>
                          <span>
                            {formatTime12h(period.start)} - {formatTime12h(period.end)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
