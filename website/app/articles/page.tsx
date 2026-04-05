'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Calendar, Clock, FileText, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';
import { PageHero } from '@/components/ui/PageHero';
import { SectionHeading } from '@/components/ui/SectionHeading';

const fallbackArticles = [
  {
    title: 'The Essence of Advaita: Understanding Non-Duality',
    excerpt:
      'A profound exploration of Advaita philosophy and how it reveals the ultimate unity of all existence.',
    date: 'December 10, 2024',
    readTime: '12 min read',
    category: 'Vedanta',
  },
  {
    title: 'Karma and Its Fruits: A Vedantic Perspective',
    excerpt:
      'Understanding the law of karma, its subtle workings, and the path to liberation from karmic bondage.',
    date: 'December 5, 2024',
    readTime: '10 min read',
    category: 'Philosophy',
  },
  {
    title: 'The Power of Satsang in Spiritual Growth',
    excerpt:
      'Why gathering in the company of truth transforms consciousness and accelerates spiritual evolution.',
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
    excerpt:
      'Understanding the sacred role of the Guru in illuminating the path from ignorance to wisdom.',
    date: 'November 15, 2024',
    readTime: '12 min read',
    category: 'Philosophy',
  },
  {
    title: 'Sanatan Dharma in the Modern World',
    excerpt:
      'How the eternal principles of Sanatan Dharma remain relevant and vital in contemporary times.',
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
    api
      .get('/articles')
      .then((response) => {
        const data = response.data?.data || response.data || [];
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
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-parchment pt-20">
      <PageHero
        eyebrow={t('hero.sanskritTitle')}
        title={t('hero.title')}
        highlight={t('hero.titleHighlight')}
        subtitle={t('hero.subtitle')}
        icon={<FileText className="h-8 w-8" />}
      />

      <section className="section-padding bg-parchment">
        <div className="container-custom">
          <SectionHeading
            eyebrow="Library"
            title="Teachings, reflections, and spiritual writing"
            subtitle="A cleaner reading experience with stronger structure, clearer filtering, and less visual noise around the content itself."
          />

          <div className="mb-10 flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelectedCategory(category);
                  setVisibleCount(6);
                }}
                className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'border-transparent bg-spiritual-maroon text-white shadow-[0_12px_28px_rgba(70,18,30,0.18)]'
                    : 'border-[rgba(122,86,26,0.16)] bg-white/88 text-spiritual-maroon hover:border-[rgba(122,86,26,0.28)] hover:bg-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-spiritual-saffron" />
              <p className="text-spiritual-warmGray">Loading articles...</p>
            </div>
          )}

          {!loading && articles.length === 0 && (
            <div className="rounded-[30px] border border-[rgba(122,86,26,0.12)] bg-white/90 py-20 text-center shadow-[0_20px_48px_rgba(60,34,12,0.08)]">
              <FileText className="mx-auto mb-4 h-16 w-16 text-gold-500" />
              <h3 className="font-display text-2xl text-spiritual-maroon">{t('noArticles')}</h3>
            </div>
          )}

          {!loading && articles.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleArticles.map((article, index) => (
                <motion.article
                  key={article._id || article.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex h-full flex-col rounded-[28px] border border-[rgba(122,86,26,0.12)] bg-white/90 p-7 shadow-[0_18px_42px_rgba(60,34,12,0.08)]"
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <span className="inline-flex rounded-full bg-[rgba(128,0,32,0.06)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-spiritual-saffron">
                      {article.category || 'Article'}
                    </span>
                    <BookOpen className="h-5 w-5 text-gold-500" />
                  </div>

                  <div className="mb-5 flex flex-wrap items-center gap-4 text-sm text-spiritual-warmGray">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-gold-500" />
                      {formatDate(article.date || article.createdAt)}
                    </span>
                    {article.readTime && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-gold-500" />
                        {article.readTime}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-2xl leading-tight text-spiritual-maroon">
                    {article.title}
                  </h3>
                  <p className="mt-4 flex-grow text-base leading-relaxed text-spiritual-warmGray">
                    {article.excerpt || article.description || ''}
                  </p>

                  {article.link ? (
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-spiritual-saffron"
                    >
                      {t('readArticle')}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-spiritual-warmGray/70">
                      {t('readArticle')} Unavailable
                    </span>
                  )}
                </motion.article>
              ))}
            </div>
          )}

          {!loading && filteredArticles.length > 0 && canLoadMore && (
            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((current) => current + 6)}
                className="btn-primary"
              >
                Load More Articles
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="section-padding bg-temple-warm">
        <div className="container-custom max-w-3xl">
          <div className="rounded-[30px] border border-[rgba(122,86,26,0.12)] bg-white/90 p-8 text-center shadow-[0_20px_48px_rgba(60,34,12,0.08)] md:p-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f3d894,#b57b1d)] text-white shadow-[0_14px_34px_rgba(181,123,29,0.26)]">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="font-display text-3xl text-spiritual-maroon">Subscribe for Wisdom</h3>
            <p className="mt-3 text-base leading-relaxed text-spiritual-warmGray">
              Receive fresh articles, reflection notes, and spiritual insights directly in your inbox.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-2xl border border-[rgba(122,86,26,0.16)] bg-[rgba(248,243,232,0.92)] px-4 py-3.5 text-spiritual-maroon outline-none transition focus:border-[rgba(122,86,26,0.35)] focus:bg-white"
              />
              <button type="button" className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
