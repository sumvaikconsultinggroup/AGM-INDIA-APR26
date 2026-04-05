'use client';

import { motion } from 'framer-motion';
import { Clock, Headphones, Loader2, Play, Radio } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';
import { PageHero } from '@/components/ui/PageHero';
import { SectionHeading } from '@/components/ui/SectionHeading';

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
    api
      .get('/podcasts')
      .then((response) => {
        const data = response.data?.data || response.data || [];
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

  const getPodcastLink = (podcast: Podcast) => podcast.audioUrl || podcast.videoUrl || podcast.link || '';

  const visiblePodcasts = podcasts.slice(0, visibleCount);
  const canLoadMore = visibleCount < podcasts.length;
  const featuredPodcast = podcasts[0];

  return (
    <div className="bg-parchment pt-20">
      <PageHero
        tone="dark"
        eyebrow={t('hero.sanskritTitle')}
        title={t('hero.title')}
        highlight={t('hero.titleHighlight')}
        subtitle={t('hero.subtitle')}
        icon={<Headphones className="h-8 w-8" />}
      />

      <section className="section-padding bg-parchment">
        <div className="container-custom">
          <SectionHeading
            eyebrow="Audio Library"
            title="A quieter, more focused listening experience"
            subtitle="The podcast page now leads with the newest episode, cleaner metadata, and clearer listening actions across the archive."
          />

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-spiritual-saffron" />
              <p className="text-spiritual-warmGray">Loading podcasts...</p>
            </div>
          )}

          {!loading && podcasts.length === 0 && (
            <div className="rounded-[30px] border border-[rgba(122,86,26,0.12)] bg-white/90 py-20 text-center shadow-[0_20px_48px_rgba(60,34,12,0.08)]">
              <Headphones className="mx-auto mb-4 h-16 w-16 text-gold-500" />
              <h3 className="font-display text-2xl text-spiritual-maroon">{t('noPodcasts')}</h3>
            </div>
          )}

          {!loading && featuredPodcast && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-14 rounded-[32px] border border-[rgba(122,86,26,0.12)] bg-white/92 p-8 shadow-[0_22px_50px_rgba(60,34,12,0.08)]"
            >
              <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
                <button
                  type="button"
                  onClick={() => {
                    const podcastLink = getPodcastLink(featuredPodcast);
                    if (podcastLink) {
                      window.open(podcastLink, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  className="flex h-24 w-24 items-center justify-center rounded-full bg-spiritual-maroon text-white shadow-[0_18px_40px_rgba(70,18,30,0.22)] transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!getPodcastLink(featuredPodcast)}
                  aria-label="Play latest episode"
                >
                  <Play className="ml-1 h-10 w-10" fill="currentColor" />
                </button>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-spiritual-saffron">Latest Episode</p>
                  <h2 className="mt-3 font-display text-3xl leading-tight text-spiritual-maroon">
                    {featuredPodcast.title}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-spiritual-warmGray">
                    {featuredPodcast.description}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-spiritual-warmGray">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-gold-500" />
                      {featuredPodcast.duration || '45 min'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Headphones className="h-4 w-4 text-gold-500" />
                      {formatListens(featuredPodcast.listens || featuredPodcast.listenCount)} listens
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {!loading && podcasts.length > 0 && (
            <>
              <SectionHeading
                eyebrow="Episodes"
                title="Browse the full archive"
                subtitle="Designed as a calm list, so listeners can scan titles and themes without wading through unnecessary motion or decoration."
                align="left"
              />
              <div className="space-y-4">
                {visiblePodcasts.map((podcast, index) => (
                  <motion.article
                    key={podcast._id || podcast.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.04 }}
                    className="flex flex-col gap-4 rounded-[26px] border border-[rgba(122,86,26,0.12)] bg-white/92 p-5 shadow-[0_16px_36px_rgba(60,34,12,0.07)] sm:flex-row sm:items-center"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const podcastLink = getPodcastLink(podcast);
                        if (podcastLink) {
                          window.open(podcastLink, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f3d894,#b57b1d)] text-white shadow-[0_12px_28px_rgba(181,123,29,0.24)] transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!getPodcastLink(podcast)}
                      aria-label={`Play ${podcast.title}`}
                    >
                      <Play className="ml-1 h-6 w-6" fill="currentColor" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-spiritual-warmGray">
                        <span className="rounded-full bg-[rgba(128,0,32,0.06)] px-3 py-1 text-spiritual-saffron">
                          {getEpisode(podcast, index)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gold-500" />
                          {podcast.duration || '30 min'}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl leading-tight text-spiritual-maroon">
                        {podcast.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-spiritual-warmGray">
                        {podcast.description}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 text-sm font-medium text-spiritual-warmGray sm:justify-end">
                      <Headphones className="h-4 w-4 text-gold-500" />
                      {formatListens(podcast.listens || podcast.listenCount)} listens
                    </div>
                  </motion.article>
                ))}
              </div>

              {canLoadMore && (
                <div className="mt-12 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((current) => current + 8)}
                    className="btn-secondary"
                  >
                    Load More Episodes
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="section-padding bg-temple-warm">
        <div className="container-custom max-w-3xl">
          <div className="rounded-[30px] border border-[rgba(122,86,26,0.12)] bg-white/90 p-8 text-center shadow-[0_20px_48px_rgba(60,34,12,0.08)] md:p-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f3d894,#b57b1d)] text-white shadow-[0_14px_34px_rgba(181,123,29,0.26)]">
              <Radio className="h-8 w-8" />
            </div>
            <h3 className="font-display text-3xl text-spiritual-maroon">Listen on your preferred platform</h3>
            <p className="mt-3 text-base leading-relaxed text-spiritual-warmGray">
              Follow updates across Spotify, Apple Podcasts, YouTube Music, and the official YouTube channel.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
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
                  className="rounded-full border border-[rgba(122,86,26,0.16)] bg-[rgba(248,243,232,0.92)] px-5 py-3 text-sm font-medium text-spiritual-maroon transition hover:border-[rgba(122,86,26,0.28)] hover:bg-white"
                >
                  {platform.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
