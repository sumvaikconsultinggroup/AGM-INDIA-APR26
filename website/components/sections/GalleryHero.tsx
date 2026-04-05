'use client';

import { useTranslation } from 'react-i18next';

export function GalleryHero() {
  const { t } = useTranslation('gallery');

  return (
    <section className="relative bg-parchment py-20 overflow-hidden">
      {/* Ornamental corner decorations */}
      <div className="absolute top-4 left-4 w-24 h-24 opacity-30">
        <svg viewBox="0 0 100 100" className="w-full h-full text-gold-400">
          <path fill="currentColor" d="M0,50 Q25,25 50,0 Q75,25 100,50 Q75,75 50,100 Q25,75 0,50" />
        </svg>
      </div>
      <div className="absolute top-4 right-4 w-24 h-24 opacity-30">
        <svg viewBox="0 0 100 100" className="w-full h-full text-gold-400">
          <path fill="currentColor" d="M0,50 Q25,25 50,0 Q75,25 100,50 Q75,75 50,100 Q25,75 0,50" />
        </svg>
      </div>

      {/* Gold borders */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

      <div className="container-custom relative z-10 text-center">
        {/* Camera/Gallery Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow animate-breathe">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
