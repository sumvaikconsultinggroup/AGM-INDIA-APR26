'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Navigation, ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';

interface City {
  name: string;
  state?: string;
  lat: number;
  lng: number;
}

interface CityLocation {
  name: string;
  lat: number;
  lng: number;
}

interface CitySelectorProps {
  onCityChange: (location: CityLocation) => void;
}

const DEFAULT_CITY: CityLocation = {
  name: 'Haridwar',
  lat: 29.9457,
  lng: 78.1642,
};

const STORAGE_KEY = 'panchang-city';

export default function CitySelector({ onCityChange }: CitySelectorProps) {
  const { t } = useTranslation('panchang');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityLocation>(DEFAULT_CITY);
  const [isLocating, setIsLocating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load saved city from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CityLocation;
        setSelectedCity(parsed);
        onCityChange(parsed);
      } else {
        onCityChange(DEFAULT_CITY);
      }
    } catch {
      onCityChange(DEFAULT_CITY);
    }
  }, [onCityChange]);

  // Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await api.get('/panchang/cities');
        const data = res.data?.data || res.data || [];
        setCities(Array.isArray(data) ? data : []);
      } catch {
        // Use a small fallback list
        setCities([
          { name: 'Haridwar', state: 'Uttarakhand', lat: 29.9457, lng: 78.1642 },
          { name: 'Rishikesh', state: 'Uttarakhand', lat: 30.0869, lng: 78.2676 },
          { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
          { name: 'Prayagraj', state: 'Uttar Pradesh', lat: 25.4358, lng: 81.8463 },
          { name: 'Ujjain', state: 'Madhya Pradesh', lat: 23.1765, lng: 75.7885 },
          { name: 'Mathura', state: 'Uttar Pradesh', lat: 27.4924, lng: 77.6737 },
          { name: 'Ayodhya', state: 'Uttar Pradesh', lat: 26.7922, lng: 82.1998 },
          { name: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.209 },
          { name: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777 },
          { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
          { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
          { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCities();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const selectCity = useCallback((city: CityLocation) => {
    setSelectedCity(city);
    onCityChange(city);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(city));
    setIsOpen(false);
    setSearch('');
  }, [onCityChange]);

  const handleNearMe = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc: CityLocation = {
          name: 'My Location',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        selectCity(loc);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  }, [selectCity]);

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(search.toLowerCase()) ||
    (city.state && city.state.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div ref={dropdownRef} className="relative inline-block w-full max-w-xs">
      {/* Selected City Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-gold-200 hover:border-gold-400 transition-all duration-300 shadow-warm group"
      >
        <MapPin className="w-4 h-4 text-spiritual-saffron flex-shrink-0" />
        <span className="font-spiritual text-spiritual-maroon font-semibold truncate flex-1 text-left">
          {selectedCity.name}
        </span>
        <ChevronDown className={`w-4 h-4 text-spiritual-warmGray transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl overflow-hidden shadow-temple"
            style={{
              background: 'linear-gradient(180deg, #FFFDF5, #FFF8E7)',
              border: '1px solid rgba(212, 160, 23, 0.3)',
            }}
          >
            {/* Gold top accent */}
            <div
              className="h-0.5"
              style={{ background: 'linear-gradient(90deg, #D4A017, #FF6B00, #D4A017)' }}
            />

            {/* Search input */}
            <div className="p-3 border-b border-gold-100/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-spiritual-warmGray" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('searchCity')}
                  className="w-full pl-9 pr-8 py-2 rounded-lg bg-white/70 border border-gold-100 text-spiritual-maroon placeholder:text-spiritual-warmGray/50 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-200 text-sm font-body"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-spiritual-warmGray hover:text-spiritual-maroon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Near Me button */}
            <button
              onClick={handleNearMe}
              disabled={isLocating}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-spiritual-saffron hover:bg-gold-50/50 transition-colors border-b border-gold-100/50 disabled:opacity-50"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-pulse' : ''}`} />
              <span className="font-medium">
                {isLocating ? t('detectingLocation') : t('nearMe')}
              </span>
            </button>

            {/* City list */}
            <div className="max-h-56 overflow-y-auto">
              {isLoading ? (
                <div className="px-4 py-6 text-center text-spiritual-warmGray text-sm">
                  {t('loadingCities')}
                </div>
              ) : filteredCities.length === 0 ? (
                <div className="px-4 py-6 text-center text-spiritual-warmGray text-sm">
                  {t('noCitiesFound')}
                </div>
              ) : (
                filteredCities.map((city) => (
                  <button
                    key={`${city.name}-${city.lat}`}
                    onClick={() => selectCity({ name: city.name, lat: city.lat, lng: city.lng })}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gold-50/50 flex items-center justify-between ${
                      selectedCity.name === city.name
                        ? 'bg-gold-50/70 text-spiritual-saffron font-semibold'
                        : 'text-spiritual-maroon'
                    }`}
                  >
                    <span>{city.name}</span>
                    {city.state && (
                      <span className="text-xs text-spiritual-warmGray/70">{city.state}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
