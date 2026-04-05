'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { Youtube, Instagram, Facebook, Twitter, Book, FileText, Video, BookOpen } from 'lucide-react';

const socialStats = [
  { platform: 'YouTube', icon: Youtube, count: '163K+', label: 'Subscribers', color: 'text-red-500', href: 'https://www.youtube.com/@avdheshanandg' },
  { platform: 'Instagram', icon: Instagram, count: '3.3M', label: 'Followers', color: 'text-pink-500', href: 'https://www.instagram.com/avdheshanandg_official/' },
  { platform: 'Facebook', icon: Facebook, count: '1.4M', label: 'Followers', color: 'text-blue-600', href: 'https://www.facebook.com/AvdheshanandG/' },
  { platform: 'Twitter', icon: Twitter, count: '342K', label: 'Followers', color: 'text-sky-500', href: 'https://twitter.com/AvdheshanandG' },
];

const contentStats = [
  { label: 'Books Published', count: '50+', icon: Book },
  { label: 'Articles Written', count: '500+', icon: FileText },
  { label: 'Video Discourses', count: '1000+', icon: Video },
  { label: 'Commentary Works', count: '25+', icon: BookOpen },
];

function AnimatedCounter({ value, duration = 2 }: { value: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState('0');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
    const suffix = value.replace(/[0-9]/g, '');
    const steps = 60;
    const stepDuration = (duration * 1000) / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(numericValue * easeOut);
      setDisplayValue(currentValue.toLocaleString() + suffix);

      if (currentStep >= steps) {
        clearInterval(interval);
        setDisplayValue(value);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isInView, value, duration]);

  return <span ref={ref}>{displayValue}</span>;
}

export function JourneyStats() {
  return (
    <section className="section-padding bg-temple-warm relative overflow-hidden">
      {/* Mandala watermark overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border-8 border-gold-400 animate-mandala-spin" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border-4 border-gold-400" style={{ animationDirection: 'reverse' }} />
      </div>

      <div className="container-custom relative">
        <SectionHeading
          title="A Global Spiritual Journey"
          subtitle="Touching millions of hearts across the world through wisdom and compassion"
        />

        {/* Social Media Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {socialStats.map((stat, index) => (
            <motion.a
              key={stat.platform}
              href={stat.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="card-temple p-6 text-center group cursor-pointer hover:shadow-glow transition-all"
            >
              <div className={`w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-100 to-spiritual-cream flex items-center justify-center border border-gold-400/30 group-hover:border-gold-400 group-hover:shadow-warm transition-all ${stat.color}`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <p className="font-display text-3xl md:text-4xl text-spiritual-maroon mb-1">
                <AnimatedCounter value={stat.count} />
              </p>
              <p className="text-spiritual-warmGray text-sm font-body">{stat.label}</p>
            </motion.a>
          ))}
        </div>

        {/* Divider */}
        <div className="divider-rangoli mb-12" />

        {/* Content Stats with Maroon Background */}
        <div className="bg-maroon-gradient rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Mandala watermark inside */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full border-4 border-gold-400" />
            <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full border-2 border-gold-400" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {contentStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                {/* Circular medallion frame */}
                <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-gold-400/50 flex items-center justify-center bg-gold-400/10 backdrop-blur-sm">
                  <stat.icon className="w-8 h-8 text-gold-300" />
                </div>
                {/* Animated number with golden shimmer */}
                <p className="font-display text-3xl md:text-4xl mb-2 text-gold-400" style={{
                  background: 'linear-gradient(90deg, #D4A017, #FFD54F, #D4A017)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'golden-shimmer 3s linear infinite',
                }}>
                  <AnimatedCounter value={stat.count} />
                </p>
                <p className="text-gold-200/80 text-sm font-body">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
