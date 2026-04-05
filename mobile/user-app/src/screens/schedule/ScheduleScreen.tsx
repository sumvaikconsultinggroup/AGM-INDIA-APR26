import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  SectionList,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface Event {
  _id: string;
  eventName: string;
  eventDate: string;
  eventLocation?: string;
  description?: string;
}

interface TimeSlot {
  period?: string;
  startDate: string;
  endDate: string;
  _id: string;
}

interface Schedule {
  _id: string;
  month: string;
  locations: string;
  timeSlots: TimeSlot[];
  appointment?: boolean;
  maxPeople?: number;
  dateRange?: string;
}

interface GroupedSchedule {
  title: string;
  data: Schedule[];
}

export function ScheduleScreen() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [schedules, setSchedules] = useState<GroupedSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registering, setRegistering] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'schedules'>('events');

  const fetchData = useCallback(async () => {
    try {
      const [eventsRes, schedulesRes] = await Promise.all([
        api.get('/events').catch(() => ({ data: [] })),
        api.get('/schedule').catch(() => ({ data: [] })),
      ]);

      // Sort events by date
      const sortedEvents = (eventsRes.data || []).sort(
        (a: Event, b: Event) =>
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      );
      setEvents(sortedEvents);

      // Group schedules by month/date
      const rawSchedules = schedulesRes.data || [];
      const grouped = groupSchedulesByMonth(rawSchedules);
      setSchedules(grouped);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const groupSchedulesByMonth = (items: Schedule[]): GroupedSchedule[] => {
    const groups: Record<string, Schedule[]> = {};

    items.forEach((item) => {
      const monthYear = item.month || 'Other';
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(item);
    });

    return Object.entries(groups).map(([title, data]) => ({
      title,
      data: data.sort((a, b) => {
        const aDate = a.timeSlots?.[0]?.startDate || '';
        const bDate = b.timeSlots?.[0]?.startDate || '';
        return new Date(aDate).getTime() - new Date(bDate).getTime();
      }),
    }));
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getPeriodIcon = (period?: string) => {
    switch (period?.toLowerCase()) {
      case 'morning':
        return 'weather-sunny' as const;
      case 'afternoon':
        return 'weather-partly-cloudy' as const;
      case 'evening':
        return 'weather-sunset' as const;
      default:
        return 'clock-outline' as const;
    }
  };

  const handleRegister = async (scheduleId: string, title: string) => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to register for schedules.',
        [{ text: 'OK' }]
      );
      return;
    }

    setRegistering(scheduleId);
    try {
      await api.post('/scheduleRegistration', { scheduleId });
      Alert.alert('Success', `You have registered for "${title}"`, [
        { text: 'OK' },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || 'Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setRegistering(null);
    }
  };

  const renderEventCard = (event: Event) => (
    <TouchableOpacity key={event._id} style={styles.eventCard}>
      <LinearGradient
        colors={[colors.background.warmWhite, colors.background.cream]}
        style={styles.eventGradient}
      >
        <View style={styles.eventDateBadge}>
          <Text style={styles.eventDateDay}>
            {new Date(event.eventDate).getDate()}
          </Text>
          <Text style={styles.eventDateMonth}>
            {new Date(event.eventDate).toLocaleDateString('en-IN', {
              month: 'short',
            })}
          </Text>
        </View>
        <View style={styles.eventContent}>
          <Text style={styles.eventName}>{event.eventName}</Text>
          <View style={styles.eventMeta}>
            <Icon name="calendar" size={14} color={colors.text.secondary} />
            <Text style={styles.eventMetaText}>
              {formatFullDate(event.eventDate)}
            </Text>
          </View>
          {event.eventLocation && (
            <View style={styles.eventMeta}>
              <Icon name="map-marker" size={14} color={colors.text.secondary} />
              <Text style={styles.eventMetaText}>{event.eventLocation}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderScheduleItem = ({ item }: { item: Schedule }) => {
    const firstSlot = item.timeSlots?.[0];
    const period = firstSlot?.period;
    const startDate = firstSlot?.startDate;

    return (
      <View style={styles.scheduleItem}>
        <View style={styles.scheduleLeft}>
          {startDate && (
            <View style={styles.scheduleDate}>
              <Text style={styles.scheduleDateText}>{formatDate(startDate)}</Text>
            </View>
          )}
          {period && (
            <View style={styles.periodBadge}>
              <Icon
                name={getPeriodIcon(period)}
                size={12}
                color={colors.gold.dark}
              />
              <Text style={styles.periodText}>{period}</Text>
            </View>
          )}
        </View>
        <View style={styles.scheduleContent}>
          <Text style={styles.scheduleTitle} numberOfLines={3}>{item.locations}</Text>
          {item.dateRange && (
            <Text style={styles.scheduleTime}>
              {item.dateRange}
            </Text>
          )}
          {item.appointment && (
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => handleRegister(item._id, item.locations)}
              disabled={registering === item._id}
            >
              {registering === item._id ? (
                <ActivityIndicator size="small" color={colors.text.white} />
              ) : (
                <>
                  <Icon name="check-circle" size={14} color={colors.text.white} />
                  <Text style={styles.registerButtonText}>{t('schedule.registerNow')}</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.saffron} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.tabActive]}
          onPress={() => setActiveTab('events')}
        >
          <Icon
            name="calendar-star"
            size={18}
            color={
              activeTab === 'events' ? colors.text.white : colors.text.primary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'events' && styles.tabTextActive,
            ]}
          >
            Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'schedules' && styles.tabActive]}
          onPress={() => setActiveTab('schedules')}
        >
          <Icon
            name="calendar-clock"
            size={18}
            color={
              activeTab === 'schedules' ? colors.text.white : colors.text.primary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'schedules' && styles.tabTextActive,
            ]}
          >
            Schedules
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'events' ? (
        <ScrollView
          style={styles.scrollView}
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
          <View style={styles.sectionHeader}>
            <Icon name="calendar-star" size={20} color={colors.primary.maroon} />
            <Text style={styles.sectionTitle}>{t('home.upcomingEvents')}</Text>
          </View>
          {events.length > 0 ? (
            events.map((event) => <View key={event._id}>{renderEventCard(event)}</View>)
          ) : (
            <View style={styles.emptyState}>
              <Icon
                name="calendar-blank"
                size={48}
                color={colors.text.secondary}
              />
              <Text style={styles.emptyTitle}>{t('schedule.noEvents')}</Text>
              <Text style={styles.emptySubtitle}>
                Check back later for new events
              </Text>
            </View>
          )}
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      ) : (
        <SectionList
          sections={schedules}
          keyExtractor={(item) => item._id}
          renderItem={renderScheduleItem}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeaderBar}>
              <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary.saffron]}
              tintColor={colors.primary.saffron}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Icon
                name="calendar-clock"
                size={48}
                color={colors.text.secondary}
              />
              <Text style={styles.emptyTitle}>No Schedules Available</Text>
              <Text style={styles.emptySubtitle}>
                Check back later for updates
              </Text>
            </View>
          )}
        />
      )}
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
    color: colors.text.secondary,
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.background.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.gold as string,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.sandstone,
  },
  tabActive: {
    backgroundColor: colors.primary.saffron,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  tabTextActive: {
    color: colors.text.white,
  },
  scrollView: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary.maroon,
    marginLeft: spacing.sm,
  },
  sectionHeaderBar: {
    backgroundColor: colors.primary.maroon,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.white,
  },
  eventCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    ...shadows.warm,
  },
  eventGradient: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  eventDateBadge: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.saffron,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  eventDateDay: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.white,
  },
  eventDateMonth: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
  },
  eventContent: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  eventMetaText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  scheduleItem: {
    flexDirection: 'row',
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    ...shadows.warm,
  },
  scheduleLeft: {
    alignItems: 'center',
    marginRight: spacing.md,
    minWidth: 60,
  },
  scheduleDate: {
    backgroundColor: colors.background.cream,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  scheduleDateText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  periodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  periodText: {
    fontSize: 10,
    color: colors.gold.dark,
    marginLeft: 2,
    textTransform: 'capitalize',
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  scheduleTime: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  scheduleLocation: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary.saffron,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  registerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.white,
    marginLeft: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});
