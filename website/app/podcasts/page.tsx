'use client';

import { motion } from 'framer-motion';
import { Headphones, Play, Clock, Radio, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useTranslation } from 'react-i18next';

// Fallback data in case API fails
const fallbackPodcasts = [
  {
    title: 'Understanding Advaita Vedanta',
    description: 'A profound exploration of non-duality and the nature of ultimate reality.',
    duration: '45 min',
    episode: 'Episode 1',
    listens: '15.2K',
  },
  {
    title: 'The Art of Dhyana Meditation',
    description: 'Practical guidance on the ancient practice of deep meditation.',
    duration: '38 min',
    episode: 'Episode 2',
    listens: '12.5K',
  },
  {
    title: 'Karma: The Universal Law',
    description: 'Understanding how our actions shape our destiny and spiritual evolution.',
    duration: '42 min',
    episode: 'Episode 3',
    listens: '9.8K',
  },
  {
    title: 'The Guru-Disciple Tradition',
    description: 'The sacred bond between teacher and student in the spiritual journey.',
    duration: '52 min',
    episode: 'Episode 4',
    listens: '11.3K',
  },
  {
    title: 'Living Dharma in Modern Times',
    description: 'How to integrate timeless spiritual principles in contemporary life.',
    duration: '35 min',
    episode: 'Episode 5',
    listens: '10.1K',
  },
  {
    title: 'Questions from Seekers',
    description: 'Swami Ji answers heartfelt spiritual queries from devotees worldwide.',
    duration: '48 min',
    episode: 'Episode 6',
    listens: '8.7K',
  },
];

interface Podcast {
  _id?: string;
  title: string;
  description?: string;
  duration?: string;
  episode?: string;
  episodeNumber?: number;
  listens?: string;
  listenCount?: number;
  videoUrl?: string;
  audioUrl?: string;
  link?: string;
}

export default function PodcastsPage() {
  const { t } = useTranslation('podcasts');
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    api.get('/podcasts')
      .then(r => {
        const data = r.data?.data || r.data || [];
        setPodcasts(data.length > 0 ? data : fallbackPodcasts);
      })
      .catch(() => {
        setPodcasts(fallbackPodcasts);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatListens = (listens?: string | number) => {
    if (!listens) return '0';
    if (typeof listens === 'string') return listens;
    if (listens >= 1000000) return `${(listens / 1000000).toFixed(1)}M`;
    if (listens >= 1000) return `${(listens / 1000).toFixed(1)}K`;
    return listens.toString();
  };

  const getEpisode = (podcast: Podcast, index: number) => {
    if (podcast.episode) return podcast.episode;
    if (podcast.episodeNumber) return `Episode ${podcast.episodeNumber}`;
    return `Episode ${index + 1}`;
  };

  const getPodcastLink = (podcast: Podcast) => {
    return podcast.audioUrl || podcast.videoUrl || podcast.link || '';
  };

  const visiblePodcasts = podcasts.slice(0, visibleCount);
  const canLoadMore = visibleCount < podcasts.length;

  return (
    <div className="pt-20">
      {/* Hero with Maroon Gradient */}
      <section className="relative bg-maroon-gradient py-24 overflow-hidden">
        {/* Audio wave decorative pattern */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="flex items-end gap-1 h-32">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gold-400 rounded-full"
                animate={{
                  height: [20, Math.random() * 100 + 30, 20],
                }}
                transition={{
                  duration: 1 + Math.random(),
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
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
              <Headphones className="w-10 h-10 text-white" />
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
              <Radio className="w-5 h-5 text-gold-400" />
              <span className="w-16 h-px bg-gradient-to-l from-transparent to-gold-400" />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="divider-rangoli" />

      {/* Featured Episode */}
      <section className="section-padding bg-parchment">
        <div className="container-custom">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-spiritual-saffron animate-spin mb-4" />
              <p className="text-spiritual-warmGray font-body">Loading podcasts...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && podcasts.length === 0 && (
            <div className="text-center py-20">
              <Headphones className="w-16 h-16 text-gold-400 mx-auto mb-4" />
              <h3 className="font-display text-2xl text-spiritual-maroon mb-2">{t('noPodcasts')}</h3>
              <p className="text-spiritual-warmGray"></p>
            </div>
          )}

          {/* Featured Episode */}
          {!loading && podcasts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card-temple p-6 md:p-8 max-w-4xl mx-auto mb-16"
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Large Play Button */}
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const podcastLink = getPodcastLink(podcasts[0]);
                      if (podcastLink) {
                        window.open(podcastLink, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-spiritual-saffron to-primary-600 flex items-center justify-center text-white shadow-glow hover:scale-105 transition-transform animate-pulse-soft disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={!getPodcastLink(podcasts[0])}
                    aria-label="Play latest episode"
                  >
                    <Play className="w-10 h-10 ml-1" fill="currentColor" />
                  </button>
                </div>
                
                {/* Content */}
                <div className="flex-grow text-center md:text-left">
                  <span className="inline-block px-3 py-1 rounded-full bg-gold-100 text-gold-600 text-sm font-medium mb-3">
                    Latest Episode
                  </span>
                  <h3 className="font-display text-2xl md:text-3xl text-spiritual-maroon mb-2">
                    {podcasts[0].title}
                  </h3>
                  <p className="text-spiritual-warmGray mb-4">
                    {podcasts[0].description}
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gold-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {podcasts[0].duration || '45 min'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Headphones className="w-4 h-4" />
                      {formatListens(podcasts[0].listens || podcasts[0].listenCount)} listens
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Audio wave animation */}
              <div className="mt-6 flex items-center justify-center gap-1 h-8">
                {[...Array(50)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-gradient-to-t from-gold-400 to-spiritual-saffron rounded-full"
                    animate={{
                      height: [4, Math.random() * 24 + 8, 4],
                    }}
                    transition={{
                      duration: 0.8 + Math.random() * 0.5,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      delay: i * 0.02,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Section Header */}
          {!loading && podcasts.length > 0 && (
            <>
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl text-spiritual-maroon mb-2">
                  All Episodes
                </h2>
                <div className="flex items-center justify-center gap-3">
                  <span className="w-8 h-px bg-gold-400" />
                  <span className="text-gold-400">◆</span>
                  <span className="w-8 h-px bg-gold-400" />
                </div>
              </div>

              {/* Podcasts List */}
              <div className="max-w-4xl mx-auto space-y-4">
                {visiblePodcasts.map((podcast, index) => (
                  <motion.div
                    key={podcast._id || podcast.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="card-temple p-5 flex items-center gap-4 group hover:shadow-temple transition-shadow duration-300"
                  >
                    {/* Play Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const podcastLink = getPodcastLink(podcast);
                        if (podcastLink) {
                          window.open(podcastLink, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-spiritual-saffron to-primary-600 flex items-center justify-center text-white flex-shrink-0 shadow-warm group-hover:scale-105 group-hover:shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={!getPodcastLink(podcast)}
                      aria-label={`Play ${podcast.title}`}
                    >
                      <Play className="w-6 h-6 ml-1" fill="currentColor" />
                    </button>
                    
                    {/* Content */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-3 text-sm mb-1">
                        <span className="px-2 py-0.5 rounded bg-gold-100 text-gold-600 font-medium">
                          {getEpisode(podcast, index)}
                        </span>
                        <span className="flex items-center gap-1 text-gold-500">
                          <Clock className="w-3.5 h-3.5" />
                          {podcast.duration || '30 min'}
                        </span>
                      </div>
                      <h3 className="font-display text-lg text-spiritual-maroon truncate group-hover:text-spiritual-saffron transition-colors">
                        {podcast.title}
                      </h3>
                      <p className="text-spiritual-warmGray text-sm truncate">
                        {podcast.description}
                      </p>
                    </div>
                    
                    {/* Listen count */}
                    <div className="hidden sm:flex items-center gap-1 text-sm text-gold-600 flex-shrink-0">
                      <Headphones className="w-4 h-4" />
                      <span>{formatListens(podcast.listens || podcast.listenCount)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Load More */}
              {canLoadMore && (
                <div className="mt-12 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 8)}
                    className="btn-secondary group"
                  >
                  Load More Episodes
                  <svg className="w-4 h-4 ml-2 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <div className="divider-rangoli" />

      {/* Subscribe Section */}
      <section className="section-padding bg-temple-warm">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="card-temple p-8 md:p-10">
              <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <Radio className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="font-display text-2xl md:text-3xl text-spiritual-maroon mb-3">
                Subscribe to Our Podcast
              </h3>
              <p className="text-spiritual-warmGray mb-8">
                Never miss an episode. Listen on your favorite platform.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { label: 'Spotify', href: 'https://open.spotify.com/search/avdheshanandg' },
                  { label: 'Apple Podcasts', href: 'https://podcasts.apple.com/us/search?term=avdheshanandg' },
                  { label: 'YouTube Music', href: 'https://music.youtube.com/search?q=avdheshanandg' },
                  { label: 'YouTube (@avdheshanandg)', href: 'https://www.youtube.com/@avdheshanandg' },
                ].map((platform) => (
                  <a
                    key={platform.label}
                    href={platform.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl border-2 border-gold-300 text-spiritual-maroon font-medium hover:border-gold-400 hover:bg-gold-50 transition-colors"
                  >
                    {platform.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
