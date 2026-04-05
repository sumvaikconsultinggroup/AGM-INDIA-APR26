'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { Play, ExternalLink, Youtube } from 'lucide-react';

const videoThumbnails = [
  {
    id: 1,
    title: 'The Nature of Consciousness',
    duration: '45 min',
  },
  {
    id: 2,
    title: 'Bhagavad Gita: Chapter 1',
    duration: '1:02 hr',
  },
  {
    id: 3,
    title: 'Meditation Techniques',
    duration: '35 min',
  },
  {
    id: 4,
    title: 'Understanding Karma',
    duration: '52 min',
  },
  {
    id: 5,
    title: 'Devi Bhagwat Recitation',
    duration: '48 min',
  },
  {
    id: 6,
    title: 'The Guru Principle',
    duration: '41 min',
  },
];

export function VideoShowcase() {
  const [selectedVideo, setSelectedVideo] = useState(0);

  return (
    <section id="video-showcase" className="section-padding bg-parchment">
      <div className="container-custom">
        <SectionHeading
          title="Video Discourses"
          subtitle="Watch transformative teachings from Swami Ji"
        />

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Featured Video - Takes 3 columns (60%) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="relative rounded-xl overflow-hidden border-2 border-gold-400/40 shadow-temple group">
              {/* Video Container with Golden Frame */}
              <div className="relative aspect-video bg-spiritual-maroon">
                {/* Placeholder/Iframe */}
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"
                  title="Swami Ji Discourse"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                
                {/* Golden corner accents */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-gold-400/60 rounded-tl-xl pointer-events-none" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-gold-400/60 rounded-tr-xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-gold-400/60 rounded-bl-xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-gold-400/60 rounded-br-xl pointer-events-none" />
              </div>

              {/* Video Title Bar */}
              <div className="bg-spiritual-maroon/95 px-6 py-4">
                <h3 className="font-display text-lg text-gold-300">
                  {videoThumbnails[selectedVideo]?.title || 'Featured Discourse'}
                </h3>
                <p className="text-gold-100/70 text-sm font-body mt-1">
                  Duration: {videoThumbnails[selectedVideo]?.duration || '45 min'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Thumbnail Grid - Takes 2 columns (40%) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <h4 className="font-display text-lg text-spiritual-maroon mb-4">More Discourses</h4>
            
            <div className="grid grid-cols-2 gap-4">
              {videoThumbnails.map((video, index) => (
                <motion.button
                  key={video.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedVideo(index)}
                  className={`relative group text-left rounded-lg overflow-hidden transition-all ${
                    selectedVideo === index
                      ? 'ring-2 ring-gold-400 shadow-glow'
                      : 'hover:shadow-warm'
                  }`}
                >
                  {/* Thumbnail Background */}
                  <div className="relative aspect-video bg-gradient-to-br from-spiritual-maroon to-spiritual-deepRed">
                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gold-400/90 flex items-center justify-center group-hover:bg-gold-400 transition-colors shadow-warm">
                        <Play className="w-5 h-5 text-spiritual-maroon fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-xs text-white font-medium">
                      {video.duration}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="p-2 bg-spiritual-warmWhite">
                    <p className="font-body text-xs text-spiritual-warmGray line-clamp-2 group-hover:text-spiritual-maroon transition-colors">
                      {video.title}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Visit YouTube Channel CTA */}
            <motion.a
              href="https://www.youtube.com/@avdheshanandg"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 w-full btn-primary flex items-center justify-center gap-3 py-4"
            >
              <Youtube className="w-5 h-5" />
              <span>Visit YouTube Channel</span>
              <ExternalLink className="w-4 h-4" />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
