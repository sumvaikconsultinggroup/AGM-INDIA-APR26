'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import CitySelector from '@/components/panchang/CitySelector';
import TodayPanchang from '@/components/panchang/TodayPanchang';
import MuhurtaTimings from '@/components/panchang/MuhurtaTimings';
import MonthlyCalendar from '@/components/panchang/MonthlyCalendar';
import FestivalList from '@/components/panchang/FestivalList';

interface CityLocation {
  name: string;
  lat: number;
  lng: number;
}

const DEFAULT_CITY: CityLocation = {
  name: 'Haridwar',
  lat: 29.9457,
  lng: 78.1642,
};

export default function PanchangPage() {
  const [city, setCity] = useState<CityLocation>(DEFAULT_CITY);

  const handleCityChange = useCallback((location: CityLocation) => {
    setCity(location);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-spiritual-warmWhite via-spiritual-cream to-spiritual-warmWhite">
      {/* Hero header */}
      <section className="relative pt-28 pb-10 md:pt-32 md:pb-14 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute top-20 left-10 text-8xl text-gold-300/10 font-sanskrit">ॐ</div>
          <div className="absolute top-32 right-16 text-6xl text-gold-300/10 font-sanskrit">॥</div>
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent 5%, #D4A017 20%, #FF6B00 50%, #D4A017 80%, transparent 95%)',
            }}
          />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-spiritual-maroon font-bold mb-3">
              <span className="font-sanskrit">पंचांग</span>{' '}
              <span className="text-spiritual-warmGray font-light">&middot;</span>{' '}
              Panchang
            </h1>
            <p className="text-spiritual-warmGray font-spiritual text-lg md:text-xl max-w-xl mx-auto mb-8">
              Location-based Hindu calendar with astronomical precision
            </p>

            {/* City Selector */}
            <div className="flex justify-center">
              <CitySelector onCityChange={handleCityChange} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="container-custom pb-20">
        <div className="space-y-8">
          {/* Today's Panchang hero card */}
          <TodayPanchang lat={city.lat} lng={city.lng} cityName={city.name} />

          {/* Muhurta Timings */}
          <MuhurtaTimings lat={city.lat} lng={city.lng} />

          {/* Two-column: Calendar + Festivals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <MonthlyCalendar lat={city.lat} lng={city.lng} />
            </div>
            <div className="lg:col-span-1">
              <FestivalList />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
