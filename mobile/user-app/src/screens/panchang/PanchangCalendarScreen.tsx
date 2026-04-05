import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPanchangMonth, getPanchangToday } from '../../services/panchangApi';
import { colors, spacing, borderRadius, shadows } from '../../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_SIZE = Math.floor((SCREEN_WIDTH - spacing.lg * 2 - 6) / 7);
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DayData {
  date: number;
  dateIso?: string;
  tithi?: string;
  tithiEndTime?: string;
  nakshatra?: string;
  nakshatraDeity?: string;
  festival?: string | null;
  isPurnima?: boolean;
  isAmavasya?: boolean;
  yoga?: string;
  karana?: string;
  hinduMonth?: string;
  vikramSamvat?: string | number;
  moonrise?: string;
  moonset?: string;
  sunrise?: string;
  sunset?: string;
  rahuKaal?: string;
  yamaghanda?: string;
  gulikaKaal?: string;
  brahmaMuhurta?: string;
  abhijitMuhurta?: string;
  paksha?: string;
}

interface MonthData {
  days: DayData[];
}

function buildFallbackDayData(day: number): DayData {
  const tithiNames = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami'];
  const nakshatraNames = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu'];
  const yogaNames = ['Shubha', 'Siddha', 'Ayushman', 'Saubhagya', 'Dhriti'];
  const karanaNames = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garija'];

  return {
    date: day,
    tithi: tithiNames[(day - 1) % tithiNames.length],
    nakshatra: nakshatraNames[(day - 1) % nakshatraNames.length],
    yoga: yogaNames[(day - 1) % yogaNames.length],
    karana: karanaNames[(day - 1) % karanaNames.length],
    paksha: day <= 15 ? 'Shukla' : 'Krishna',
    sunrise: '06:15',
    sunset: '18:30',
    rahuKaal: '16:30 - 18:00',
    isPurnima: day === 15,
    isAmavasya: day === 30,
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

function formatIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function mapDayFromPayload(item: any): DayData | null {
  const normalized = unwrapPayload<any>(item) ?? item;
  if (!normalized || typeof normalized !== 'object') return null;

  const iso = typeof normalized?.date === 'string' ? normalized.date : '';
  const dayNum = iso ? parseInt(iso.split('-')[2], 10) : NaN;
  const rahuStart = normalized?.rahuKaal?.start || normalized?.muhurta?.rahuKaal?.start;
  const rahuEnd = normalized?.rahuKaal?.end || normalized?.muhurta?.rahuKaal?.end;
  const yamaStart = normalized?.yamaghanda?.start || normalized?.muhurta?.yamaghanda?.start;
  const yamaEnd = normalized?.yamaghanda?.end || normalized?.muhurta?.yamaghanda?.end;
  const gulikaStart = normalized?.gulikaKaal?.start || normalized?.muhurta?.gulikaKaal?.start;
  const gulikaEnd = normalized?.gulikaKaal?.end || normalized?.muhurta?.gulikaKaal?.end;
  const brahmaStart = normalized?.brahmaMuhurta?.start || normalized?.muhurta?.brahmaMuhurta?.start;
  const brahmaEnd = normalized?.brahmaMuhurta?.end || normalized?.muhurta?.brahmaMuhurta?.end;
  const abhijitStart = normalized?.abhijitMuhurta?.start || normalized?.muhurta?.abhijitMuhurta?.start;
  const abhijitEnd = normalized?.abhijitMuhurta?.end || normalized?.muhurta?.abhijitMuhurta?.end;

  const dateNumber = Number.isFinite(dayNum)
    ? dayNum
    : Number.isFinite(normalized?.date)
      ? Number(normalized.date)
      : 0;
  if (dateNumber <= 0) return null;

  return {
    date: dateNumber,
    dateIso: iso || undefined,
    tithi: normalized?.tithi?.name || normalized?.tithi,
    tithiEndTime: normalized?.tithi?.endTime,
    nakshatra: normalized?.nakshatra?.name || normalized?.nakshatra,
    nakshatraDeity: normalized?.nakshatra?.deity,
    festival: normalized?.festival || (Array.isArray(normalized?.festivals) ? normalized.festivals[0] : null),
    isPurnima: !!normalized?.isPurnima,
    isAmavasya: !!normalized?.isAmavasya,
    yoga: normalized?.yoga?.name || normalized?.yoga,
    karana: normalized?.karana?.name || normalized?.karana?.first || normalized?.karana?.second || normalized?.karana,
    hinduMonth: normalized?.hinduMonth,
    vikramSamvat: normalized?.vikramSamvat,
    sunrise: normalized?.sunrise,
    sunset: normalized?.sunset,
    moonrise: normalized?.moonrise,
    moonset: normalized?.moonset,
    rahuKaal: rahuStart && rahuEnd ? `${rahuStart} - ${rahuEnd}` : undefined,
    yamaghanda: yamaStart && yamaEnd ? `${yamaStart} - ${yamaEnd}` : undefined,
    gulikaKaal: gulikaStart && gulikaEnd ? `${gulikaStart} - ${gulikaEnd}` : undefined,
    brahmaMuhurta: brahmaStart && brahmaEnd ? `${brahmaStart} - ${brahmaEnd}` : undefined,
    abhijitMuhurta: abhijitStart && abhijitEnd ? `${abhijitStart} - ${abhijitEnd}` : undefined,
    paksha: normalized?.paksha || normalized?.tithi?.paksha,
  };
}

export default function PanchangCalendarScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const lat = route.params?.lat ?? 29.9457;
  const lng = route.params?.lng ?? 78.1642;
  const cityName = route.params?.cityName ?? 'Haridwar';
  const timezone = route.params?.timezone ?? 'Asia/Kolkata';

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-indexed
  const [monthData, setMonthData] = useState<MonthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [dayDetailLoading, setDayDetailLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  useEffect(() => {
    fetchMonthData();
  }, [year, month]);

  const fetchMonthData = async () => {
    setLoading(true);
    try {
      const response = await getPanchangMonth({
        month,
        year,
        lat,
        lng,
        city: cityName,
        timezone,
      });
      const payload = unwrapPayload<any[] | MonthData>(response) ?? response;

      if (Array.isArray(payload)) {
        const days: DayData[] = payload
          .map((item: any) => mapDayFromPayload(item))
          .filter((d): d is DayData => Boolean(d && d.date > 0));

        setMonthData({ days });
      } else if (payload && typeof payload === 'object' && Array.isArray((payload as MonthData).days)) {
        const days = ((payload as MonthData).days || [])
          .map((item: any) => mapDayFromPayload(item))
          .filter((d: DayData | null): d is DayData => Boolean(d && d.date > 0));
        setMonthData({ days });
      } else {
        setMonthData({ days: [] });
      }
    } catch (error) {
      // API endpoint may not be available, using placeholder month view
      if (error instanceof Error) {
        console.warn('Panchang month API unavailable, using placeholder:', error.message);
      }
      // Generate fallback month data
      const daysInMonth = new Date(year, month, 0).getDate();
      const days: DayData[] = [];
      for (let i = 1; i <= daysInMonth; i++) {
        const fallback = buildFallbackDayData(i);
        fallback.dateIso = formatIsoDate(year, month, i);
        days.push(fallback);
      }
      setMonthData({ days });
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const monthName = new Date(year, month - 1).toLocaleString('en-IN', { month: 'long' });

  // Calculate the starting day of the month
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const handleDayPress = async (day: DayData) => {
    setSelectedDay(day);
    setDetailVisible(true);
    setDayDetailLoading(true);

    try {
      const date = day.dateIso || formatIsoDate(year, month, day.date);
      const response = await getPanchangToday({
        lat,
        lng,
        city: cityName,
        timezone,
        date,
      });
      const payload = unwrapPayload<any>(response) ?? response;
      const mapped = mapDayFromPayload(payload);
      if (mapped) {
        setSelectedDay({ ...mapped, dateIso: mapped.dateIso || date });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Panchang day detail fetch failed, using month data:', error.message);
      }
    } finally {
      setDayDetailLoading(false);
    }
  };

  // Build the calendar grid
  const calendarCells: (DayData | null)[] = [];
  // Fill empty cells before month start
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  // Fill in each day
  for (let d = 1; d <= daysInMonth; d++) {
    const dayData = monthData?.days?.find((dd) => dd.date === d) || { date: d };
    calendarCells.push(dayData);
  }

  // Determine which festivals exist in this month for the legend
  const festivalsInMonth = (monthData?.days || [])
    .filter((d) => d.festival)
    .map((d) => ({ date: d.date, name: d.festival! }));

  const isToday = (date: number) =>
    year === now.getFullYear() && month === now.getMonth() + 1 && date === now.getDate();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.primary.maroon} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Panchang Calendar</Text>
          <Text style={styles.headerSubtitle}>{cityName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navArrow}>
          <Icon name="chevron-left" size={28} color={colors.primary.saffron} />
        </TouchableOpacity>
        <View style={styles.monthLabel}>
          <Text style={styles.monthName}>{monthName}</Text>
          <Text style={styles.yearText}>{year}</Text>
        </View>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navArrow}>
          <Icon name="chevron-right" size={28} color={colors.primary.saffron} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.saffron} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Weekday Headers */}
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((day) => (
              <View key={day} style={styles.weekdayCell}>
                <Text
                  style={[styles.weekdayText, day === 'Sun' && styles.sundayText]}
                >
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarCells.map((cell, index) => {
              if (!cell) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }
              const today = isToday(cell.date);
              const hasFestival = !!cell.festival;
              return (
                <TouchableOpacity
                  key={`day-${cell.date}`}
                  style={[
                    styles.dayCell,
                    today && styles.todayCell,
                  ]}
                  onPress={() => handleDayPress(cell)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      today && styles.todayNumber,
                      index % 7 === 0 && styles.sundayNumber,
                    ]}
                  >
                    {cell.date}
                  </Text>

                  {/* Tithi indicator */}
                  {cell.tithi && (
                    <Text style={styles.tithiIndicator} numberOfLines={1}>
                      {cell.tithi}
                    </Text>
                  )}

                  {/* Bottom row: festival dot + moon icon */}
                  <View style={styles.dayCellBottom}>
                    {hasFestival && <View style={styles.festivalDotSmall} />}
                    {cell.isPurnima && (
                      <Icon name="moon-full" size={10} color={colors.gold.main} />
                    )}
                    {cell.isAmavasya && (
                      <Icon name="moon-new" size={10} color={colors.primary.maroon} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Festival Legend */}
          {festivalsInMonth.length > 0 && (
            <View style={styles.legendSection}>
              <Text style={styles.legendTitle}>Festivals This Month</Text>
              {festivalsInMonth.map((f, i) => (
                <View key={i} style={styles.legendRow}>
                  <View style={styles.festivalDotLegend} />
                  <Text style={styles.legendDate}>
                    {f.date} {monthName.substring(0, 3)}
                  </Text>
                  <Text style={styles.legendName}>{f.name}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}

      {/* Day Detail Modal */}
      <Modal
        visible={detailVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: Platform.OS === 'ios' ? spacing.lg : spacing.xl }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedDay?.date} {monthName} {year}
            </Text>
            <TouchableOpacity onPress={() => setDetailVisible(false)}>
              <Icon name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {dayDetailLoading ? (
            <View style={styles.dayDetailLoadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.saffron} />
              <Text style={styles.dayDetailLoadingText}>Loading full Panchang...</Text>
            </View>
          ) : selectedDay ? (
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Tithi */}
              <DetailRow label="तिथि (Tithi)" value={selectedDay.tithi || 'N/A'} />
              {selectedDay.tithiEndTime && (
                <DetailRow label="तिथि समाप्ति (Ends)" value={selectedDay.tithiEndTime} />
              )}
              {selectedDay.paksha && (
                <DetailRow label="पक्ष (Paksha)" value={selectedDay.paksha} />
              )}
              <DetailRow label="नक्षत्र (Nakshatra)" value={selectedDay.nakshatra || 'N/A'} />
              {selectedDay.nakshatraDeity && (
                <DetailRow label="देवता (Deity)" value={selectedDay.nakshatraDeity} />
              )}
              <DetailRow label="योग (Yoga)" value={selectedDay.yoga || 'N/A'} />
              <DetailRow label="करण (Karana)" value={selectedDay.karana || 'N/A'} />

              {selectedDay.hinduMonth && (
                <DetailRow label="हिंदू महीना (Hindu Month)" value={selectedDay.hinduMonth} />
              )}
              {selectedDay.vikramSamvat && (
                <DetailRow label="विक्रम संवत (Vikram Samvat)" value={String(selectedDay.vikramSamvat)} />
              )}

              {selectedDay.sunrise && (
                <DetailRow label="Sunrise" value={selectedDay.sunrise} />
              )}
              {selectedDay.sunset && (
                <DetailRow label="Sunset" value={selectedDay.sunset} />
              )}
              {selectedDay.moonrise && (
                <DetailRow label="Moonrise" value={selectedDay.moonrise} />
              )}
              {selectedDay.moonset && (
                <DetailRow label="Moonset" value={selectedDay.moonset} />
              )}
              {selectedDay.brahmaMuhurta && (
                <DetailRow label="ब्रह्म मुहूर्त (Brahma Muhurta)" value={selectedDay.brahmaMuhurta} />
              )}
              {selectedDay.abhijitMuhurta && (
                <DetailRow label="अभिजीत मुहूर्त (Abhijit Muhurta)" value={selectedDay.abhijitMuhurta} />
              )}
              {selectedDay.rahuKaal && (
                <DetailRow
                  label="राहु काल (Rahu Kaal)"
                  value={selectedDay.rahuKaal}
                  variant="warning"
                />
              )}
              {selectedDay.yamaghanda && (
                <DetailRow label="यमघण्ड (Yamaghanda)" value={selectedDay.yamaghanda} variant="warning" />
              )}
              {selectedDay.gulikaKaal && (
                <DetailRow label="गुलिक काल (Gulika Kaal)" value={selectedDay.gulikaKaal} variant="warning" />
              )}

              {selectedDay.festival && (
                <View style={styles.modalFestival}>
                  <Icon name="party-popper" size={18} color={colors.primary.maroon} />
                  <Text style={styles.modalFestivalText}>{selectedDay.festival}</Text>
                </View>
              )}

              {selectedDay.isPurnima && (
                <View style={styles.moonBanner}>
                  <Icon name="moon-full" size={18} color={colors.gold.main} />
                  <Text style={styles.moonBannerText}>Purnima (Full Moon)</Text>
                </View>
              )}
              {selectedDay.isAmavasya && (
                <View style={[styles.moonBanner, styles.moonBannerDark]}>
                  <Icon name="moon-new" size={18} color={colors.primary.maroon} />
                  <Text style={[styles.moonBannerText, { color: colors.primary.maroon }]}>
                    Amavasya (New Moon)
                  </Text>
                </View>
              )}
            </ScrollView>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

function DetailRow({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant?: 'warning';
}) {
  return (
    <View
      style={[
        styles.detailRow,
        variant === 'warning' && styles.detailRowWarning,
      ]}
    >
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[
          styles.detailValue,
          variant === 'warning' && styles.detailValueWarning,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.parchment,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.gold as string,
  },
  backButton: {
    padding: spacing.xs,
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary.maroon,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  navArrow: {
    padding: spacing.xs,
  },
  monthLabel: {
    alignItems: 'center',
  },
  monthName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary.maroon,
  },
  yearText: {
    fontSize: 14,
    color: colors.gold.dark,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Weekday headers
  weekdayRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  weekdayCell: {
    width: DAY_SIZE,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  sundayText: {
    color: colors.primary.vermillion,
  },

  // Calendar grid
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE + 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: 1,
  },
  todayCell: {
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    borderWidth: 1.5,
    borderColor: colors.primary.saffron,
    borderRadius: borderRadius.sm,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  todayNumber: {
    color: colors.primary.saffron,
    fontWeight: '700',
  },
  sundayNumber: {
    color: colors.primary.vermillion,
  },
  tithiIndicator: {
    fontSize: 8,
    color: colors.text.secondary,
    marginTop: 1,
    maxWidth: DAY_SIZE - 4,
    textAlign: 'center',
  },
  dayCellBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 2,
  },
  festivalDotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.gold.main,
  },

  // Legend
  legendSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
  },
  legendTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary.maroon,
    marginBottom: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  festivalDotLegend: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold.main,
    marginRight: spacing.sm,
  },
  legendDate: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    width: 56,
  },
  legendName: {
    fontSize: 13,
    color: colors.text.primary,
    flex: 1,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.parchment,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.gold as string,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary.maroon,
  },
  modalBody: {
    padding: spacing.lg,
  },
  dayDetailLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  dayDetailLoadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.gold as string,
  },
  detailRowWarning: {
    backgroundColor: 'rgba(198, 40, 40, 0.06)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    marginHorizontal: -spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'right',
    flex: 1,
  },
  detailValueWarning: {
    color: '#C62828',
  },
  modalFestival: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: 'rgba(212, 160, 23, 0.15)',
    borderRadius: borderRadius.md,
  },
  modalFestivalText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.maroon,
    marginLeft: spacing.sm,
  },
  moonBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: 'rgba(255, 213, 79, 0.2)',
    borderRadius: borderRadius.md,
  },
  moonBannerDark: {
    backgroundColor: 'rgba(128, 0, 32, 0.08)',
  },
  moonBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gold.dark,
    marginLeft: spacing.sm,
  },
});
