'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Users, Crown, BookOpen, Video, Globe, Heart } from 'lucide-react';
// SectionHeading is available but custom heading is used in this component

interface Stat {
  value: string;
  numericValue: number;
  suffix: string;
  label: string;
  icon: React.ElementType;
}

interface Engagement {
  year: string;
  title: string;
  description: string;
}

const stats: Stat[] = [
  { value: '100,000+', numericValue: 100000, suffix: '+', label: 'Sannyasins Initiated', icon: Users },
  { value: '500,000+', numericValue: 500000, suffix: '+', label: 'Monks in Juna Akhara', icon: Crown },
  { value: '50+', numericValue: 50, suffix: '+', label: 'Books Published', icon: BookOpen },
  { value: '1,000+', numericValue: 1000, suffix: '+', label: 'Video Discourses', icon: Video },
  { value: '30+', numericValue: 30, suffix: '+', label: 'Countries Reached', icon: Globe },
  { value: '1.5M+', numericValue: 1500000, suffix: '+', label: 'Facebook Followers', icon: Heart },
];

const engagements: Engagement[] = [
  {
    year: '2022',
    title: 'International Yoga Day, Times Square',
    description: 'Led global Yoga Day celebrations at the iconic Times Square, New York — bringing Vedantic wisdom to the heart of the Western world.',
  },
  {
    year: '2025',
    title: 'Maha Kumbh Mela Leadership',
    description: 'Presided over the sacred Amrit Snan ceremonies at Prayagraj, guiding millions of devotees in the world\'s largest spiritual gathering.',
  },
  {
    year: '2008',
    title: 'Hindu Renaissance Award',
    description: 'Honored as \'Hindu of the Year\' by Hinduism Today magazine for extraordinary contributions to the revival and global spread of Sanatan Dharma.',
  },
  {
    year: '2019',
    title: 'Champions of Change',
    description: 'Recognized for transformative social impact through spiritual leadership, education initiatives, and community development programs across India.',
  },
];

function AnimatedCounter({ value, suffix, isInView }: { value: number; suffix: string; isInView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(value * easeOut));

      if (currentStep >= steps) {
        clearInterval(timer);
        setCount(value);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, isInView]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return num.toLocaleString();
    }
    return num.toString();
  };

  return (
    <span className="tabular-nums">
      {formatNumber(count)}{suffix}
    </span>
  );
}

export function GlobalPresence() {
  const statsRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(statsRef, { once: true, margin: '-100px' });

  return (
    <section id="global-presence" className="section-padding relative overflow-hidden">
      {/* Deep maroon gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#800020] via-[#5c0018] to-[#3a0010]" />
      
      {/* Gold mandala watermark overlay */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <defs>
              <pattern id="mandala-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="15" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                  <line
                    key={angle}
                    x1="50"
                    y1="5"
                    x2="50"
                    y2="95"
                    stroke="#D4AF37"
                    strokeWidth="0.3"
                    transform={`rotate(${angle} 50 50)`}
                  />
                ))}
              </pattern>
            </defs>
            <rect width="400" height="400" fill="url(#mandala-pattern)" />
            <circle cx="200" cy="200" r="180" fill="none" stroke="#D4AF37" strokeWidth="1" />
            <circle cx="200" cy="200" r="150" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="120" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
          </svg>
        </div>
      </div>

      <div className="container-custom relative z-10">
        {/* Section Heading - Light variant for dark background */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-16 text-center"
        >
          <h2 className="font-display fluid-text-3xl text-gold-200 mb-4">
            A Global Spiritual Journey
          </h2>
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold-400" />
            <div className="w-2 h-2 rotate-45 bg-gold-400" />
            <div className="w-8 h-1 bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400 rounded-full" />
            <div className="w-2 h-2 rotate-45 bg-gold-400" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold-400" />
          </div>
          <p className="font-body fluid-text-lg text-gold-100/80 max-w-2xl mx-auto text-balance">
            From the Himalayas to the world stage
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div 
          ref={statsRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center group"
              >
                {/* Icon Circle */}
                <motion.div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-400/20 to-gold-600/10 border border-gold-400/30 flex items-center justify-center group-hover:border-gold-400/60 transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  <Icon className="w-7 h-7 text-gold-400" />
                </motion.div>

                {/* Animated Counter with Gold Shimmer */}
                <div className="relative mb-2">
                  <span 
                    className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-gold-300 via-gold-100 to-gold-300 bg-clip-text text-transparent bg-[length:200%_100%] animate-shimmer"
                    style={{
                      animation: isInView ? 'shimmer 3s ease-in-out infinite' : 'none',
                    }}
                  >
                    <AnimatedCounter 
                      value={stat.numericValue} 
                      suffix={stat.suffix} 
                      isInView={isInView} 
                    />
                  </span>
                </div>

                {/* Label */}
                <p className="font-spiritual text-gold-100/70 text-sm md:text-base">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Engagement Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {engagements.map((engagement, index) => (
            <motion.div
              key={engagement.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-xl p-6 border border-gold-400/20 hover:border-gold-400/40 transition-all duration-300"
            >
              {/* Gold left border accent */}
              <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b from-gold-400 via-gold-300 to-gold-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />

              <div className="pl-4">
                {/* Year Badge */}
                <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider bg-gold-400/20 text-gold-300 rounded-full border border-gold-400/30">
                  {engagement.year}
                </span>

                {/* Title */}
                <h3 className="font-display text-xl md:text-2xl text-gold-100 mb-3 group-hover:text-gold-200 transition-colors">
                  {engagement.title}
                </h3>

                {/* Description */}
                <p className="font-body text-gold-100/60 text-sm md:text-base leading-relaxed">
                  {engagement.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Shimmer animation keyframes */}
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        @keyframes shimmer {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </section>
  );
}
