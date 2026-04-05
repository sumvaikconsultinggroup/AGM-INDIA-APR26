import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGE_OPTIONS, LanguageCode, translations } from './translations';

const STORAGE_KEY = 'admin_app_language';

interface I18nContextValue {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  languageOptions: typeof LANGUAGE_OPTIONS;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function resolveKey(obj: unknown, key: string): string | undefined {
  const value = key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);

  return typeof value === 'string' ? value : undefined;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{(.*?)\}\}/g, (_, rawKey: string) => {
    const key = rawKey.trim();
    const value = params[key];
    return value === undefined ? '' : String(value);
  });
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    const loadLanguage = async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved && saved in translations) {
        setLanguageState(saved as LanguageCode);
        return;
      }

      const locale = Intl.DateTimeFormat().resolvedOptions().locale;
      const code = locale.split('-')[0] as LanguageCode;
      if (code in translations) {
        setLanguageState(code);
      }
    };
    loadLanguage().catch(() => {});
  }, []);

  const setLanguage = async (nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage);
    await AsyncStorage.setItem(STORAGE_KEY, nextLanguage);
  };

  const value = useMemo<I18nContextValue>(() => {
    const t = (key: string, params?: Record<string, string | number>) => {
      const template =
        resolveKey(translations[language], key) ||
        resolveKey(translations.en, key) ||
        key;
      return interpolate(template, params);
    };

    return {
      language,
      setLanguage,
      t,
      languageOptions: LANGUAGE_OPTIONS,
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
