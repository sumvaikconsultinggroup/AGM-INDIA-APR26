'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { SectionHeading } from '../ui/SectionHeading';
import { Droplets, Leaf, GraduationCap, School } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const initiativeKeys = [
  { key: 'shivganga', impactNumber: 5000, impactSuffix: '+', icon: Droplets },
  { key: 'greenKumbh', impactNumber: null, impactSuffix: '', icon: Leaf },
  { key: 'futureSkilling', impactNumber: 2000, impactSuffix: '+', icon: GraduationCap },
  { key: 'bhopalVidyaPeeth', impactNumber: null, impactSuffix: '', icon: School },
];

function CounterAnimation({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (isInView && target > 0) {
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function Initiatives() {
  const { t } = useTranslation('home');

  return (
    <section
      id="initiatives"
      className="section-padding relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FFFDF5 0%, #FFF8E7 50%, #F5E6CC 100%)',
      }}
    >
      <div className="container-custom">
        <SectionHeading
          title={t('initiatives.title')}
          subtitle={t('initiatives.subtitle')}
        />

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {initiativeKeys.map((initiative, index) => {
            const IconComponent = initiative.icon;
            const title = t(`initiatives.${initiative.key}.title`);
            const location = t(`initiatives.${initiative.key}.location`);
            const description = t(`initiatives.${initiative.key}.description`);
            const impactLabel = t(`initiatives.${initiative.key}.impactLabel`);
            return (
              <motion.div
                key={initiative.key}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="card-3d-hover bg-white rounded-2xl overflow-hidden relative group"
              >
                {/* Maroon Accent Line on Left */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-spiritual-maroon via-spiritual-deepRed to-spiritual-maroon" />

                <div className="p-6 lg:p-8 pl-8 lg:pl-10">
                  {/* Top Row: Icon + Title + Location */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Icon Circle */}
                    <div className="w-14 h-14 flex-shrink-0 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-md group-hover:shadow-warm transition-shadow">
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h3 className="font-display text-xl lg:text-2xl text-spiritual-maroon mb-2 group-hover:text-gradient-gold transition-colors">
                        {title}
                      </h3>

                      {/* Location Pill Badge */}
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gold-400/10 text-spiritual-warmGray border border-gold-400/20">
                        <svg
                          className="w-3 h-3 mr-1.5 text-gold-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {location}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-spiritual-warmGray text-sm lg:text-base leading-relaxed font-body mb-6">
                    {description}
                  </p>

                  {/* Impact Stat */}
                  <div className="pt-4 border-t border-gold-400/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-gold-400 to-spiritual-saffron animate-pulse" />
                      <span className="font-display text-lg text-spiritual-maroon">
                        {initiative.impactNumber !== null ? (
                          <>
                            <CounterAnimation
                              target={initiative.impactNumber}
                              suffix={initiative.impactSuffix}
                            />{' '}
                            <span className="text-spiritual-warmGray font-body text-sm">
                              {impactLabel}
                            </span>
                          </>
                        ) : (
                          <span className="text-spiritual-warmGray font-body text-base">
                            {impactLabel}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subtle Corner Decoration */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg
                    className="w-16 h-16 text-gold-400"
                    viewBox="0 0 100 100"
                    fill="currentColor"
                  >
                    <path d="M50 0C50 27.6 27.6 50 0 50C27.6 50 50 72.4 50 100C50 72.4 72.4 50 100 50C72.4 50 50 27.6 50 0Z" />
                  </svg>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
