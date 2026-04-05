import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../services/api';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import DailyVicharCard from './DailyVicharCard';
import PanchangCard from './PanchangCard';
import LanguageDrawer from '../../components/LanguageDrawer';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;

interface Event {
  _id: string;
  eventName: string;
  eventDate: string;
  eventLocation?: string;
  eventImage?: string;
}

interface Article {
  _id: string;
  title: string;
  description?: string;
  publishedDate: string;
  coverImage?: string;
  category?: string;
}

interface Campaign {
  _id: string;
  title: string;
  description?: string;
  goal: number;
  achieved: number;
  backgroundImage?: string;
}

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredCampaign, setFeaturedCampaign] = useState<Campaign | null>(null);
  const [languageDrawerVisible, setLanguageDrawerVisible] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [eventsRes, articlesRes, campaignsRes] = await Promise.all([
        api.get('/events').catch(() => ({ data: [] })),
        api.get('/articles').catch(() => ({ data: [] })),
        api.get('/donate').catch(() => ({ data: [] })),
      ]);

      setEvents((eventsRes.data || []).slice(0, 5));
      setArticles((articlesRes.data || []).slice(0, 5));
      
      const campaigns = campaignsRes.data || [];
      if (campaigns.length > 0) {
        setFeaturedCampaign(campaigns[0]);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const quickLinks = [
    { icon: 'calendar-star' as const, labelKey: 'home.quickLinksItems.panchang', screen: 'Panchang' },
    { icon: 'calendar' as const, labelKey: 'home.quickLinksItems.schedule', tab: 'Schedule' },
    { icon: 'book-open-variant' as const, labelKey: 'home.quickLinksItems.books', category: 'Books' },
    { icon: 'video' as const, labelKey: 'home.quickLinksItems.videos', category: 'Videos' },
    { icon: 'podcast' as const, labelKey: 'home.quickLinksItems.podcasts', category: 'Podcasts' },
    { icon: 'image-multiple' as const, labelKey: 'home.quickLinksItems.gallery', screen: 'GalleryFull' },
    { icon: 'hand-heart' as const, labelKey: 'home.quickLinksItems.volunteer', screen: 'VolunteerForm' },
  ];

  const navigateToQuickLink = (item: typeof quickLinks[0]) => {
    if (item.tab) {
      navigation.navigate(item.tab);
    } else if (item.category) {
      navigation.navigate('Explore', { category: item.category });
    } else if (item.screen) {
      navigation.navigate(item.screen);
    }
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
    <ScrollView
      style={styles.container}
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
      {/* Hero Banner */}
      <LinearGradient
        colors={[colors.primary.saffron, colors.primary.maroon]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroBanner, { paddingTop: Math.max(insets.top + spacing.lg, spacing.xxl) }]}
      >
        <TouchableOpacity
          style={styles.heroMenuButton}
          onPress={() => setLanguageDrawerVisible(true)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('profile.language')}
        >
          <Icon name="menu" size={22} color={colors.text.white} />
        </TouchableOpacity>
        <Text style={styles.omSymbol}>ॐ</Text>
        <Text style={styles.heroGreeting}>{t('home.welcome')}</Text>
        <Text style={styles.heroQuote}>
          {t('home.heroQuote')}
        </Text>
        <View style={styles.heroDecoration} />
      </LinearGradient>

      {/* Daily Vichar Card */}
      <DailyVicharCard />

      {/* Today's Panchang Card */}
      <PanchangCard onPress={() => navigation.navigate('Panchang')} />

      {/* Featured Events Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.upcomingEvents')}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Schedule')}
            accessibilityRole="button"
            accessibilityLabel={t('home.seeAllUpcomingEvents')}
          >
            <Text style={styles.seeAll}>{t('home.seeAll')}</Text>
          </TouchableOpacity>
        </View>
        {events.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {events.map((event) => (
              <TouchableOpacity 
                key={event._id} 
                style={styles.eventCard}
                onPress={() => navigation.navigate('EventDetail', { eventId: event._id })}
                accessibilityRole="button"
                accessibilityLabel={`${event.eventName}, ${formatDate(event.eventDate)}`}
              >
                <View style={styles.eventImagePlaceholder}>
                  {event.eventImage ? (
                    <Image source={{ uri: event.eventImage }} style={styles.eventImage} />
                  ) : (
                    <Icon name="calendar-star" size={32} color={colors.gold.main} />
                  )}
                </View>
                <View style={styles.eventContent}>
                  <Text style={styles.eventName} numberOfLines={2}>
                    {event.eventName}
                  </Text>
                  <View style={styles.eventMeta}>
                    <Icon name="calendar" size={14} color={colors.text.secondary} />
                    <Text style={styles.eventDate}>{formatDate(event.eventDate)}</Text>
                  </View>
                  {event.eventLocation && (
                    <View style={styles.eventMeta}>
                      <Icon name="map-marker" size={14} color={colors.text.secondary} />
                      <Text style={styles.eventLocation} numberOfLines={1}>
                        {event.eventLocation}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="calendar-blank" size={40} color={colors.text.secondary} />
            <Text style={styles.emptyText}>{t('home.noUpcomingEvents')}</Text>
          </View>
        )}
      </View>

      {/* Latest Articles Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.latestArticles')}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Explore', { category: 'Articles' })}
            accessibilityRole="button"
            accessibilityLabel={t('home.seeAllArticles')}
          >
            <Text style={styles.seeAll}>{t('home.seeAll')}</Text>
          </TouchableOpacity>
        </View>
        {articles.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {articles.map((article) => (
              <TouchableOpacity 
                key={article._id} 
                style={styles.articleCard}
                onPress={() => navigation.navigate('ArticleDetail', { articleId: article._id })}
                accessibilityRole="button"
                accessibilityLabel={article.title}
              >
                <View style={styles.articleImagePlaceholder}>
                  {article.coverImage ? (
                    <Image source={{ uri: article.coverImage }} style={styles.articleImage} />
                  ) : (
                    <Icon name="file-document" size={28} color={colors.gold.main} />
                  )}
                </View>
                <Text style={styles.articleTitle} numberOfLines={2}>
                  {article.title}
                </Text>
                <Text style={styles.articleExcerpt} numberOfLines={2}>
                  {article.description || ''}
                </Text>
                <Text style={styles.articleDate}>{formatDate(article.publishedDate)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="file-document-outline" size={40} color={colors.text.secondary} />
            <Text style={styles.emptyText}>{t('home.noArticlesAvailable')}</Text>
          </View>
        )}
      </View>

      {/* Donation Spotlight */}
      {featuredCampaign && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.donationSpotlight')}</Text>
          </View>
          <TouchableOpacity
            style={styles.donationCard}
            onPress={() => navigation.navigate('Donate')}
            accessibilityRole="button"
            accessibilityLabel={`${t('home.donationSpotlight')}: ${featuredCampaign.title}`}
          >
            <LinearGradient
              colors={[colors.gold.light, colors.gold.main]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.donationCardGradient}
            >
              <View style={styles.donationHeader}>
                <Icon name="hand-heart" size={24} color={colors.primary.maroon} />
                <Text style={styles.donationTitle}>{featuredCampaign.title}</Text>
              </View>
              {featuredCampaign.description && (
                <Text style={styles.donationDescription} numberOfLines={2}>
                  {featuredCampaign.description}
                </Text>
              )}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(
                          (featuredCampaign.achieved / featuredCampaign.goal) * 100,
                          100
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <View style={styles.progressText}>
                  <Text style={styles.progressAmount}>
                    ₹{featuredCampaign.achieved.toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.progressGoal}>
                    of ₹{featuredCampaign.goal.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
              <View style={styles.donateButtonContainer}>
                <Text style={styles.donateButtonText}>{t('donate.donateNow')}</Text>
                <Icon name="arrow-right" size={18} color={colors.text.white} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.quickLinks')}</Text>
        <View style={styles.quickLinksGrid}>
          {quickLinks.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickLinkItem}
              onPress={() => navigateToQuickLink(item)}
              accessibilityRole="button"
              accessibilityLabel={t(item.labelKey)}
            >
              <View style={styles.quickLinkIcon}>
                <Icon name={item.icon} size={24} color={colors.primary.saffron} />
              </View>
              <Text style={styles.quickLinkLabel}>{t(item.labelKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: spacing.xxl }} />

      <LanguageDrawer
        visible={languageDrawerVisible}
        onClose={() => setLanguageDrawerVisible(false)}
      />
    </ScrollView>
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
  heroBanner: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    alignItems: 'center',
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    position: 'relative',
  },
  heroMenuButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  omSymbol: {
    fontSize: 48,
    color: colors.gold.light,
    marginBottom: spacing.sm,
  },
  heroGreeting: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.white,
    marginBottom: spacing.sm,
  },
  heroQuote: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: 20,
  },
  heroDecoration: {
    width: 60,
    height: 3,
    backgroundColor: colors.gold.light,
    borderRadius: 2,
    marginTop: spacing.lg,
  },
  section: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary.maroon,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary.saffron,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingRight: spacing.lg,
  },
  eventCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    ...shadows.warm,
  },
  eventImagePlaceholder: {
    height: 100,
    backgroundColor: colors.background.sandstone,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventContent: {
    padding: spacing.md,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  eventDate: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  eventLocation: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  articleCard: {
    width: CARD_WIDTH * 0.75,
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    ...shadows.warm,
  },
  articleImagePlaceholder: {
    height: 80,
    backgroundColor: colors.background.sandstone,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  articleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: borderRadius.md,
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  articleExcerpt: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  articleDate: {
    fontSize: 11,
    color: colors.gold.dark,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
  },
  emptyText: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.text.secondary,
  },
  donationCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.temple,
  },
  donationCardGradient: {
    padding: spacing.lg,
  },
  donationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  donationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary.maroon,
    marginLeft: spacing.sm,
    flex: 1,
  },
  donationDescription: {
    fontSize: 13,
    color: colors.text.primary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(128, 0, 32, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.maroon,
    borderRadius: 4,
  },
  progressText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  progressAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary.maroon,
  },
  progressGoal: {
    fontSize: 12,
    color: colors.text.primary,
  },
  donateButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.maroon,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  donateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.white,
    marginRight: spacing.xs,
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    marginHorizontal: -spacing.xs,
  },
  quickLinkItem: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  quickLinkIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background.warmWhite,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    marginBottom: spacing.sm,
    ...shadows.warm,
  },
  quickLinkLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.primary,
    textAlign: 'center',
  },
});
