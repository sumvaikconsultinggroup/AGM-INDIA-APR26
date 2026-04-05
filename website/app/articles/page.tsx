'use client';

import { motion } from 'framer-motion';
import { FileText, ArrowRight, Calendar, Clock, BookOpen, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import api from '../../lib/api';
import { useTranslation } from 'react-i18next';

// Fallback data in case API fails
const fallbackArticles = [
  {
    title: 'The Essence of Advaita: Understanding Non-Duality',
    excerpt: 'A profound exploration of the Advaita philosophy and how it reveals the ultimate unity of all existence.',
    date: 'December 10, 2024',
    readTime: '12 min read',
    category: 'Vedanta',
  },
  {
    title: 'Karma and Its Fruits: A Vedantic Perspective',
    excerpt: 'Understanding the law of karma, its subtle workings, and the path to liberation from karmic bondage.',
    date: 'December 5, 2024',
    readTime: '10 min read',
    category: 'Philosophy',
  },
  {
    title: 'The Power of Satsang in Spiritual Growth',
    excerpt: 'Why gathering in the company of truth transforms consciousness and accelerates spiritual evolution.',
    date: 'November 28, 2024',
    readTime: '8 min read',
    category: 'Satsang',
  },
  {
    title: 'Dhyana: The Science of Meditation',
    excerpt: 'A comprehensive guide to the ancient practice of meditation and its transformative power.',
    date: 'November 20, 2024',
    readTime: '15 min read',
    category: 'Practice',
  },
  {
    title: 'The Guru Principle: Dispeller of Darkness',
    excerpt: 'Understanding the sacred role of the Guru in illuminating the path from ignorance to wisdom.',
    date: 'November 15, 2024',
    readTime: '12 min read',
    category: 'Philosophy',
  },
  {
    title: 'Sanatan Dharma in the Modern World',
    excerpt: 'How the eternal principles of Sanatan Dharma remain relevant and vital in contemporary times.',
    date: 'November 8, 2024',
    readTime: '9 min read',
    category: 'Vedanta',
  },
];

interface Article {
  _id?: string;
  title: string;
  excerpt?: string;
  description?: string;
  link?: string;
  date?: string;
  createdAt?: string;
  readTime?: string;
  category?: string;
}

export default function ArticlesPage() {
  const { t } = useTranslation('articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    api.get('/articles')
      .then(r => {
        const data = r.data?.data || r.data || [];
        setArticles(data.length > 0 ? data : fallbackArticles);
      })
      .catch(() => {
        setArticles(fallbackArticles);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const dynamicCategories = Array.from(
      new Set(
        articles
          .map((article) => article.category)
          .filter((value): value is string => Boolean(value))
      )
    );
    return ['All', ...dynamicCategories];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'All') return articles;
    return articles.filter((article) => article.category === selectedCategory);
  }, [articles, selectedCategory]);

  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredArticles.length;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative bg-parchment py-24 overflow-hidden">
        {/* Decorative book pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 text-8xl text-gold-600 font-sanskrit">ॐ</div>
          <div className="absolute bottom-10 right-10 text-8xl text-gold-600 font-sanskrit rotate-180">ॐ</div>
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
              <FileText className="w-10 h-10 text-white" />
            </div>
            
            <span className="text-gold-500 font-sanskrit text-lg tracking-wider">{t('hero.sanskritTitle')}</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-spiritual-maroon mt-2 mb-6">
              {t('hero.title')} <span className="text-gradient-gold">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="text-spiritual-warmGray text-lg md:text-xl leading-relaxed font-body">
              {t('hero.subtitle')}
            </p>
            
            {/* Decorative divider */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <span className="w-16 h-px bg-gradient-to-r from-transparent to-gold-400" />
              <BookOpen className="w-5 h-5 text-gold-400" />
              <span className="w-16 h-px bg-gradient-to-l from-transparent to-gold-400" />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="divider-rangoli" />

      {/* Articles Grid */}
      <section className="section-padding bg-temple-warm">
        <div className="container-custom">
          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setVisibleCount(6);
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
              <p className="text-spiritual-warmGray font-body">Loading articles...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && articles.length === 0 && (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 text-gold-400 mx-auto mb-4" />
              <h3 className="font-display text-2xl text-spiritual-maroon mb-2">{t('noArticles')}</h3>
              <p className="text-spiritual-warmGray"></p>
            </div>
          )}

          {/* Articles Grid */}
          {!loading && articles.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleArticles.map((article, index) => (
                <motion.article
                  key={article._id || article.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card-temple p-6 flex flex-col group hover:shadow-temple transition-shadow duration-300"
                >
                  {/* Category Tag */}
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-spiritual-saffron/20 to-gold-200/50 text-spiritual-saffron text-xs font-semibold">
                      {article.category || 'Article'}
                    </span>
                  </div>
                  
                  {/* Date & Read Time */}
                  <div className="flex items-center gap-4 text-sm text-gold-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(article.date || article.createdAt)}
                    </span>
                    {article.readTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {article.readTime}
                      </span>
                    )}
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-display text-xl text-spiritual-maroon mb-3 group-hover:text-spiritual-saffron transition-colors">
                    {article.title}
                  </h3>
                  
                  {/* Excerpt */}
                  <p className="text-spiritual-warmGray text-sm mb-6 flex-grow leading-relaxed">
                    {article.excerpt || article.description || ''}
                  </p>
                  
                  {/* Read More Link */}
                  {article.link ? (
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-gold-600 font-medium hover:text-spiritual-saffron group/link"
                    >
                      <span className="relative">
                        {t('readArticle')}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold-400 group-hover/link:w-full transition-all duration-300" />
                      </span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/link:translate-x-1 transition-transform" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center text-gold-400/70 font-medium cursor-not-allowed">
                      {t('readArticle')} Unavailable
                    </span>
                  )}
                </motion.article>
              ))}
            </div>
          )}

          {/* Load More */}
          {!loading && filteredArticles.length > 0 && canLoadMore && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="btn-gold group"
              >
                Load More Articles
                <svg className="w-4 h-4 ml-2 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="divider-rangoli" />

      {/* Newsletter Section */}
      <section className="section-padding bg-parchment">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="card-temple p-8 md:p-10">
              <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <FileText className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="font-display text-2xl md:text-3xl text-spiritual-maroon mb-3">
                Subscribe for Wisdom
              </h3>
              <p className="text-spiritual-warmGray mb-6">
                Receive new articles and spiritual insights directly in your inbox
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl bg-spiritual-warmWhite border-2 border-gold-300 focus:border-gold-500 focus:ring-4 focus:ring-gold-200/50 focus:outline-none text-spiritual-maroon placeholder:text-spiritual-warmGray/50 transition-all duration-300"
                />
                <button className="btn-primary whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
