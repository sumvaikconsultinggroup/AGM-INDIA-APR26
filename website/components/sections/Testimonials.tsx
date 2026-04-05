'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Dr. Ramesh Sharma',
    location: 'Haridwar',
    quote:
      "Swami Ji's discourses on Advaita Vedanta have transformed my understanding of life. His ability to make ancient wisdom accessible to modern seekers is truly remarkable.",
  },
  {
    id: 2,
    name: 'Priya Mehta',
    location: 'Mumbai',
    quote:
      "Attending the Satsang at Kankhal Ashram was a life-changing experience. The peace and spiritual energy there is indescribable. Swami Ji's presence radiates divine grace.",
  },
  {
    id: 3,
    name: 'Acharya Vinod Tiwari',
    location: 'Prayagraj',
    quote:
      "As a fellow scholar of Vedanta, I am constantly inspired by Swami Ji's depth of knowledge and his tireless commitment to preserving and spreading Sanatan Dharma across the world.",
  },
  {
    id: 4,
    name: 'Sunita Devi',
    location: 'Ambala',
    quote:
      "Through Swami Ji's guidance, our entire community has been uplifted. The Shivganga project brought water, education, and hope to our village. He is truly a saint of the people.",
  },
  {
    id: 5,
    name: 'Michael Thompson',
    location: 'New York, USA',
    quote:
      "I traveled from New York to attend Swami Ji's International Yoga Day celebration at Times Square. His message of universal consciousness transcends all cultural and religious boundaries.",
  },
];

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const goToIndex = (index: number) => {
    setActiveIndex(index);
  };

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [isPaused, goToNext]);

  return (
    <section
      id="testimonials"
      className="section-padding relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FFFDF5 0%, #FFF8E7 50%, #F5E6CC 100%)',
      }}
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gold-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-spiritual-saffron/5 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <SectionHeading
          title="Voices of Devotion"
          subtitle="Hearts touched by divine grace"
        />

        {/* Testimonial Carousel */}
        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="card-temple p-8 md:p-12"
            >
              {/* Gold Left Border Accent */}
              <div className="absolute left-0 top-8 bottom-8 w-1 bg-gradient-to-b from-gold-400 via-gold-300 to-gold-400 rounded-full" />

              {/* Large Quotation Mark */}
              <div className="absolute top-4 right-6 md:top-6 md:right-8">
                <Quote className="w-16 h-16 md:w-20 md:h-20 text-gold-400/20 fill-gold-400/10" />
              </div>

              <div className="relative pl-6">
                {/* Quote Text */}
                <blockquote className="font-spiritual text-xl md:text-2xl lg:text-2xl text-spiritual-warmGray italic leading-relaxed mb-8">
                  &ldquo;{testimonials[activeIndex].quote}&rdquo;
                </blockquote>

                {/* Attribution */}
                <div className="flex items-center gap-4">
                  {/* Avatar Placeholder */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-spiritual-maroon to-spiritual-deepRed flex items-center justify-center border-2 border-gold-400/40">
                    <span className="font-display text-xl text-gold-300">
                      {testimonials[activeIndex].name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-display text-lg text-spiritual-maroon">
                      {testimonials[activeIndex].name}
                    </p>
                    <p className="text-spiritual-warmGray text-sm">
                      {testimonials[activeIndex].location}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? 'bg-gold-400 scale-125 shadow-warm'
                    : 'bg-spiritual-warmGray/30 hover:bg-gold-400/50'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-6 max-w-xs mx-auto">
            <div className="h-1 bg-spiritual-sandstone/50 rounded-full overflow-hidden">
              <motion.div
                key={activeIndex}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-gold-400 to-spiritual-saffron"
                style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
              />
            </div>
          </div>
        </div>

        {/* Decorative Divider */}
        <div className="mt-16 flex items-center justify-center gap-4">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-gold-400/50" />
          <div className="font-sanskrit text-2xl text-gold-400/60">॥</div>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-gold-400/50" />
        </div>
      </div>
    </section>
  );
}
