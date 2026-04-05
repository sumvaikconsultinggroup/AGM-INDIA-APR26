'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  tone?: 'light' | 'dark';
  align?: 'left' | 'center';
}

export function PageHero({
  eyebrow,
  title,
  highlight,
  subtitle,
  icon,
  actions,
  tone = 'light',
  align = 'center',
}: PageHeroProps) {
  const isDark = tone === 'dark';
  const isCentered = align === 'center';

  return (
    <section
      className={`relative overflow-hidden border-b ${
        isDark
          ? 'bg-maroon-gradient border-white/10 text-white'
          : 'bg-parchment border-[rgba(122,86,26,0.12)]'
      }`}
    >
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className={`absolute -top-24 ${isCentered ? 'left-1/2 -translate-x-1/2' : 'left-20'} h-64 w-64 rounded-full blur-3xl ${isDark ? 'bg-gold-300/15' : 'bg-gold-300/20'}`} />
        <div className={`absolute -bottom-20 ${isCentered ? 'right-16' : 'right-8'} h-56 w-56 rounded-full blur-3xl ${isDark ? 'bg-primary-400/10' : 'bg-primary-300/18'}`} />
      </div>

      <div className="container-custom relative pt-28 pb-16 md:pt-32 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`mx-auto max-w-4xl ${isCentered ? 'text-center' : 'text-left'}`}
        >
          {icon && (
            <div className={`mb-6 flex ${isCentered ? 'justify-center' : 'justify-start'}`}>
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${isDark ? 'border-gold-300/25 bg-white/10 text-gold-200' : 'border-[rgba(122,86,26,0.14)] bg-white/70 text-spiritual-saffron'} shadow-[0_12px_30px_rgba(54,31,12,0.12)]`}>
                {icon}
              </div>
            </div>
          )}

          {eyebrow && (
            <p className={`mb-4 text-xs font-semibold uppercase tracking-[0.32em] ${isDark ? 'text-gold-200/80' : 'text-spiritual-saffron'}`}>
              {eyebrow}
            </p>
          )}

          <h1 className={`font-display fluid-text-4xl leading-[0.95] ${isDark ? 'text-white' : 'text-spiritual-maroon'}`}>
            <span>{title}</span>
            {highlight && (
              <>
                {' '}
                <span className="text-gradient-gold">{highlight}</span>
              </>
            )}
          </h1>

          {subtitle && (
            <p className={`mt-5 max-w-3xl fluid-text-lg leading-relaxed ${isCentered ? 'mx-auto' : ''} ${isDark ? 'text-gold-50/78' : 'text-spiritual-warmGray'}`}>
              {subtitle}
            </p>
          )}

          {actions && (
            <div className={`mt-8 flex flex-wrap gap-3 ${isCentered ? 'justify-center' : 'justify-start'}`}>
              {actions}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
