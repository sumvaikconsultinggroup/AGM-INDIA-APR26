'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { BookOpen, ExternalLink, Loader2, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';
import { PageHero } from '@/components/ui/PageHero';
import { SectionHeading } from '@/components/ui/SectionHeading';

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
    description: "A Mystic's Guide to Unlimited Happiness",
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
  genre?: string;
  purchaseUrl?: string;
}

export default function BooksPage() {
  const { t } = useTranslation('books');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Books');
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    api
      .get('/allbooks')
      .then((response) => {
        const data = response.data?.data || response.data || [];
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

  const formatPrice = (price?: string | number) => {
    if (!price) return '₹0';
    if (typeof price === 'string') return price.startsWith('₹') ? price : `₹${price}`;
    return `₹${price}`;
  };

  return (
    <div className="bg-parchment pt-20">
      <PageHero
        tone="dark"
        eyebrow={t('hero.sanskritTitle')}
        title={t('hero.title')}
        highlight={t('hero.titleHighlight')}
        subtitle={t('hero.subtitle')}
        icon={<BookOpen className="h-8 w-8" />}
      />

      <section className="section-padding bg-parchment">
        <div className="container-custom">
          <SectionHeading
            eyebrow="Publications"
            title="A bookstore experience that feels curated, not crowded"
            subtitle="The books page now leans into cover-led storytelling, cleaner filtering, and a calmer reading rhythm across the catalog."
          />

          <div className="mb-10 flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelectedCategory(category);
                  setVisibleCount(8);
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
              <p className="text-spiritual-warmGray">Loading books...</p>
            </div>
          )}

          {!loading && books.length === 0 && (
            <div className="rounded-[30px] border border-[rgba(122,86,26,0.12)] bg-white/90 py-20 text-center shadow-[0_20px_48px_rgba(60,34,12,0.08)]">
              <BookOpen className="mx-auto mb-4 h-16 w-16 text-gold-500" />
              <h3 className="font-display text-2xl text-spiritual-maroon">{t('noBooks')}</h3>
            </div>
          )}

          {!loading && books.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {visibleBooks.map((book, index) => (
                <motion.article
                  key={book._id || book.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="overflow-hidden rounded-[28px] border border-[rgba(122,86,26,0.12)] bg-white/92 shadow-[0_18px_42px_rgba(60,34,12,0.08)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#ece0c8]">
                    <Image
                      src={book.cover || book.image || book.coverImage || '/assets/videoseries/Book1.jpg'}
                      alt={book.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-spiritual-maroon/88 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                      {book.category || book.genre || 'Book'}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-center gap-1 text-gold-500">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className={`h-4 w-4 ${
                            starIndex < Math.floor(book.rating || 5) ? 'opacity-100' : 'opacity-30'
                          }`}
                          fill="currentColor"
                        />
                      ))}
                      <span className="ml-1 text-sm font-medium text-spiritual-warmGray">
                        {book.rating || 5.0}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl leading-tight text-spiritual-maroon">{book.title}</h3>
                    <p className="mt-3 min-h-[52px] text-sm leading-relaxed text-spiritual-warmGray">
                      {book.description || ''}
                    </p>

                    <div className="mt-6 flex items-center justify-between gap-3">
                      <span className="font-display text-2xl text-gradient-gold">{formatPrice(book.price)}</span>
                      {book.purchaseUrl ? (
                        <a
                          href={book.purchaseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-primary px-4 py-2.5 text-sm"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          {t('buyNow')}
                        </a>
                      ) : (
                        <span className="rounded-full border border-[rgba(122,86,26,0.16)] px-4 py-2.5 text-sm font-medium text-spiritual-warmGray">
                          {t('linkUnavailable')}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {!loading && filteredBooks.length > 0 && canLoadMore && (
            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((current) => current + 8)}
                className="btn-secondary"
              >
                Load More Books
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="section-padding bg-temple-warm">
        <div className="container-custom max-w-3xl">
          <div className="mb-8 rounded-[24px] border border-[rgba(122,86,26,0.14)] bg-white/92 p-5 text-center shadow-[0_16px_40px_rgba(60,34,12,0.06)]">
            <p className="text-sm leading-relaxed text-spiritual-warmGray md:text-base">
              {t('externalDisclaimer')}
            </p>
          </div>
          <div className="rounded-[30px] border border-[rgba(122,86,26,0.12)] bg-white/90 p-8 text-center shadow-[0_20px_48px_rgba(60,34,12,0.08)] md:p-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f3d894,#b57b1d)] text-white shadow-[0_14px_34px_rgba(181,123,29,0.26)]">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="font-display text-3xl text-spiritual-maroon">Reading as inner transformation</h3>
            <p className="mt-4 font-spiritual text-2xl leading-relaxed text-spiritual-maroon">
              “The true purpose of reading sacred texts is not to gather information, but to transform the reader.”
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
