'use client';

import { motion } from 'framer-motion';
import {
  Award,
  Calendar,
  CheckCircle,
  Globe,
  Heart,
  Loader2,
  MapPin,
  Send,
  Users,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';
import { PageHero } from '@/components/ui/PageHero';
import { SectionHeading } from '@/components/ui/SectionHeading';

const volunteerAreas = [
  {
    title: 'Kumbh Mela Seva',
    description:
      "Join the sacred service during Maha Kumbh — from devotee assistance to environmental stewardship at the world's largest gathering.",
    icon: Calendar,
    volunteers: '5,000+',
  },
  {
    title: 'Ashram Seva',
    description:
      'Contribute to daily operations at Harihar Ashram, Kankhal — hospitality, kitchen service, maintenance, and spiritual program support.',
    icon: MapPin,
    volunteers: '500+',
  },
  {
    title: 'Community Outreach',
    description:
      'Participate in healthcare camps, food distribution drives, and education programs in underserved communities across India.',
    icon: Users,
    volunteers: '1,000+',
  },
];

const impactStats = [
  { value: '5,000+', label: 'Active Volunteers', icon: Users },
  { value: '100+', label: 'Events Organized', icon: Calendar },
  { value: '50+', label: 'Cities Reached', icon: Globe },
  { value: '50,000+', label: 'Lives Touched', icon: Heart },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  areaOfInterest: string;
  availability: string[];
  message: string;
}

export default function VolunteerPage() {
  const { t } = useTranslation('volunteer');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    areaOfInterest: '',
    availability: [],
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleAvailabilityChange = (option: string) => {
    setFormData((previous) => ({
      ...previous,
      availability: previous.availability.includes(option)
        ? previous.availability.filter((value) => value !== option)
        : [...previous.availability, option],
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitStatus('idle');

    try {
      await api.post('/volunteer', formData);
      setSubmitStatus('success');
      setStatusMessage('Thank you for your interest in volunteering. Our team will reach out soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        areaOfInterest: '',
        availability: [],
        message: '',
      });

      setTimeout(() => {
        setSubmitStatus('idle');
        setStatusMessage('');
      }, 5000);
    } catch (error) {
      setSubmitStatus('error');
      setStatusMessage('We could not submit your application right now. Please try again shortly.');
      console.error('Volunteer form error:', error);

      setTimeout(() => {
        setSubmitStatus('idle');
        setStatusMessage('');
      }, 5000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-parchment pt-20">
      <PageHero
        tone="dark"
        eyebrow={t('hero.sanskritTitle')}
        title={t('hero.title')}
        highlight={t('hero.titleHighlight')}
        subtitle={t('hero.subtitle')}
        icon={<Heart className="h-8 w-8" />}
        actions={
          <>
            <a href="#register" className="btn-gold">
              {t('hero.ctaJoin')}
            </a>
            <a href="#areas" className="btn-ghost rounded-full border border-white/18 px-6 py-3 text-white hover:bg-white/8">
              {t('hero.ctaLearn')}
            </a>
          </>
        }
      />

      <section className="section-padding bg-parchment">
        <div className="container-custom">
          <SectionHeading
            eyebrow="Impact"
            title="Service at scale, presented with more clarity"
            subtitle="Instead of decorative overload, the volunteer experience now focuses on credibility, outcomes, and a cleaner path to participation."
          />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {impactStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="rounded-[28px] border border-[rgba(122,86,26,0.12)] bg-white/92 p-6 text-center shadow-[0_18px_42px_rgba(60,34,12,0.08)]"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f3d894,#b57b1d)] text-white shadow-[0_14px_30px_rgba(181,123,29,0.24)]">
                  <stat.icon className="h-8 w-8" />
                </div>
                <p className="font-display text-3xl text-spiritual-maroon">{stat.value}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.16em] text-spiritual-warmGray">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="areas" className="section-padding bg-temple-warm">
        <div className="container-custom">
          <SectionHeading
            eyebrow="Volunteer Areas"
            title="Ways to serve"
            subtitle="Each opportunity is now framed as a clear participation path, making it easier to understand where time and energy can help most."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {volunteerAreas.map((area, index) => (
              <motion.article
                key={area.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="rounded-[28px] border border-[rgba(122,86,26,0.12)] bg-white/92 p-7 shadow-[0_18px_42px_rgba(60,34,12,0.08)]"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f3d894,#b57b1d)] text-white shadow-[0_12px_28px_rgba(181,123,29,0.24)]">
                  <area.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-2xl leading-tight text-spiritual-maroon">{area.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-spiritual-warmGray">{area.description}</p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[rgba(128,0,32,0.06)] px-4 py-2 text-sm font-medium text-spiritual-saffron">
                  <Users className="h-4 w-4" />
                  {area.volunteers} volunteers
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="register" className="section-padding bg-parchment">
        <div className="container-custom grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="rounded-[30px] border border-[rgba(122,86,26,0.12)] bg-[linear-gradient(180deg,rgba(128,0,32,0.94),rgba(89,8,28,0.96))] p-8 text-white shadow-[0_26px_60px_rgba(45,10,18,0.22)]">
            <SectionHeading
              eyebrow="Why Volunteer"
              title="Seva as lived practice"
              subtitle="Volunteering is presented here not as a utility task, but as a spiritual offering grounded in humility, care, and participation."
              align="left"
            />
            <div className="space-y-4">
              {[
                'Serve devotees, communities, and ashram initiatives with presence and dignity.',
                'Learn directly through participation in dharmic and humanitarian work.',
                'Offer time, attention, and skills where they can create measurable impact.',
              ].map((point) => (
                <div key={point} className="rounded-[20px] border border-white/10 bg-white/8 px-5 py-4 text-sm leading-relaxed text-gold-50/78">
                  {point}
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-[22px] border border-white/10 bg-white/8 p-5">
              <div className="mb-2 flex items-center gap-2 text-gold-200">
                <Award className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-[0.28em]">Reflection</span>
              </div>
              <p className="font-spiritual text-2xl leading-relaxed text-white">
                “Seva is not only action. It is a way of softening the ego and widening the heart.”
              </p>
            </div>
          </div>

          <div className="rounded-[30px] border border-[rgba(122,86,26,0.12)] bg-white/92 p-8 shadow-[0_20px_48px_rgba(60,34,12,0.08)] md:p-10">
            <SectionHeading
              eyebrow="Application"
              title={t('register.title')}
              subtitle={t('register.subtitle')}
              align="left"
            />

            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-start gap-3 rounded-[20px] border border-green-200 bg-green-50 px-4 py-4"
              >
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <p className="text-sm text-green-800">{statusMessage}</p>
              </motion.div>
            )}

            {submitStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-start gap-3 rounded-[20px] border border-red-200 bg-red-50 px-4 py-4"
              >
                <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <p className="text-sm text-red-800">{statusMessage}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-spiritual-maroon">{t('register.fullName')}</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    className="w-full rounded-[20px] border border-[rgba(122,86,26,0.16)] bg-[rgba(248,243,232,0.92)] px-4 py-3.5 text-spiritual-maroon outline-none transition focus:border-[rgba(122,86,26,0.32)] focus:bg-white"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-spiritual-maroon">{t('register.emailAddress')}</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                    className="w-full rounded-[20px] border border-[rgba(122,86,26,0.16)] bg-[rgba(248,243,232,0.92)] px-4 py-3.5 text-spiritual-maroon outline-none transition focus:border-[rgba(122,86,26,0.32)] focus:bg-white"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-spiritual-maroon">{t('register.phoneNumber')}</label>
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                  className="w-full rounded-[20px] border border-[rgba(122,86,26,0.16)] bg-[rgba(248,243,232,0.92)] px-4 py-3.5 text-spiritual-maroon outline-none transition focus:border-[rgba(122,86,26,0.32)] focus:bg-white"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-spiritual-maroon">Area of Interest</label>
                <select
                  value={formData.areaOfInterest}
                  onChange={(event) => setFormData({ ...formData, areaOfInterest: event.target.value })}
                  className="w-full rounded-[20px] border border-[rgba(122,86,26,0.16)] bg-[rgba(248,243,232,0.92)] px-4 py-3.5 text-spiritual-maroon outline-none transition focus:border-[rgba(122,86,26,0.32)] focus:bg-white"
                  disabled={submitting}
                >
                  <option value="">Select your preferred area</option>
                  <option value="events">Event Support</option>
                  <option value="community">Community Service</option>
                  <option value="ashram">Ashram Activities</option>
                  <option value="all">All Areas</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-spiritual-maroon">Availability</label>
                <div className="flex flex-wrap gap-3">
                  {['Weekdays', 'Weekends', 'Flexible'].map((option) => (
                    <label
                      key={option}
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(122,86,26,0.16)] bg-[rgba(248,243,232,0.92)] px-4 py-2.5 text-sm text-spiritual-warmGray"
                    >
                      <input
                        type="checkbox"
                        checked={formData.availability.includes(option)}
                        onChange={() => handleAvailabilityChange(option)}
                        disabled={submitting}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-spiritual-maroon">Tell Us About Yourself</label>
                <textarea
                  rows={5}
                  placeholder="Share your motivation to serve and any relevant experience..."
                  value={formData.message}
                  onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                  className="w-full rounded-[20px] border border-[rgba(122,86,26,0.16)] bg-[rgba(248,243,232,0.92)] px-4 py-3.5 text-spiritual-maroon outline-none transition focus:border-[rgba(122,86,26,0.32)] focus:bg-white"
                  disabled={submitting}
                />
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full py-4 text-base disabled:opacity-70">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('register.submitting')}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    {t('register.submitApplication')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
