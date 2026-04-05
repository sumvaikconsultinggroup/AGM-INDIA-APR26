import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, shadows } from '../../theme';

const { width } = Dimensions.get('window');

interface Campaign {
  _id: string;
  title: string;
  description?: string;
  goal: number;
  achieved: number;
  backgroundImage?: string;
  category?: string;
  isActive?: boolean;
}

export function DonateScreen() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const DONATE_WEB_URL =
    process.env.EXPO_PUBLIC_DONATE_URL || 'https://www.avdheshanandg.org/donate';

  const fetchCampaigns = useCallback(async () => {
    try {
      const response = await api.get('/donate');
      setCampaigns(response.data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCampaigns();
    setRefreshing(false);
  }, [fetchCampaigns]);

  const openDonateWebCheckout = async (campaign?: Campaign) => {
    const queryParams: string[] = ['source=mobile-app'];
    if (campaign?._id) queryParams.push(`campaignId=${encodeURIComponent(campaign._id)}`);
    if (customAmount) queryParams.push(`amount=${encodeURIComponent(customAmount)}`);
    queryParams.push(`returnTo=${encodeURIComponent('swamiavdheshanand://donate')}`);
    const checkoutUrl = `${DONATE_WEB_URL}?${queryParams.join('&')}`;

    const canOpen = await Linking.canOpenURL(checkoutUrl);
    if (!canOpen) {
      throw new Error('Cannot open donation page');
    }
    await Linking.openURL(checkoutUrl);
  };

  const handleDonate = (campaign?: Campaign) => {
    if (!isAuthenticated) {
      Alert.alert(
        t('donate.alerts.signInRequiredTitle'),
        t('donate.alerts.signInRequiredMessage'),
        [{ text: t('donate.alerts.ok') }]
      );
      return;
    }

    Alert.alert(
      t('donate.alerts.continueCheckoutTitle'),
      `${t('donate.alerts.continueCheckoutMessage')}${campaign ? ` ${t('donate.alerts.forCampaign')} "${campaign.title}".` : ''}`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('donate.alerts.openWebCheckout'),
          onPress: async () => {
            try {
              await openDonateWebCheckout(campaign);
            } catch {
              Alert.alert(
                t('donate.alerts.unableToOpenTitle'),
                t('donate.alerts.unableToOpenMessage')
              );
            }
          },
        },
      ]
    );
  };

  const quickAmounts = [100, 500, 1000, 5000];

  const calculateProgress = (achievedVal: number, goalVal: number) => {
    if (goalVal <= 0) return 0;
    return Math.min((achievedVal / goalVal) * 100, 100);
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
      {/* Header */}
      <LinearGradient
        colors={[colors.primary.saffron, colors.primary.maroon]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Icon name="hand-heart" size={40} color={colors.gold.light} />
        <Text style={styles.headerTitle}>{t('donate.supportMission')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('donate.supportMissionSubtitle')}
        </Text>
      </LinearGradient>

      {/* Custom Donation Section */}
      <View style={styles.customDonationSection}>
        <Text style={styles.sectionTitle}>{t('donate.title')}</Text>
        
        {/* Quick Amount Buttons */}
        <View style={styles.quickAmountsContainer}>
          {quickAmounts.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.quickAmountButton,
                customAmount === String(amount) && styles.quickAmountButtonActive,
              ]}
              onPress={() => setCustomAmount(String(amount))}
              accessibilityRole="button"
              accessibilityLabel={t('donate.selectAmountLabel', { amount: `₹${amount}` })}
            >
              <Text
                style={[
                  styles.quickAmountText,
                  customAmount === String(amount) && styles.quickAmountTextActive,
                ]}
              >
                ₹{amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Amount Input */}
        <View style={styles.customAmountContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.customAmountInput}
            placeholder={t('donate.customAmountPlaceholder')}
            placeholderTextColor={colors.text.secondary}
            keyboardType="numeric"
            value={customAmount}
            onChangeText={setCustomAmount}
          />
        </View>

        {/* Donate Button */}
        <TouchableOpacity
          style={styles.donateButton}
          onPress={() => handleDonate()}
          accessibilityRole="button"
          accessibilityLabel={`${t('donate.donateNow')} ${customAmount ? `₹${customAmount}` : ''}`}
        >
          <LinearGradient
            colors={[colors.gold.main, colors.gold.dark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.donateButtonGradient}
          >
            <Icon name="gift" size={20} color={colors.text.white} />
            <Text style={styles.donateButtonText}>
              {t('donate.donateNow')} {customAmount ? `₹${customAmount}` : ''}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Campaigns Section */}
      <View style={styles.campaignsSection}>
        <Text style={styles.sectionTitle}>{t('donate.activeCampaigns')}</Text>
        
        {campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <View key={campaign._id} style={styles.campaignCard}>
              <View style={styles.campaignHeader}>
                <View style={styles.campaignIconContainer}>
                  <Icon name="heart" size={24} color={colors.primary.saffron} />
                </View>
                <View style={styles.campaignHeaderContent}>
                  <Text style={styles.campaignTitle}>{campaign.title}</Text>
                  {campaign.category && (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{campaign.category}</Text>
                    </View>
                  )}
                </View>
              </View>

              {campaign.description && (
                <Text style={styles.campaignDescription} numberOfLines={3}>
                  {campaign.description}
                </Text>
              )}

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={[colors.gold.light, colors.gold.main]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.progressFill,
                      {
                        width: `${calculateProgress(
                          campaign.achieved,
                          campaign.goal
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <View style={styles.progressStats}>
                  <View>
                    <Text style={styles.progressLabel}>{t('donate.raised')}</Text>
                    <Text style={styles.progressAmount}>
                      ₹{campaign.achieved.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.progressRight}>
                    <Text style={styles.progressLabel}>{t('donate.goal')}</Text>
                    <Text style={styles.progressGoal}>
                      ₹{campaign.goal.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Donate to Campaign Button */}
              <TouchableOpacity
                style={styles.campaignDonateButton}
                onPress={() => handleDonate(campaign)}
                accessibilityRole="button"
                accessibilityLabel={`Donate to ${campaign.title}`}
              >
                <Icon name="hand-heart" size={18} color={colors.text.white} />
                <Text style={styles.campaignDonateText}>{t('donate.donateNow')}</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="heart-outline" size={48} color={colors.text.secondary} />
            <Text style={styles.emptyTitle}>{t('donate.noCampaigns')}</Text>
            <Text style={styles.emptySubtitle}>
              {t('donate.noCampaignsSubtitle')}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Icon name="shield-check" size={24} color={colors.accent.peacock} />
          <Text style={styles.infoTitle}>{t('donate.secureCheckoutTitle')}</Text>
          <Text style={styles.infoText}>
            {t('donate.secureCheckoutSubtitle')}
          </Text>
        </View>
        <View style={styles.infoCard}>
          <Icon name="receipt" size={24} color={colors.accent.peacock} />
          <Text style={styles.infoTitle}>{t('donate.taxBenefitsTitle')}</Text>
          <Text style={styles.infoText}>
            {t('donate.taxBenefitsSubtitle')}
          </Text>
        </View>
      </View>

      <View style={{ height: spacing.xxl }} />
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
  header: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    alignItems: 'center',
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.white,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  customDonationSection: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    ...shadows.warm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary.maroon,
    marginBottom: spacing.md,
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  quickAmountButton: {
    flex: 1,
    minWidth: (width - spacing.lg * 4 - spacing.sm * 3) / 4,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.sandstone,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickAmountButtonActive: {
    backgroundColor: colors.primary.saffron,
    borderColor: colors.primary.saffron,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  quickAmountTextActive: {
    color: colors.text.white,
  },
  customAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.parchment,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    marginBottom: spacing.md,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  customAmountInput: {
    flex: 1,
    fontSize: 18,
    color: colors.text.primary,
    paddingVertical: spacing.md,
    paddingLeft: spacing.sm,
  },
  donateButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  donateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  donateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.white,
    marginLeft: spacing.sm,
  },
  campaignsSection: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  campaignCard: {
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    ...shadows.warm,
  },
  campaignHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  campaignIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  campaignHeaderContent: {
    flex: 1,
  },
  campaignTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background.sandstone,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  categoryText: {
    fontSize: 11,
    color: colors.gold.dark,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  campaignDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 10,
    backgroundColor: colors.background.sandstone,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  progressRight: {
    alignItems: 'flex-end',
  },
  progressLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  progressAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.saffron,
  },
  progressGoal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  campaignDonateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.maroon,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  campaignDonateText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.white,
    marginLeft: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
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
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  infoSection: {
    flexDirection: 'row',
    padding: spacing.lg,
    paddingTop: 0,
    gap: spacing.md,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.gold as string,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
