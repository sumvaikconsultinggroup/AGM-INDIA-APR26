'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function AnimatedCard({ children, className, delay = 0, hover = true }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { 
        y: -8, 
        scale: 1.02,
        boxShadow: '0 0 30px rgba(212, 160, 23, 0.3), 0 10px 40px rgba(212, 160, 23, 0.2)',
      } : undefined}
      className={cn(
        'card-warm p-6 cursor-pointer transition-all duration-300',
        'hover:shadow-glow',
        className
      )}
      style={{
        borderRadius: '0.75rem',
      }}
    >
      {children}
    </motion.div>
  );
}
