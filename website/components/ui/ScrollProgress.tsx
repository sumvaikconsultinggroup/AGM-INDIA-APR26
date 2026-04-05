'use client';

import { motion, useScroll, useReducedMotion } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return null;
  }

  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX: scrollYProgress, transformOrigin: '0%' }}
    />
  );
}
