'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type LanguageCode =
  | 'en'
  | 'hi'
  | 'bn'
  | 'ta'
  | 'te'
  | 'mr'
  | 'gu'
  | 'kn'
  | 'ml'
  | 'pa'
  | 'or'
  | 'as';

const STORAGE_KEY = 'admin_web_language';

export const LANGUAGE_OPTIONS: Array<{ code: LanguageCode; label: string }> = [
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

interface Dictionary {
  [key: string]: string | Dictionary;
}

const en: Dictionary = {
  common: {
    language: 'Language',
    changeLanguage: 'Change language',
    dashboard: 'Dashboard',
    user: 'User',
    admin: 'Admin',
    signOut: 'Sign out',
    toggleNavigationMenu: 'Toggle navigation menu',
    loggedIn: 'Logged in',
  },
  app: {
    name: 'SwamiG Admin',
  },
  sidebar: {
    dashboard: 'Dashboard',
    events: 'Events',
    donations: 'Donations',
    schedule: 'Schedule',
    servicesManagement: 'Services Management',
    scheduleRegistrations: 'Schedule Registrations',
    connect: 'Connect',
    books: 'Books',
    rooms: 'Rooms',
    users: 'Users',
    glimpse: 'Glimpse',
    imagelibrary: 'Image Library',
    volunteers: 'Volunteer',
    printMedia: 'Print Media',
    dikshaMantra: 'Diksha Mantra',
    dailySchedule: 'Daily Schedule',
    website: 'Website',
    podcasts: 'Podcasts',
    videoSeries: 'Video Series',
    articles: 'Articles',
  },
  dashboardPage: {
    welcomeTitle: 'Welcome, Swamiji',
    welcomeSubtitle: 'ॐ AvdheshanandG Mission • Admin Dashboard',
    welcomeDescription:
      'Manage your sacred mission of Gau Seva, Education, and Healthcare. Continue serving humanity with divine grace.',
    stats: {
      totalEvents: 'Total Events',
      donations: 'Donations',
      activeUsers: 'Active Users',
      volunteers: 'Volunteers',
      growthThisMonth: '{{value}} this month',
    },
    managementPortal: 'Management Portal',
    modulesAvailable: '{{count}} modules available',
    needHelpTitle: 'Need Help?',
    needHelpSubtitle: 'Access guides and documentation',
    viewGuides: 'View Guides',
    contactSupport: 'Contact Support',
    cards: {
      events: {
        title: 'Events',
        description: 'Manage upcoming and past events',
        linkText: 'View Events',
      },
      donations: {
        title: 'Donations',
        description: 'Manage donations and fundraising',
        linkText: 'View Donations',
      },
      schedule: {
        title: 'Schedule',
        description: 'Manage daily and weekly schedule',
        linkText: 'View Schedule',
      },
      scheduleRegistrations: {
        title: 'Registrations',
        description: 'Manage schedule registrations',
        linkText: 'View Registrations',
      },
      connect: {
        title: 'Connect',
        description: 'Contact form submissions',
        linkText: 'View Messages',
      },
      books: {
        title: 'Books',
        description: 'Manage published books',
        linkText: 'View Books',
      },
      rooms: {
        title: 'Rooms',
        description: 'Manage room bookings',
        linkText: 'View Rooms',
      },
      users: {
        title: 'Users',
        description: 'Manage user accounts',
        linkText: 'View Users',
      },
      website: {
        title: 'Website Content',
        description: 'Podcasts, videos, and articles',
        linkText: 'Manage Content',
      },
      volunteers: {
        title: 'Volunteers',
        description: 'Manage volunteer applications',
        linkText: 'View Volunteers',
      },
      glimpse: {
        title: 'Glimpse',
        description: 'Manage image gallery',
        linkText: 'View Glimpses',
      },
      imagelibrary: {
        title: 'Image Library',
        description: 'Manage images',
        linkText: 'View Library',
      },
      printMedia: {
        title: 'Print Media',
        description: 'Manage print media',
        linkText: 'View Media',
      },
      dikshaMantra: {
        title: 'Diksha Mantra',
        description: 'Manage Diksha Mantra',
        linkText: 'View Mantra',
      },
      dailySchedule: {
        title: 'Daily Schedule',
        description: 'Manage daily schedule',
        linkText: 'View Schedule',
      },
      servicesManagement: {
        title: 'Services',
        description: 'Manage services',
        linkText: 'Manage Services',
      },
    },
  },
};

const hi: Dictionary = {
  common: {
    language: 'भाषा',
    changeLanguage: 'भाषा बदलें',
    dashboard: 'डैशबोर्ड',
    user: 'उपयोगकर्ता',
    admin: 'एडमिन',
    signOut: 'साइन आउट',
    toggleNavigationMenu: 'नेविगेशन मेन्यू टॉगल करें',
    loggedIn: 'लॉग-इन',
  },
  app: {
    name: 'स्वामीजी एडमिन',
  },
  sidebar: {
    dashboard: 'डैशबोर्ड',
    events: 'कार्यक्रम',
    donations: 'दान',
    schedule: 'कार्यक्रम सूची',
    servicesManagement: 'सेवा प्रबंधन',
    scheduleRegistrations: 'कार्यक्रम पंजीकरण',
    connect: 'संपर्क',
    books: 'पुस्तकें',
    rooms: 'कक्ष',
    users: 'उपयोगकर्ता',
    glimpse: 'झलक',
    imagelibrary: 'छवि लाइब्रेरी',
    volunteers: 'सेवक',
    printMedia: 'प्रिंट मीडिया',
    dikshaMantra: 'दीक्षा मंत्र',
    dailySchedule: 'दैनिक कार्यक्रम',
    website: 'वेबसाइट',
    podcasts: 'पॉडकास्ट',
    videoSeries: 'वीडियो श्रृंखला',
    articles: 'लेख',
  },
  dashboardPage: {
    welcomeTitle: 'स्वागत है, स्वामीजी',
    welcomeSubtitle: 'ॐ अवधेशानंदजी मिशन • एडमिन डैशबोर्ड',
    welcomeDescription:
      'गौ सेवा, शिक्षा और स्वास्थ्य के पवित्र मिशन का प्रबंधन करें। दिव्य कृपा से मानवता की सेवा जारी रखें।',
    stats: {
      totalEvents: 'कुल कार्यक्रम',
      donations: 'दान',
      activeUsers: 'सक्रिय उपयोगकर्ता',
      volunteers: 'सेवक',
      growthThisMonth: 'इस माह {{value}}',
    },
    managementPortal: 'प्रबंधन पोर्टल',
    modulesAvailable: '{{count}} मॉड्यूल उपलब्ध',
    needHelpTitle: 'सहायता चाहिए?',
    needHelpSubtitle: 'गाइड और दस्तावेज़ देखें',
    viewGuides: 'गाइड देखें',
    contactSupport: 'सपोर्ट से संपर्क करें',
    cards: {
      events: {
        title: 'कार्यक्रम',
        description: 'आगामी और पिछले कार्यक्रम प्रबंधित करें',
        linkText: 'कार्यक्रम देखें',
      },
      donations: {
        title: 'दान',
        description: 'दान और फंडरेज़िंग प्रबंधित करें',
        linkText: 'दान देखें',
      },
      schedule: {
        title: 'कार्यक्रम सूची',
        description: 'दैनिक और साप्ताहिक कार्यक्रम प्रबंधित करें',
        linkText: 'कार्यक्रम देखें',
      },
      scheduleRegistrations: {
        title: 'पंजीकरण',
        description: 'कार्यक्रम पंजीकरण प्रबंधित करें',
        linkText: 'पंजीकरण देखें',
      },
      connect: {
        title: 'संपर्क',
        description: 'संपर्क फ़ॉर्म सबमिशन',
        linkText: 'संदेश देखें',
      },
      books: {
        title: 'पुस्तकें',
        description: 'प्रकाशित पुस्तकों का प्रबंधन',
        linkText: 'पुस्तकें देखें',
      },
      rooms: {
        title: 'कक्ष',
        description: 'कक्ष बुकिंग प्रबंधित करें',
        linkText: 'कक्ष देखें',
      },
      users: {
        title: 'उपयोगकर्ता',
        description: 'उपयोगकर्ता खातों का प्रबंधन',
        linkText: 'उपयोगकर्ता देखें',
      },
      website: {
        title: 'वेबसाइट सामग्री',
        description: 'पॉडकास्ट, वीडियो और लेख',
        linkText: 'सामग्री प्रबंधित करें',
      },
      volunteers: {
        title: 'सेवक',
        description: 'सेवक आवेदनों का प्रबंधन',
        linkText: 'सेवक देखें',
      },
      glimpse: {
        title: 'झलक',
        description: 'इमेज गैलरी प्रबंधित करें',
        linkText: 'झलक देखें',
      },
      imagelibrary: {
        title: 'छवि लाइब्रेरी',
        description: 'छवियाँ प्रबंधित करें',
        linkText: 'लाइब्रेरी देखें',
      },
      printMedia: {
        title: 'प्रिंट मीडिया',
        description: 'प्रिंट मीडिया प्रबंधित करें',
        linkText: 'मीडिया देखें',
      },
      dikshaMantra: {
        title: 'दीक्षा मंत्र',
        description: 'दीक्षा मंत्र प्रबंधित करें',
        linkText: 'मंत्र देखें',
      },
      dailySchedule: {
        title: 'दैनिक कार्यक्रम',
        description: 'दैनिक कार्यक्रम प्रबंधित करें',
        linkText: 'कार्यक्रम देखें',
      },
      servicesManagement: {
        title: 'सेवाएँ',
        description: 'सेवाओं का प्रबंधन',
        linkText: 'सेवाएँ प्रबंधित करें',
      },
    },
  },
};

const dictionaries: Record<LanguageCode, Dictionary> = {
  en,
  hi,
  bn: en,
  ta: en,
  te: en,
  mr: en,
  gu: en,
  kn: en,
  ml: en,
  pa: en,
  or: en,
  as: en,
};

type I18nContextValue = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  options: Array<{ code: LanguageCode; label: string }>;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function readNestedValue(dict: Dictionary, key: string): string | undefined {
  const parts = key.split('.');
  let current: string | Dictionary | undefined = dict;
  for (const part of parts) {
    if (!current || typeof current === 'string') return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, token: string) =>
    vars[token] !== undefined ? String(vars[token]) : ''
  );
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    if (saved && LANGUAGE_OPTIONS.some((option) => option.code === saved)) {
      setLanguageState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = dictionaries[language] || en;
      const fallback = readNestedValue(en, key) || key;
      const value = readNestedValue(dict, key) || fallback;
      return interpolate(value, vars);
    },
    [language]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t,
      options: LANGUAGE_OPTIONS,
    }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
