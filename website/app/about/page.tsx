'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Award,
  Calendar,
  ChevronDown,
  Crown,
  Flame,
  GraduationCap,
  MapPin,
  Mountain,
  Quote,
  Star,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { SectionHeading } from '@/components/ui/SectionHeading';

interface HighlightCard {
  title: string;
  description: string;
  icon: LucideIcon;
}

const biographyTimeline: HighlightCard[] = [
  {
    title: 'Early Spiritual Inclination',
    description:
      'Born on November 24, 1962 in Khurja, Uttar Pradesh, Swami Ji displayed unusual spiritual depth and inwardness from a very young age.',
    icon: Calendar,
  },
  {
    title: 'Journey to the Himalayas',
    description:
      'At the age of 18, he left worldly comforts in search of truth, undertaking intense study, tapasya, and sadhana in the Himalayas.',
    icon: Mountain,
  },
  {
    title: 'Sannyas and Lineage',
    description:
      'He received Sannyas Diksha into the Juna Akhara tradition and emerged as one of the most respected spiritual leaders of his generation.',
    icon: Flame,
  },
  {
    title: 'Global Spiritual Leadership',
    description:
      'As Acharya Mahamandaleshwar of Juna Akhara and President of the Hindu Dharma Acharya Sabha, he continues to guide millions with compassion and clarity.',
    icon: Crown,
  },
];

const recognitions: HighlightCard[] = [
  {
    title: 'Hindu Renaissance Award (2008)',
    description:
      "Recognized as 'Hindu of the Year' by Hinduism Today for advancing Sanatan Dharma globally.",
    icon: Award,
  },
  {
    title: 'Doctor of Literature (D.Litt)',
    description:
      'Honored for extraordinary contribution to spiritual literature, wisdom traditions, and humanitarian thought.',
    icon: GraduationCap,
  },
  {
    title: 'Champions of Change (2019)',
    description:
      'Awarded for transformative social impact through education, spirituality, and service-oriented leadership.',
    icon: Star,
  },
  {
    title: 'Spiritual Leadership Honors',
    description:
      'Celebrated across India and abroad for peace-building, guidance, and upliftment through Vedantic teaching.',
    icon: Crown,
  },
];

const guidingThoughts = [
  'We are just like waves in the ocean longing to merge with our source of origin, that is, God whose fraction we are.',
  'Discipline and self-restraint bring peace of mind and inner happiness.',
  'The Guru removes ignorance, grants wisdom, and guides the seeker toward light.',
  'Through selfless seva, the ego softens and the divine becomes visible in all beings.',
];

const faqs = [
  {
    question: 'Who is Swami Avdheshanand Giri Ji Maharaj?',
    answer:
      'Swami Avdheshanand Giri Ji Maharaj is the Acharya Mahamandaleshwar of Juna Akhara and President of the Hindu Dharma Acharya Sabha. He is a Vedanta scholar, a spiritual guide, a prolific author, and a humanitarian leader.',
  },
  {
    question: 'What is Avdheshanandg Mission?',
    answer:
      'Avdheshanandg Mission supports the dissemination of Vedic wisdom, satsang, education, healthcare, social outreach, and humanitarian service under Swami Ji’s guidance.',
  },
  {
    question: 'Where is the main ashram located?',
    answer:
      'The main ashram presence is centered in Kankhal, Haridwar, with a wider spiritual and social footprint in other locations including Ambala and beyond.',
  },
  {
    question: 'How can devotees contribute?',
    answer:
      'Support can be offered through seva, donations, participation in programs, and by helping extend the mission’s educational, spiritual, and humanitarian work.',
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[rgba(122,86,26,0.12)] bg-white/90 shadow-[0_16px_40px_rgba(60,34,12,0.08)]">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-display text-xl text-spiritual-maroon">{question}</span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-spiritual-saffron transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <p className="px-6 pb-6 text-base leading-relaxed text-spiritual-warmGray">{answer}</p>
      </motion.div>
    </div>
  );
}

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="bg-parchment pt-20">
      <PageHero
        tone="dark"
        eyebrow="Spiritual Legacy"
        title="Swami Avdheshanand"
        highlight="Giri Ji Maharaj"
        subtitle="A life rooted in tapasya, Vedantic wisdom, universal compassion, and service to humanity through Sanatan Dharma."
        icon={<Quote className="h-8 w-8" />}
      />

      <section className="section-padding bg-parchment">
        <div className="container-custom">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-[32px] border border-[rgba(122,86,26,0.16)] bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(245,235,214,0.9))] p-6 shadow-[0_30px_80px_rgba(58,35,14,0.12)]"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-[#f1e6d0]">
                <Image
                  src="/newassets/SwamiJi.png"
                  alt="His Holiness Swami Avdheshanand Giri Ji Maharaj"
                  fill
                  priority
                  className="object-cover object-top"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <SectionHeading
                eyebrow="Introduction"
                title="A modern spiritual voice anchored in an ancient lineage"
                subtitle="Swami Ji brings together scriptural depth, practical wisdom, and humanitarian action in a way that feels deeply rooted yet fully relevant to the present moment."
                align="left"
              />
              <p className="text-lg leading-relaxed text-spiritual-warmGray">
                As Acharya Mahamandaleshwar of Juna Akhara and President of the Hindu Dharma Acharya Sabha,
                he represents one of the most important living continuities of India’s monastic and spiritual traditions.
              </p>
              <p className="text-lg leading-relaxed text-spiritual-warmGray">
                His work spans satsang, scripture, meditation, literature, social upliftment, ecological awareness,
                education, and compassionate engagement with society across India and the world.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { value: '50+', label: 'Books authored' },
                  { value: '500K+', label: 'Sadhus in Juna Akhara' },
                  { value: '40+', label: 'Years of spiritual service' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[22px] border border-[rgba(122,86,26,0.12)] bg-white/85 px-5 py-6 text-center shadow-[0_14px_34px_rgba(60,34,12,0.08)]"
                  >
                    <p className="font-display text-3xl text-spiritual-maroon">{stat.value}</p>
                    <p className="mt-2 text-sm uppercase tracking-[0.18em] text-spiritual-warmGray">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-temple-warm">
        <div className="container-custom">
          <SectionHeading
            eyebrow="Biography"
            title="A life journey shaped by sadhana and service"
            subtitle="The arc of Swami Ji’s life reflects renunciation, rigorous spiritual discipline, and expanding responsibility toward the world."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {biographyTimeline.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="rounded-[28px] border border-[rgba(122,86,26,0.12)] bg-white/88 p-7 shadow-[0_18px_42px_rgba(60,34,12,0.08)]"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f3d894,#b57b1d)] text-white shadow-[0_12px_28px_rgba(181,123,29,0.26)]">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-2xl text-spiritual-maroon">{item.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-spiritual-warmGray">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-parchment">
        <div className="container-custom grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[30px] border border-[rgba(122,86,26,0.12)] bg-white/90 p-8 shadow-[0_22px_50px_rgba(60,34,12,0.08)]">
            <SectionHeading
              eyebrow="Spiritual Vision"
              title="The core message"
              subtitle="The teachings consistently return to inner discipline, oneness, humility, seva, and remembrance of the divine as the basis of a meaningful life."
              align="left"
            />
            <div className="space-y-4">
              {guidingThoughts.map((thought) => (
                <div
                  key={thought}
                  className="rounded-[22px] border border-[rgba(122,86,26,0.1)] bg-[rgba(248,243,232,0.92)] px-5 py-4"
                >
                  <p className="font-spiritual text-xl leading-relaxed text-spiritual-maroon">“{thought}”</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-[rgba(122,86,26,0.12)] bg-[linear-gradient(180deg,rgba(128,0,32,0.94),rgba(89,8,28,0.96))] p-8 text-white shadow-[0_26px_60px_rgba(45,10,18,0.22)]">
            <div className="flex items-center gap-3 text-gold-200">
              <MapPin className="h-5 w-5" />
              <span className="text-sm uppercase tracking-[0.28em]">Ashram Presence</span>
            </div>
            <h3 className="mt-5 font-display text-3xl text-white">Haridwar at the heart, global in reach</h3>
            <p className="mt-4 text-base leading-relaxed text-gold-50/80">
              From Harihar Ashram, Kankhal, to spiritual gatherings across India and abroad, the mission combines personal guidance, public discourse, and humanitarian participation.
            </p>
            <div className="mt-8 space-y-4 text-sm text-gold-50/78">
              <div className="rounded-[20px] border border-white/10 bg-white/8 px-5 py-4">
                Harihar Ashram, Kankhal, Haridwar remains the spiritual anchor for devotees and seekers.
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/8 px-5 py-4">
                The mission’s influence extends through satsangs, publications, seva programs, and educational activity.
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/8 px-5 py-4">
                Swami Ji’s message is centered on unity, consciousness, compassion, and dharmic living.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-temple-warm">
        <div className="container-custom">
          <SectionHeading
            eyebrow="Recognition"
            title="Honors that reflect impact, not spectacle"
            subtitle="These recognitions matter less as awards and more as markers of the influence of a life committed to dharma, education, and service."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {recognitions.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="rounded-[28px] border border-[rgba(122,86,26,0.12)] bg-white/88 p-7 shadow-[0_18px_42px_rgba(60,34,12,0.08)]"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f3d894,#b57b1d)] text-white shadow-[0_12px_28px_rgba(181,123,29,0.26)]">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-2xl text-spiritual-maroon">{item.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-spiritual-warmGray">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-parchment">
        <div className="container-custom max-w-4xl">
          <SectionHeading
            eyebrow="Frequently Asked"
            title="Common questions from seekers and devotees"
            subtitle="A concise introduction for those discovering the mission, the ashram, and Swami Ji’s work for the first time."
          />
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaq === index}
                onClick={() => setOpenFaq((current) => (current === index ? null : index))}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
