'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { BookOpen, ShoppingCart, Star, Heart, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import api from '../../lib/api';
import { useTranslation } from 'react-i18next';

// Fallback data in case API fails
const fallbackBooks = [
  {
    title: 'Eternal Wisdom',
    description: 'From the Discourses, Lectures and Writings of H.H. Swami Avdheshanand Giri',
    cover: '/assets/videoseries/Book1.jpg',
    price: '₹450',
    rating: 4.9,
    category: 'Discourses',
  },
  {
    title: 'The Path to Ananda',
    description: 'A Mystic\'s Guide to Unlimited Happiness',
    cover: '/assets/videoseries/Book2.jpg',
    price: '₹399',
    rating: 4.8,
    category: 'Spiritual Guide',
  },
  {
    title: 'Journey To Self',
    description: 'Discovering the Divine Within',
    cover: '/assets/videoseries/Book3.jpg',
    price: '₹350',
    rating: 4.7,
    category: 'Philosophy',
  },
  {
    title: '108 Nuggets of Wisdom',
    description: 'For Life',
    cover: '/assets/videoseries/Book4.jpg',
    price: '₹299',
    rating: 4.9,
    category: 'Wisdom',
  },
];

interface Book {
  _id?: string;
  title: string;
  description?: string;
  cover?: string;
  image?: string;
  coverImage?: string;
  price?: string | number;
  rating?: number;
  category?: string;
}

export default function BooksPage() {
  const { t } = useTranslation('books');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Books');
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    api.get('/allbooks')
      .then(r => {
        const data = r.data?.data || r.data || [];
        setBooks(data.length > 0 ? data : fallbackBooks);
      })
      .catch(() => {
        setBooks(fallbackBooks);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const dynamicCategories = Array.from(
      new Set(
        books
          .map((book) => book.category)
          .filter((value): value is string => Boolean(value))
      )
    );
    return ['All Books', ...dynamicCategories];
  }, [books]);

  const filteredBooks = useMemo(() => {
    if (selectedCategory === 'All Books') return books;
    return books.filter((book) => book.category === selectedCategory);
  }, [books, selectedCategory]);

  const visibleBooks = filteredBooks.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredBooks.length;

  const buildBookInquiryMailto = (title: string) => {
    const subject = encodeURIComponent(`Book enquiry: ${title}`);
    return `mailto:office@avdheshanandg.org?subject=${subject}`;
  };

  const formatPrice = (price?: string | number) => {
    if (!price) return '₹0';
    if (typeof price === 'string') return price.startsWith('₹') ? price : `₹${price}`;
    return `₹${price}`;
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative bg-maroon-gradient py-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-gold-400 blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-0 right-1/4 w-56 h-56 rounded-full bg-gold-300 blur-3xl animate-pulse-soft animation-delay-500" />
        </div>
        
        {/* Gold borders */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow animate-breathe">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            
            <span className="text-gold-300/80 font-sanskrit text-lg tracking-wider">{t('hero.sanskritTitle')}</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-gold-200 mt-2 mb-6">
              {t('hero.title')} <span className="text-gradient-gold">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="text-gold-100/80 text-lg md:text-xl leading-relaxed font-body">
              {t('hero.subtitle')}
            </p>
            
            {/* Decorative divider */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <span className="w-16 h-px bg-gradient-to-r from-transparent to-gold-400" />
              <Star className="w-5 h-5 text-gold-400" fill="currentColor" />
              <span className="w-16 h-px bg-gradient-to-l from-transparent to-gold-400" />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="divider-rangoli" />

      {/* Books Grid */}
      <section className="section-padding bg-parchment">
        <div className="container-custom">
          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setVisibleCount(8);
                }}
                className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-gold-400 to-gold-500 text-white shadow-warm'
                    : 'bg-white border-2 border-gold-300 text-spiritual-maroon hover:border-gold-400 hover:bg-gold-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-spiritual-saffron animate-spin mb-4" />
              <p className="text-spiritual-warmGray font-body">Loading books...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && books.length === 0 && (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gold-400 mx-auto mb-4" />
              <h3 className="font-display text-2xl text-spiritual-maroon mb-2">{t('noBooks')}</h3>
              <p className="text-spiritual-warmGray"></p>
            </div>
          )}

          {/* Books Grid */}
          {!loading && books.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {visibleBooks.map((book, index) => (
                <motion.div
                  key={book._id || book.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card-temple overflow-hidden group"
                >
                  {/* Book Cover with ornamental frame */}
                  <div className="relative aspect-[3/4] bg-spiritual-sandstone overflow-hidden">
                    {/* Ornamental frame overlay */}
                    <div className="absolute inset-2 border-2 border-gold-400/30 rounded-lg z-10 pointer-events-none" />
                    <div className="absolute inset-3 border border-gold-400/20 rounded-lg z-10 pointer-events-none" />
                    
                    <Image
                      src={book.cover || book.image || book.coverImage || '/assets/videoseries/Book1.jpg'}
                      alt={book.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Wishlist button */}
                    <button className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-warm hover:bg-gold-50">
                      <Heart className="w-5 h-5 text-spiritual-maroon" />
                    </button>
                    
                    {/* Category badge */}
                    <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-gradient-to-r from-spiritual-saffron to-primary-600 text-white text-xs font-semibold">
                      {book.category || 'Book'}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5">
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(book.rating || 5)
                              ? 'text-gold-400'
                              : 'text-gold-200'
                          }`}
                          fill="currentColor"
                        />
                      ))}
                      <span className="text-sm text-gold-600 ml-1">{book.rating || 5.0}</span>
                    </div>
                    
                    <h3 className="font-display text-lg text-spiritual-maroon mb-2 group-hover:text-spiritual-saffron transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-spiritual-warmGray text-sm mb-4 line-clamp-2">
                      {book.description || ''}
                    </p>
                    
                    {/* Price and Cart */}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-display text-gradient-gold">
                        {formatPrice(book.price)}
                      </span>
                      <a
                        href={buildBookInquiryMailto(book.title)}
                        className="btn-gold py-2 px-4 text-sm group/btn"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1 group-hover/btn:scale-110 transition-transform" />
                        Enquire
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Browse All Button */}
          {!loading && filteredBooks.length > 0 && canLoadMore && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 8)}
                className="btn-secondary group"
              >
                Load More Books
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="divider-rangoli" />

      {/* Featured Quote Section */}
      <section className="section-padding bg-temple-warm">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="card-temple p-8 md:p-12">
              <span className="text-6xl text-gold-400 font-serif leading-none">&ldquo;</span>
              <blockquote className="font-spiritual text-2xl md:text-3xl text-spiritual-maroon leading-relaxed mt-2 mb-6">
                The true purpose of reading sacred texts is not to gather information, 
                but to transform the reader.
              </blockquote>
              <div className="flex items-center justify-center gap-3">
                <span className="w-12 h-px bg-gold-400" />
                <span className="font-display text-gold-600">Swami Avdheshanand Giri Ji</span>
                <span className="w-12 h-px bg-gold-400" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
