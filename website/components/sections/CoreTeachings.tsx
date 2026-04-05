'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { SectionHeading } from '../ui/SectionHeading';
import { Eye, BookOpen, Sun, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const teachingKeys = [
  { key: 'meditation', image: '/newassets/meditation.webp', icon: Eye },
  { key: 'advaita', image: '/newassets/vedant.webp', icon: BookOpen },
  { key: 'consciousLiving', image: '/newassets/conscious.webp', icon: Sun },
  { key: 'seva', image: '/newassets/service.webp', icon: Heart },
];

export function CoreTeachings() {
  const { t } = useTranslation('home');

  return (
    <section
      id="teachings"
      className="section-padding bg-parchment relative overflow-hidden bg-mandala"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <Image
          src="/newassets/coreteachingbg.png"
          alt=""
          fill
          className="object-cover"
        />
      </div>

      <div className="container-custom relative">
        <SectionHeading
          title={t('coreTeachings.title')}
          subtitle={t('coreTeachings.subtitle')}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {teachingKeys.map((teaching, index) => {
            const IconComponent = teaching.icon;
            const title = t(`coreTeachings.${teaching.key}.title`);
            const tagline = t(`coreTeachings.${teaching.key}.tagline`);
            const description = t(`coreTeachings.${teaching.key}.description`);
            return (
              <motion.div
                key={teaching.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="flip-card h-[380px] cursor-pointer"
              >
                <div className="flip-card-inner">
                  {/* Front of Card */}
                  <div className="flip-card-front">
                    {/* Background Image */}
                    <Image
                      src={teaching.image}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                    {/* Front Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      {/* Gold Icon Circle */}
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mb-6 shadow-lg">
                        <IconComponent className="w-10 h-10 text-spiritual-maroon" />
                      </div>

                      {/* Title */}
                      <h3 className="font-display text-xl lg:text-2xl text-white mb-3">
                        {title}
                      </h3>

                      {/* Tagline */}
                      <p className="text-gold-300 text-sm font-body italic">
                        {tagline}
                      </p>

                      {/* Hover hint */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-60">
                        <div className="w-8 h-1 bg-gold-400/50 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Back of Card */}
                  <div className="flip-card-back bg-gradient-to-br from-spiritual-maroon to-spiritual-deepRed">
                    {/* Gold Accent Border */}
                    <div className="absolute inset-0 border-2 border-gold-400/30 rounded-2xl m-2" />

                    {/* Back Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      {/* Small Om Symbol */}
                      <div className="text-gold-400/40 text-3xl font-sanskrit mb-4">
                        ॐ
                      </div>

                      {/* Description */}
                      <p className="text-white/90 text-sm leading-relaxed font-body">
                        {description}
                      </p>

                      {/* Gold Accent Line */}
                      <div className="mt-6 w-16 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
                    </div>

                    {/* Corner Decorations */}
                    <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-gold-400/40 rounded-tl-lg" />
                    <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-gold-400/40 rounded-tr-lg" />
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-gold-400/40 rounded-bl-lg" />
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-gold-400/40 rounded-br-lg" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
