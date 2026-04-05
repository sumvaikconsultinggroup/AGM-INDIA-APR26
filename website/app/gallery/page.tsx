import { Gallery } from '@/components/sections/Gallery';
import { GalleryHero } from '@/components/sections/GalleryHero';

export const metadata = {
  title: 'Gallery | Swami Avdheshanand Giri Ji Maharaj',
  description: 'View sacred moments and spiritual gatherings with Swami Avdheshanand Giri Ji Maharaj.',
};

export default function GalleryPage() {
  return (
    <div className="bg-parchment pt-20">
      <GalleryHero />
      <Gallery />
    </div>
  );
}
