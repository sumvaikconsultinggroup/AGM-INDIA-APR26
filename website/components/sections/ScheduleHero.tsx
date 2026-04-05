'use client';

import { useTranslation } from 'react-i18next';

export function ScheduleHero() {
  const { t } = useTranslation('schedule');

  return (
    <section className="relative bg-parchment py-20 overflow-hidden">
      {/* Decorative mandala corners */}
      <div className="absolute top-0 left-0 w-40 h-40 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full text-gold-400 animate-mandala-spin" style={{ animationDuration: '120s' }}>
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-40 h-40 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full text-gold-400 animate-mandala-spin" style={{ animationDuration: '120s', animationDirection: 'reverse' }}>
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      {/* Gold borders */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

      <div className="container-custom relative z-10 text-center">
        {/* Calendar Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow animate-breathe">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <span className="text-gold-500 font-sanskrit text-lg tracking-wider">{t('hero.sanskritTitle')}</span>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-spiritual-maroon mt-2 mb-6">
          {t('hero.title')} <span className="text-gradient-gold">{t('hero.titleHighlight')}</span>
        </h1>
        <p className="max-w-2xl mx-auto text-spiritual-warmGray text-lg md:text-xl font-body leading-relaxed">
          {t('hero.subtitle')}
        </p>

        {/* Decorative divider */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <span className="w-12 h-px bg-gradient-to-r from-transparent to-gold-400" />
          <span className="text-gold-400 text-lg">&#10023;</span>
          <span className="w-12 h-px bg-gradient-to-l from-transparent to-gold-400" />
        </div>
      </div>
    </section>
  );
}
