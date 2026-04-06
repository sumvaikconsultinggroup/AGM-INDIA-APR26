import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  Modal,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { colors, spacing, borderRadius, shadows } from '../../theme';

const { width } = Dimensions.get('window');
type LocalizedText = Record<string, string | undefined>;

type DonateMode = 'one_time' | 'subscription';

interface Campaign {
  _id: string;
  title: string;
  titleTranslations?: LocalizedText;
  description?: string;
  descriptionTranslations?: LocalizedText;
  additionalText?: string;
  additionalTextTranslations?: LocalizedText;
  goal: number;
  achieved: number;
  donors?: number;
  totalDays?: number;
  createdAt?: string;
  backgroundImage?: string;
}

interface RecentDonation {
  id: string;
  donorName: string;
  amount: number;
  donatedAt: string;
  campaignTitle: string;
  donationType: 'one_time' | 'subscription';
}

type FormState = {
  amount: string;
  fullName: string;
  email: string;
  mobile: string;
  nationality: string;
  address: string;
  panNumber: string;
  taxBenefitOptIn: boolean;
  isAnonymous: boolean;
  dedicationType: 'general' | 'memory' | 'honor' | 'occasion';
  dedicatedTo: string;
  dedicationMessage: string;
};

const initialForm: FormState = {
  amount: '1100',
  fullName: '',
  email: '',
  mobile: '',
  nationality: 'Indian',
  address: '',
  panNumber: '',
  taxBenefitOptIn: true,
  isAnonymous: false,
  dedicationType: 'general',
  dedicatedTo: '',
  dedicationMessage: '',
};

const quickAmounts = ['501', '1100', '2501', '5001'];

function formatCurrency(amount: number | string | undefined) {
  const numeric =
    typeof amount === 'string'
      ? Number(String(amount).replace(/[^\d.]/g, ''))
      : Number(amount || 0);
  return `₹${numeric.toLocaleString('en-IN')}`;
}

function calculateProgress(campaign: Campaign) {
  if (!campaign.goal) return 0;
  return Math.max(0, Math.min(100, Math.round((campaign.achieved / campaign.goal) * 100)));
}

function calculateDaysLeft(campaign: Campaign) {
  if (!campaign.createdAt || !campaign.totalDays) return null;
  const created = new Date(campaign.createdAt);
  const end = new Date(created);
  end.setDate(end.getDate() + campaign.totalDays);
  const diff = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function buildCheckoutHtml({
  key,
  amount,
  mode,
  orderId,
  subscriptionId,
  form,
  campaignTitle,
}: {
  key: string;
  amount: number;
  mode: DonateMode;
  orderId?: string;
  subscriptionId?: string;
  form: FormState;
  campaignTitle: string;
}) {
  const safeCampaignTitle = JSON.stringify(campaignTitle);
  const safeName = JSON.stringify(form.fullName);
  const safeEmail = JSON.stringify(form.email);
  const safeMobile = JSON.stringify(form.mobile);

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>
      body {
        margin: 0;
        background: #fff8e7;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        display: flex;
        min-height: 100vh;
        align-items: center;
        justify-content: center;
      }
      .card {
        width: calc(100vw - 40px);
        max-width: 420px;
        background: white;
        border-radius: 24px;
        padding: 24px;
        box-shadow: 0 18px 42px rgba(60,34,12,0.14);
        text-align: center;
      }
      .spinner {
        width: 38px;
        height: 38px;
        border: 4px solid rgba(181,123,29,0.18);
        border-top-color: #b57b1d;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 18px;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="spinner"></div>
      <h2 style="margin:0 0 10px;color:#4a0010;">Opening secure checkout</h2>
      <p style="margin:0;color:#7a665a;line-height:1.5;">Your donation towards ${campaignTitle} is being prepared.</p>
    </div>
    <script>
      (function() {
        const options = {
          key: ${JSON.stringify(key)},
          amount: ${Math.round(amount * 100)},
          currency: 'INR',
          name: 'AvdheshanandG Mission',
          description: ${JSON.stringify(mode === 'subscription' ? 'Monthly Seva Donation' : 'One-Time Donation')},
          prefill: {
            name: ${safeName},
            email: ${safeEmail},
            contact: ${safeMobile}
          },
          notes: {
            campaignTitle: ${safeCampaignTitle},
            donationType: ${JSON.stringify(mode)}
          },
          theme: { color: '#B57B1D' },
          handler: function (response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'success', payload: response }));
          },
          modal: {
            ondismiss: function () {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'dismissed' }));
            }
          }
        };

        ${mode === 'subscription' ? `options.subscription_id = ${JSON.stringify(subscriptionId || '')};` : `options.order_id = ${JSON.stringify(orderId || '')};`}

        try {
          const rzp = new Razorpay(options);
          rzp.on('payment.failed', function (response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'failed', payload: response.error || {} }));
          });
          rzp.open();
        } catch (error) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'failed', payload: { description: error.message } }));
        }
      })();
    </script>
  </body>
</html>`;
}

export function DonateScreen() {
  const { t, i18n } = useTranslation();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [mode, setMode] = useState<DonateMode>('one_time');
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);
  const [successState, setSuccessState] = useState<{
    paymentId: string;
    amount: number;
    campaignTitle: string;
  } | null>(null);

  const selectedCampaign = useMemo(
    () => campaigns.find((item) => item._id === selectedCampaignId) || campaigns[0] || null,
    [campaigns, selectedCampaignId]
  );

  const resolveLocalizedText = useCallback(
    (localized?: LocalizedText, fallback?: string) => {
      const language = i18n.language?.split('-')[0] || 'en';
      return localized?.[language] || localized?.en || localized?.hi || fallback || '';
    },
    [i18n.language]
  );

  const fetchData = useCallback(async () => {
    try {
      const [campaignResponse, recentResponse] = await Promise.all([
        api.get('/donate'),
        api
          .get(`/donations/recent?limit=6&lang=${encodeURIComponent(i18n.language || 'en')}`)
          .catch(() => ({ data: [] })),
      ]);

      const campaignData = campaignResponse.data || [];
      setCampaigns(campaignData);
      if (!selectedCampaignId && campaignData[0]?._id) {
        setSelectedCampaignId(campaignData[0]._id);
      }
      setRecentDonations(recentResponse.data || []);
    } catch (fetchError) {
      console.error('Error fetching donation data:', fetchError);
      setError(t('donate.states.loadError'));
    } finally {
      setLoading(false);
    }
  }, [i18n.language, selectedCampaignId, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validateForm = () => {
    if (!form.amount || Number(form.amount) < 100) return t('donate.validation.amountMin');
    if (!form.fullName.trim()) return t('donate.validation.fullNameRequired');
    if (!form.email.trim()) return t('donate.validation.emailRequired');
    if (!form.mobile.trim()) return t('donate.validation.mobileRequired');
    if (!form.nationality.trim()) return t('donate.validation.nationalityRequired');
    return null;
  };

  const handleCheckout = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        amount: Number(form.amount),
        campaignId: selectedCampaign?._id,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        address: form.address.trim(),
        nationality: form.nationality.trim(),
        donationType: mode,
        panNumber: form.panNumber.trim().toUpperCase(),
        taxBenefitOptIn: form.taxBenefitOptIn,
        isAnonymous: form.isAnonymous,
        dedicationType: form.dedicationType,
        dedicatedTo: form.dedicatedTo.trim(),
        dedicationMessage: form.dedicationMessage.trim(),
        interval: 'monthly',
        customerEmail: form.email.trim(),
        source: 'mobile',
      };

      const endpoint = mode === 'subscription' ? '/create-custom-subs' : '/create-checkout-session';
      const response = await api.post(endpoint, payload);
      const data = response.data;

      setCheckoutHtml(
        buildCheckoutHtml({
          key: data.key,
          amount: Number(form.amount),
          mode,
          orderId: data.orderId,
          subscriptionId: data.subscriptionId,
          form,
          campaignTitle:
            resolveLocalizedText(selectedCampaign?.titleTranslations, selectedCampaign?.title) ||
            t('donate.generalDonation'),
        })
      );
    } catch (checkoutError) {
      console.error('Checkout error:', checkoutError);
      setError(t('donate.states.checkoutError'));
      setSubmitting(false);
    }
  };

  const handleCheckoutMessage = async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === 'dismissed') {
        setCheckoutHtml(null);
        setSubmitting(false);
        return;
      }

      if (message.type === 'failed') {
        setCheckoutHtml(null);
        setSubmitting(false);
        setError(
          message.payload?.description || t('donate.states.checkoutError')
        );
        return;
      }

      if (message.type === 'success') {
        const verification = await api.post('/verify-session', message.payload);
        if (!verification.data?.success && verification.data?.status !== 'success') {
          throw new Error('Verification failed');
        }

        setSuccessState({
          paymentId: message.payload.razorpay_payment_id,
          amount: Number(form.amount),
          campaignTitle:
            resolveLocalizedText(selectedCampaign?.titleTranslations, selectedCampaign?.title) ||
            t('donate.generalDonation'),
        });
        setCheckoutHtml(null);
        setSubmitting(false);
      }
    } catch (checkoutError) {
      console.error('Checkout verification error:', checkoutError);
      setCheckoutHtml(null);
      setSubmitting(false);
      setError(t('donate.states.verifyError'));
    }
  };

  const handleShare = async () => {
    if (!successState) return;
    await Share.share({
      title: t('donate.success.shareTitle'),
      message: t('donate.success.shareText', {
        amount: formatCurrency(successState.amount),
        campaign: successState.campaignTitle,
      }),
    });
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
    <>
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
        <LinearGradient
          colors={[colors.primary.saffron, colors.primary.maroon]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Icon name="hand-heart" size={42} color={colors.gold.light} />
          <Text style={styles.headerTitle}>{t('donate.supportMission')}</Text>
          <Text style={styles.headerSubtitle}>{t('donate.supportMissionSubtitle')}</Text>
        </LinearGradient>

        {recentDonations.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.socialProofRow}
          >
            {recentDonations.map((donation) => (
              <View key={donation.id} style={styles.socialProofChip}>
                <Icon
                  name={donation.donationType === 'subscription' ? 'repeat' : 'star-four-points'}
                  size={14}
                  color={colors.primary.saffron}
                />
                <Text style={styles.socialProofText}>
                  {t('donate.socialProofItem', {
                    name: donation.donorName,
                    amount: formatCurrency(donation.amount),
                    campaign: donation.campaignTitle,
                  })}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.section}>
          <View style={styles.toggleRow}>
            {(['one_time', 'subscription'] as DonateMode[]).map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.toggleButton, mode === item && styles.toggleButtonActive]}
                onPress={() => setMode(item)}
              >
                <Text style={[styles.toggleText, mode === item && styles.toggleTextActive]}>
                  {item === 'one_time' ? t('donate.oneTime') : t('donate.monthly')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {successState ? (
            <View style={styles.successCard}>
              <Icon name="check-decagram" size={36} color={colors.status.success} />
              <Text style={styles.successTitle}>{t('donate.success.title')}</Text>
              <Text style={styles.successSubtitle}>{t('donate.success.subtitle')}</Text>
              <View style={styles.successDetails}>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>{t('donate.success.amount')}</Text>
                  <Text style={styles.successValue}>{formatCurrency(successState.amount)}</Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>{t('donate.success.campaign')}</Text>
                  <Text style={styles.successValue}>{successState.campaignTitle}</Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>{t('donate.success.reference')}</Text>
                  <Text style={styles.successValue}>{successState.paymentId}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.primaryButton} onPress={handleShare}>
                <LinearGradient
                  colors={[colors.gold.main, colors.gold.dark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  <Icon name="share-variant" size={18} color={colors.text.white} />
                  <Text style={styles.primaryButtonText}>{t('donate.success.share')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.quickAmountsRow}>
                {quickAmounts.map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.quickAmountButton,
                      form.amount === amount && styles.quickAmountButtonActive,
                    ]}
                    onPress={() => setField('amount', amount)}
                  >
                    <Text
                      style={[
                        styles.quickAmountText,
                        form.amount === amount && styles.quickAmountTextActive,
                      ]}
                    >
                      {formatCurrency(amount)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>{t('donate.formTitle')}</Text>

              <View style={styles.formGrid}>
                <TextInput
                  style={styles.input}
                  placeholder={t('donate.amountPlaceholder')}
                  placeholderTextColor={colors.text.secondary}
                  keyboardType="numeric"
                  value={form.amount}
                  onChangeText={(value) => setField('amount', value.replace(/[^\d]/g, ''))}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t('donate.fullNameLabel')}
                  placeholderTextColor={colors.text.secondary}
                  value={form.fullName}
                  onChangeText={(value) => setField('fullName', value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t('donate.emailLabel')}
                  placeholderTextColor={colors.text.secondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={(value) => setField('email', value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t('donate.mobileLabel')}
                  placeholderTextColor={colors.text.secondary}
                  keyboardType="phone-pad"
                  value={form.mobile}
                  onChangeText={(value) => setField('mobile', value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t('donate.nationalityLabel')}
                  placeholderTextColor={colors.text.secondary}
                  value={form.nationality}
                  onChangeText={(value) => setField('nationality', value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t('donate.panLabel')}
                  placeholderTextColor={colors.text.secondary}
                  autoCapitalize="characters"
                  value={form.panNumber}
                  onChangeText={(value) => setField('panNumber', value.toUpperCase())}
                />
              </View>

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('donate.addressLabel')}
                placeholderTextColor={colors.text.secondary}
                multiline
                numberOfLines={3}
                value={form.address}
                onChangeText={(value) => setField('address', value)}
              />

              <View style={styles.dedicationCard}>
                <Text style={styles.cardTitle}>{t('donate.dedicationTitle')}</Text>
                <View style={styles.dedicationOptions}>
                  {(['general', 'memory', 'honor', 'occasion'] as FormState['dedicationType'][]).map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.dedicationOption,
                        form.dedicationType === item && styles.dedicationOptionActive,
                      ]}
                      onPress={() => setField('dedicationType', item)}
                    >
                      <Text
                        style={[
                          styles.dedicationOptionText,
                          form.dedicationType === item && styles.dedicationOptionTextActive,
                        ]}
                      >
                        {t(`donate.dedication.${item}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder={t('donate.dedicatedToLabel')}
                  placeholderTextColor={colors.text.secondary}
                  value={form.dedicatedTo}
                  onChangeText={(value) => setField('dedicatedTo', value)}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder={t('donate.messageLabel')}
                  placeholderTextColor={colors.text.secondary}
                  multiline
                  numberOfLines={3}
                  value={form.dedicationMessage}
                  onChangeText={(value) => setField('dedicationMessage', value)}
                />
              </View>

              <View style={styles.preferenceRow}>
                <View style={styles.preferenceTextWrap}>
                  <Text style={styles.preferenceTitle}>{t('donate.taxBenefitOptIn')}</Text>
                  <Text style={styles.preferenceSubtitle}>{t('donate.taxBenefitsSubtitle')}</Text>
                </View>
                <Switch
                  value={form.taxBenefitOptIn}
                  onValueChange={(value) => setField('taxBenefitOptIn', value)}
                  trackColor={{ false: '#d6c3a6', true: colors.gold.main }}
                />
              </View>

              <View style={styles.preferenceRow}>
                <View style={styles.preferenceTextWrap}>
                  <Text style={styles.preferenceTitle}>{t('donate.anonymous')}</Text>
                  <Text style={styles.preferenceSubtitle}>{t('donate.anonymousSubtitle')}</Text>
                </View>
                <Switch
                  value={form.isAnonymous}
                  onValueChange={(value) => setField('isAnonymous', value)}
                  trackColor={{ false: '#d6c3a6', true: colors.gold.main }}
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity style={styles.primaryButton} onPress={handleCheckout} disabled={submitting}>
                <LinearGradient
                  colors={[colors.gold.main, colors.gold.dark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  {submitting ? (
                    <ActivityIndicator color={colors.text.white} />
                  ) : (
                    <>
                      <Icon
                        name={mode === 'subscription' ? 'repeat' : 'gift'}
                        size={20}
                        color={colors.text.white}
                      />
                      <Text style={styles.primaryButtonText}>
                        {mode === 'subscription'
                          ? t('donate.monthlyButton', { amount: formatCurrency(form.amount) })
                          : t('donate.payButton', { amount: formatCurrency(form.amount) })}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('donate.activeCampaigns')}</Text>
          {campaigns.map((campaign) => {
            const progress = calculateProgress(campaign);
            const daysLeft = calculateDaysLeft(campaign);
            const selected = selectedCampaign?._id === campaign._id;

            return (
              <TouchableOpacity
                key={campaign._id}
                style={[styles.campaignCard, selected && styles.campaignCardActive]}
                onPress={() => setSelectedCampaignId(campaign._id)}
              >
                <ImageBackground
                  source={
                    campaign.backgroundImage
                      ? { uri: campaign.backgroundImage }
                      : undefined
                  }
                  style={styles.campaignHero}
                  imageStyle={styles.campaignHeroImage}
                >
                  <LinearGradient
                    colors={['rgba(38,17,4,0.1)', 'rgba(38,17,4,0.78)']}
                    style={styles.campaignHeroOverlay}
                  >
                    <View style={styles.campaignBadgeRow}>
                      <View style={styles.progressBadge}>
                        <Text style={styles.progressBadgeText}>{progress}% {t('donate.raised')}</Text>
                      </View>
                      {daysLeft !== null && (
                        <View style={styles.daysBadge}>
                          <Text style={styles.daysBadgeText}>
                            {t('donate.daysLeft', { count: daysLeft })}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.campaignTitle}>
                      {resolveLocalizedText(campaign.titleTranslations, campaign.title)}
                    </Text>
                    <Text style={styles.campaignSubtitle} numberOfLines={2}>
                      {resolveLocalizedText(
                        campaign.additionalTextTranslations,
                        campaign.additionalText
                      ) ||
                        resolveLocalizedText(campaign.descriptionTranslations, campaign.description)}
                    </Text>
                  </LinearGradient>
                </ImageBackground>

                <View style={styles.campaignBody}>
                  <Text style={styles.campaignDescription}>
                    {resolveLocalizedText(campaign.descriptionTranslations, campaign.description)}
                  </Text>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={[colors.gold.light, colors.gold.main]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${progress}%` }]}
                    />
                  </View>
                  <View style={styles.progressStats}>
                    <Text style={styles.progressStat}>{t('donate.raisedValue', { amount: formatCurrency(campaign.achieved) })}</Text>
                    <Text style={styles.progressStat}>{t('donate.goalValue', { amount: formatCurrency(campaign.goal) })}</Text>
                  </View>
                  <View style={styles.campaignFooter}>
                    <Text style={styles.donorCount}>
                      {t('donate.donorCount', { count: campaign.donors || 0 })}
                    </Text>
                    <Text style={styles.goalAmount}>{formatCurrency(campaign.goal)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Icon name="shield-check" size={22} color={colors.gold.dark} />
            <Text style={styles.infoTitle}>{t('donate.secureCheckoutTitle')}</Text>
            <Text style={styles.infoSubtitle}>{t('donate.secureCheckoutSubtitle')}</Text>
          </View>
          <View style={styles.infoCard}>
            <Icon name="file-certificate" size={22} color={colors.gold.dark} />
            <Text style={styles.infoTitle}>{t('donate.taxBenefitsTitle')}</Text>
            <Text style={styles.infoSubtitle}>{t('donate.taxBenefitsSubtitle')}</Text>
          </View>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      <Modal visible={Boolean(checkoutHtml)} animationType="slide" onRequestClose={() => setCheckoutHtml(null)}>
        <View style={styles.checkoutModal}>
          <View style={styles.checkoutHeader}>
            <Text style={styles.checkoutTitle}>{t('donate.checkoutTitle')}</Text>
            <TouchableOpacity onPress={() => setCheckoutHtml(null)}>
              <Icon name="close" size={24} color={colors.primary.maroon} />
            </TouchableOpacity>
          </View>
          {checkoutHtml ? (
            <WebView
              originWhitelist={['*']}
              source={{ html: checkoutHtml }}
              onMessage={handleCheckoutMessage}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              renderLoading={() => (
                <View style={styles.checkoutLoading}>
                  <ActivityIndicator size="large" color={colors.primary.saffron} />
                </View>
              )}
            />
          ) : null}
        </View>
      </Modal>
    </>
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
  },
  header: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  headerTitle: {
    marginTop: spacing.md,
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.white,
    textAlign: 'center',
  },
  headerSubtitle: {
    marginTop: spacing.sm,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  socialProofRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  socialProofChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.warmWhite,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
  },
  socialProofText: {
    maxWidth: width * 0.7,
    fontSize: 12,
    color: colors.text.primary,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.warmWhite,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    padding: spacing.lg,
    ...shadows.warm,
  },
  toggleRow: {
    flexDirection: 'row',
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.sandstone,
    padding: 4,
    marginBottom: spacing.lg,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary.maroon,
  },
  toggleText: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: colors.text.white,
  },
  quickAmountsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickAmountButton: {
    minWidth: '47%',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    backgroundColor: colors.background.parchment,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  quickAmountButtonActive: {
    backgroundColor: colors.background.sandstone,
    borderColor: colors.gold.main,
  },
  quickAmountText: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  quickAmountTextActive: {
    color: colors.primary.maroon,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  formGrid: {
    gap: spacing.sm,
  },
  input: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    backgroundColor: colors.background.parchment,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  textArea: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  dedicationCard: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.parchment,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  dedicationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dedicationOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    backgroundColor: colors.background.warmWhite,
  },
  dedicationOptionActive: {
    backgroundColor: colors.primary.maroon,
  },
  dedicationOptionText: {
    color: colors.text.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  dedicationOptionTextActive: {
    color: colors.text.white,
  },
  preferenceRow: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.parchment,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  preferenceTextWrap: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  preferenceSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.text.secondary,
  },
  errorText: {
    marginTop: spacing.md,
    color: colors.status.error,
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    color: colors.text.white,
    fontSize: 15,
    fontWeight: '700',
  },
  successCard: {
    borderRadius: borderRadius.xl,
    backgroundColor: '#F0FBF4',
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.25)',
    padding: spacing.lg,
    alignItems: 'center',
  },
  successTitle: {
    marginTop: spacing.sm,
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
  },
  successSubtitle: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 21,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  successDetails: {
    width: '100%',
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.warmWhite,
    padding: spacing.md,
    gap: spacing.sm,
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  successLabel: {
    color: colors.text.secondary,
    fontSize: 13,
  },
  successValue: {
    flex: 1,
    textAlign: 'right',
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  campaignCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.background.parchment,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
  },
  campaignCardActive: {
    borderColor: colors.gold.main,
  },
  campaignHero: {
    height: 180,
    backgroundColor: colors.primary.maroon,
  },
  campaignHeroImage: {
    resizeMode: 'cover',
  },
  campaignHeroOverlay: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  campaignBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  progressBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  progressBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary.maroon,
  },
  daysBadge: {
    backgroundColor: 'rgba(128,0,32,0.84)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  daysBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.white,
  },
  campaignTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.white,
  },
  campaignSubtitle: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.88)',
  },
  campaignBody: {
    padding: spacing.md,
  },
  campaignDescription: {
    color: colors.text.secondary,
    lineHeight: 20,
    fontSize: 13,
  },
  progressBar: {
    marginTop: spacing.md,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(212, 160, 23, 0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressStats: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  progressStat: {
    flex: 1,
    fontSize: 12,
    color: colors.text.secondary,
  },
  campaignFooter: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  donorCount: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  goalAmount: {
    color: colors.gold.dark,
    fontSize: 18,
    fontWeight: '800',
  },
  infoSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  infoCard: {
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.warmWhite,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    padding: spacing.lg,
    ...shadows.warm,
  },
  infoTitle: {
    marginTop: spacing.sm,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  infoSubtitle: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 19,
    color: colors.text.secondary,
  },
  checkoutModal: {
    flex: 1,
    backgroundColor: colors.background.warmWhite,
  },
  checkoutHeader: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.gold as string,
  },
  checkoutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  checkoutLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
