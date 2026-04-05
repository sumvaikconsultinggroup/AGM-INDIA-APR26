'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';

export default function LanguageSwitcher() {
  const { language, setLanguage, options, t } = useI18n();

  return (
    <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
      <Globe className="h-4 w-4" />
      <span className="hidden xl:inline">{t('common.language')}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as typeof language)}
        aria-label={t('common.changeLanguage')}
        className="bg-transparent outline-none"
      >
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
