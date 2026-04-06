'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Sparkles, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';

interface Festival {
  name: string;
  date: string;
  type?: string;
  description?: string;
}

const TYPE_BADGES: Record<string, { bg: string; text: string }> = {
  major: { bg: 'bg-spiritual-saffron/10', text: 'text-spiritual-saffron' },
  ekadashi: { bg: 'bg-gold-100', text: 'text-gold-600' },
  vrat: { bg: 'bg-green-50', text: 'text-green-700' },
  regional: { bg: 'bg-blue-50', text: 'text-blue-700' },
};

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatFestivalDate(dateStr: string, locale: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      weekday: 'short',
    });
  } catch {
    return dateStr;
  }
}

function SkeletonList() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 bg-gold-100/50 rounded-lg" />
          <div className="flex-1">
            <div className="h-4 bg-gold-100/50 rounded w-3/4 mb-1.5" />
            <div className="h-3 bg-gold-100/30 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FestivalList() {
  const { t, i18n } = useTranslation('panchang');
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        const res = await api.get('/panchang/festivals?upcoming=true&limit=10');
        const data = res.data?.data || res.data || [];
        setFestivals(Array.isArray(data) ? data : []);
      } catch {
        setFestivals([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFestivals();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="rounded-2xl overflow-hidden shadow-card-ornate h-fit"
      style={{
        background: 'linear-gradient(180deg, #FFFDF5, #FFF8E7)',
        border: '1px solid rgba(212, 160, 23, 0.2)',
      }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gold-100/50">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-spiritual-saffron" />
          <h3 className="font-display text-lg text-spiritual-maroon font-semibold">
            {t('upcomingFestivals')}
          </h3>
        </div>
      </div>

      <div className="p-3">
        {isLoading ? (
          <SkeletonList />
        ) : festivals.length === 0 ? (
          <div className="text-center py-8 text-spiritual-warmGray text-sm">
            <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>{t('noUpcomingFestivals')}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {festivals.map((festival, index) => {
              const days = daysUntil(festival.date);
              const isEkadashi =
                festival.type === 'ekadashi' ||
                festival.name.toLowerCase().includes('ekadashi');
              const isExpanded = expandedIndex === index;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isEkadashi
                        ? 'bg-gradient-to-r from-gold-50 to-gold-100/50 border border-gold-200/50 hover:border-gold-300'
                        : 'hover:bg-white/60 border border-transparent hover:border-gold-100/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Date badge */}
                      <div
                        className={`flex-shrink-0 w-11 h-11 rounded-lg flex flex-col items-center justify-center text-center ${
                          isEkadashi
                            ? 'bg-gradient-to-br from-gold-300 to-gold-400 text-white'
                            : days === 0
                            ? 'bg-spiritual-saffron text-white'
                            : 'bg-white/80 text-spiritual-maroon border border-gold-100/50'
                        }`}
                      >
                        {days === 0 ? (
                          <span className="text-[10px] font-bold">{t('today').toUpperCase()}</span>
                        ) : (
                          <>
                            <span className="text-sm font-bold leading-none">{days}</span>
                            <span className="text-[9px] leading-none opacity-70">
                              {days === 1 ? t('daySingular') : t('dayPlural')}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {isEkadashi && (
                            <Sparkles className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
                          )}
                          <p className="font-display text-spiritual-maroon font-semibold text-sm truncate">
                            {festival.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-spiritual-warmGray">
                            {formatFestivalDate(festival.date, i18n.language === 'en' ? 'en-IN' : `${i18n.language}-IN`)}
                          </span>
                          {festival.type && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                TYPE_BADGES[festival.type]?.bg || 'bg-gray-50'
                              } ${TYPE_BADGES[festival.type]?.text || 'text-gray-600'}`}
                            >
                              {festival.type}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expand arrow */}
                      {festival.description && (
                        <ChevronRight
                          className={`w-4 h-4 text-spiritual-warmGray/50 transition-transform duration-200 flex-shrink-0 ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      )}
                    </div>

                    {/* Expanded description */}
                    <AnimatePresence>
                      {isExpanded && festival.description && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs text-spiritual-warmGray leading-relaxed mt-2 pl-14 pr-2">
                            {festival.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
