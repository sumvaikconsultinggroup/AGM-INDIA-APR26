'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Award,
  Quote,
  ChevronDown,
  MapPin,
  Star,
  Mountain,
  Flame,
  Crown,
  Calendar,
  GraduationCap,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

// Section Title Component
const SectionTitle = ({ children, icon: Icon }: { children: React.ReactNode; icon?: LucideIcon }) => (
  <motion.div
    variants={fadeInUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-100px' }}
    className="flex items-center gap-4 mb-8"
  >
    <div className="flex items-center gap-3">
      <span className="text-3xl font-sanskrit text-gold-400">ॐ</span>
      {Icon && <Icon className="w-6 h-6 text-gold-500" />}
    </div>
    <h2 className="font-display text-3xl md:text-4xl text-spiritual-maroon">{children}</h2>
    <div className="flex-1 h-px bg-gradient-to-r from-gold-400 to-transparent ml-4" />
  </motion.div>
);

// Timeline Dot Component
const TimelineDot = () => (
  <div className="absolute left-0 top-8 w-4 h-4 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 shadow-glow z-10 hidden lg:block">
    <div className="absolute inset-1 rounded-full bg-spiritual-cream" />
    <div className="absolute inset-2 rounded-full bg-gold-400" />
  </div>
);

// Ornamental Corner Component
const OrnamentalCorner = ({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
  const rotations = {
    'top-left': '',
    'top-right': 'rotate-90',
    'bottom-left': '-rotate-90',
    'bottom-right': 'rotate-180',
  };
  const positions = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  };

  return (
    <div className={`absolute ${positions[position]} w-24 md:w-32 h-24 md:h-32 opacity-30 ${rotations[position]}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full text-gold-400">
        <path
          fill="currentColor"
          d="M0,0 L30,0 Q15,15 0,30 Z M0,0 L0,30 Q15,15 30,0 Z"
        />
        <path
          fill="currentColor"
          opacity="0.5"
          d="M5,5 L25,5 Q15,15 5,25 Z"
        />
      </svg>
    </div>
  );
};

// FAQ Accordion Component
const FAQItem = ({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) => (
  <motion.div
    variants={fadeInUp}
    className="border-2 border-gold-300/50 rounded-xl overflow-hidden bg-spiritual-warmWhite/80 backdrop-blur-sm"
  >
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 text-left hover:bg-gold-50/50 transition-colors"
    >
      <span className="font-display text-lg text-spiritual-maroon pr-4">{question}</span>
      <ChevronDown
        className={`w-5 h-5 text-gold-500 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
    <motion.div
      initial={false}
      animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <p className="px-5 pb-5 text-spiritual-warmGray leading-relaxed font-body">{answer}</p>
    </motion.div>
  </motion.div>
);

export default function AboutPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const awards = [
    {
      title: 'Hindu Renaissance Award (2008)',
      description: "Honored as 'Hindu of the Year' by Hinduism Today magazine for extraordinary contributions to the revival and global spread of Sanatan Dharma.",
      icon: Award,
    },
    {
      title: 'Doctor of Literature (D.Litt)',
      description: 'Conferred by Vikram University, Ujjain, in recognition of his extraordinary work in spiritual literature and humanitarian approach.',
      icon: GraduationCap,
    },
    {
      title: 'Champions of Change (2019)',
      description: 'Awarded for transformative social impact through spiritual leadership, education, and community development across India.',
      icon: Star,
    },
    {
      title: 'High Range Spiritual Guru Award',
      description: 'Recognized for outstanding contributions to peace, harmony, and the upliftment of humanity through spiritual wisdom.',
      icon: Crown,
    },
  ];

  const quotes = [
    'We are just like waves in the ocean longing to merge with our source of origin, that is, God whose fraction we are.',
    'Discipline and self-restraint brings peace of mind and happiness.',
    'The Guru is the dispeller of darkness. Guru is the one who guides us, grants wisdom, and removes ignorance.',
    'This is an era of service. Through selfless seva, we dissolve the ego and experience the divine within ourselves and others.',
  ];

  const faqs = [
    {
      question: 'Who is Swami Avdheshanand Giri Ji Maharaj?',
      answer: 'Swami Avdheshanand Giri Ji Maharaj is the Acharya Mahamandaleshwar of Juna Akhara — the oldest and largest Hindu monastic order with over 500,000 sadhus. He is also the President of the Hindu Dharma Acharya Sabha, the apex body of Hindu religious leaders. A Vedanta scholar, prolific author of over 50 books, and a humanitarian, he carries forward the ancient tradition established by Adi Shankaracharya.',
    },
    {
      question: 'What is Avdheshanandg Mission (AGM)?',
      answer: 'Avdheshanandg Mission (AGM) is a spiritual and humanitarian organization founded under the guidance of Swami Ji. It works towards spreading Vedic wisdom, conducting satsangs and spiritual programs, running educational institutions, providing healthcare services, and undertaking various social welfare activities for the upliftment of society.',
    },
    {
      question: "How can I attend Swami Ji's satsangs?",
      answer: "Swami Ji conducts satsangs regularly at various locations across India and internationally. You can check our Schedule page for upcoming events, or subscribe to our newsletter to receive updates about satsangs in your area. Major programs are also live-streamed on our YouTube channel.",
    },
    {
      question: "Where are Swami Ji's ashrams located?",
      answer: 'The main ashram is located at Parmarth Ashram, Kankhal, Haridwar, Uttarakhand. There is also a significant presence at Ambala, Haryana. Devotees are welcome to visit these sacred spaces for spiritual guidance, meditation, and to participate in daily prayers and activities.',
    },
    {
      question: 'How can I contribute to the mission?',
      answer: 'You can contribute by donating to support our spiritual, educational, and humanitarian programs. We also welcome volunteers who wish to offer their time and skills in service (seva). Visit our Donate page to make a contribution or our Volunteer page to join our seva initiatives.',
    },
    {
      question: 'How can I meet Swami Ji personally?',
      answer: 'Personal darshan and meetings with Swami Ji can be arranged by contacting the ashram administration. Due to his extensive schedule of satsangs, travels, and spiritual duties, appointments are recommended. You may also have darshan during public satsangs and special occasions at the ashram.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-spiritual-cream via-spiritual-warmWhite to-spiritual-parchment">
      {/* ========== HERO BANNER ========== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Maroon Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-spiritual-maroon via-[#6a0019] to-[#4A0010]" />
        
        {/* Decorative Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A017' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Ornamental Corners */}
        <OrnamentalCorner position="top-left" />
        <OrnamentalCorner position="top-right" />
        <OrnamentalCorner position="bottom-left" />
        <OrnamentalCorner position="bottom-right" />

        {/* Content */}
        <div className="relative z-10 container-custom text-center py-20 px-4">
          {/* Portrait Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative mx-auto mb-10 w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72"
          >
            {/* Outer Glow */}
            <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-gold-400/40 to-gold-600/40 blur-xl animate-pulse-soft" />
            {/* Gold Border */}
            <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-gold-400 p-1 shadow-glow-lg">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-spiritual-maroon to-[#4A0010]" />
            </div>
            {/* Image Container */}
            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-gold-400/50 shadow-2xl">
              <Image
                src="/newassets/SwamiJi.png"
                alt="His Holiness Swami Avdheshanand Giri Ji Maharaj"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
            {/* Decorative Ring */}
            <div className="absolute -inset-6 rounded-full border border-gold-400/30 animate-breathe" />
            <div className="absolute -inset-10 rounded-full border border-gold-400/20" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white mb-6 leading-tight"
          >
            His Holiness{' '}
            <span className="block mt-2 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 bg-clip-text text-transparent">
              Swami Avdheshanand Giri Ji Maharaj
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="font-spiritual text-lg md:text-xl lg:text-2xl text-gold-200/90 max-w-3xl mx-auto leading-relaxed"
          >
            Acharya Mahamandaleshwar · Juna Akhara · President, Hindu Dharma Acharya Sabha
          </motion.p>

          {/* Decorative Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <span className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent to-gold-400" />
            <span className="text-gold-400 text-2xl">✦</span>
            <span className="font-sanskrit text-gold-300 text-xl">॥ श्री ॥</span>
            <span className="text-gold-400 text-2xl">✦</span>
            <span className="w-16 md:w-24 h-px bg-gradient-to-l from-transparent to-gold-400" />
          </motion.div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-spiritual-cream to-transparent" />
      </section>

      {/* ========== TIMELINE LINE (Desktop) ========== */}
      <div className="hidden lg:block fixed left-8 xl:left-16 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold-400/30 to-transparent z-0" />

      {/* ========== INTRODUCTION SECTION ========== */}
      <section className="relative py-20 md:py-28 bg-spiritual-cream">
        <TimelineDot />
        <div className="container-custom">
          <div className="lg:pl-12">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
              {/* Left: Quote Card */}
              <motion.div
                variants={fadeInLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                className="relative"
              >
                <div className="relative h-full bg-gradient-to-br from-spiritual-warmWhite to-spiritual-parchment rounded-2xl p-8 md:p-10 border-2 border-gold-300/50 shadow-temple">
                  {/* Corner Decorations */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-gold-400" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-gold-400" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-gold-400" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-gold-400" />

                  <Quote className="w-12 h-12 text-gold-400/60 mb-6" />
                  <blockquote className="font-spiritual text-xl md:text-2xl lg:text-2xl text-spiritual-maroon leading-relaxed italic">
                    &ldquo;The universe is one family and God is one. All creations are purely out of His will. All human beings are children of the same Almighty.&rdquo;
                  </blockquote>
                  <div className="mt-8 flex items-center gap-3">
                    <div className="w-12 h-px bg-gold-400" />
                    <span className="font-display text-gold-600">Swami Ji</span>
                  </div>
                </div>
              </motion.div>

              {/* Right: Introduction */}
              <motion.div
                variants={fadeInRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                className="flex flex-col justify-center"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-sanskrit text-gold-400">ॐ</span>
                  <h2 className="font-display text-2xl md:text-3xl text-spiritual-maroon">Introduction</h2>
                </div>
                <p className="text-lg md:text-xl text-spiritual-warmGray leading-relaxed font-body">
                  Swami Avdheshanand Giri Ji Maharaj stands as one of the most revered spiritual leaders of our time. As the Acharya Mahamandaleshwar of Juna Akhara — the oldest and largest Hindu monastic order with over 500,000 sadhus — and President of the Hindu Dharma Acharya Sabha, he carries the torch of an ancient tradition that stretches back to Adi Shankaracharya.
                </p>
                <p className="mt-6 text-lg md:text-xl text-spiritual-warmGray leading-relaxed font-body">
                  A Vedanta scholar, prolific author of over 50 books, and a humanitarian whose initiatives have transformed thousands of lives, Swami Ji&apos;s message of universal consciousness and compassionate service resonates across the globe.
                </p>
                {/* Stats */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white/50 rounded-xl border border-gold-200">
                    <span className="block font-display text-2xl md:text-3xl text-spiritual-maroon">50+</span>
                    <span className="text-sm text-spiritual-warmGray">Books Authored</span>
                  </div>
                  <div className="text-center p-4 bg-white/50 rounded-xl border border-gold-200">
                    <span className="block font-display text-2xl md:text-3xl text-spiritual-maroon">500K+</span>
                    <span className="text-sm text-spiritual-warmGray">Sadhus in Order</span>
                  </div>
                  <div className="text-center p-4 bg-white/50 rounded-xl border border-gold-200">
                    <span className="block font-display text-2xl md:text-3xl text-spiritual-maroon">40+</span>
                    <span className="text-sm text-spiritual-warmGray">Years of Service</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== EARLY LIFE SECTION ========== */}
      <section className="relative py-20 md:py-28 bg-spiritual-parchment/50">
        <TimelineDot />
        <div className="container-custom">
          <div className="lg:pl-12">
            <SectionTitle icon={Calendar}>The Early Years</SectionTitle>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="max-w-4xl"
            >
              <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-gold-200/50 shadow-warm">
                <div className="absolute top-6 left-6 w-3 h-3 rounded-full bg-gold-400 shadow-glow" />
                <p className="text-lg md:text-xl text-spiritual-warmGray leading-relaxed font-body pl-8">
                  Born on <strong className="text-spiritual-maroon">November 24, 1962</strong>, in Khurja, Bulandsher, Uttar Pradesh, into a devout Brahmin family, Swami Ji exhibited extraordinary spiritual inclinations from his earliest years. Unlike other children, he showed no interest in toys or playmates.
                </p>
                <p className="mt-6 text-lg md:text-xl text-spiritual-warmGray leading-relaxed font-body pl-8">
                  Instead, he was deeply introspective, often speaking to family members about vivid memories of his previous births — an early sign of the profound spiritual depth that would come to define his life.
                </p>
                <div className="mt-8 pl-8 flex items-center gap-4">
                  <MapPin className="w-5 h-5 text-gold-500" />
                  <span className="text-spiritual-warmGray font-body">Khurja, Bulandsher, Uttar Pradesh</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== HIMALAYAN QUEST SECTION ========== */}
      <section className="relative py-20 md:py-28 bg-spiritual-cream overflow-hidden">
        {/* Mountain Silhouette Background */}
        <div className="absolute bottom-0 left-0 right-0 h-64 opacity-5">
          <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="w-full h-full">
            <path fill="#800020" d="M0,200 L0,100 L150,50 L300,100 L400,30 L500,80 L600,20 L750,90 L850,40 L950,70 L1050,25 L1150,80 L1200,60 L1200,200 Z" />
          </svg>
        </div>

        <TimelineDot />
        <div className="container-custom relative z-10">
          <div className="lg:pl-12">
            <SectionTitle icon={Mountain}>The Call of the Himalayas</SectionTitle>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="max-w-4xl space-y-6"
            >
              <motion.div variants={fadeInUp} className="relative bg-gradient-to-br from-white/80 to-spiritual-parchment/60 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-gold-200/50 shadow-warm">
                <p className="text-lg md:text-xl text-spiritual-warmGray leading-relaxed font-body">
                  In <strong className="text-spiritual-maroon">1980</strong>, at the age of 18, an intense craving for Truth awakened within him. Leaving behind the comforts of worldly life, he set forth for the majestic Himalayas in search of <em className="text-spiritual-maroon font-spiritual">Gyana</em> (knowledge) and <em className="text-spiritual-maroon font-spiritual">Satya</em> (truth).
                </p>
                <blockquote className="mt-6 pl-6 border-l-4 border-gold-400 italic font-spiritual text-xl text-spiritual-maroon">
                  &ldquo;When you develop a craving to know the Truth, the mountains and caves start attracting you.&rdquo;
                </blockquote>
              </motion.div>

              <motion.div variants={fadeInUp} className="relative bg-gradient-to-br from-white/80 to-spiritual-parchment/60 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-gold-200/50 shadow-warm">
                <p className="text-lg md:text-xl text-spiritual-warmGray leading-relaxed font-body">
                  After months of wandering through the lower Himalayan ranges, divine providence led him to his first guru — <strong className="text-spiritual-maroon">Swami Avdhoot Prakash Maharaj</strong>, a self-realized yogi, master of Yoga, and a scholar deeply versed in the Vedas and Hindu scriptures.
                </p>
                <p className="mt-6 text-lg md:text-xl text-spiritual-warmGray leading-relaxed font-body">
                  Under his compassionate guidance, the young seeker immersed himself in the study of Vedas, Sanskrit, and rigorous yogic sadhana, receiving his first formal initiation as a <strong className="text-spiritual-maroon">Naishtika Brahmachari</strong> (sworn celibate student).
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== SANNYAS & SACRED LEADERSHIP ========== */}
      <section className="relative py-20 md:py-28 bg-spiritual-parchment/50">
        <TimelineDot />
        <div className="container-custom">
          <div className="lg:pl-12">
            <SectionTitle icon={Flame}>The Sacred Renunciation</SectionTitle>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="max-w-4xl space-y-6"
            >
              <motion.div variants={fadeInUp} className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-gold-200/50 shadow-warm">
                <p className="text-lg md:text-xl text-spiritual-warmGray leading-relaxed font-body">
                  After years of intense sadhana in the caves of the Himalayas, a matured and luminous yogi emerged in <strong className="text-spiritual-maroon">1985</strong>. He sought out <strong className="text-spiritual-maroon">Swami Satyamittranand Giri</strong> of the renowned Bharat Mata Temple in Haridwar and received <em className="text-spiritual-maroon font-spiritual">Sannyas Diksha</em> — formal monastic initiation into the ancient Juna Akhara.
                </p>
                <p className="mt-6 text-lg md:text-xl text-spiritual-warmGray leading-relaxed font-body">
                  He was bestowed the sacred name <strong className="text-gold-600 font-display text-2xl">Swami Avdheshanand Giri</strong>.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="relative bg-gradient-to-br from-spiritual-maroon/5 to-gold-50 backdrop-blur-sm rounded-2xl p-8 md:p-10 border-2 border-gold-300/50 shadow-temple">
                <Crown className="w-10 h-10 text-gold-500 mb-4" />
                <p className="text-lg md:text-xl text-spiritual-warmGray leading-relaxed font-body">
                  In <strong className="text-spiritual-maroon">1998</strong>, in a historic <em className="text-spiritual-maroon font-spiritual">Pattabhishekam</em> ceremony witnessed by the entire monastic community, he was formally consecrated as <strong className="text-spiritual-maroon">Acharya Mahamandaleshwar</strong> — the supreme spiritual leader of Juna Akhara.
                </p>
                <p className="mt-6 text-lg md:text-xl text-spiritual-warmGray leading-relaxed font-body">
                  This ancient order, tracing its origins to <strong className="text-spiritual-maroon">Adi Shankaracharya</strong> and <strong className="text-spiritual-maroon">Bhagavan Dattatreya</strong>, comprises 52 sub-lineages and over 500,000 sadhus. Today, he also serves as President of the Hindu Dharma Acharya Sabha, the highest council of Hindu religious leaders.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== TITLES & AWARDS SECTION ========== */}
      <section className="relative py-20 md:py-28 bg-spiritual-cream">
        <TimelineDot />
        <div className="container-custom">
          <div className="lg:pl-12">
            <SectionTitle icon={Award}>Recognition & Honors</SectionTitle>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="grid md:grid-cols-2 gap-6 lg:gap-8"
            >
              {awards.map((award, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gold-200/50 shadow-warm hover:shadow-temple transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                      <award.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-spiritual-maroon mb-2">{award.title}</h3>
                      <p className="text-spiritual-warmGray font-body leading-relaxed">{award.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== KEY QUOTES SECTION ========== */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-spiritual-maroon via-[#6a0019] to-[#4A0010] overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #D4A017 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-12"
          >
            <span className="text-4xl font-sanskrit text-gold-400">ॐ</span>
            <h2 className="font-display text-3xl md:text-4xl text-white mt-4">In His Own Words</h2>
            <div className="mt-4 flex items-center justify-center gap-4">
              <span className="w-16 h-px bg-gradient-to-r from-transparent to-gold-400" />
              <Quote className="w-6 h-6 text-gold-400" />
              <span className="w-16 h-px bg-gradient-to-l from-transparent to-gold-400" />
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-2 gap-6 lg:gap-8"
          >
            {quotes.map((quote, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`relative ${index % 2 === 1 ? 'md:mt-8' : ''}`}
              >
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gold-400/30 hover:border-gold-400/50 transition-colors">
                  <Quote className="w-8 h-8 text-gold-400/40 mb-4" />
                  <p className="font-spiritual text-lg md:text-xl text-white/90 leading-relaxed italic">
                    &ldquo;{quote}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="w-8 h-px bg-gold-400/50" />
                    <span className="text-gold-300 text-sm font-body">Swami Avdheshanand Giri Ji</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== FAQ SECTION ========== */}
      <section className="relative py-20 md:py-28 bg-spiritual-cream">
        <TimelineDot />
        <div className="container-custom">
          <div className="lg:pl-12">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="text-center mb-12"
            >
              <span className="text-4xl font-sanskrit text-gold-400">ॐ</span>
              <h2 className="font-display text-3xl md:text-4xl text-spiritual-maroon mt-4">Frequently Asked Questions</h2>
              <p className="mt-4 text-spiritual-warmGray max-w-2xl mx-auto">
                Find answers to common questions about Swami Ji and the mission.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="max-w-3xl mx-auto space-y-4"
            >
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQ === index}
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== CLOSING SECTION ========== */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-spiritual-cream to-spiritual-parchment">
        <div className="container-custom text-center">
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="w-16 h-px bg-gradient-to-r from-transparent to-gold-400" />
              <span className="text-3xl font-sanskrit text-gold-400">॥ श्री गुरवे नमः ॥</span>
              <span className="w-16 h-px bg-gradient-to-l from-transparent to-gold-400" />
            </div>
            <p className="font-spiritual text-xl text-spiritual-warmGray italic">
              &ldquo;In the presence of the Guru, all darkness dissolves.&rdquo;
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
