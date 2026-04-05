import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { getPanchangFestivals, getPanchangToday } from '../../services/panchangApi';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import CityPickerModal, { City } from './CityPickerModal';

const STORAGE_KEY_CITY = '@panchang_selected_city';
const STORAGE_KEY_LAST_PANCHANG = '@panchang_last_data';
const DEFAULT_CITY: City = {
  _id: 'default',
  name: 'Haridwar',
  state: 'Uttarakhand',
  country: 'India',
  lat: 29.9457,
  lng: 78.1642,
  timezone: 'Asia/Kolkata',
};

interface PanchangData {
  tithi?: {
    name?: string;
    paksha?: string;
    number?: number;
    startTime?: string;
    endTime?: string;
  };
  nakshatra?: {
    name?: string;
    deity?: string;
  };
  yoga?: {
    name?: string;
  };
  karana?: {
    name?: string;
    first?: string;
    second?: string;
  };
  hinduMonth?: string;
  vikramSamvat?: number | string;
  sunrise?: string;
  sunset?: string;
  moonrise?: string;
  moonset?: string;
  festival?: string | null;
  festivals?: string[];
  brahmaMuhurta?: { start?: string; end?: string };
  abhijitMuhurta?: { start?: string; end?: string };
  rahuKaal?: { start?: string; end?: string };
  yamaghanda?: { start?: string; end?: string };
  gulikaKaal?: { start?: string; end?: string };
  muhurta?: {
    brahmaMuhurta?: { start?: string; end?: string };
    abhijitMuhurta?: { start?: string; end?: string };
    rahuKaal?: { start?: string; end?: string };
    yamaghanda?: { start?: string; end?: string };
    gulikaKaal?: { start?: string; end?: string };
  };
}

interface Festival {
  _id?: string;
  name: string;
  date: string;
  daysUntil?: number;
  description?: string;
}

interface ApiPanchangPayload extends Partial<PanchangData> {
  festivals?: string[];
}

// Fallback panchang data for when API is unavailable
function getDefaultPanchangData(): PanchangData {
  const now = new Date();
  // Cycle through some common tithi names for demo
  const tithiNames = ['Shukla Pratipada', 'Shukla Dwitiya', 'Shukla Tritiya', 'Shukla Chaturthi', 'Shukla Panchami'];
  const nakshatraNames = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira'];
  const yogaNames = ['Auspicious', 'Good', 'Perfect', 'Favorable', 'Prosperous'];
  const karanaNames = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara'];
  
  const dayOfMonth = now.getDate();
  const tithiIndex = (dayOfMonth - 1) % tithiNames.length;
  const nakshatraIndex = (dayOfMonth - 1) % nakshatraNames.length;
  const yogaIndex = (dayOfMonth - 1) % yogaNames.length;
  const karanaIndex = (dayOfMonth - 1) % karanaNames.length;

  return {
    tithi: {
      name: tithiNames[tithiIndex],
      paksha: dayOfMonth <= 15 ? 'Shukla' : 'Krishna',
      number: ((dayOfMonth - 1) % 15) + 1,
    },
    nakshatra: {
      name: nakshatraNames[nakshatraIndex],
    },
    yoga: {
      name: yogaNames[yogaIndex],
    },
    karana: {
      name: karanaNames[karanaIndex],
    },
    sunrise: '06:15 AM',
    sunset: '06:45 PM',
    moonrise: '02:30 AM',
    moonset: '03:15 PM',
    hinduMonth: 'Chaitra',
    vikramSamvat: 2083,
    muhurta: {
      brahmaMuhurta: { start: '04:45 AM', end: '05:30 AM' },
      abhijitMuhurta: { start: '12:00 PM', end: '12:48 PM' },
      rahuKaal: { start: '04:45 PM', end: '06:00 PM' },
      yamaghanda: { start: '03:30 PM', end: '04:45 PM' },
      gulikaKaal: { start: '02:15 PM', end: '03:30 PM' },
    },
  };
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

function hasMeaningfulPanchangData(payload: Partial<PanchangData>): boolean {
  return Boolean(
    payload.tithi?.name ||
    payload.nakshatra?.name ||
    payload.yoga?.name ||
    payload.karana?.name ||
    payload.sunrise
  );
}

function normalizePanchang(payload: unknown): PanchangData | null {
  const data = unwrapPayload<ApiPanchangPayload>(payload);
  if (!data || typeof data !== 'object' || !hasMeaningfulPanchangData(data)) {
    return null;
  }

  const festivals = Array.isArray(data.festivals) ? data.festivals : [];
  const muhurta = data.muhurta || {
    brahmaMuhurta: data.brahmaMuhurta,
    abhijitMuhurta: data.abhijitMuhurta,
    rahuKaal: data.rahuKaal,
    yamaghanda: data.yamaghanda,
    gulikaKaal: data.gulikaKaal,
  };

  return {
    ...data,
    karana: data.karana
      ? {
          ...data.karana,
          name: data.karana.name || data.karana.first || data.karana.second,
        }
      : undefined,
    festivals,
    festival: data.festival || festivals[0] || null,
    muhurta,
  };
}

async function loadCachedPanchang(): Promise<PanchangData | null> {
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEY_LAST_PANCHANG);
    if (!cached) return null;
    return normalizePanchang(JSON.parse(cached));
  } catch {
    return null;
  }
}

async function saveCachedPanchang(data: PanchangData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_LAST_PANCHANG, JSON.stringify(data));
  } catch {
    // Non-blocking
  }
}

export default function PanchangScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [selectedCity, setSelectedCity] = useState<City>(DEFAULT_CITY);
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Load saved city on mount
  useEffect(() => {
    loadSavedCity();
  }, []);

  // Fetch panchang when city changes
  useEffect(() => {
    fetchPanchangData();
  }, [selectedCity]);

  const loadSavedCity = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_CITY);
      if (stored) {
        const city = JSON.parse(stored) as City;
        setSelectedCity(city);
      }
    } catch {
      // Use default
    }
  };

  const saveCity = async (city: City) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CITY, JSON.stringify(city));
    } catch {
      // Ignore storage errors
    }
  };

  const fetchPanchangData = async () => {
    if (!refreshing) setLoading(true);
    setFetchError(null);
    try {
      const [panchangRes, festivalsRes] = await Promise.all([
        getPanchangToday({
          lat: selectedCity.lat,
          lng: selectedCity.lng,
          city: selectedCity.name,
          timezone: selectedCity.timezone,
        }),
        getPanchangFestivals({ upcoming: true, limit: 5 }),
      ]);

      const normalized = normalizePanchang(panchangRes as ApiPanchangPayload);
      if (normalized) {
        setPanchang(normalized);
        await saveCachedPanchang(normalized);
      } else {
        const cached = await loadCachedPanchang();
        setPanchang(cached || getDefaultPanchangData());
        setFetchError(t('common.somethingWentWrong'));
      }

      const rawFestivalData = unwrapPayload<any[]>(festivalsRes) || [];
      const festivalData = Array.isArray(rawFestivalData) ? rawFestivalData : [];
      const enriched: Festival[] = festivalData.map((f: any) => {
        const festDate = new Date(f.date);
        const now = new Date();
        const diffMs = festDate.getTime() - now.getTime();
        const daysUntil = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        return { ...f, daysUntil };
      });
      setFestivals(enriched);
    } catch (error) {
      const cached = await loadCachedPanchang();
      setPanchang(cached || getDefaultPanchangData());
      setFetchError(t('common.somethingWentWrong'));
      if (error instanceof Error) {
        console.warn('Panchang data fetch failed:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPanchangData();
    setRefreshing(false);
  }, [selectedCity]);

  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    saveCity(city);
  };

  const handleGPSLocation = (lat: number, lng: number) => {
    const gpsCity: City = {
      _id: 'gps',
      name: 'Current Location',
      country: '',
      lat,
      lng,
    };
    setSelectedCity(gpsCity);
    saveCity(gpsCity);
  };

  const formatTime = (time?: string) => {
    if (!time) return '--:--';
    return time;
  };

  const isEkadashi = (panchang?.tithi?.number === 11 || panchang?.tithi?.number === 26);
  const primaryFestival = panchang?.festival || panchang?.festivals?.[0];

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary.saffron} />
        <Text style={styles.loadingText}>Loading Panchang...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* City Selector Bar */}
      <View style={styles.cityBar}>
        <TouchableOpacity
          style={styles.citySelector}
          onPress={() => setCityPickerVisible(true)}
          activeOpacity={0.7}
        >
          <Icon name="map-marker" size={18} color={colors.primary.saffron} />
          <Text style={styles.cityName} numberOfLines={1}>
            {selectedCity.name}
          </Text>
          <Icon name="chevron-down" size={18} color={colors.text.secondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.gpsButton}
          onPress={() => {
            setCityPickerVisible(true);
          }}
          activeOpacity={0.7}
        >
          <Icon name="crosshairs-gps" size={20} color={colors.primary.saffron} />
        </TouchableOpacity>
      </View>

      {!!fetchError && (
        <TouchableOpacity style={styles.errorBanner} onPress={onRefresh} activeOpacity={0.8}>
          <Icon name="alert-circle-outline" size={16} color={colors.primary.vermillion} />
          <Text style={styles.errorText}>{fetchError} - {t('common.retry')}</Text>
        </TouchableOpacity>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.saffron]}
            tintColor={colors.primary.saffron}
          />
        }
      >
        {/* Today's Panchang Hero Card */}
        <View style={[styles.heroCard, isEkadashi && styles.ekadashiCard]}>
          {isEkadashi && (
            <LinearGradient
              colors={['rgba(212,160,23,0.15)', 'rgba(212,160,23,0.05)']}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          )}
          <Text style={styles.heroLabel}>आज का पंचांग</Text>
          <Text style={styles.heroSubLabel}>Today's Panchang</Text>

          {/* Tithi */}
          <View style={styles.tithiRow}>
            <View style={styles.tithiMain}>
              <Text style={styles.tithiLabel}>तिथि</Text>
              <Text style={styles.tithiName}>{panchang?.tithi?.name || 'N/A'}</Text>
            </View>
            {panchang?.tithi?.paksha && (
              <View
                style={[
                  styles.pakshaBadge,
                  panchang.tithi.paksha.toLowerCase().includes('शुक्ल') ||
                  panchang.tithi.paksha.toLowerCase().includes('shukla')
                    ? styles.shukla
                    : styles.krishna,
                ]}
              >
                <Text style={styles.pakshaText}>
                  {panchang.tithi.paksha}
                </Text>
              </View>
            )}
          </View>

          {isEkadashi && (
            <View style={styles.ekadashiBanner}>
              <Icon name="star-four-points" size={14} color={colors.gold.dark} />
              <Text style={styles.ekadashiText}>Ekadashi - Fasting Day</Text>
              <Icon name="star-four-points" size={14} color={colors.gold.dark} />
            </View>
          )}

          {/* Nakshatra */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>नक्षत्र</Text>
            <Text style={styles.infoValue}>
              {panchang?.nakshatra?.name || 'N/A'}
              {panchang?.nakshatra?.deity ? ` (${panchang.nakshatra.deity})` : ''}
            </Text>
          </View>

          {/* Yoga & Karana Grid */}
          <View style={styles.gridRow}>
            <View style={styles.gridCell}>
              <Text style={styles.gridLabel}>योग</Text>
              <Text style={styles.gridLabelEn}>Yoga</Text>
              <Text style={styles.gridValue}>{panchang?.yoga?.name || 'N/A'}</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.gridCell}>
              <Text style={styles.gridLabel}>करण</Text>
              <Text style={styles.gridLabelEn}>Karana</Text>
              <Text style={styles.gridValue}>{panchang?.karana?.name || 'N/A'}</Text>
            </View>
          </View>

          {/* Hindu Month & Samvat */}
          <View style={styles.samvatRow}>
            {panchang?.hinduMonth && (
              <Text style={styles.samvatText}>
                {panchang.hinduMonth}
              </Text>
            )}
            {panchang?.vikramSamvat && (
              <Text style={styles.samvatText}>
                Vikram Samvat {panchang.vikramSamvat}
              </Text>
            )}
          </View>
        </View>

        {/* Sun/Moon Times */}
        <View style={styles.timesRow}>
          <TimeBox icon="weather-sunset-up" label="Sunrise" time={formatTime(panchang?.sunrise)} />
          <TimeBox icon="weather-sunset-down" label="Sunset" time={formatTime(panchang?.sunset)} />
          <TimeBox icon="moon-waxing-crescent" label="Moonrise" time={formatTime(panchang?.moonrise)} />
          <TimeBox icon="moon-waning-crescent" label="Moonset" time={formatTime(panchang?.moonset)} />
        </View>

        {/* Festival Banner */}
        {primaryFestival && (
          <View style={styles.festivalBanner}>
            <LinearGradient
              colors={[colors.gold.light, colors.gold.main]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.festivalGradient}
            >
              <Icon name="party-popper" size={22} color={colors.primary.maroon} />
              <Text style={styles.festivalText}>{primaryFestival}</Text>
              <Icon name="party-popper" size={22} color={colors.primary.maroon} />
            </LinearGradient>
          </View>
        )}

        {/* Muhurta Timings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>मुहूर्त Timings</Text>

          {/* Auspicious */}
          <Text style={styles.muhurtaGroupLabel}>
            <Icon name="check-circle" size={14} color="#2E7D32" /> Auspicious (शुभ)
          </Text>
          <MuhurtaRow
            label="ब्रह्म मुहूर्त"
            labelEn="Brahma Muhurta"
            start={panchang?.muhurta?.brahmaMuhurta?.start}
            end={panchang?.muhurta?.brahmaMuhurta?.end}
            variant="auspicious"
            note="Best for meditation"
          />
          <MuhurtaRow
            label="अभिजित मुहूर्त"
            labelEn="Abhijit Muhurta"
            start={panchang?.muhurta?.abhijitMuhurta?.start}
            end={panchang?.muhurta?.abhijitMuhurta?.end}
            variant="auspicious"
          />

          {/* Inauspicious */}
          <Text style={[styles.muhurtaGroupLabel, { marginTop: spacing.md }]}>
            <Icon name="alert-circle" size={14} color="#C62828" /> Inauspicious (अशुभ)
          </Text>
          <MuhurtaRow
            label="राहु काल"
            labelEn="Rahu Kaal"
            start={panchang?.muhurta?.rahuKaal?.start}
            end={panchang?.muhurta?.rahuKaal?.end}
            variant="inauspicious"
          />
          <MuhurtaRow
            label="यमघण्ड"
            labelEn="Yamaghanda"
            start={panchang?.muhurta?.yamaghanda?.start}
            end={panchang?.muhurta?.yamaghanda?.end}
            variant="inauspicious"
          />
          <MuhurtaRow
            label="गुलिक काल"
            labelEn="Gulika Kaal"
            start={panchang?.muhurta?.gulikaKaal?.start}
            end={panchang?.muhurta?.gulikaKaal?.end}
            variant="inauspicious"
          />
        </View>

        {/* Upcoming Festivals */}
        {festivals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Festivals</Text>
            {festivals.map((fest, idx) => (
              <View key={fest._id || idx} style={styles.festivalRow}>
                <View style={styles.festivalDot} />
                <View style={styles.festivalInfo}>
                  <Text style={styles.festivalName}>{fest.name}</Text>
                  <Text style={styles.festivalDate}>
                    {new Date(fest.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.daysUntilBadge}>
                  <Text style={styles.daysUntilText}>
                    {fest.daysUntil === 0
                      ? 'Today'
                      : fest.daysUntil === 1
                        ? 'Tomorrow'
                        : `${fest.daysUntil} days`}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* View Full Calendar */}
        <TouchableOpacity
          style={styles.calendarButton}
          onPress={() => navigation.navigate('PanchangCalendar', {
            lat: selectedCity.lat,
            lng: selectedCity.lng,
            cityName: selectedCity.name,
            timezone: selectedCity.timezone,
          })}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[colors.primary.saffron, colors.primary.maroon]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.calendarButtonGradient}
          >
            <Icon name="calendar-month" size={20} color={colors.text.white} />
            <Text style={styles.calendarButtonText}>View Full Calendar</Text>
            <Icon name="arrow-right" size={18} color={colors.text.white} />
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* City Picker Modal */}
      <CityPickerModal
        visible={cityPickerVisible}
        onClose={() => setCityPickerVisible(false)}
        onSelectCity={handleSelectCity}
        onUseGPS={handleGPSLocation}
      />
    </View>
  );
}

/* Sub-components */

function TimeBox({
  icon,
  label,
  time,
}: {
  icon: React.ComponentProps<typeof Icon>['name'];
  label: string;
  time: string;
}) {
  return (
    <View style={styles.timeBox}>
      <Icon name={icon} size={20} color={colors.gold.dark} />
      <Text style={styles.timeLabel}>{label}</Text>
      <Text style={styles.timeValue}>{time}</Text>
    </View>
  );
}

function MuhurtaRow({
  label,
  labelEn,
  start,
  end,
  variant,
  note,
}: {
  label: string;
  labelEn: string;
  start?: string;
  end?: string;
  variant: 'auspicious' | 'inauspicious';
  note?: string;
}) {
  const isAuspicious = variant === 'auspicious';
  return (
    <View
      style={[
        styles.muhurtaRow,
        isAuspicious ? styles.muhurtaAuspicious : styles.muhurtaInauspicious,
      ]}
    >
      <View style={styles.muhurtaInfo}>
        <Text style={styles.muhurtaLabel}>{label}</Text>
        <Text style={styles.muhurtaLabelEn}>{labelEn}</Text>
        {note && (
          <View style={styles.muhurtaNote}>
            <Icon name="meditation" size={12} color="#2E7D32" />
            <Text style={styles.muhurtaNoteText}>{note}</Text>
          </View>
        )}
      </View>
      <Text
        style={[
          styles.muhurtaTime,
          isAuspicious ? styles.muhurtaTimeGreen : styles.muhurtaTimeRed,
        ]}
      >
        {start && end ? `${start} - ${end}` : '--:-- - --:--'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.parchment,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.parchment,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.text.secondary,
  },

  // City Bar
  cityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.gold as string,
  },
  citySelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  cityName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginHorizontal: spacing.sm,
  },
  gpsButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.parchment,
    marginLeft: spacing.xs,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(227, 66, 52, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(227, 66, 52, 0.25)',
    gap: spacing.xs,
  },
  errorText: {
    color: colors.primary.vermillion,
    fontSize: 13,
    fontWeight: '600',
  },

  // Hero Card
  heroCard: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    overflow: 'hidden',
    ...shadows.warm,
  },
  ekadashiCard: {
    borderColor: colors.gold.main,
    borderWidth: 2,
  },
  heroLabel: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary.maroon,
    textAlign: 'center',
  },
  heroSubLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  // Tithi
  tithiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  tithiMain: {
    alignItems: 'center',
  },
  tithiLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  tithiName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary.saffron,
  },
  pakshaBadge: {
    marginLeft: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  shukla: {
    backgroundColor: 'rgba(255, 213, 79, 0.3)',
  },
  krishna: {
    backgroundColor: 'rgba(128, 0, 32, 0.15)',
  },
  pakshaText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary.maroon,
  },

  // Ekadashi
  ekadashiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,160,23,0.15)',
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  ekadashiText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gold.dark,
    marginHorizontal: spacing.sm,
  },

  // Info rows
  infoRow: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
  },

  // Grid
  gridRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border.gold as string,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  gridCell: {
    flex: 1,
    alignItems: 'center',
  },
  gridDivider: {
    width: 1,
    backgroundColor: colors.border.gold as string,
  },
  gridLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.maroon,
  },
  gridLabelEn: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },

  // Samvat
  samvatRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.gold as string,
    gap: spacing.lg,
  },
  samvatText: {
    fontSize: 13,
    color: colors.gold.dark,
    fontWeight: '500',
  },

  // Times
  timesRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  timeBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background.warmWhite,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
  },
  timeLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  timeValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 2,
  },

  // Festival Banner
  festivalBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.warm,
  },
  festivalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  festivalText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.maroon,
    marginHorizontal: spacing.sm,
    textAlign: 'center',
  },

  // Sections
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary.maroon,
    marginBottom: spacing.md,
  },

  // Muhurta
  muhurtaGroupLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  muhurtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  muhurtaAuspicious: {
    backgroundColor: 'rgba(46, 125, 50, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#2E7D32',
  },
  muhurtaInauspicious: {
    backgroundColor: 'rgba(198, 40, 40, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#C62828',
  },
  muhurtaInfo: {
    flex: 1,
  },
  muhurtaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  muhurtaLabelEn: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  muhurtaNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  muhurtaNoteText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '500',
    marginLeft: 4,
  },
  muhurtaTime: {
    fontSize: 13,
    fontWeight: '600',
  },
  muhurtaTimeGreen: {
    color: '#2E7D32',
  },
  muhurtaTimeRed: {
    color: '#C62828',
  },

  // Festival list
  festivalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.gold as string,
  },
  festivalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold.main,
    marginRight: spacing.md,
  },
  festivalInfo: {
    flex: 1,
  },
  festivalName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  festivalDate: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  daysUntilBadge: {
    backgroundColor: colors.background.sandstone,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  daysUntilText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gold.dark,
  },

  // Calendar button
  calendarButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.temple,
  },
  calendarButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  calendarButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.white,
  },
});
