'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ChevronDown, Play } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function Hero() {
  const { t } = useTranslation('home');
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Parallax transforms
  const videoY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const videoScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.15]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const glowVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* ===== VIDEO BACKGROUND WITH PARALLAX ===== */}
      <motion.div
        style={{ y: videoY, scale: videoScale }}
        className="absolute inset-0 w-full h-full"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="/assets/Prabhushree ji 01_.webp"
        >
          <source src="/assets/video/website.mp4" type="video/mp4" />
        </video>

        {/* Multi-layer gradient overlays */}
        {/* Dark maroon vignette at top */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#300010]/90 via-[#300010]/50 to-transparent" />
        {/* Golden warm glow at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0808]/95 via-[#2a0a0a]/60 to-transparent" />
        {/* Radial vignette for cinematic effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(26,8,8,0.4)_70%,rgba(26,8,8,0.8)_100%)]" />
        {/* Golden light leak from bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#D4A017]/10 via-transparent to-transparent" />
      </motion.div>

      {/* ===== FLOATING DECORATIVE ELEMENTS (CSS Animation for performance) ===== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Om Symbol 1 - Top Left */}
        <div className="absolute top-[15%] left-[8%] text-6xl md:text-7xl text-gold-400/[0.08] font-sanskrit animate-float-slow select-none">
          ॐ
        </div>

        {/* Om Symbol 2 - Top Right */}
        <div className="absolute top-[20%] right-[12%] text-5xl md:text-6xl text-gold-400/[0.06] font-sanskrit animate-float-medium select-none hidden md:block">
          ॐ
        </div>

        {/* Om Symbol 3 - Bottom Left */}
        <div className="absolute bottom-[30%] left-[15%] text-4xl md:text-5xl text-gold-400/[0.07] font-sanskrit animate-float-fast select-none hidden lg:block">
          ॐ
        </div>

        {/* Om Symbol 4 - Center Right */}
        <div className="absolute top-[45%] right-[6%] text-5xl text-gold-400/[0.05] font-sanskrit animate-float-slower select-none hidden md:block">
          ॐ
        </div>

        {/* Om Symbol 5 - Bottom Right */}
        <div className="absolute bottom-[25%] right-[20%] text-4xl text-gold-400/[0.06] font-sanskrit animate-float-reverse select-none hidden lg:block">
          ॐ
        </div>

        {/* Golden particle dots */}
        <div className="absolute top-[10%] left-[25%] w-1 h-1 rounded-full bg-gold-400/30 animate-twinkle" />
        <div className="absolute top-[35%] left-[10%] w-1.5 h-1.5 rounded-full bg-gold-400/20 animate-twinkle-delayed" />
        <div className="absolute top-[60%] right-[15%] w-1 h-1 rounded-full bg-gold-400/25 animate-twinkle" />
        <div className="absolute top-[25%] right-[30%] w-1 h-1 rounded-full bg-gold-400/20 animate-twinkle-delayed-2" />
        <div className="absolute bottom-[40%] left-[35%] w-1.5 h-1.5 rounded-full bg-gold-400/15 animate-twinkle" />
        <div className="absolute bottom-[20%] right-[40%] w-1 h-1 rounded-full bg-gold-400/25 animate-twinkle-delayed" />

        {/* Diya flame - Top Left Corner */}
        <div className="absolute top-[18%] left-[5%] hidden lg:block">
          <div className="relative w-10 h-14">
            <div className="absolute bottom-0 w-8 h-4 bg-gradient-to-t from-gold-600/60 to-gold-500/40 rounded-full left-1" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-2.5 h-8 bg-gradient-to-t from-gold-500/80 via-primary-400/60 to-primary-300/40 rounded-full animate-diya-flame blur-[1px]" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1 h-5 bg-gradient-to-t from-gold-300/80 to-white/60 rounded-full animate-diya-flame" />
          </div>
        </div>

        {/* Diya flame - Bottom Right Corner */}
        <div className="absolute bottom-[22%] right-[5%] hidden lg:block">
          <div className="relative w-10 h-14">
            <div className="absolute bottom-0 w-8 h-4 bg-gradient-to-t from-gold-600/60 to-gold-500/40 rounded-full left-1" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-2.5 h-8 bg-gradient-to-t from-gold-500/80 via-primary-400/60 to-primary-300/40 rounded-full animate-diya-flame-alt blur-[1px]" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1 h-5 bg-gradient-to-t from-gold-300/80 to-white/60 rounded-full animate-diya-flame-alt" />
          </div>
        </div>

        {/* Slow rotating mandala watermark - Background center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] md:w-[1200px] md:h-[1200px] opacity-[0.03] animate-mandala-spin">
          <div className="w-full h-full rounded-full border-[3px] border-gold-400" />
          <div className="absolute inset-12 rounded-full border-2 border-gold-400" />
          <div className="absolute inset-24 rounded-full border border-gold-400" />
          <div className="absolute inset-36 rounded-full border border-gold-400/70" />
          <div className="absolute inset-48 rounded-full border border-gold-400/50" />
          {/* Mandala cross lines */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-gold-400/50 -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-gold-400/50 -translate-x-1/2" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-gold-400/30 -translate-y-1/2 rotate-45 origin-center" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-gold-400/30 -translate-y-1/2 -rotate-45 origin-center" />
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto"
      >
        {/* Sanskrit blessing at top */}
        <motion.div variants={glowVariants} className="mb-6 md:mb-8">
          <span className="inline-block font-sanskrit text-gold-400 text-lg md:text-xl lg:text-2xl tracking-wider animate-text-glow">
            {t('hero.blessing')}
          </span>
        </motion.div>

        {/* Badge/Tagline */}
        <motion.div variants={itemVariants} className="mb-6 md:mb-8">
          <span className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.03] backdrop-blur-sm border border-gold-400/20 text-gold-400/90">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse-soft" />
            <span className="font-spiritual text-xs md:text-sm tracking-[0.2em] uppercase">
              {t('hero.badge')}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse-soft" />
          </span>
        </motion.div>

        {/* Main Title - Dramatic */}
        <motion.h1
          variants={itemVariants}
          className="font-display mb-6 md:mb-8 leading-[0.95]"
          style={{ fontSize: 'clamp(2.5rem, 10vw, 6rem)' }}
        >
          <span className="block text-white drop-shadow-[0_4px_30px_rgba(212,160,23,0.3)]">
            {t('hero.titleLine1')}
          </span>
          <span className="block text-gradient-gold mt-2">
            {t('hero.titleLine2')}
          </span>
        </motion.h1>

        {/* Subtitle - Elegant */}
        <motion.p
          variants={itemVariants}
          className="font-spiritual text-spiritual-parchment/90 italic mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed"
          style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)' }}
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* Sanskrit Shloka with ornamental borders */}
        <motion.div
          variants={itemVariants}
          className="mb-10 md:mb-12 flex items-center justify-center gap-4"
        >
          <span className="hidden sm:block w-12 md:w-20 h-px bg-gradient-to-r from-transparent to-gold-400/60" />
          <span className="font-sanskrit text-gold-400/80 text-base md:text-lg lg:text-xl tracking-wide">
            {t('hero.shloka')}
          </span>
          <span className="hidden sm:block w-12 md:w-20 h-px bg-gradient-to-l from-transparent to-gold-400/60" />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="#life-story"
            className="group relative inline-flex items-center justify-center px-8 py-4 rounded-full font-medium text-white overflow-hidden transition-all duration-300 animate-glow-pulse-subtle"
          >
            {/* Button gradient background */}
            <span className="absolute inset-0 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 transition-all duration-300 group-hover:scale-105" />
            {/* Shimmer effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative flex items-center gap-2">
              <span>{t('hero.ctaExplore')}</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="#video-showcase"
            className="group relative inline-flex items-center justify-center px-8 py-4 rounded-full font-medium text-gold-400 border-2 border-gold-400/40 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-gold-400/80 hover:text-white"
          >
            {/* Hover fill */}
            <span className="absolute inset-0 bg-gold-400/0 group-hover:bg-gold-400/20 transition-all duration-300" />
            <span className="relative flex items-center gap-2">
              <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>{t('hero.ctaWatch')}</span>
            </span>
          </Link>
        </motion.div>
      </motion.div>

      {/* ===== SCROLL INDICATOR ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-gold-400/60 text-xs tracking-[0.3em] uppercase font-spiritual">
          {t('hero.scrollDiscover')}
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 rounded-full border-2 border-gold-400/30 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1], y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-2 rounded-full bg-gold-400/80"
          />
        </motion.div>
      </motion.div>

      {/* ===== CUSTOM CSS ANIMATIONS (injected) ===== */}
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(3deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(-2deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-30px) rotate(2deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(-15px) rotate(2deg); }
          50% { transform: translateY(0) rotate(-1deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
        @keyframes twinkle-delayed {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes twinkle-delayed-2 {
          0%, 100% { opacity: 0.15; transform: scale(1.2); }
          50% { opacity: 0.6; transform: scale(1); }
        }
        @keyframes diya-flame-alt {
          0%, 100% { transform: scaleY(1) rotate(1deg); opacity: 1; }
          25% { transform: scaleY(1.15) rotate(-1deg); opacity: 0.85; }
          50% { transform: scaleY(0.9) rotate(0.5deg); opacity: 1; }
          75% { transform: scaleY(1.1) rotate(-0.5deg); opacity: 0.9; }
        }
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 10px rgba(212,160,23,0.4), 0 0 20px rgba(212,160,23,0.2); }
          50% { text-shadow: 0 0 20px rgba(212,160,23,0.6), 0 0 40px rgba(212,160,23,0.3), 0 0 60px rgba(212,160,23,0.1); }
        }
        @keyframes glow-pulse-subtle {
          0%, 100% { box-shadow: 0 0 20px rgba(255,107,0,0.3), 0 0 40px rgba(255,107,0,0.1); }
          50% { box-shadow: 0 0 30px rgba(255,107,0,0.5), 0 0 60px rgba(255,107,0,0.2); }
        }

        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 10s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 7s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        .animate-twinkle-delayed { animation: twinkle-delayed 4s ease-in-out infinite 1s; }
        .animate-twinkle-delayed-2 { animation: twinkle-delayed-2 5s ease-in-out infinite 2s; }
        .animate-diya-flame-alt { animation: diya-flame-alt 2.5s ease-in-out infinite; }
        .animate-text-glow { animation: text-glow 3s ease-in-out infinite; }
        .animate-glow-pulse-subtle { animation: glow-pulse-subtle 2.5s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
