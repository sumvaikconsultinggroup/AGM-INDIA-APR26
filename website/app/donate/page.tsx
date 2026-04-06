'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock3,
  Heart,
  ImageIcon,
  Loader2,
  Repeat,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import api from '../../lib/api';
import { PageHero } from '@/components/ui/PageHero';
import { SectionHeading } from '@/components/ui/SectionHeading';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: () => void) => void;
    };
  }
}

type Campaign = {
  _id: string;
  title: string;
  description?: string;
  additionalText?: string;
  goal?: number;
  achieved?: number;
  donors?: number;
  totalDays?: number;
  createdAt?: string;
  backgroundImage?: string;
};

type RecentDonation = {
  id: string;
  donorName: string;
  amount: number;
  donatedAt: string;
  campaignTitle: string;
  donationType: 'one_time' | 'subscription';
  isAnonymous: boolean;
};

type DonateMode = 'one_time' | 'subscription';

type DonorForm = {
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

const initialForm: DonorForm = {
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

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector('script[data-razorpay="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpay = 'true';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function formatCurrency(amount: number | string | undefined) {
  const numeric =
    typeof amount === 'string'
      ? Number(String(amount).replace(/[^\d.]/g, ''))
      : Number(amount || 0);
  return `₹${numeric.toLocaleString('en-IN')}`;
}

function calculateDaysLeft(campaign: Campaign) {
  if (!campaign.createdAt || !campaign.totalDays) return null;
  const created = new Date(campaign.createdAt);
  const end = new Date(created);
  end.setDate(end.getDate() + campaign.totalDays);
  const diff = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function getProgress(campaign: Campaign) {
  const goal = Number(campaign.goal || 0);
  const achieved = Number(campaign.achieved || 0);
  if (!goal) return 0;
  return Math.max(0, Math.min(100, Math.round((achieved / goal) * 100)));
}

export default function DonatePage() {
  const { t, i18n } = useTranslation('donate');
  const { t: tCommon } = useTranslation('common');
  const searchParams = useSearchParams();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [mode, setMode] = useState<DonateMode>('one_time');
  const [form, setForm] = useState<DonorForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [returnToAppUrl, setReturnToAppUrl] = useState<string | null>(null);
  const [successState, setSuccessState] = useState<{
    paymentId: string;
    orderOrSubscriptionId: string;
    amount: number;
    campaignTitle: string;
  } | null>(null);

  const localeByLanguage: Record<string, string> = {
    en: 'en-IN',
    hi: 'hi-IN',
    bn: 'bn-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    mr: 'mr-IN',
    gu: 'gu-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    pa: 'pa-IN',
    or: 'or-IN',
    as: 'as-IN',
  };
  const dateLocale = localeByLanguage[i18n.language] || 'en-IN';

  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign._id === selectedCampaignId) || campaigns[0] || null,
    [campaigns, selectedCampaignId]
  );

  useEffect(() => {
    const amountFromQuery = searchParams.get('amount');
    const campaignIdFromQuery = searchParams.get('campaignId');
    const returnTo = searchParams.get('returnTo');

    if (amountFromQuery) {
      setForm((current) => ({
        ...current,
        amount: amountFromQuery.replace(/[^\d]/g, '') || current.amount,
      }));
    }

    if (campaignIdFromQuery) {
      setSelectedCampaignId(campaignIdFromQuery);
    }

    if (returnTo && /^[-a-zA-Z0-9+.]+:\/\//.test(returnTo)) {
      setReturnToAppUrl(returnTo);
    }
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.get('/donate'),
      api.get('/donations/recent?limit=8').catch(() => ({ data: [] })),
      loadRazorpayScript(),
    ])
      .then(([campaignResponse, recentResponse, razorpayLoaded]) => {
        if (!mounted) return;
        const campaignData = campaignResponse.data?.data || campaignResponse.data || [];
        setCampaigns(campaignData);
        if (!selectedCampaignId && campaignData[0]?._id) {
          setSelectedCampaignId(campaignData[0]._id);
        }
        setRecentDonations(recentResponse.data?.data || recentResponse.data || []);
        setCheckoutReady(razorpayLoaded);
      })
      .catch((requestError) => {
        if (!mounted) return;
        console.error('Failed to load donate page data:', requestError);
        setError(t('states.loadError'));
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [selectedCampaignId, t]);

  const setField = <K extends keyof DonorForm>(field: K, value: DonorForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validateForm = () => {
    if (!form.amount || Number(form.amount) < 100) {
      return t('validation.amountMin');
    }
    if (!form.fullName.trim()) return t('validation.fullNameRequired');
    if (!form.email.trim()) return t('validation.emailRequired');
    if (!form.mobile.trim()) return t('validation.mobileRequired');
    if (!form.nationality.trim()) return t('validation.nationalityRequired');
    if (!checkoutReady) return t('validation.checkoutUnavailable');
    return null;
  };

  const handleCheckout = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    const endpoint = mode === 'subscription' ? '/create-custom-subs' : '/create-checkout-session';
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
      source: returnToAppUrl ? 'mobile' : 'website',
    };

    try {
      const response = await api.post(endpoint, payload);
      const data = response.data?.data || response.data;

      const options: Record<string, unknown> = {
        key: data.key,
        amount: Number(form.amount) * 100,
        currency: data.currency || 'INR',
        name: 'AvdheshanandG Mission',
        description:
          mode === 'subscription'
            ? t('checkout.subscriptionDescription')
            : t('checkout.oneTimeDescription'),
        prefill: {
          name: form.fullName.trim(),
          email: form.email.trim(),
          contact: form.mobile.trim(),
        },
        notes: {
          campaignTitle: selectedCampaign?.title || 'General Donation',
          donationType: mode,
        },
        theme: { color: '#B57B1D' },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
        },
        handler: async (paymentResponse: Record<string, string>) => {
          try {
            const verification = await api.post('/verify-session', paymentResponse);
            const verified = verification.data?.success ?? verification.data?.status === 'success';
            if (!verified) {
              throw new Error('Verification failed');
            }

            setSuccessState({
              paymentId: paymentResponse.razorpay_payment_id,
              orderOrSubscriptionId:
                paymentResponse.razorpay_order_id ||
                paymentResponse.razorpay_subscription_id ||
                '',
              amount: Number(form.amount),
              campaignTitle: selectedCampaign?.title || t('summary.generalDonation'),
            });
            setSubmitting(false);
          } catch (verificationError) {
            console.error('Failed to verify payment:', verificationError);
            setError(t('states.verifyError'));
            setSubmitting(false);
          }
        },
      };

      if (mode === 'subscription') {
        options.subscription_id = data.subscriptionId;
      } else {
        options.order_id = data.orderId;
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay checkout is unavailable');
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (checkoutError) {
      console.error('Donation checkout failed:', checkoutError);
      setError(t('states.checkoutError'));
      setSubmitting(false);
    }
  };

  const shareImpact = async () => {
    if (!successState || typeof navigator === 'undefined' || !navigator.share) return;

    try {
      await navigator.share({
        title: t('success.shareTitle'),
        text: t('success.shareText', {
          amount: formatCurrency(successState.amount),
          campaign: successState.campaignTitle,
        }),
      });
    } catch {
      // user dismissed share
    }
  };

  return (
    <div className="bg-parchment pt-20">
      <PageHero
        tone="dark"
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        highlight={t('hero.titleHighlight')}
        subtitle={t('hero.subtitle')}
        icon={<Heart className="h-8 w-8" />}
      />

      {returnToAppUrl && (
        <section className="border-b border-[rgba(122,86,26,0.12)] bg-[rgba(247,234,192,0.72)]">
          <div className="container-custom flex flex-col items-start justify-between gap-3 py-4 sm:flex-row sm:items-center">
            <p className="text-sm font-medium text-spiritual-maroon">{t('handoff.message')}</p>
            <a href={returnToAppUrl} className="btn-secondary px-4 py-2 text-sm">
              {t('handoff.returnToApp')}
            </a>
          </div>
        </section>
      )}

      <section className="section-padding bg-parchment">
        <div className="container-custom">
          <SectionHeading
            eyebrow={t('overview.eyebrow')}
            title={t('overview.title')}
            subtitle={t('overview.subtitle')}
          />

          {recentDonations.length > 0 && (
            <div className="mb-8 overflow-hidden rounded-full border border-[rgba(122,86,26,0.12)] bg-white/92 px-4 py-3 shadow-[0_18px_42px_rgba(60,34,12,0.08)]">
              <div className="flex flex-wrap items-center gap-3 text-sm text-spiritual-maroon">
                <Sparkles className="h-4 w-4 text-gold-600" />
                {recentDonations.map((donation) => (
                  <span
                    key={donation.id}
                    className="rounded-full bg-[rgba(247,234,192,0.78)] px-3 py-1.5 text-xs font-semibold"
                  >
                    {t('socialProof.item', {
                      name: donation.donorName,
                      amount: formatCurrency(donation.amount),
                      campaign: donation.campaignTitle,
                    })}
                  </span>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-spiritual-saffron" />
              <p className="text-spiritual-warmGray">{tCommon('loadingCauses')}</p>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {campaigns.map((campaign, index) => {
                    const progress = getProgress(campaign);
                    const daysLeft = calculateDaysLeft(campaign);
                    const isSelected = selectedCampaign?._id === campaign._id;

                    return (
                      <motion.article
                        key={campaign._id}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.04 }}
                        className={`overflow-hidden rounded-[28px] border ${
                          isSelected
                            ? 'border-[rgba(181,123,29,0.42)] shadow-[0_22px_56px_rgba(181,123,29,0.16)]'
                            : 'border-[rgba(122,86,26,0.12)] shadow-[0_18px_42px_rgba(60,34,12,0.08)]'
                        } bg-white/92`}
                      >
                        <button type="button" className="block w-full text-left" onClick={() => setSelectedCampaignId(campaign._id)}>
                          <div className="relative h-52 bg-[linear-gradient(135deg,#f2e0b1,#b57b1d)]">
                            {campaign.backgroundImage ? (
                              <img
                                src={campaign.backgroundImage}
                                alt={campaign.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-white/80">
                                <ImageIcon className="h-10 w-10" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(38,17,4,0.02),rgba(38,17,4,0.78))]" />
                            <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-3">
                              <span className="rounded-full bg-white/88 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-spiritual-maroon">
                                {progress}% {t('labels.raised')}
                              </span>
                              {daysLeft !== null && (
                                <span className="rounded-full bg-[rgba(128,0,32,0.84)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                                  {t('labels.daysLeft', { count: daysLeft })}
                                </span>
                              )}
                            </div>
                            <div className="absolute bottom-5 left-5 right-5">
                              <h3 className="font-display text-3xl leading-tight text-white">{campaign.title}</h3>
                              <p className="mt-2 text-sm leading-relaxed text-white/82">
                                {campaign.additionalText || campaign.description}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-5 p-6">
                            <p className="text-sm leading-relaxed text-spiritual-warmGray">
                              {campaign.description}
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-spiritual-warmGray">
                                <span>
                                  {t('labels.raisedValue', {
                                    amount: formatCurrency(campaign.achieved || 0),
                                  })}
                                </span>
                                <span>
                                  {t('labels.goalValue', {
                                    amount: formatCurrency(campaign.goal || 0),
                                  })}
                                </span>
                              </div>
                              <div className="h-2.5 overflow-hidden rounded-full bg-[rgba(122,86,26,0.12)]">
                                <div
                                  className="h-full rounded-full bg-[linear-gradient(90deg,#b57b1d,#d6a647)]"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-spiritual-maroon">
                              <span className="inline-flex items-center gap-2 font-medium">
                                <Users className="h-4 w-4 text-gold-600" />
                                {t('labels.donorCount', { count: campaign.donors || 0 })}
                              </span>
                              <span className="font-display text-xl text-gradient-gold">
                                {formatCurrency(campaign.goal || 0)}
                              </span>
                            </div>
                          </div>
                        </button>
                      </motion.article>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[30px] border border-[rgba(122,86,26,0.12)] bg-white/94 p-8 shadow-[0_20px_48px_rgba(60,34,12,0.08)]">
                  <SectionHeading
                    eyebrow={t('form.eyebrow')}
                    title={t('form.title')}
                    subtitle={t('form.subtitle')}
                    align="left"
                  />

                  <div className="mt-6 grid grid-cols-2 gap-3 rounded-full bg-[rgba(248,243,232,0.9)] p-1">
                    {(['one_time', 'subscription'] as DonateMode[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setMode(type)}
                        className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                          mode === type
                            ? 'bg-spiritual-maroon text-white shadow-[0_12px_26px_rgba(93,13,31,0.18)]'
                            : 'text-spiritual-maroon'
                        }`}
                      >
                        {type === 'one_time' ? t('form.oneTime') : t('form.monthly')}
                      </button>
                    ))}
                  </div>

                  {successState ? (
                    <div className="mt-6 space-y-5 rounded-[24px] border border-[rgba(29,122,64,0.14)] bg-[rgba(239,252,243,0.96)] p-6">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-[rgba(29,122,64,0.12)] p-3 text-[#1D7A40]">
                          <CheckCircle2 className="h-7 w-7" />
                        </div>
                        <div>
                          <h3 className="font-display text-2xl text-spiritual-maroon">{t('success.title')}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-spiritual-warmGray">
                            {t('success.subtitle')}
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-3 rounded-[20px] bg-white/88 p-4 text-sm text-spiritual-maroon">
                        <div className="flex items-center justify-between">
                          <span>{t('success.amount')}</span>
                          <strong>{formatCurrency(successState.amount)}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{t('success.campaign')}</span>
                          <strong>{successState.campaignTitle}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{t('success.reference')}</span>
                          <strong>{successState.paymentId}</strong>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button type="button" className="btn-primary" onClick={shareImpact}>
                          <Sparkles className="mr-2 h-4 w-4" />
                          {t('success.share')}
                        </button>
                        {returnToAppUrl && (
                          <a href={returnToAppUrl} className="btn-secondary">
                            {t('success.returnToApp')}
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {quickAmounts.map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => setField('amount', amount)}
                            className={`rounded-full border px-4 py-3 text-sm font-semibold transition ${
                              form.amount === amount
                                ? 'border-[rgba(181,123,29,0.42)] bg-[rgba(247,234,192,0.72)] text-spiritual-maroon'
                                : 'border-[rgba(122,86,26,0.16)] bg-white text-spiritual-maroon'
                            }`}
                          >
                            {formatCurrency(amount)}
                          </button>
                        ))}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-spiritual-maroon">{t('form.amountLabel')}</span>
                          <input
                            type="number"
                            value={form.amount}
                            onChange={(event) => setField('amount', event.target.value.replace(/[^\d]/g, ''))}
                            placeholder={t('form.amountPlaceholder')}
                            className="w-full rounded-2xl border border-[rgba(122,86,26,0.14)] bg-[rgba(248,243,232,0.88)] px-4 py-3 text-spiritual-maroon outline-none focus:border-[rgba(122,86,26,0.3)]"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-spiritual-maroon">{t('form.fullNameLabel')}</span>
                          <input
                            type="text"
                            value={form.fullName}
                            onChange={(event) => setField('fullName', event.target.value)}
                            placeholder={t('form.fullNamePlaceholder')}
                            className="w-full rounded-2xl border border-[rgba(122,86,26,0.14)] bg-[rgba(248,243,232,0.88)] px-4 py-3 text-spiritual-maroon outline-none focus:border-[rgba(122,86,26,0.3)]"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-spiritual-maroon">{t('form.emailLabel')}</span>
                          <input
                            type="email"
                            value={form.email}
                            onChange={(event) => setField('email', event.target.value)}
                            placeholder={t('form.emailPlaceholder')}
                            className="w-full rounded-2xl border border-[rgba(122,86,26,0.14)] bg-[rgba(248,243,232,0.88)] px-4 py-3 text-spiritual-maroon outline-none focus:border-[rgba(122,86,26,0.3)]"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-spiritual-maroon">{t('form.mobileLabel')}</span>
                          <input
                            type="tel"
                            value={form.mobile}
                            onChange={(event) => setField('mobile', event.target.value)}
                            placeholder={t('form.mobilePlaceholder')}
                            className="w-full rounded-2xl border border-[rgba(122,86,26,0.14)] bg-[rgba(248,243,232,0.88)] px-4 py-3 text-spiritual-maroon outline-none focus:border-[rgba(122,86,26,0.3)]"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-spiritual-maroon">{t('form.nationalityLabel')}</span>
                          <select
                            value={form.nationality}
                            onChange={(event) => setField('nationality', event.target.value)}
                            className="w-full rounded-2xl border border-[rgba(122,86,26,0.14)] bg-[rgba(248,243,232,0.88)] px-4 py-3 text-spiritual-maroon outline-none focus:border-[rgba(122,86,26,0.3)]"
                          >
                            <option value="Indian">{t('form.nationalityIndian')}</option>
                            <option value="Foreign">{t('form.nationalityForeign')}</option>
                          </select>
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-spiritual-maroon">{t('form.panLabel')}</span>
                          <input
                            type="text"
                            value={form.panNumber}
                            onChange={(event) => setField('panNumber', event.target.value.toUpperCase())}
                            placeholder={t('form.panPlaceholder')}
                            className="w-full rounded-2xl border border-[rgba(122,86,26,0.14)] bg-[rgba(248,243,232,0.88)] px-4 py-3 text-spiritual-maroon outline-none focus:border-[rgba(122,86,26,0.3)]"
                          />
                        </label>
                      </div>

                      <label className="space-y-2">
                        <span className="text-sm font-medium text-spiritual-maroon">{t('form.addressLabel')}</span>
                        <textarea
                          rows={3}
                          value={form.address}
                          onChange={(event) => setField('address', event.target.value)}
                          placeholder={t('form.addressPlaceholder')}
                          className="w-full rounded-2xl border border-[rgba(122,86,26,0.14)] bg-[rgba(248,243,232,0.88)] px-4 py-3 text-spiritual-maroon outline-none focus:border-[rgba(122,86,26,0.3)]"
                        />
                      </label>

                      <div className="rounded-[24px] border border-[rgba(122,86,26,0.12)] bg-[rgba(248,243,232,0.76)] p-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-spiritual-maroon">{t('form.dedicationTypeLabel')}</span>
                            <select
                              value={form.dedicationType}
                              onChange={(event) =>
                                setField('dedicationType', event.target.value as DonorForm['dedicationType'])
                              }
                              className="w-full rounded-2xl border border-[rgba(122,86,26,0.14)] bg-white px-4 py-3 text-spiritual-maroon outline-none focus:border-[rgba(122,86,26,0.3)]"
                            >
                              <option value="general">{t('form.dedicationGeneral')}</option>
                              <option value="memory">{t('form.dedicationMemory')}</option>
                              <option value="honor">{t('form.dedicationHonor')}</option>
                              <option value="occasion">{t('form.dedicationOccasion')}</option>
                            </select>
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-spiritual-maroon">{t('form.dedicatedToLabel')}</span>
                            <input
                              type="text"
                              value={form.dedicatedTo}
                              onChange={(event) => setField('dedicatedTo', event.target.value)}
                              placeholder={t('form.dedicatedToPlaceholder')}
                              className="w-full rounded-2xl border border-[rgba(122,86,26,0.14)] bg-white px-4 py-3 text-spiritual-maroon outline-none focus:border-[rgba(122,86,26,0.3)]"
                            />
                          </label>
                        </div>
                        <label className="mt-4 block space-y-2">
                          <span className="text-sm font-medium text-spiritual-maroon">{t('form.messageLabel')}</span>
                          <textarea
                            rows={3}
                            value={form.dedicationMessage}
                            onChange={(event) => setField('dedicationMessage', event.target.value)}
                            placeholder={t('form.messagePlaceholder')}
                            className="w-full rounded-2xl border border-[rgba(122,86,26,0.14)] bg-white px-4 py-3 text-spiritual-maroon outline-none focus:border-[rgba(122,86,26,0.3)]"
                          />
                        </label>
                      </div>

                      <div className="space-y-3 rounded-[24px] border border-[rgba(122,86,26,0.12)] bg-[rgba(248,243,232,0.76)] p-4">
                        <label className="flex items-center gap-3 text-sm text-spiritual-maroon">
                          <input
                            type="checkbox"
                            checked={form.taxBenefitOptIn}
                            onChange={(event) => setField('taxBenefitOptIn', event.target.checked)}
                            className="h-4 w-4 accent-[#B57B1D]"
                          />
                          {t('form.taxBenefitOptIn')}
                        </label>
                        <label className="flex items-center gap-3 text-sm text-spiritual-maroon">
                          <input
                            type="checkbox"
                            checked={form.isAnonymous}
                            onChange={(event) => setField('isAnonymous', event.target.checked)}
                            className="h-4 w-4 accent-[#B57B1D]"
                          />
                          {t('form.anonymous')}
                        </label>
                      </div>

                      {error && (
                        <div className="rounded-2xl border border-[rgba(201,58,58,0.18)] bg-[rgba(255,241,241,0.96)] px-4 py-3 text-sm text-[#9a2626]">
                          {error}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleCheckout}
                        disabled={submitting}
                        className="btn-primary w-full py-4 text-base disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {t('states.processing')}
                          </>
                        ) : (
                          <>
                            {mode === 'subscription' ? <Repeat className="mr-2 h-5 w-5" /> : <Heart className="mr-2 h-5 w-5" />}
                            {mode === 'subscription'
                              ? t('checkout.monthlyButton', { amount: formatCurrency(form.amount || 0) })
                              : t('checkout.payButton', { amount: formatCurrency(form.amount || 0) })}
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="mt-6 grid gap-3 rounded-[24px] bg-[rgba(248,243,232,0.72)] p-5 text-sm text-spiritual-maroon">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 text-gold-600" />
                      <div>
                        <p className="font-semibold">{t('trust.secureTitle')}</p>
                        <p className="text-spiritual-warmGray">{t('trust.secureSubtitle')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 h-5 w-5 text-gold-600" />
                      <div>
                        <p className="font-semibold">{t('trust.receiptTitle')}</p>
                        <p className="text-spiritual-warmGray">{t('trust.receiptSubtitle')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
