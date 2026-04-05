'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Play, Eye, Video, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import api from '../../lib/api';
import { useTranslation } from 'react-i18next';

// Fallback data in case API fails
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
    api.get('/videoseries')
      .then(r => {
        const data = r.data?.data || r.data || [];
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
    <div className="pt-20">
      {/* Hero with Maroon Gradient */}
      <section className="relative bg-maroon-gradient py-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-1/4 w-64 h-64 rounded-full bg-gold-400 blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-10 right-1/4 w-48 h-48 rounded-full bg-gold-300 blur-3xl animate-pulse-soft animation-delay-500" />
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
            {/* Video Icon */}
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow animate-breathe">
              <Video className="w-10 h-10 text-white" />
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
              <Play className="w-5 h-5 text-gold-400" />
              <span className="w-16 h-px bg-gradient-to-l from-transparent to-gold-400" />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="divider-rangoli" />

      {/* Videos Grid */}
      <section className="section-padding bg-temple-warm">
        <div className="container-custom">
          {/* Filter tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setSelectedCategory(tab);
                  setVisibleCount(6);
                }}
                className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === tab
                    ? 'bg-gradient-to-r from-gold-400 to-gold-500 text-white shadow-warm'
                    : 'bg-white border-2 border-gold-300 text-spiritual-maroon hover:border-gold-400 hover:bg-gold-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-spiritual-saffron animate-spin mb-4" />
              <p className="text-spiritual-warmGray font-body">Loading videos...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && videos.length === 0 && (
            <div className="text-center py-20">
              <Video className="w-16 h-16 text-gold-400 mx-auto mb-4" />
              <h3 className="font-display text-2xl text-spiritual-maroon mb-2">{t('noVideos')}</h3>
              <p className="text-spiritual-warmGray"></p>
            </div>
          )}

          {/* Videos Grid */}
          {!loading && videos.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleVideos.map((video, index) => (
                <motion.div
                  key={video._id || video.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`card-temple overflow-hidden group ${
                    video.videoUrl ? 'cursor-pointer' : 'cursor-default'
                  }`}
                  onClick={() => {
                    if (video.videoUrl) {
                      window.open(video.videoUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  onKeyDown={(event) => {
                    if (video.videoUrl && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault();
                      window.open(video.videoUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  role={video.videoUrl ? 'link' : undefined}
                  tabIndex={video.videoUrl ? 0 : -1}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-spiritual-sandstone overflow-hidden">
                    <Image
                      src={video.thumbnail || video.image || '/assets/videoseries/hqdefault.jpg'}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-spiritual-maroon/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-spiritual-saffron to-primary-600 flex items-center justify-center shadow-glow transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                      </div>
                    </div>
                    
                    {/* Duration badge */}
                    {video.duration && (
                      <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-spiritual-maroon/90 text-gold-200 text-xs font-medium backdrop-blur-sm">
                        {video.duration}
                      </div>
                    )}
                    
                    {/* Category badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 text-white text-xs font-medium">
                      {video.category || 'Video'}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-display text-xl text-spiritual-maroon mb-2 group-hover:text-spiritual-saffron transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-spiritual-warmGray text-sm mb-4 line-clamp-2">
                      {video.description || ''}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gold-600">
                      <Eye className="w-4 h-4" />
                      <span>{formatViews(video.views || video.viewCount)} views</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {!loading && filteredVideos.length > 0 && canLoadMore && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="btn-secondary group"
              >
                Load More Videos
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
