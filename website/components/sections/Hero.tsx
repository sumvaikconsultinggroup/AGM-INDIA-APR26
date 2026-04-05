'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function Hero() {
  const { t } = useTranslation('home');
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, shouldReduceMotion ? 1 : 1.06]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, shouldReduceMotion ? 0 : -24]);

  return (
    <section ref={containerRef} className="relative min-h-[90vh] overflow-hidden border-b border-white/10">
      <motion.div style={{ scale: mediaScale }} className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          poster="/assets/Prabhushree ji 01_.webp"
        >
          <source src="/assets/video/website.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,14,10,0.52)_0%,rgba(26,14,10,0.24)_28%,rgba(26,14,10,0.72)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,168,79,0.22),transparent_28%)]" />
      </motion.div>

      <div className="absolute inset-x-0 top-28 z-10">
        <div className="container-custom">
          <div className="mx-auto max-w-5xl rounded-[32px] border border-white/12 bg-[rgba(27,18,12,0.36)] p-8 shadow-[0_30px_80px_rgba(16,10,6,0.24)] backdrop-blur-md md:p-12">
            <motion.div style={{ y: contentY }} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold-200/90">
                {t('hero.badge')}
              </p>
              <h1 className="mt-5 font-display fluid-text-4xl leading-[0.94] text-white">
                <span className="block">{t('hero.titleLine1')}</span>
                <span className="mt-2 block text-gradient-gold">{t('hero.titleLine2')}</span>
              </h1>
              <p className="mt-5 max-w-2xl fluid-text-lg leading-relaxed text-gold-50/82">
                {t('hero.subtitle')}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="#core-teachings" className="btn-primary">
                  {t('hero.ctaExplore')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/live" className="btn-secondary border-white/20 bg-white/8 text-white hover:bg-white/12">
                  <Play className="h-4 w-4" />
                  {t('hero.ctaWatch')}
                </Link>
              </div>

              <div className="mt-10 grid gap-3 border-t border-white/12 pt-6 text-left sm:grid-cols-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-gold-200/72">{t('hero.blessing')}</p>
                  <p className="mt-2 text-sm text-gold-50/78">{t('hero.shloka')}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-gold-200/72">Tradition</p>
                  <p className="mt-2 text-sm text-gold-50/78">Living Vedanta, seva, discourse, and spiritual discipline.</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-gold-200/72">Platform</p>
                  <p className="mt-2 text-sm text-gold-50/78">Panchang, teachings, events, media, and ways to connect.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
