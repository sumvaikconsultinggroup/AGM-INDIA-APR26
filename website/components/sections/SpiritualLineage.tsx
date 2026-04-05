'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';

const lineageNodes = [
  {
    title: 'Adi Shankaracharya',
    subtitle: 'The Supreme Teacher',
    description: 'In the 8th century, Adi Shankaracharya revived Sanatan Dharma and established the Dashanami monastic tradition — ten orders of monks to preserve Vedantic wisdom for all ages.',
    image: '/assets/sankaracharya.jpg',
  },
  {
    title: 'Bhagavan Dattatreya',
    subtitle: 'The Primordial Guru',
    description: 'Revered as the divine trinity of Brahma, Vishnu, and Maheshwara, Lord Dattatreya is the Adi Guru of the Nath and Akhara traditions, from whom the eternal stream of spiritual knowledge flows.',
    image: '/assets/lord-dakshinamurthy.jpg',
  },
  {
    title: 'Juna Akhara',
    subtitle: 'The Ancient Order',
    description: 'One of the oldest and most revered monastic orders in Hinduism, comprising 52 sub-lineages and over 500,000 sadhus worldwide. For centuries, it has stood as the guardian of Sanatan Dharma.',
    image: '/assets/kumbh_img.jpg',
  },
  {
    title: 'Swami Avdheshanand Giri Ji',
    subtitle: 'Acharya Mahamandaleshwar',
    description: 'The present-day torchbearer of this ancient lineage, guiding the world\'s largest monastic order with wisdom, compassion, and an unwavering commitment to Truth.',
    image: '/assets/Prabhushree ji 01_.webp',
  },
];

// Om Symbol component
function OmSymbol() {
  return (
    <span 
      className="text-gold-400 font-sanskrit text-lg md:text-xl select-none"
      style={{ textShadow: '0 0 10px rgba(212, 160, 23, 0.5)' }}
    >
      ॐ
    </span>
  );
}

export function SpiritualLineage() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      id="lineage"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FFF8E7 0%, #E8D5B7 50%, #F5E6CC 100%)',
      }}
    >
      {/* Temple arch pattern watermark */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M100 10 C150 10, 180 50, 180 100 C180 150, 150 180, 100 180 C50 180, 20 150, 20 100 C20 50, 50 10, 100 10' fill='none' stroke='%23800020' stroke-width='1'/%3E%3Cpath d='M100 30 L100 170 M30 100 L170 100' stroke='%23D4A017' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '300px 300px',
            backgroundRepeat: 'repeat',
          }}
        />
      </div>

      <div className="container-custom relative">
        <SectionHeading
          title="An Ancient Lineage of Wisdom"
          subtitle="Carrying the torch of Sanatan Dharma through millennia"
        />

        {/* Lineage Chain */}
        <div className="relative">
          {/* Desktop Layout - Horizontal */}
          <div className="hidden md:block">
            {/* Horizontal connecting line */}
            <div className="absolute top-[100px] left-[10%] right-[10%] h-1 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 z-0" />
            
            {/* Om symbols on the line */}
            <div className="absolute top-[100px] left-[10%] right-[10%] flex justify-around items-center z-10 -translate-y-1/2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-spiritual-parchment px-2">
                  <OmSymbol />
                </div>
              ))}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-4 gap-6 lg:gap-8">
              {lineageNodes.map((node, index) => (
                <motion.div
                  key={node.title}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ delay: index * 0.2, duration: 0.6, ease: 'easeOut' }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Circular Image with gold border and glow */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative mb-6"
                  >
                    <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-gold-400 shadow-glow relative">
                      <Image
                        src={node.image}
                        alt={node.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 128px, 160px"
                      />
                    </div>
                    {/* Golden glow effect */}
                    <div className="absolute inset-0 rounded-full shadow-glow-lg pointer-events-none" />
                  </motion.div>

                  {/* Arrow pointing to next (except last) */}
                  {index < lineageNodes.length - 1 && (
                    <div className="absolute top-[100px] right-0 translate-x-1/2 -translate-y-1/2 text-gold-400 hidden lg:block">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="card-temple p-5 w-full">
                    <h3 className="font-display text-lg lg:text-xl text-spiritual-maroon mb-1">
                      {node.title}
                    </h3>
                    <p className="text-gold-600 text-sm font-medium mb-3">
                      {node.subtitle}
                    </p>
                    <p className="text-spiritual-warmGray text-sm leading-relaxed font-body">
                      {node.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile Layout - Vertical */}
          <div className="md:hidden relative">
            {/* Vertical connecting line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-gold-300 via-gold-400 to-gold-300 z-0" />

            <div className="flex flex-col gap-8">
              {lineageNodes.map((node, index) => (
                <motion.div
                  key={node.title}
                  initial={{ opacity: 0, x: -30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: index * 0.2, duration: 0.5, ease: 'easeOut' }}
                  className="flex gap-6 items-start"
                >
                  {/* Circular Image - Left side on vertical line */}
                  <div className="relative flex-shrink-0 z-10">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-gold-400 shadow-warm">
                      <Image
                        src={node.image}
                        alt={node.title}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    {/* Om symbol below circle (except last) */}
                    {index < lineageNodes.length - 1 && (
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-spiritual-parchment px-1">
                        <OmSymbol />
                      </div>
                    )}
                  </div>

                  {/* Card Content - Right side */}
                  <div className="card-temple p-4 flex-1">
                    <h3 className="font-display text-lg text-spiritual-maroon mb-1">
                      {node.title}
                    </h3>
                    <p className="text-gold-600 text-xs font-medium mb-2">
                      {node.subtitle}
                    </p>
                    <p className="text-spiritual-warmGray text-sm leading-relaxed font-body">
                      {node.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom ornamental flourish */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex items-center justify-center gap-4 mt-12 md:mt-16"
        >
          <div className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent to-gold-400" />
          <div className="w-2 h-2 rotate-45 bg-gold-400" />
          <OmSymbol />
          <div className="w-2 h-2 rotate-45 bg-gold-400" />
          <div className="w-16 md:w-24 h-px bg-gradient-to-l from-transparent to-gold-400" />
        </motion.div>
      </div>
    </section>
  );
}
