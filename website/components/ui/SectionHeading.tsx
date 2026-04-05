'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  align?: 'left' | 'center';
  className?: string;
  eyebrow?: string;
}

export function SectionHeading({
  title,
  subtitle,
  centered = true,
  align,
  className,
  eyebrow,
}: SectionHeadingProps) {
  const isCentered = align ? align === 'center' : centered;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      className={cn(
        'mb-10 md:mb-14',
        isCentered && 'text-center',
        className
      )}
    >
      {eyebrow && (
        <p className={cn('mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-spiritual-saffron', isCentered && 'justify-center')}>
          {eyebrow}
        </p>
      )}
      <h2 className="font-display fluid-text-3xl text-spiritual-maroon mb-4">
        {title}
      </h2>
      <div className={cn(
        'flex items-center gap-3 mb-5',
        isCentered && 'justify-center'
      )}>
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold-400/90" />
        <div className="h-2 w-2 rounded-full bg-gold-400/90" />
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold-400/90" />
      </div>
      {subtitle && (
        <p className={cn(
          'font-body fluid-text-lg text-spiritual-warmGray max-w-2xl text-balance leading-relaxed',
          isCentered && 'mx-auto'
        )}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
