import { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { LifeStory } from '@/components/sections/LifeStory';
import { SpiritualLineage } from '@/components/sections/SpiritualLineage';
import { CoreTeachings } from '@/components/sections/CoreTeachings';
import { Initiatives } from '@/components/sections/Initiatives';
import { FeaturedBooks } from '@/components/sections/FeaturedBooks';
import { VideoShowcase } from '@/components/sections/VideoShowcase';
import { GlobalPresence } from '@/components/sections/GlobalPresence';
import { Gallery } from '@/components/sections/Gallery';
import { Events } from '@/components/sections/Events';
import { Testimonials } from '@/components/sections/Testimonials';
import { Contact } from '@/components/sections/Contact';
import DailyVichar from '@/components/sections/DailyVichar';
import LiveBanner from '@/components/sections/LiveBanner';
import TVSchedule from '@/components/sections/TVSchedule';
import PanchangSummary from '@/components/sections/PanchangSummary';

export const metadata: Metadata = {
  title: 'Swami Avdheshanand Giri Ji Maharaj | Acharya Mahamandaleshwar, Juna Akhara',
  description: 'Official website of His Holiness Swami Avdheshanand Giri Ji Maharaj — Acharya Mahamandaleshwar of Juna Akhara, President of Hindu Dharma Acharya Sabha, Vedanta scholar, and spiritual guide to millions.',
};

export default function Home() {
  return (
    <>
      <LiveBanner />
      <Hero />
      {/* Temple arch divider */}
      <div className="section-divider-temple" />
      <DailyVichar />
      <PanchangSummary />
      <LifeStory />
      <div className="section-divider-lotus">
        <span className="text-gold-500 text-2xl font-sanskrit">ॐ</span>
      </div>
      <SpiritualLineage />
      <div className="section-divider-temple" />
      <CoreTeachings />
      <div className="section-divider-lotus">
        <span className="text-gold-500 text-2xl font-sanskrit">॥</span>
      </div>
      <Initiatives />
      <div className="section-divider-temple" />
      <FeaturedBooks />
      <div className="section-divider-lotus">
        <span className="text-gold-500 text-2xl font-sanskrit">ॐ</span>
      </div>
      <VideoShowcase />
      <div className="section-divider-temple" />
      <GlobalPresence />
      <div className="section-divider-lotus">
        <span className="text-gold-500 text-2xl font-sanskrit">॥</span>
      </div>
      <Gallery />
      <div className="section-divider-temple" />
      <Events />
      <div className="section-divider-lotus">
        <span className="text-gold-500 text-2xl font-sanskrit">ॐ</span>
      </div>
      <Testimonials />
      <div className="section-divider-temple" />
      <TVSchedule />
      <div className="section-divider-lotus">
        <span className="text-gold-500 text-2xl font-sanskrit">ॐ</span>
      </div>
      <Contact />
    </>
  );
}
