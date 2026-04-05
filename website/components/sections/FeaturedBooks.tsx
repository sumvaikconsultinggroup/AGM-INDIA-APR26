'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

const books = [
  {
    id: 1,
    title: 'Eternal Wisdom',
    subtitle: 'From the Discourses of H.H. Swami Avdheshanand Giri',
    category: 'Discourses',
  },
  {
    id: 2,
    title: 'The Path to Ananda',
    subtitle: "A Mystic's Guide to Unlimited Happiness",
    category: 'Spiritual Guide',
  },
  {
    id: 3,
    title: 'Journey To Self',
    subtitle: 'Discovering the Divine Within',
    category: 'Philosophy',
  },
  {
    id: 4,
    title: '108 Nuggets of Wisdom',
    subtitle: 'For Life',
    category: 'Wisdom',
  },
  {
    id: 5,
    title: 'Unfolding Divinity Within',
    subtitle: 'Awakening the Sacred Self',
    category: 'Meditation',
  },
  {
    id: 6,
    title: 'Eternal Echoes',
    subtitle: 'Reverberations of Truth',
    category: 'Vedanta',
  },
  {
    id: 7,
    title: 'Gharisth Gita',
    subtitle: 'Wisdom for the Householder',
    category: 'Scripture',
  },
  {
    id: 8,
    title: 'Brahm Hi Satya Hai',
    subtitle: 'The Supreme Truth',
    category: 'Vedanta',
  },
];

export function FeaturedBooks() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 260; // book card width + gap
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="books-showcase" className="section-padding bg-maroon-gradient relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-9xl font-sanskrit text-gold-400">ॐ</div>
        <div className="absolute bottom-10 right-10 text-9xl font-sanskrit text-gold-400">ॐ</div>
      </div>

      <div className="container-custom relative z-10">
        <SectionHeading
          title="Sacred Literature"
          subtitle="Explore the profound wisdom penned by Swami Ji"
          className="[&_h2]:text-gold-300 [&_p]:text-gold-100/80"
        />

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll('left')}
            className="p-3 rounded-full border-2 border-gold-400/50 text-gold-400 hover:bg-gold-400/10 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll('right')}
            className="p-3 rounded-full border-2 border-gold-400/50 text-gold-400 hover:bg-gold-400/10 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Book Carousel */}
        <div ref={carouselRef} className="book-carousel">
          {books.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="book-card"
            >
              <div className="relative h-80 rounded-lg overflow-hidden cursor-pointer group">
                {/* Book Cover Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-spiritual-maroon via-spiritual-deepRed to-primary-900" />
                
                {/* Ornamental Gold Border Frame */}
                <div className="absolute inset-2 border-2 border-gold-400/40 rounded-md group-hover:border-gold-400/70 transition-colors" />
                <div className="absolute inset-3 border border-gold-400/20 rounded" />
                
                {/* Decorative Om Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-15 transition-opacity">
                  <span className="text-8xl font-sanskrit text-gold-400">ॐ</span>
                </div>
                
                {/* Book Icon Top */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2">
                  <BookOpen className="w-6 h-6 text-gold-400/60" />
                </div>

                {/* Book Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="font-display text-xl text-gold-300 mb-2 leading-tight group-hover:text-gold-200 transition-colors">
                    {book.title}
                  </h3>
                  <p className="font-spiritual text-sm text-spiritual-parchment/80 leading-relaxed mb-4 line-clamp-3">
                    {book.subtitle}
                  </p>
                </div>

                {/* Category Badge */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-gold-400/20 text-gold-300 rounded-full border border-gold-400/30">
                    {book.category}
                  </span>
                </div>

                {/* Corner Decorations */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-gold-400/50 rounded-tl" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-gold-400/50 rounded-tr" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-gold-400/50 rounded-bl" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-gold-400/50 rounded-br" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Featured Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center max-w-3xl mx-auto"
        >
          <div className="relative px-8 py-6">
            {/* Quote Marks */}
            <span className="absolute top-0 left-4 text-5xl font-display text-gold-400/40 leading-none">&ldquo;</span>
            <span className="absolute bottom-0 right-4 text-5xl font-display text-gold-400/40 leading-none rotate-180">&rdquo;</span>
            
            <blockquote className="font-spiritual text-xl md:text-2xl text-gold-100 italic leading-relaxed">
              The true purpose of reading sacred texts is not to gather information, but to transform the reader.
            </blockquote>
            <cite className="block mt-4 font-display text-gold-400 not-italic">
              — Swami Avdheshanand Giri Ji
            </cite>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
