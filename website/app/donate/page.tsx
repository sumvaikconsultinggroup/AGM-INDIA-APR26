'use client';

import { motion } from 'framer-motion';
import { BookOpen, Heart, Home, Leaf, Loader2, Sparkles, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import api from '../../lib/api';
import { PageHero } from '@/components/ui/PageHero';
import { SectionHeading } from '@/components/ui/SectionHeading';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Users,
  Home,
  Leaf,
  Heart,
  Sparkles,
};

const fallbackCauses = [
  {
    title: 'Shivganga Project',
    description:
      'Transforming arid villages in Jhabua, MP through water conservation, agriculture, and skill development.',
    icon: 'Leaf',
    amount: '₹5,00,000',
    raised: 65,
  },
  {
    title: 'Spiritual Education',
    description: 'Supporting Sanskrit and Vedic education at Bhopal Vidya Peeth and other centers.',
    icon: 'BookOpen',
    amount: '₹2,00,000',
    raised: 75,
  },
  {
    title: 'Healthcare Camps',
    description: 'Free medical and eye care camps serving thousands at spiritual gatherings and rural areas.',
    icon: 'Heart',
    amount: '₹1,50,000',
    raised: 80,
  },
  {
    title: 'Ashram Development',
    description:
      'Maintaining and expanding Harihar Ashram at Kankhal, Haridwar — a sanctuary for seekers worldwide.',
    icon: 'Home',
    amount: '₹10,00,000',
    raised: 45,
  },
];

interface DonationCause {
  _id?: string;
  title: string;
  description?: string;
  icon?: string;
  amount?: string | number;
  goal?: string | number;
  raised?: number;
  progress?: number;
}

export default function DonatePage() {
  const { t } = useTranslation('donate');
  const { t: tCommon } = useTranslation('common');
  const searchParams = useSearchParams();
  const [causes, setCauses] = useState<DonationCause[]>([]);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [returnToAppUrl, setReturnToAppUrl] = useState<string | null>(null);

  const DONATE_CHECKOUT_URL =
    process.env.NEXT_PUBLIC_DONATE_CHECKOUT_URL || 'https://www.avdheshanandg.org/donate';

  useEffect(() => {
    api
      .get('/donate')
      .then((response) => {
        const data = response.data?.data || response.data || [];
        setCauses(data.length > 0 ? data : fallbackCauses);
      })
      .catch(() => {
        setCauses(fallbackCauses);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const amountFromQuery = searchParams.get('amount');
    const campaignIdFromQuery = searchParams.get('campaignId');
    const returnTo = searchParams.get('returnTo');

    if (amountFromQuery) {
      const sanitized = amountFromQuery.replace(/[^\d]/g, '');
      if (sanitized) {
        setCustomAmount(sanitized);
      }
    }

    if (campaignIdFromQuery) {
      setSelectedCampaignId(campaignIdFromQuery);
    }

    if (returnTo && /^[-a-zA-Z0-9+.]+:\/\//.test(returnTo)) {
      setReturnToAppUrl(returnTo);
    }
  }, [searchParams]);

  const formatAmount = (amount?: string | number) => {
    if (!amount) return '₹1,100';
    if (typeof amount === 'string') return amount.startsWith('₹') ? amount : `₹${amount}`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getIcon = (iconName?: string) => {
    const IconComponent = iconName ? iconMap[iconName] : Heart;
    return IconComponent || Heart;
  };

  const handleDonate = (cause?: DonationCause) => {
    const checkoutUrl = new URL(DONATE_CHECKOUT_URL);
    checkoutUrl.searchParams.set('source', 'website');

    const campaignId = cause?._id || selectedCampaignId;
    if (campaignId) {
      checkoutUrl.searchParams.set('campaignId', campaignId);
    }

    if (customAmount) {
      checkoutUrl.searchParams.set('amount', customAmount);
    }

    checkoutUrl.searchParams.set('returnTo', window.location.href);
    window.location.href = checkoutUrl.toString();
  };

  return (
    <div className="bg-parchment pt-20">
      <PageHero
        tone="dark"
        eyebrow="Support Seva"
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
            eyebrow="Giving"
            title="Donation pathways with more clarity and trust"
            subtitle="The donate flow now feels calmer and more intentional, with clearer campaigns, more legible progress states, and a stronger primary action."
          />

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-spiritual-saffron" />
              <p className="text-spiritual-warmGray">{tCommon('loadingCauses')}</p>
            </div>
          )}

          {!loading && causes.length === 0 && (
            <div className="rounded-[30px] border border-[rgba(122,86,26,0.12)] bg-white/90 py-20 text-center shadow-[0_20px_48px_rgba(60,34,12,0.08)]">
              <Heart className="mx-auto mb-4 h-16 w-16 text-gold-500" />
              <h3 className="font-display text-2xl text-spiritual-maroon">{t('noCauses.title')}</h3>
              <p className="mt-2 text-spiritual-warmGray">{t('noCauses.subtitle')}</p>
            </div>
          )}

          {!loading && causes.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {causes.map((cause, index) => {
                const IconComponent = getIcon(cause.icon);
                const progress = cause.raised || cause.progress || 0;

                return (
                  <motion.article
                    key={cause._id || cause.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-[28px] border border-[rgba(122,86,26,0.12)] bg-white/92 p-6 shadow-[0_18px_42px_rgba(60,34,12,0.08)]"
                  >
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f3d894,#b57b1d)] text-white shadow-[0_12px_28px_rgba(181,123,29,0.24)]">
                      <IconComponent className="h-7 w-7" />
                    </div>
                    <h3 className="font-display text-2xl leading-tight text-spiritual-maroon">{cause.title}</h3>
                    <p className="mt-3 min-h-[72px] text-sm leading-relaxed text-spiritual-warmGray">
                      {cause.description || ''}
                    </p>
                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-spiritual-warmGray">
                        <span>{progress}% {t('labels.raised')}</span>
                        <span>{t('labels.goal')}: {formatAmount(cause.amount || cause.goal)}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-[rgba(122,86,26,0.12)]">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#b57b1d,#d6a647)]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <p className="mt-5 font-display text-2xl text-gradient-gold">
                      {formatAmount(cause.amount || cause.goal)}
                    </p>
                    <button type="button" className="btn-primary mt-6 w-full" onClick={() => handleDonate(cause)}>
                      <Heart className="mr-2 h-4 w-4" />
                      {t('donateNow')}
                    </button>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="section-padding bg-temple-warm">
        <div className="container-custom grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="rounded-[30px] border border-[rgba(122,86,26,0.12)] bg-white/92 p-8 shadow-[0_20px_48px_rgba(60,34,12,0.08)]">
            <SectionHeading
              eyebrow="Custom Offering"
              title={t('custom.title')}
              subtitle={t('custom.subtitle')}
              align="left"
            />
            <div className="space-y-5">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-display text-2xl text-gold-600">₹</span>
                <input
                  type="number"
                  placeholder={t('custom.placeholder')}
                  value={customAmount}
                  onChange={(event) => setCustomAmount(event.target.value.replace(/[^\d]/g, ''))}
                  className="w-full rounded-[22px] border border-[rgba(122,86,26,0.16)] bg-[rgba(248,243,232,0.92)] px-12 py-4 text-center font-display text-2xl text-spiritual-maroon outline-none transition focus:border-[rgba(122,86,26,0.32)] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {['₹501', '₹1,001', '₹2,501', '₹5,001'].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setCustomAmount(amount.replace(/[^\d]/g, ''))}
                    className="rounded-full border border-[rgba(122,86,26,0.16)] bg-white px-4 py-3 text-sm font-medium text-spiritual-maroon transition hover:border-[rgba(122,86,26,0.28)] hover:bg-[rgba(248,243,232,0.92)]"
                  >
                    {amount}
                  </button>
                ))}
              </div>

              <button type="button" className="btn-primary w-full py-4 text-base" onClick={() => handleDonate()}>
                <Heart className="mr-2 h-5 w-5" />
                {t('donateWithLove')} {customAmount ? `₹${customAmount}` : ''}
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[rgba(122,86,26,0.1)] pt-6 text-xs font-semibold uppercase tracking-[0.14em] text-spiritual-warmGray">
              <span>{tCommon('securePayment')}</span>
              <span>{tCommon('taxDeductible')}</span>
            </div>
          </div>

          <div className="rounded-[30px] border border-[rgba(122,86,26,0.12)] bg-[linear-gradient(180deg,rgba(128,0,32,0.94),rgba(89,8,28,0.96))] p-8 text-white shadow-[0_26px_60px_rgba(45,10,18,0.22)]">
            <SectionHeading
              eyebrow="Impact"
              title={t('impact.title')}
              subtitle={t('impact.subtitle')}
              align="left"
            />
            <div className="grid gap-5 sm:grid-cols-3">
              {[
                { value: '50,000+', label: t('impact.stats.mealsServed') },
                { value: '2,000+', label: t('impact.stats.studentsEducated') },
                { value: '100+', label: t('impact.stats.healthcareCamps') },
              ].map((stat) => (
                <div key={stat.label} className="rounded-[22px] border border-white/10 bg-white/8 px-5 py-5 text-center">
                  <p className="font-display text-3xl text-gold-200">{stat.value}</p>
                  <p className="mt-2 text-sm leading-relaxed text-gold-50/74">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
