import { Gallery } from '@/components/sections/Gallery';
import { GalleryHero } from '@/components/sections/GalleryHero';

export const metadata = {
  title: 'Gallery | Swami Avdheshanand Giri Ji Maharaj',
  description: 'View sacred moments and spiritual gatherings with Swami Avdheshanand Giri Ji Maharaj.',
};

export default function GalleryPage() {
  return (
    <div className="pt-20">
      {/* Spiritual Hero Banner */}
      <GalleryHero />
      
      <div className="divider-rangoli" />
      
      <div className="bg-temple-warm">
        <Gallery />
      </div>
    </div>
  );
}
