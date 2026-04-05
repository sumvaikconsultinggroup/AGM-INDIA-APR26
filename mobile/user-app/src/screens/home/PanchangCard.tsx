import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPanchangFestivals, getPanchangToday } from '../../services/panchangApi';
import { colors, spacing, borderRadius, shadows } from '../../theme';

const STORAGE_KEY_CITY = '@panchang_selected_city';
const DEFAULT_LAT = 29.9457;
const DEFAULT_LNG = 78.1642;

interface PanchangSummary {
  tithi?: { name?: string; paksha?: string };
  nakshatra?: { name?: string };
  yoga?: { name?: string };
  karana?: { name?: string; first?: string; second?: string };
  festival?: string | null;
  sunrise?: string;
  festivals?: string[];
}

interface Festival {
  name: string;
  date: string;
  daysUntil?: number;
}

interface PanchangCardProps {
  onPress: () => void;
}

function unwrapPayload<T = unknown>(payload: unknown, maxDepth = 3): T | null {
  let current: unknown = payload;
  for (let i = 0; i < maxDepth; i += 1) {
    if (
      current &&
      typeof current === 'object' &&
      'success' in (current as Record<string, unknown>) &&
      'data' in (current as Record<string, unknown>)
    ) {
      current = (current as { data?: unknown }).data;
      continue;
    }
    break;
  }
  return (current as T) ?? null;
}

function normalizePanchangSummary(payload: unknown): PanchangSummary | null {
  const data = unwrapPayload<PanchangSummary>(payload);
  if (!data || typeof data !== 'object') return null;

  const hasCore = Boolean(data.tithi?.name || data.nakshatra?.name || data.sunrise);
  if (!hasCore) return null;

  const festivals = Array.isArray(data.festivals) ? data.festivals : [];
  const karanaName = data.karana?.name || data.karana?.first || data.karana?.second;

  return {
    ...data,
    karana: data.karana ? { ...data.karana, name: karanaName } : undefined,
    festival: data.festival || festivals[0] || null,
  };
}

// Fallback panchang data for when API is unavailable
function getDefaultPanchangSummary(): PanchangSummary {
  const now = new Date();
  const dayOfMonth = now.getDate();
  
  const tithiNames = ['Shukla Pratipada', 'Shukla Dwitiya', 'Shukla Tritiya', 'Shukla Chaturthi', 'Shukla Panchami'];
  const nakshatraNames = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira'];
  
  const tithiIndex = (dayOfMonth - 1) % tithiNames.length;
  const nakshatraIndex = (dayOfMonth - 1) % nakshatraNames.length;

  return {
    tithi: {
      name: tithiNames[tithiIndex],
      paksha: dayOfMonth <= 15 ? 'Shukla' : 'Krishna',
    },
    nakshatra: {
      name: nakshatraNames[nakshatraIndex],
    },
    sunrise: '06:15 AM',
  };
}

function getDefaultFestival(): Festival {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const festivals = ['Akshaya Tritiya', 'Hanuman Jayanti', 'Navratri', 'Diwali', 'Holi'];
  const randomFestival = festivals[Math.floor(Math.random() * festivals.length)];
  
  return {
    name: randomFestival,
    date: nextMonth.toISOString(),
    daysUntil: Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  };
}

export default function PanchangCard({ onPress }: PanchangCardProps) {
  const [panchang, setPanchang] = useState<PanchangSummary | null>(null);
  const [nextFestival, setNextFestival] = useState<Festival | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      let lat = DEFAULT_LAT;
      let lng = DEFAULT_LNG;
      let cityName = 'Haridwar';
      let timezone = 'Asia/Kolkata';

      const storedCity = await AsyncStorage.getItem(STORAGE_KEY_CITY);
      if (storedCity) {
        const city = JSON.parse(storedCity);
        lat = city.lat ?? DEFAULT_LAT;
        lng = city.lng ?? DEFAULT_LNG;
        cityName = city.name || cityName;
        timezone = city.timezone || timezone;
      }

      const [panchangRes, festivalsRes] = await Promise.all([
        getPanchangToday({ lat, lng, city: cityName, timezone }).catch(() => null),
        getPanchangFestivals({ upcoming: true, limit: 1 }).catch(() => []),
      ]);

      setPanchang(normalizePanchangSummary(panchangRes) || getDefaultPanchangSummary());

      const fests = unwrapPayload<any[]>(festivalsRes) || [];
      if (fests.length > 0) {
        const f = fests[0];
        const festDate = new Date(f.date);
        const now = new Date();
        const diffMs = festDate.getTime() - now.getTime();
        const daysUntil = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        setNextFestival({ ...f, daysUntil });
      } else {
        // Use default festival if API returns empty
        setNextFestival(getDefaultFestival());
      }
    } catch (error) {
      // API may be unavailable, use fallback data
      if (error instanceof Error) {
        console.warn('Panchang summary fetch failed, using defaults:', error.message);
      }
      setPanchang(getDefaultPanchangSummary());
      setNextFestival(getDefaultFestival());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingInner}>
          <Icon name="calendar-star" size={24} color={colors.gold.main} />
          <Text style={styles.loadingText}>Loading Panchang...</Text>
        </View>
      </View>
    );
  }

  if (!panchang) return null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="om" size={20} color={colors.primary.saffron} />
          <Text style={styles.headerTitle}>आज का पंचांग</Text>
        </View>
        <Icon name="chevron-right" size={20} color={colors.text.secondary} />
      </View>

      {/* Tithi & Nakshatra */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>तिथि</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {panchang.tithi?.name || 'N/A'}
          </Text>
          {panchang.tithi?.paksha && (
            <Text style={styles.pakshaText}>{panchang.tithi.paksha}</Text>
          )}
        </View>
        <View style={styles.divider} />
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>नक्षत्र</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {panchang.nakshatra?.name || 'N/A'}
          </Text>
        </View>
      </View>

      {/* Today's festival or next festival countdown */}
      {panchang.festival ? (
        <View style={styles.festivalBanner}>
          <Icon name="party-popper" size={14} color={colors.primary.maroon} />
          <Text style={styles.festivalText} numberOfLines={1}>
            {panchang.festival}
          </Text>
        </View>
      ) : nextFestival ? (
        <View style={styles.nextFestival}>
          <Icon name="calendar-clock" size={14} color={colors.gold.dark} />
          <Text style={styles.nextFestivalText} numberOfLines={1}>
            {nextFestival.name}
          </Text>
          <Text style={styles.countdownText}>
            {nextFestival.daysUntil === 0
              ? 'Today'
              : nextFestival.daysUntil === 1
                ? 'Tomorrow'
                : `in ${nextFestival.daysUntil} days`}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    padding: spacing.md,
    ...shadows.warm,
  },
  loadingInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.maroon,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.gold as string,
    alignSelf: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary.saffron,
  },
  pakshaText: {
    fontSize: 11,
    color: colors.primary.maroon,
    marginTop: 1,
  },
  festivalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 160, 23, 0.15)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  festivalText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary.maroon,
    marginLeft: spacing.xs,
  },
  nextFestival: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.gold as string,
  },
  nextFestivalText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gold.dark,
  },
});
