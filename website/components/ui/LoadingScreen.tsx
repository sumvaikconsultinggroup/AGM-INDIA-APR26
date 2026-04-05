'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export function LoadingScreen() {
  const shouldReduceMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.sessionStorage.getItem('loader_seen');
  });

  useEffect(() => {
    if (!isLoading) return;

    const hideLoader = () => {
      setIsLoading(false);
      window.sessionStorage.setItem('loader_seen', '1');
    };

    if (document.readyState === 'complete') {
      const timer = setTimeout(hideLoader, shouldReduceMotion ? 100 : 500);
      return () => clearTimeout(timer);
    }

    const fallbackTimer = setTimeout(hideLoader, shouldReduceMotion ? 250 : 1200);
    window.addEventListener('load', hideLoader, { once: true });
    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener('load', hideLoader);
    };
  }, [isLoading, shouldReduceMotion]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.2 : 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #FFFDF5 0%, #FFF8E7 40%, #F5E6CC 100%)',
          }}
        >
          {/* Mandala background pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(212, 160, 23, 0.3) 0%, transparent 50%)',
              backgroundSize: '100% 100%',
            }}
          />

          <div className="text-center relative z-10">
            {/* Logo with breathing animation and glow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <motion.div
                animate={shouldReduceMotion ? undefined : { scale: [1, 1.03, 1] }}
                transition={shouldReduceMotion ? undefined : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-full blur-xl bg-gold-400/20" />
                <Image
                  src="/assets/Avdheshanandg mission logo.png"
                  alt="Avdheshanand Mission"
                  width={120}
                  height={120}
                  className="mx-auto relative shadow-glow rounded-full"
                  priority
                />
              </motion.div>
            </motion.div>

            {/* Animated Om Symbol */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-6"
            >
              <motion.span
                animate={shouldReduceMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
                transition={shouldReduceMotion ? undefined : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="font-sanskrit text-6xl text-gold-400 drop-shadow-lg inline-block"
                style={{
                  textShadow: '0 0 30px rgba(212, 160, 23, 0.4), 0 0 60px rgba(212, 160, 23, 0.2)',
                }}
              >
                ॐ
              </motion.span>
            </motion.div>

            {/* Golden shimmer loading bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="relative w-48 h-1.5 mx-auto rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(212, 160, 23, 0.2)' }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, #D4A017, #FFD54F, #D4A017, transparent)',
                  backgroundSize: '200% 100%',
                }}
                animate={shouldReduceMotion ? undefined : { backgroundPosition: ['200% center', '-200% center'] }}
                transition={shouldReduceMotion ? undefined : { duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>

            {/* Blessing text */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 font-spiritual text-xl text-gold-400 tracking-wide"
              style={{
                textShadow: '0 2px 10px rgba(212, 160, 23, 0.2)',
              }}
            >
              Hari Om
            </motion.p>

            {/* Subtle decorative elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 0.8 }}
              className="mt-4 text-gold-400/50 text-sm font-sanskrit"
            >
              ॥ श्री ॥
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
