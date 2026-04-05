'use client';

import { motion, AnimatePresence, useInView } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { X, ChevronLeft, ChevronRight, Loader2, Camera } from 'lucide-react';
import { fetchData } from '@/lib/api';

// Fallback images
const fallbackImages = [
  { src: '/assets/Ig1.jpg', alt: 'Spiritual discourse', caption: 'Sacred teachings and divine wisdom' },
  { src: '/assets/Ig2.jpg', alt: 'Meditation session', caption: 'Deep meditation and inner peace' },
  { src: '/assets/Ig3.jpg', alt: 'Temple ceremony', caption: 'Traditional temple rituals' },
  { src: '/assets/Ig4.jpg', alt: 'Community gathering', caption: 'Devotees united in faith' },
  { src: '/assets/Ig5.jpg', alt: 'Devotees meeting', caption: 'Blessings and spiritual guidance' },
  { src: '/assets/Ig6.jpeg', alt: 'Ashram activities', caption: 'Daily life at the ashram' },
];

interface GalleryImage {
  _id?: string;
  src?: string;
  image?: string;
  url?: string;
  alt?: string;
  title?: string;
  caption?: string;
}

interface GalleryProps {
  images?: GalleryImage[];
}

export function Gallery({ images: propImages }: GalleryProps) {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(propImages || []);
  const [lightbox, setLightbox] = useState<{ isOpen: boolean; index: number }>({ isOpen: false, index: 0 });
  const [loading, setLoading] = useState(!propImages);
  const [direction, setDirection] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  useEffect(() => {
    if (propImages && propImages.length > 0) {
      setGalleryImages(propImages);
      setLoading(false);
      return;
    }

    const loadImages = async () => {
      try {
        const data = await fetchData<GalleryImage[]>('/glimpse');
        if (data && Array.isArray(data) && data.length > 0) {
          const mappedImages = data.map((img: GalleryImage) => ({
            src: img.src || img.image || img.url || '/assets/Ig1.jpg',
            alt: img.alt || img.title || img.caption || 'Sacred moment',
            caption: img.caption || img.title || img.alt || 'A glimpse of divine grace',
          }));
          setGalleryImages(mappedImages);
        } else {
          setGalleryImages(fallbackImages);
        }
      } catch {
        setGalleryImages(fallbackImages);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [propImages]);

  const openLightbox = (index: number) => {
    setLightbox({ isOpen: true, index });
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = useCallback(() => {
    setLightbox({ isOpen: false, index: 0 });
    document.body.style.overflow = 'unset';
  }, []);

  const nextImage = useCallback(() => {
    setDirection(1);
    setLightbox(prev => ({ ...prev, index: (prev.index + 1) % galleryImages.length }));
  }, [galleryImages.length]);

  const prevImage = useCallback(() => {
    setDirection(-1);
    setLightbox(prev => ({ ...prev, index: (prev.index - 1 + galleryImages.length) % galleryImages.length }));
  }, [galleryImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightbox.isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox.isOpen, closeLightbox, nextImage, prevImage]);

  const getImageSrc = (image: GalleryImage) => {
    return image.src || image.image || image.url || '/assets/Ig1.jpg';
  };

  const getImageAlt = (image: GalleryImage) => {
    return image.alt || image.title || image.caption || 'Sacred moment';
  };

  const getImageCaption = (image: GalleryImage) => {
    return image.caption || image.title || image.alt || 'A glimpse of divine grace';
  };

  // Determine if image should be tall (for masonry effect)
  const isTallImage = (index: number) => {
    // Pattern: 0-short, 1-tall, 2-short, 3-tall, etc.
    // But offset by column for visual interest
    const col = index % 3;
    const row = Math.floor(index / 3);
    return (col + row) % 2 === 1;
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <section id="gallery" ref={sectionRef} className="section-padding bg-parchment relative overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4af37\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} 
      />

      <div className="container-custom relative z-10">
        <SectionHeading
          title="Sacred Moments"
          subtitle="Glimpses of divine grace and spiritual gatherings"
        />

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-spiritual-saffron animate-spin mb-4" />
            <p className="text-spiritual-warmGray font-body">Loading gallery...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && galleryImages.length === 0 && (
          <div className="text-center py-20">
            <Camera className="w-16 h-16 text-gold-400 mx-auto mb-4" />
            <h3 className="font-display text-2xl text-spiritual-maroon mb-2">No Images Found</h3>
            <p className="text-spiritual-warmGray">Check back later for new photos.</p>
          </div>
        )}

        {/* Masonry Gallery Grid */}
        {!loading && galleryImages.length > 0 && (
          <div className="masonry-grid columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6">
            {galleryImages.map((image, index) => (
              <motion.div
                key={image._id || index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                onClick={() => openLightbox(index)}
                className="break-inside-avoid cursor-pointer group"
              >
                <div 
                  className={`relative overflow-hidden rounded-xl border-2 border-transparent hover:border-gold-400/50 transition-all duration-500 ${
                    isTallImage(index) ? 'aspect-[3/4]' : 'aspect-[4/3]'
                  }`}
                >
                  <Image
                    src={getImageSrc(image)}
                    alt={getImageAlt(image)}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  
                  {/* Hover overlay with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end">
                    <div className="p-4 w-full">
                      <p className="text-gold-100 font-spiritual text-sm md:text-base line-clamp-2">
                        {getImageCaption(image)}
                      </p>
                    </div>
                  </div>

                  {/* Subtle gold corner accents on hover */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-gold-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-tl" />
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-gold-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-tr" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-gold-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-bl" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-gold-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-br" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Improved Full-Screen Lightbox */}
        <AnimatePresence>
          {lightbox.isOpen && galleryImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center"
              onClick={closeLightbox}
            >
              {/* Blur backdrop */}
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

              {/* Gold ornamental corners */}
              <div className="absolute top-6 left-6 w-20 h-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-400 to-transparent" />
                <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-gold-400 to-transparent" />
                <div className="absolute top-2 left-2 w-3 h-3 rotate-45 bg-gold-400" />
              </div>
              <div className="absolute top-6 right-6 w-20 h-20 pointer-events-none">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-gold-400 to-transparent" />
                <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-gold-400 to-transparent" />
                <div className="absolute top-2 right-2 w-3 h-3 rotate-45 bg-gold-400" />
              </div>
              <div className="absolute bottom-6 left-6 w-20 h-20 pointer-events-none">
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-gold-400 to-transparent" />
                <div className="absolute bottom-0 left-0 h-full w-1 bg-gradient-to-t from-gold-400 to-transparent" />
                <div className="absolute bottom-2 left-2 w-3 h-3 rotate-45 bg-gold-400" />
              </div>
              <div className="absolute bottom-6 right-6 w-20 h-20 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-gold-400 to-transparent" />
                <div className="absolute bottom-0 right-0 h-full w-1 bg-gradient-to-t from-gold-400 to-transparent" />
                <div className="absolute bottom-2 right-2 w-3 h-3 rotate-45 bg-gold-400" />
              </div>

              {/* Close button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 text-gold-400 p-3 hover:bg-gold-400/20 rounded-full transition-all duration-300 border border-gold-400/40 hover:border-gold-400"
              >
                <X className="w-7 h-7" />
              </motion.button>

              {/* Navigation - Previous */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 md:left-8 z-10 text-gold-400 p-4 hover:bg-gold-400/20 rounded-full transition-all duration-300 border border-gold-400/40 hover:border-gold-400 group"
              >
                <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
              </motion.button>

              {/* Navigation - Next */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 md:right-8 z-10 text-gold-400 p-4 hover:bg-gold-400/20 rounded-full transition-all duration-300 border border-gold-400/40 hover:border-gold-400 group"
              >
                <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              {/* Image container with smooth transitions */}
              <div 
                className="relative w-full max-w-5xl h-[70vh] mx-4 md:mx-8"
                onClick={(e) => e.stopPropagation()}
              >
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={lightbox.index}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'tween', duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    {/* Image frame with gold border */}
                    <div className="relative w-full h-full p-1 bg-gradient-to-br from-gold-400/40 via-gold-300/20 to-gold-400/40 rounded-lg">
                      <div className="relative w-full h-full rounded-lg overflow-hidden bg-black/50">
                        <Image
                          src={getImageSrc(galleryImages[lightbox.index])}
                          alt={getImageAlt(galleryImages[lightbox.index])}
                          fill
                          className="object-contain"
                          priority
                        />
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Caption and Counter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center z-10"
              >
                <p className="text-gold-200 font-spiritual text-lg md:text-xl mb-2 max-w-2xl px-4">
                  {getImageCaption(galleryImages[lightbox.index])}
                </p>
                <p className="text-gold-400/70 text-sm font-medium tracking-wider">
                  {lightbox.index + 1} / {galleryImages.length}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
