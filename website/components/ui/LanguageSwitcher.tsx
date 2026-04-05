'use client';

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Languages } from 'lucide-react';

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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const currentLanguage = i18n.language?.split('-')[0] || 'en';
  const current = useMemo(
    () => LANGUAGES.find((language) => language.code === currentLanguage) || LANGUAGES[0],
    [currentLanguage]
  );

  if (!mounted) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('changeLanguage')}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-all duration-300',
          isScrolled
            ? 'border-white/15 bg-white/8 text-gold-100 hover:bg-white/14'
            : 'border-[rgba(122,86,26,0.14)] bg-white/80 text-spiritual-maroon hover:bg-white'
        )}
      >
        <Languages className="h-4 w-4" />
        <span className="hidden sm:inline">{current.label}</span>
        <span className="sm:hidden">{current.code.toUpperCase()}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-3 w-64 rounded-[24px] border border-[rgba(122,86,26,0.16)] bg-[rgba(255,252,247,0.98)] p-2 shadow-[0_22px_60px_rgba(41,22,11,0.18)] backdrop-blur-xl"
        >
          <div className="px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-spiritual-saffron">
              {t('language')}
            </p>
            <p className="mt-1 text-xs text-spiritual-warmGray">{t('changeLanguage')}</p>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-1">
            {LANGUAGES.map((language) => {
              const active = language.code === currentLanguage;
              return (
                <button
                  key={language.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    i18n.changeLanguage(language.code);
                    document.documentElement.lang = language.code;
                    setOpen(false);
                  }}
                  className={cn(
                    'rounded-2xl px-3 py-2 text-left text-sm transition-colors',
                    active
                      ? 'bg-[rgba(200,107,36,0.12)] text-spiritual-maroon'
                      : 'text-spiritual-warmGray hover:bg-[rgba(92,29,38,0.04)] hover:text-spiritual-maroon'
                  )}
                >
                  {language.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
