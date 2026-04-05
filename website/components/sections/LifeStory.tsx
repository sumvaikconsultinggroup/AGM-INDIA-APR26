'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Star, Mountain, BookOpen, Flame, Crown, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useTranslation } from 'react-i18next';

const milestoneKeys = [
  { key: 'divineBirth', Icon: Star },
  { key: 'callOfHimalayas', Icon: Mountain },
  { key: 'gurusGrace', Icon: BookOpen },
  { key: 'sacredRenunciation', Icon: Flame },
  { key: 'ascendingSeat', Icon: Crown },
  { key: 'worldInService', Icon: Globe },
];

export function LifeStory() {
  const { t } = useTranslation('home');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition();
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      id="life-story"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FFF8E7 0%, #F5E6CC 50%, #FFF8E7 100%)',
      }}
    >
      {/* Mandala watermark background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='200' cy='200' r='180' fill='none' stroke='%23D4A017' stroke-width='2'/%3E%3Ccircle cx='200' cy='200' r='140' fill='none' stroke='%23D4A017' stroke-width='1.5'/%3E%3Ccircle cx='200' cy='200' r='100' fill='none' stroke='%23D4A017' stroke-width='1'/%3E%3Ccircle cx='200' cy='200' r='60' fill='none' stroke='%23D4A017' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
          }}
        />
      </div>

      <div className="container-custom relative">
        <SectionHeading
          title={t('lifeStory.title')}
          subtitle={t('lifeStory.subtitle')}
        />

        {/* Timeline Container */}
        <div className="relative">
          {/* Scroll Navigation Buttons - Desktop */}
          <button
            onClick={() => scroll('left')}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex w-12 h-12 items-center justify-center rounded-full bg-spiritual-warmWhite border-2 border-gold-400 shadow-warm transition-all duration-300 ${
              canScrollLeft 
                ? 'opacity-100 hover:bg-gold-400 hover:text-white cursor-pointer' 
                : 'opacity-30 cursor-not-allowed'
            }`}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-gold-600" />
          </button>
          <button
            onClick={() => scroll('right')}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex w-12 h-12 items-center justify-center rounded-full bg-spiritual-warmWhite border-2 border-gold-400 shadow-warm transition-all duration-300 ${
              canScrollRight 
                ? 'opacity-100 hover:bg-gold-400 hover:text-white cursor-pointer' 
                : 'opacity-30 cursor-not-allowed'
            }`}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-gold-600" />
          </button>

          {/* Timeline Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="timeline-scroll px-4 md:px-16 py-8 -mx-4 md:-mx-8"
          >
            {/* Gold connecting line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 hidden md:block" style={{ transform: 'translateY(-50%)' }} />

            <div className="flex gap-6 md:gap-8 lg:gap-12">
              {milestoneKeys.map((milestone, index) => {
                const isAbove = index % 2 === 0;

                return (
                  <motion.div
                    key={milestone.key}
                    initial={{ opacity: 0, y: isAbove ? -50 : 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: index * 0.15, duration: 0.6, ease: 'easeOut' }}
                    className="relative flex flex-col items-center min-w-[280px] md:min-w-[320px]"
                  >
                    {/* Card positioned above or below on desktop */}
                    <div className={`flex flex-col items-center ${isAbove ? 'md:flex-col' : 'md:flex-col-reverse'}`}>
                      {/* Timeline Node with Icon */}
                      <div className="relative z-10 mb-4 md:mb-0">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow cursor-pointer"
                        >
                          <milestone.Icon className="w-7 h-7 md:w-9 md:h-9 text-white" />
                        </motion.div>
                        {/* Year badge */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-spiritual-maroon text-white text-xs font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                          {t(`lifeStory.milestones.${milestone.key}.year`)}
                        </div>
                      </div>

                      {/* Connecting stem on desktop */}
                      <div className={`hidden md:block w-px h-8 bg-gradient-to-b from-gold-400 to-gold-300 ${isAbove ? 'order-first' : 'order-last'}`} />

                      {/* Card */}
                      <motion.div
                        whileHover={{ y: isAbove ? -5 : 5, boxShadow: '0 8px 32px rgba(128, 0, 32, 0.15), 0 0 20px rgba(212, 160, 23, 0.2)' }}
                        className={`card-temple p-5 md:p-6 w-[280px] md:w-[300px] mt-8 md:mt-0 ${isAbove ? 'md:mb-8' : 'md:mt-8'}`}
                      >
                        {/* Maroon accent top */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-spiritual-maroon via-spiritual-deepRed to-spiritual-maroon" />

                        <h3 className="font-display text-lg md:text-xl text-spiritual-maroon mb-3">
                          {t(`lifeStory.milestones.${milestone.key}.title`)}
                        </h3>
                        <p className="text-spiritual-warmGray text-sm leading-relaxed font-body">
                          {t(`lifeStory.milestones.${milestone.key}.description`)}
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Mobile scroll hint */}
          <p className="text-center text-spiritual-warmGray text-sm mt-4 md:hidden">
            <span className="inline-flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              {t('lifeStory.swipeToExplore')}
              <ChevronRight className="w-4 h-4" />
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
