'use client';

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface LanguageSwitcherProps {
  isScrolled?: boolean;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'mr', label: 'मराठी' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'অসমীয়া' },
];

export function LanguageSwitcher({ isScrolled = false }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation('common');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentLanguage = i18n.language?.split('-')[0] || 'en';

  return (
    <label
      className={cn(
        'relative flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border',
        isScrolled
          ? 'border-gold-400/40 text-gold-200 hover:bg-gold-400/10 hover:text-gold-400'
          : 'border-gold-400/30 text-spiritual-maroon hover:bg-gold-50 hover:border-gold-400/50'
      )}
    >
      <span className={cn('text-xs', isScrolled ? 'text-gold-300' : 'text-spiritual-warmGray')}>
        {t('language')}
      </span>
      <select
        value={currentLanguage}
        onChange={(e) => {
          const nextLanguage = e.target.value;
          i18n.changeLanguage(nextLanguage);
          document.documentElement.lang = nextLanguage;
        }}
        aria-label={t('changeLanguage')}
        className={cn(
          'bg-transparent outline-none text-sm font-medium cursor-pointer',
          isScrolled ? 'text-gold-100' : 'text-spiritual-maroon'
        )}
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
}
