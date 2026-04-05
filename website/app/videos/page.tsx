'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Eye, Loader2, Play, Video } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';
import { PageHero } from '@/components/ui/PageHero';
import { SectionHeading } from '@/components/ui/SectionHeading';

const fallbackVideos = [
  {
    title: 'Devi Bhagwat Katha — Part 1',
    description: 'Sacred discourse on the divine Devi Bhagwat scripture.',
    thumbnail: '/assets/videoseries/hqdefault.jpg',
    duration: '1:15:00',
    views: '234K',
    category: 'Scripture',
  },
  {
    title: 'The Nature of Consciousness',
    description: 'Understanding the essence of awareness through Vedantic wisdom.',
    thumbnail: '/assets/videoseries/hqdefault1.jpg',
    duration: '45:30',
    views: '189K',
    category: 'Vedanta',
  },
  {
    title: 'Bhagavad Gita: The Song of the Divine',
    description: 'Illuminating discourse on the timeless wisdom of the Gita.',
    thumbnail: '/assets/videoseries/hqdefault2.jpg',
    duration: '1:02:15',
    views: '312K',
    category: 'Scripture',
  },
  {
    title: 'Meditation and the Mind',
    description: 'Practical guidance on mastering the mind through meditation.',
    thumbnail: '/assets/videoseries/hqdefault3.jpg',
    duration: '38:20',
    views: '156K',
    category: 'Practice',
  },
  {
    title: 'International Yoga Day — Times Square',
    description: 'Historic address at Times Square, New York for International Yoga Day.',
    thumbnail: '/assets/videoseries/hqdefault4.jpg',
    duration: '52:10',
    views: '98K',
    category: 'Events',
  },
  {
    title: 'Maha Kumbh Discourse 2025',
    description: 'Divine satsang delivered at the sacred Maha Kumbh gathering.',
    thumbnail: '/assets/videoseries/hqdefault5.jpg',
    duration: '48:45',
    views: '275K',
    category: 'Satsang',
  },
];

interface VideoItem {
  _id?: string;
  title: string;
  description?: string;
  thumbnail?: string;
  image?: string;
  duration?: string;
  views?: string;
  viewCount?: number;
  category?: string;
  videoUrl?: string;
}

export default function VideosPage() {
  const { t } = useTranslation('videos');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    api
      .get('/videoseries')
      .then((response) => {
        const data = response.data?.data || response.data || [];
        setVideos(data.length > 0 ? data : fallbackVideos);
      })
      .catch(() => {
        setVideos(fallbackVideos);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const dynamicCategories = Array.from(
      new Set(
        videos
          .map((video) => video.category)
          .filter((value): value is string => Boolean(value))
      )
    );
    return ['All', ...dynamicCategories];
  }, [videos]);

  const filteredVideos = useMemo(() => {
    if (selectedCategory === 'All') return videos;
    return videos.filter((video) => video.category === selectedCategory);
  }, [videos, selectedCategory]);

  const visibleVideos = filteredVideos.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredVideos.length;

  const formatViews = (views?: string | number) => {
    if (!views) return '0';
    if (typeof views === 'string') return views;
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  return (
    <div className="bg-parchment pt-20">
      <PageHero
        tone="dark"
        eyebrow={t('hero.sanskritTitle')}
        title={t('hero.title')}
        highlight={t('hero.titleHighlight')}
        subtitle={t('hero.subtitle')}
        icon={<Video className="h-8 w-8" />}
      />

      <section className="section-padding bg-parchment">
        <div className="container-custom">
          <SectionHeading
            eyebrow="Video Library"
            title="Discourse-led, cinematic, and easier to browse"
            subtitle="The visual emphasis now stays on thumbnails, categories, and watch intent instead of decorative chrome around the cards."
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
              <p className="text-spiritual-warmGray">Loading videos...</p>
            </div>
          )}

          {!loading && videos.length === 0 && (
            <div className="rounded-[30px] border border-[rgba(122,86,26,0.12)] bg-white/90 py-20 text-center shadow-[0_20px_48px_rgba(60,34,12,0.08)]">
              <Video className="mx-auto mb-4 h-16 w-16 text-gold-500" />
              <h3 className="font-display text-2xl text-spiritual-maroon">{t('noVideos')}</h3>
            </div>
          )}

          {!loading && videos.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleVideos.map((video, index) => (
                <motion.article
                  key={video._id || video.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className={`overflow-hidden rounded-[28px] border border-[rgba(122,86,26,0.12)] bg-white/92 shadow-[0_18px_42px_rgba(60,34,12,0.08)] ${
                    video.videoUrl ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => {
                    if (video.videoUrl) {
                      window.open(video.videoUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  <div className="relative aspect-video overflow-hidden bg-[#e6dbc4]">
                    <Image
                      src={video.thumbnail || video.image || '/assets/videoseries/hqdefault.jpg'}
                      alt={video.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/58 via-black/8 to-transparent" />
                    <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-spiritual-maroon">
                      {video.category || 'Video'}
                    </div>
                    {video.duration && (
                      <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-white backdrop-blur">
                        {video.duration}
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/92 text-spiritual-maroon shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                        <Play className="ml-1 h-7 w-7" fill="currentColor" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-display text-2xl leading-tight text-spiritual-maroon">{video.title}</h3>
                    <p className="mt-3 min-h-[52px] text-sm leading-relaxed text-spiritual-warmGray">
                      {video.description || ''}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-spiritual-warmGray">
                      <Eye className="h-4 w-4 text-gold-500" />
                      {formatViews(video.views || video.viewCount)} views
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {!loading && filteredVideos.length > 0 && canLoadMore && (
            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((current) => current + 6)}
                className="btn-secondary"
              >
                Load More Videos
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
