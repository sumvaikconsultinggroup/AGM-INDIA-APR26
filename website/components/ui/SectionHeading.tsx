'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeading({ title, subtitle, centered = true, className }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      className={cn(
        'mb-12 md:mb-16',
        centered && 'text-center',
        className
      )}
    >
      <h2 className="font-display fluid-text-3xl text-spiritual-maroon mb-4">
        {title}
      </h2>
      {/* Gold ornamental divider */}
      <div className={cn(
        'flex items-center gap-3 mb-6',
        centered && 'justify-center'
      )}>
        <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold-400" />
        <div className="w-2 h-2 rotate-45 bg-gold-400" />
        <div className="w-8 h-1 bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400 rounded-full" />
        <div className="w-2 h-2 rotate-45 bg-gold-400" />
        <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold-400" />
      </div>
      {subtitle && (
        <p className="font-body fluid-text-lg text-spiritual-warmGray max-w-2xl mx-auto text-balance">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
