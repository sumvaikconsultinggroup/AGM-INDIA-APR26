'use client';

import { motion } from 'framer-motion';
import { Heart, BookOpen, Users, Home, Leaf, Sparkles, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';

// Icon map for dynamic icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Users,
  Home,
  Leaf,
  Heart,
  Sparkles,
};

// Fallback data in case API fails
const fallbackCauses = [
  {
    title: 'Shivganga Project',
    description: 'Transforming arid villages in Jhabua, MP through water conservation, agriculture, and skill development.',
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
    description: 'Maintaining and expanding Harihar Ashram at Kankhal, Haridwar — a sanctuary for seekers worldwide.',
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
    api.get('/donate')
      .then(r => {
        const data = r.data?.data || r.data || [];
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
    <div className="pt-20">
      {/* Hero Section with Maroon Gradient */}
      <section className="relative bg-maroon-gradient py-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-gold-400 blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-gold-300 blur-3xl animate-pulse-soft animation-delay-300" />
        </div>
        
        {/* Mandala pattern overlay */}
        <div className="absolute inset-0 bg-mandala opacity-30" />
        
        {/* Gold ornamental borders */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Heart Icon with Gold Circle */}
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow animate-breathe">
              <Heart className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-gold-200 mb-6">
              {t('hero.title')} <span className="text-gradient-gold">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="text-gold-100/80 text-lg md:text-xl leading-relaxed font-body">
              {t('hero.subtitle')}
            </p>
            
            {/* Decorative element */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <span className="w-16 h-px bg-gradient-to-r from-transparent to-gold-400" />
              <Sparkles className="w-5 h-5 text-gold-400 animate-pulse-soft" />
              <span className="w-16 h-px bg-gradient-to-l from-transparent to-gold-400" />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="divider-rangoli" />

      {returnToAppUrl && (
        <section className="bg-gold-100 border-y border-gold-300">
          <div className="container-custom py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-spiritual-maroon font-medium text-sm">{t('handoff.message')}</p>
            <a
              href={returnToAppUrl}
              className="btn-secondary px-4 py-2 text-sm"
              aria-label="Return to mobile app"
            >
              {t('handoff.returnToApp')}
            </a>
          </div>
        </section>
      )}

      {/* Causes Section */}
      <section className="section-padding bg-parchment">
        <div className="container-custom">
          {/* Section Heading */}
          <div className="text-center mb-16">
            <span className="text-gold-500 font-sanskrit text-lg tracking-wider">{t('causes.sanskritTitle')}</span>
            <h2 className="font-display text-3xl md:text-4xl text-spiritual-maroon mt-2 mb-4">
              {t('causes.title')} <span className="text-gradient-gold">{t('causes.titleHighlight')}</span>
            </h2>
            <p className="text-spiritual-warmGray max-w-xl mx-auto">
              {t('causes.subtitle')}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="w-8 h-px bg-gold-400" />
              <span className="text-gold-400">◆</span>
              <span className="w-8 h-px bg-gold-400" />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-spiritual-saffron animate-spin mb-4" />
              <p className="text-spiritual-warmGray font-body">{tCommon('loadingCauses')}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && causes.length === 0 && (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 text-gold-400 mx-auto mb-4" />
              <h3 className="font-display text-2xl text-spiritual-maroon mb-2">{t('noCauses.title')}</h3>
              <p className="text-spiritual-warmGray">{t('noCauses.subtitle')}</p>
            </div>
          )}

          {/* Causes Grid */}
          {!loading && causes.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {causes.map((cause, index) => {
                const IconComponent = getIcon(cause.icon);
                return (
                  <motion.div
                    key={cause._id || cause.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="card-temple p-6 text-center hover:shadow-temple transition-shadow duration-300"
                  >
                    {/* Icon */}
                    <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center border-2 border-gold-400/30">
                      <IconComponent className="w-8 h-8 text-spiritual-maroon" />
                    </div>
                    
                    <h3 className="font-display text-xl text-spiritual-maroon mb-3">
                      {cause.title}
                    </h3>
                    <p className="text-spiritual-warmGray text-sm mb-5 leading-relaxed">
                      {cause.description || ''}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-spiritual-warmGray mb-1">
                        <span>{cause.raised || cause.progress || 0}% {t('labels.raised')}</span>
                        <span>{t('labels.goal')}: {formatAmount(cause.amount || cause.goal)}</span>
                      </div>
                      <div className="h-2 bg-spiritual-sandstone rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${cause.raised || cause.progress || 0}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                          className="h-full rounded-full bg-gradient-to-r from-gold-400 to-spiritual-saffron"
                        />
                      </div>
                    </div>
                    
                    {/* Amount */}
                    <p className="text-2xl font-display text-gradient-gold mb-5">
                      {formatAmount(cause.amount || cause.goal)}
                    </p>
                    
                    <button
                      className="btn-gold w-full group"
                      onClick={() => handleDonate(cause)}
                      aria-label={`Donate to ${cause.title}`}
                    >
                      <Heart className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                      {t('donateNow')}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Custom Amount Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 max-w-xl mx-auto"
          >
            <div className="card-temple p-8 md:p-10">
              {/* Decorative top element */}
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h3 className="font-display text-2xl md:text-3xl text-spiritual-maroon text-center mb-2">
                {t('custom.title')}
              </h3>
              <p className="text-center text-spiritual-warmGray text-sm mb-8">
                {t('custom.subtitle')}
              </p>
              
              <div className="space-y-5">
                {/* Amount Input */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500 font-display text-xl">₹</span>
                  <input
                    type="number"
                    placeholder={t('custom.placeholder')}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value.replace(/[^\d]/g, ''))}
                    className="w-full pl-10 pr-4 py-4 rounded-xl bg-spiritual-warmWhite border-2 border-gold-300 focus:border-gold-500 focus:ring-4 focus:ring-gold-200/50 focus:outline-none text-center text-2xl font-display text-spiritual-maroon placeholder:text-spiritual-warmGray/50 transition-all duration-300"
                  />
                </div>
                
                {/* Quick amount buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {['₹501', '₹1,001', '₹2,501', '₹5,001'].map((amount) => (
                    <button
                      key={amount}
                      className="py-2 rounded-lg border-2 border-gold-300 text-spiritual-maroon font-medium hover:bg-gold-100 hover:border-gold-400 transition-colors text-sm"
                      onClick={() => setCustomAmount(amount.replace(/[^\d]/g, ''))}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
                
                <button className="btn-primary w-full py-4 text-lg group" onClick={() => handleDonate()}>
                  <Heart className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  {t('donateWithLove')} {customAmount ? `₹${customAmount}` : ''}
                </button>
              </div>
              
              {/* Trust badges */}
              <div className="mt-8 pt-6 border-t border-gold-200/50 flex items-center justify-center gap-6 text-xs text-spiritual-warmGray">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {tCommon('securePayment')}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gold-500" />
                  {tCommon('taxDeductible')}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="divider-rangoli" />

      {/* Impact Section */}
      <section className="section-padding bg-temple-warm">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl text-spiritual-maroon mb-4">
              {t('impact.title')}
            </h2>
            <p className="text-spiritual-warmGray max-w-xl mx-auto">
              {t('impact.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { value: '50,000+', label: t('impact.stats.mealsServed'), icon: '🙏' },
              { value: '2,000+', label: t('impact.stats.studentsEducated'), icon: '📿' },
              { value: '100+', label: t('impact.stats.healthcareCamps'), icon: '🕉️' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">
                  {stat.value}
                </div>
                <div className="text-spiritual-warmGray font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
