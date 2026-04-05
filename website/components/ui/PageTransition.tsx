'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative"
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -20 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: 'easeOut' }}
    >
      {/* Golden shimmer wipe overlay */}
      {!shouldReduceMotion && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50"
          initial={{ 
            background: 'linear-gradient(90deg, transparent 0%, rgba(212, 160, 23, 0.15) 50%, transparent 100%)',
            x: '-100%' 
          }}
          animate={{ x: '100%' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{ backgroundSize: '200% 100%' }}
        />
      )}
      
      {/* Brief golden tint flash */}
      {!shouldReduceMotion && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-40 bg-gold-100/20"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      )}
      
      {children}
    </motion.div>
  );
}
