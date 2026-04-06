import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import hi from './locales/hi.json';
import bn from './locales/bn.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import mr from './locales/mr.json';
import gu from './locales/gu.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import pa from './locales/pa.json';
import odia from './locales/or.json';
import assamese from './locales/as.json';

const LANGUAGE_KEY = 'user_language';
const SUPPORTED_LANGUAGES = ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as'] as const;

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLang) {
        callback(savedLang);
        return;
      }
      const deviceLocales = Localization.getLocales();
      const deviceLang = deviceLocales?.[0]?.languageCode || 'en';
      const supportedLang = SUPPORTED_LANGUAGES.includes(deviceLang as (typeof SUPPORTED_LANGUAGES)[number])
        ? deviceLang
        : 'en';
      callback(supportedLang);
    } catch {
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lang: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    } catch {}
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      bn: { translation: bn },
      ta: { translation: ta },
      te: { translation: te },
      mr: { translation: mr },
      gu: { translation: gu },
      kn: { translation: kn },
      ml: { translation: ml },
      pa: { translation: pa },
      or: { translation: odia },
      as: { translation: assamese },
    },
    fallbackLng: (code) => {
      if (!code) return ['en'];
      if (code.startsWith('en')) return ['en'];
      if (code.startsWith('hi')) return ['hi', 'en'];
      return ['hi', 'en'];
    },
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
    react: {
      useSuspense: false,
    },
  });

export default i18n;
