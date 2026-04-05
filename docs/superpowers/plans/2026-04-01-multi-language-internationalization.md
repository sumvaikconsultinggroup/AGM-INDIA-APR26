# Multi-Language Internationalization (Hindi + English) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure i18next on the website and mobile app, create complete Hindi and English translations for every page/screen, and add language switchers so users can toggle between Hindi and English with persisted preference.

**Architecture:** Client-side i18next initialization on the website (no `next-i18next` server dependency since all pages are `'use client'` or static). Translation files stored as JSON in `website/public/locales/{lang}/{namespace}.json`. Mobile app uses i18next with expo-localization for device language detection and AsyncStorage for persistence. Both platforms share the same namespace structure and translation key conventions. No RTL support needed — Hindi is LTR.

**Tech Stack:** i18next 24.2.1, react-i18next 15.4.0, i18next-browser-languagedetector 8.0.2 (already installed on website), i18next-http-backend (new — website), expo-localization (new — mobile), @react-native-async-storage/async-storage (already installed — mobile), i18next + react-i18next (new — mobile).

**Peer Benchmark:**
| Feature | Heartfulness | Art of Living | ISKCON Transcend | Sadhguru | **Our Target** |
|---------|-------------|---------------|-----------------|----------|----------------|
| Languages | 11 | 7 | 11 | 5+ | 2 (Phase 1: Hindi + English) |
| Language Detection | Browser | Browser | Browser + App | Browser | Browser + Device locale |
| Persistence | Cookie | Cookie | LocalStorage | Cookie | LocalStorage (web) + AsyncStorage (mobile) |
| Translation Coverage | Partial (menus only) | Full site | Full app | Full site | Full site + full app |
| Language Switcher | Footer dropdown | Header dropdown | Settings page | Header toggle | Header toggle (web) + Settings (mobile) |
| Mobile App i18n | No app | Limited | Full | Limited | Full |

---

## File Structure

### New Files to Create

**Website — i18n Configuration:**
- `website/lib/i18n.ts` — i18next initialization with browser language detection and HTTP backend
- `website/components/ui/LanguageSwitcher.tsx` — Toggle button component for Navbar

**Website — English Translation Files (one per namespace):**
- `website/public/locales/en/common.json` — Shared UI strings (buttons, labels, loading states)
- `website/public/locales/en/nav.json` — Navbar link names and labels
- `website/public/locales/en/footer.json` — Footer text, quick links, contact, newsletter
- `website/public/locales/en/home.json` — Hero, LifeStory, CoreTeachings, Initiatives, FeaturedBooks, VideoShowcase, GlobalPresence, Gallery, Events, Testimonials, Contact sections
- `website/public/locales/en/about.json` — About page text
- `website/public/locales/en/schedule.json` — Schedule page text
- `website/public/locales/en/donate.json` — Donate page text
- `website/public/locales/en/volunteer.json` — Volunteer page text
- `website/public/locales/en/articles.json` — Articles listing page
- `website/public/locales/en/books.json` — Books listing page
- `website/public/locales/en/videos.json` — Videos listing page
- `website/public/locales/en/podcasts.json` — Podcasts listing page
- `website/public/locales/en/gallery.json` — Gallery page
- `website/public/locales/en/auth.json` — Login, register, OTP screens (future web auth)

**Website — Hindi Translation Files (mirrored namespaces):**
- `website/public/locales/hi/common.json`
- `website/public/locales/hi/nav.json`
- `website/public/locales/hi/footer.json`
- `website/public/locales/hi/home.json`
- `website/public/locales/hi/about.json`
- `website/public/locales/hi/schedule.json`
- `website/public/locales/hi/donate.json`
- `website/public/locales/hi/volunteer.json`
- `website/public/locales/hi/articles.json`
- `website/public/locales/hi/books.json`
- `website/public/locales/hi/videos.json`
- `website/public/locales/hi/podcasts.json`
- `website/public/locales/hi/gallery.json`
- `website/public/locales/hi/auth.json`

**Mobile — i18n Configuration:**
- `mobile/user-app/src/i18n/index.ts` — i18next initialization with device locale detection
- `mobile/user-app/src/i18n/locales/en.json` — All English strings (flat single file)
- `mobile/user-app/src/i18n/locales/hi.json` — All Hindi strings (flat single file)
- `mobile/user-app/src/components/LanguageSwitcher.tsx` — Language toggle component for ProfileScreen

### Files to Modify

**Website:**
- `website/app/layout.tsx` — Import i18n initialization, set `lang` attribute dynamically
- `website/components/layout/Navbar.tsx` — Add LanguageSwitcher, replace hardcoded strings with `t()` calls
- `website/components/layout/Footer.tsx` — Replace hardcoded strings with `t()` calls
- `website/components/sections/Hero.tsx` — Replace hardcoded strings with `t()` calls
- `website/components/sections/LifeStory.tsx` — Replace hardcoded strings with `t()` calls
- `website/components/sections/CoreTeachings.tsx` — Replace hardcoded strings with `t()` calls
- `website/components/sections/Initiatives.tsx` — Replace hardcoded strings with `t()` calls
- `website/components/sections/Events.tsx` — Replace hardcoded strings with `t()` calls
- `website/components/sections/FeaturedBooks.tsx` — Replace hardcoded strings with `t()` calls
- `website/components/sections/VideoShowcase.tsx` — Replace hardcoded strings with `t()` calls
- `website/components/sections/GlobalPresence.tsx` — Replace hardcoded strings with `t()` calls
- `website/components/sections/Gallery.tsx` — Replace hardcoded strings with `t()` calls
- `website/components/sections/Testimonials.tsx` — Replace hardcoded strings with `t()` calls
- `website/components/sections/Contact.tsx` — Replace hardcoded strings with `t()` calls
- `website/components/ui/SectionHeading.tsx` — No changes needed (receives text as props)
- `website/app/page.tsx` — No changes needed (compositions only, no text)
- `website/app/about/page.tsx` — Replace hardcoded strings with `t()` calls
- `website/app/schedule/page.tsx` — Replace hardcoded strings with `t()` calls
- `website/app/donate/page.tsx` — Replace hardcoded strings with `t()` calls
- `website/app/volunteer/page.tsx` — Replace hardcoded strings with `t()` calls
- `website/app/articles/page.tsx` — Replace hardcoded strings with `t()` calls
- `website/app/books/page.tsx` — Replace hardcoded strings with `t()` calls
- `website/app/videos/page.tsx` — Replace hardcoded strings with `t()` calls
- `website/app/podcasts/page.tsx` — Replace hardcoded strings with `t()` calls
- `website/app/gallery/page.tsx` — Replace hardcoded strings with `t()` calls
- `website/package.json` — Add `i18next-http-backend` dependency

**Mobile:**
- `mobile/user-app/package.json` — Add `i18next`, `react-i18next`, `expo-localization` dependencies
- `mobile/user-app/App.tsx` — Import i18n initialization
- `mobile/user-app/src/navigation/AppNavigator.tsx` — Replace hardcoded tab labels with `t()` calls
- `mobile/user-app/src/screens/home/HomeScreen.tsx` — Replace hardcoded strings with `t()` calls
- `mobile/user-app/src/screens/explore/ExploreScreen.tsx` — Replace hardcoded strings with `t()` calls
- `mobile/user-app/src/screens/schedule/ScheduleScreen.tsx` — Replace hardcoded strings with `t()` calls
- `mobile/user-app/src/screens/donate/DonateScreen.tsx` — Replace hardcoded strings with `t()` calls
- `mobile/user-app/src/screens/profile/ProfileScreen.tsx` — Add LanguageSwitcher, replace hardcoded strings
- `mobile/user-app/src/screens/profile/ProfileLoginPrompt.tsx` — Replace hardcoded strings with `t()` calls
- `mobile/user-app/src/screens/auth/LoginScreen.tsx` — Replace hardcoded strings with `t()` calls
- `mobile/user-app/src/screens/auth/RegisterScreen.tsx` — Replace hardcoded strings with `t()` calls
- `mobile/user-app/src/screens/auth/OTPScreen.tsx` — Replace hardcoded strings with `t()` calls
- `mobile/user-app/src/screens/auth/ForgotPasswordScreen.tsx` — Replace hardcoded strings with `t()` calls

### Files to Delete
- `website/public/locales/en/translation.json` — Old backup translation file, replaced by namespace-based files
- `website/public/locales/hi/translation.json` — Old backup translation file, replaced by namespace-based files

---

## Task 1: Install Dependencies

- [ ] **1.1** Install `i18next-http-backend` on the website for loading translations from `/public/locales/` at runtime:

```bash
cd website && npm install i18next-http-backend
```

- [ ] **1.2** Install i18n packages on the mobile app:

```bash
cd mobile/user-app && npx expo install expo-localization && npm install i18next react-i18next
```

Note: `@react-native-async-storage/async-storage` is already installed in the mobile app.

---

## Task 2: Website i18n Initialization

- [ ] **2.1** Create `website/lib/i18n.ts` — the i18next configuration file:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

const NAMESPACES = [
  'common',
  'nav',
  'footer',
  'home',
  'about',
  'schedule',
  'donate',
  'volunteer',
  'articles',
  'books',
  'videos',
  'podcasts',
  'gallery',
  'auth',
];

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi'],
    defaultNS: 'common',
    ns: NAMESPACES,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
```

- [ ] **2.2** Modify `website/app/layout.tsx` — Import i18n and add a client wrapper component for dynamic `lang` attribute:

```typescript
import type { Metadata } from 'next';
import { Inter, Playfair_Display, Cormorant_Garamond, Noto_Serif_Devanagari } from 'next/font/google';
import './globals.css';
import '@/lib/i18n';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PageTransition } from '@/components/ui/PageTransition';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ScrollProgress } from '@/components/ui/ScrollProgress';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const notoSerif = Noto_Serif_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Swami Avdheshanand Giri Ji Maharaj | Spiritual Guide & Visionary',
  description: 'Experience the divine wisdom of Swami Avdheshanand Giri Ji Maharaj, Acharya Mahamandaleshwar & Juna Akhada\'s Peethadheeshwar, guiding souls to inner awakening.',
  keywords: 'Swami Avdheshanand Giri, Juna Akhada, spiritual leader, Advait Vedanta, Hinduism, meditation, ashram, guru, spirituality',
  openGraph: {
    title: 'Swami Avdheshanand Giri Ji Maharaj',
    description: 'Experience the divine wisdom of Swami Avdheshanand Giri Ji Maharaj',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${playfair.variable} ${cormorant.variable} ${notoSerif.variable}`}>
      <body className="min-h-screen bg-spiritual-warmWhite overflow-x-hidden font-body">
        <ScrollProgress />
        <LoadingScreen />
        <Navbar />
        <PageTransition>
          <main className="flex-1">
            {children}
          </main>
        </PageTransition>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
```

The key change is the single line `import '@/lib/i18n';` which initializes i18next before any component renders. Because `layout.tsx` is a Server Component, the import runs the side-effect. All client components that call `useTranslation()` will then find i18n already initialized.

---

## Task 3: Website Language Switcher Component

- [ ] **3.1** Create `website/components/ui/LanguageSwitcher.tsx`:

```typescript
'use client';

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface LanguageSwitcherProps {
  isScrolled?: boolean;
}

export function LanguageSwitcher({ isScrolled = false }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'hi' ? 'en' : 'hi';
    i18n.changeLanguage(newLang);
    document.documentElement.lang = newLang;
  };

  if (!mounted) return null;

  const isHindi = i18n.language === 'hi';

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        'relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border',
        isScrolled
          ? 'border-gold-400/40 text-gold-200 hover:bg-gold-400/10 hover:text-gold-400'
          : 'border-gold-400/30 text-spiritual-maroon hover:bg-gold-50 hover:border-gold-400/50'
      )}
      aria-label={isHindi ? 'Switch to English' : 'हिंदी में बदलें'}
      title={isHindi ? 'Switch to English' : 'हिंदी में बदलें'}
    >
      <span className={cn(
        'transition-all duration-300',
        isHindi ? 'font-noto-serif' : ''
      )}>
        {isHindi ? 'En' : 'हि'}
      </span>
      <span className={cn(
        'text-xs opacity-60',
        isScrolled ? 'text-gold-300' : 'text-spiritual-warmGray'
      )}>
        |
      </span>
      <span className={cn(
        'transition-all duration-300 font-medium',
        !isHindi ? 'font-noto-serif' : ''
      )}>
        {isHindi ? 'English' : 'हिंदी'}
      </span>
    </button>
  );
}
```

- [ ] **3.2** Modify `website/components/layout/Navbar.tsx` — Add the LanguageSwitcher and replace hardcoded strings:

Add import at top of file:
```typescript
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
```

Inside the `Navbar` component function, add the hook:
```typescript
const { t } = useTranslation('nav');
```

Replace the hardcoded `navLinks` array with a function that uses `t()`:
```typescript
const getNavLinks = () => [
  { name: t('home'), href: '/' },
  { name: t('about'), href: '/about' },
  {
    name: t('wisdomLibrary'),
    href: '#',
    children: [
      { name: t('books'), href: '/books' },
      { name: t('podcasts'), href: '/podcasts' },
      { name: t('articles'), href: '/articles' },
      { name: t('videos'), href: '/videos' },
    ],
  },
  { name: t('schedule'), href: '/schedule' },
  { name: t('gallery'), href: '/gallery' },
  { name: t('volunteer'), href: '/volunteer' },
];
```

Move `navLinks` inside the component (call `const navLinks = getNavLinks();` after the hook).

Replace the Donate button text `Donate` with `{t('donate')}` and `Donate with Love` with `{t('donateWithLove')}`.

Replace the mobile menu header `Menu` with `{t('menu')}`.

Replace `Swipe to explore` text (if present in mobile menu) similarly.

Add the `<LanguageSwitcher isScrolled={isScrolled} />` in the right section, before the Donate button:

```tsx
{/* Right Section */}
<div className="flex items-center gap-4">
  <LanguageSwitcher isScrolled={isScrolled} />
  <Link
    href="/donate"
    className={cn(
      "hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300",
      isScrolled
        ? "bg-gradient-to-r from-gold-400 to-gold-500 text-spiritual-maroon hover:shadow-[0_4px_20px_rgba(212,160,23,0.4)] hover:-translate-y-0.5"
        : "btn-primary"
    )}
  >
    <Heart className="w-4 h-4" />
    {t('donate')}
  </Link>
  {/* Mobile Menu Button ... */}
</div>
```

Also add a language switcher in the mobile menu panel, above the Om divider:

```tsx
{/* Language Switcher in mobile menu */}
<div className="px-4 py-3">
  <LanguageSwitcher />
</div>
```

---

## Task 4: Website English Translation Files

- [ ] **4.1** Delete old files and create `website/public/locales/en/common.json`:

```json
{
  "loading": "Loading...",
  "loadingCauses": "Loading causes...",
  "error": "Error",
  "retry": "Retry",
  "submit": "Submit",
  "cancel": "Cancel",
  "close": "Close",
  "learnMore": "Learn More",
  "seeAll": "See All",
  "readMore": "Read More",
  "viewAll": "View All",
  "backToHome": "Back to Home",
  "comingSoon": "Coming Soon",
  "nothingFound": "Nothing found",
  "swipeToExplore": "Swipe to explore",
  "securePayment": "Secure Payment",
  "taxDeductible": "Tax Deductible",
  "raised": "raised",
  "goal": "Goal",
  "privacyPolicy": "Privacy Policy",
  "termsOfService": "Terms of Service",
  "copyright": "Avdheshanand Mission. Made with",
  "forSpiritualSeekers": "for spiritual seekers.",
  "sarveBlessing": "May all beings be happy, may all beings be free from illness"
}
```

- [ ] **4.2** Create `website/public/locales/en/nav.json`:

```json
{
  "home": "Home",
  "about": "About",
  "wisdomLibrary": "Wisdom Library",
  "books": "Books",
  "podcasts": "Podcasts",
  "articles": "Articles",
  "videos": "Videos",
  "schedule": "Schedule",
  "gallery": "Gallery",
  "volunteer": "Volunteer",
  "donate": "Donate",
  "donateWithLove": "Donate with Love",
  "menu": "Menu"
}
```

- [ ] **4.3** Create `website/public/locales/en/footer.json`:

```json
{
  "tagline": "Guiding souls towards inner awakening through the timeless wisdom of Vedanta.",
  "quickLinks": "Quick Links",
  "contactUs": "Contact Us",
  "stayConnected": "Stay Connected",
  "newsletterText": "Receive spiritual insights and updates directly in your inbox.",
  "emailPlaceholder": "Your email address",
  "subscribeWithLove": "Subscribe with Love",
  "address": "Kankhal Ashram, Haridwar,\nUttarakhand, India",
  "phone": "+91 XXX XXX XXXX",
  "email": "info@avdheshanandg.org"
}
```

- [ ] **4.4** Create `website/public/locales/en/home.json`:

```json
{
  "hero": {
    "blessing": "॥ श्री गुरवे नमः ॥",
    "badge": "Acharya Mahamandaleshwar · Juna Akhara",
    "titleLine1": "Swami Avdheshanand",
    "titleLine2": "Giri Ji Maharaj",
    "subtitle": "Illuminating the Path of Vedanta for Millions Worldwide",
    "shloka": "सत्यं शिवं सुन्दरम्",
    "ctaExplore": "Explore His Journey",
    "ctaWatch": "Watch Discourse",
    "scrollDiscover": "Discover"
  },
  "lifeStory": {
    "title": "A Life Devoted to Truth",
    "subtitle": "The sacred journey from seeking to illumination",
    "milestones": {
      "divineBirth": {
        "year": "1962",
        "title": "Divine Birth",
        "description": "Born in Khurja, Bulandsher, Uttar Pradesh into a devout Brahmin family. From infancy, he displayed extraordinary spiritual inclinations, often sharing memories of previous births with family members."
      },
      "callOfHimalayas": {
        "year": "1980",
        "title": "Call of the Himalayas",
        "description": "At age 18, driven by an intense craving for Truth, he renounced worldly life and departed for the Himalayas. \"When you develop a craving to know the Truth, the mountains and caves start attracting you,\" he later recalled."
      },
      "gurusGrace": {
        "year": "1980-85",
        "title": "The Guru's Grace",
        "description": "After months of wandering in the Himalayan ranges, he found his guru — Swami Avdhoot Prakash Maharaj, a self-realized yogi and Vedic master. Under his guidance, he immersed in the study of Vedas, scriptures, and rigorous yogic sadhana."
      },
      "sacredRenunciation": {
        "year": "1985",
        "title": "The Sacred Renunciation",
        "description": "After years of intense sadhana in Himalayan caves, a matured yogi emerged. He received Sannyas Diksha from Swami Satyamittranand Giri and formally entered the ancient Juna Akhara, receiving the name Swami Avdheshanand Giri."
      },
      "ascendingSeat": {
        "year": "1998",
        "title": "Ascending the Sacred Seat",
        "description": "In a historic Pattabhishekam ceremony, he was formally consecrated as Acharya Mahamandaleshwar of Juna Akhara — becoming the supreme spiritual leader of one of the oldest and largest Hindu monastic orders with over 500,000 monks."
      },
      "worldInService": {
        "year": "Present",
        "title": "A World in Service",
        "description": "Today, as President of the Hindu Dharma Acharya Sabha, he guides millions through his teachings of Vedanta. From Times Square to the Kumbh Mela, his message of universal consciousness and compassionate service reaches every corner of the globe."
      }
    },
    "swipeToExplore": "Swipe to explore"
  },
  "coreTeachings": {
    "title": "Core Teachings",
    "subtitle": "Timeless wisdom for the modern seeker",
    "meditation": {
      "title": "Meditation & Dhyana",
      "tagline": "The path within",
      "description": "Swami Ji teaches that through the ancient practice of dhyana — deep meditation — we transcend the restless mind and discover the infinite peace that resides within. Regular meditation dissolves the ego and reveals our true nature as pure consciousness."
    },
    "advaita": {
      "title": "Advaita Vedanta",
      "tagline": "Non-dual wisdom",
      "description": "Rooted in the teachings of Adi Shankaracharya, Swami Ji illuminates the profound truth of Advaita — that the individual soul and the Supreme Reality are one. 'We are waves in the ocean, longing to merge with our source,' he teaches."
    },
    "consciousLiving": {
      "title": "Conscious Living",
      "tagline": "Dharma in daily life",
      "description": "Swami Ji emphasizes transforming daily life into spiritual practice. Through discipline, self-restraint, and mindful awareness, every moment becomes an opportunity for growth. Living by Satya (truth) and Ahimsa (non-violence) brings lasting peace."
    },
    "seva": {
      "title": "Seva — Selfless Service",
      "tagline": "Love in action",
      "description": "'This is an era of service,' Swami Ji declares. Through selfless seva, we dissolve the boundaries of ego and experience the divine in all beings. Compassionate service to humanity is the highest spiritual practice."
    }
  },
  "initiatives": {
    "title": "Seva in Action",
    "subtitle": "Transforming lives through compassion and commitment",
    "shivganga": {
      "title": "Shivganga Project",
      "location": "Jhabua, Madhya Pradesh",
      "description": "Transforming lives in one of India's most arid and underdeveloped regions through water conservation, sustainable agriculture, skill development, and community empowerment — while preserving local customs and cultural identity.",
      "impactLabel": "Lives Transformed"
    },
    "greenKumbh": {
      "title": "Green Kumbh Initiative",
      "location": "Prayagraj & Beyond",
      "description": "A pioneering initiative to make the world's largest spiritual gathering environmentally sustainable. From medical camps to waste management, setting new standards for eco-conscious spiritual events.",
      "impactLabel": "Millions of Devotees Served"
    },
    "futureSkilling": {
      "title": "Institute of Future Skilling",
      "location": "New Delhi",
      "description": "In partnership with Ladli Foundation, empowering 2,000+ youth — including 100+ transgender trainees — in digital technologies and AI, bridging ancient wisdom with modern innovation.",
      "impactLabel": "Youth Empowered"
    },
    "bhopalVidyaPeeth": {
      "title": "Bhopal Vidya Peeth",
      "location": "Bhopal, Madhya Pradesh",
      "description": "An educational initiative nurturing 'dharma ambassadors' through comprehensive training in Sanskrit, Vedas, Ayurveda, organic farming, and modern languages — preparing youth to carry Sanatan values globally.",
      "impactLabel": "Next Generation Leaders"
    }
  }
}
```

- [ ] **4.5** Create `website/public/locales/en/about.json`:

```json
{
  "hero": {
    "title": "About Swami Ji",
    "subtitle": "The journey of a spiritual luminary",
    "badge": "Acharya Mahamandaleshwar · Juna Akhara"
  },
  "introduction": {
    "title": "A Beacon of Spiritual Light",
    "paragraph1": "His Holiness Swami Avdheshanand Giri Ji Maharaj is the Acharya Mahamandaleshwar of Juna Akhara — one of the oldest and most revered Hindu monastic orders. As the supreme spiritual head of over 500,000 monks, he carries forward the unbroken lineage of Adi Shankaracharya's Advaita Vedanta tradition.",
    "paragraph2": "Born in 1962 in Khurja, Uttar Pradesh, Swami Ji renounced worldly life at the age of 18 and embarked on a solitary journey to the Himalayas. Under the guidance of his Guru, Swami Avdhoot Prakash Maharaj, he underwent years of intense sadhana in Himalayan caves.",
    "paragraph3": "Today, as President of the Hindu Dharma Acharya Sabha, he bridges ancient wisdom with contemporary challenges, guiding millions across the globe toward inner awakening and righteous living."
  },
  "roles": {
    "title": "Roles & Responsibilities",
    "acharyaMahamandaleshwar": "Acharya Mahamandaleshwar, Juna Akhara",
    "presidentSabha": "President, Hindu Dharma Acharya Sabha",
    "founderMission": "Founder, Avdheshanand Mission",
    "vedantaScholar": "Vedanta Scholar & Author",
    "globalSpeaker": "Global Spiritual Speaker"
  },
  "philosophy": {
    "title": "Philosophy & Vision",
    "description": "Swami Ji's philosophy rests on the foundation of Advaita Vedanta — the non-dual understanding that the individual self and the universal consciousness are one. He teaches that true knowledge is not information but transformation.",
    "quote": "True knowledge is not merely information; it is transformation. When wisdom enters the heart, it changes not only how we think but how we live.",
    "quoteAuthor": "— Swami Avdheshanand Giri Ji"
  },
  "timeline": {
    "title": "Life Journey",
    "birth": "Born in Khurja, UP",
    "renunciation": "Renounced worldly life at 18",
    "guruDiksha": "Received Guru's guidance",
    "sannyasDiksha": "Sannyas Diksha received",
    "pattabhishekam": "Consecrated as Acharya Mahamandaleshwar",
    "present": "Guiding millions worldwide"
  }
}
```

- [ ] **4.6** Create `website/public/locales/en/schedule.json`:

```json
{
  "hero": {
    "sanskritTitle": "आगामी कार्यक्रम",
    "title": "Schedule &",
    "titleHighlight": "Events",
    "subtitle": "Join us in sacred gatherings that nourish the soul and awaken the spirit. Experience divine satsangs and transformative spiritual events."
  },
  "upcomingEvents": "Upcoming Events",
  "noEvents": "No upcoming events scheduled at this time.",
  "registerNow": "Register Now",
  "registered": "Registered",
  "viewDetails": "View Details",
  "location": "Location",
  "date": "Date",
  "time": "Time"
}
```

- [ ] **4.7** Create `website/public/locales/en/donate.json`:

```json
{
  "hero": {
    "title": "Donate with",
    "titleHighlight": "Love",
    "subtitle": "Your generous contribution helps sustain Swami Ji's mission of spreading spiritual wisdom and serving humanity. Every offering, big or small, makes a divine difference."
  },
  "causes": {
    "sanskritTitle": "सेवा",
    "title": "Support Our",
    "titleHighlight": "Causes",
    "subtitle": "Choose a cause close to your heart and make a meaningful contribution"
  },
  "noCauses": {
    "title": "No Causes Found",
    "subtitle": "Check back later for donation opportunities."
  },
  "donateNow": "Donate Now",
  "customDonation": {
    "title": "Custom Donation Amount",
    "subtitle": "Every contribution, no matter the size, brings blessings",
    "placeholder": "Enter amount"
  },
  "donateWithLove": "Donate with Love",
  "impact": {
    "title": "Your Impact",
    "subtitle": "See how your donations have helped spread light and love",
    "mealsServed": "Meals Served",
    "studentsEducated": "Students Educated",
    "healthcareCamps": "Healthcare Camps"
  }
}
```

- [ ] **4.8** Create `website/public/locales/en/volunteer.json`:

```json
{
  "hero": {
    "sanskritTitle": "सेवा भाव",
    "title": "Serve with",
    "titleHighlight": "Love",
    "subtitle": "Join our community of dedicated volunteers and contribute to Swami Ji's mission of spiritual upliftment and service to humanity.",
    "ctaJoin": "Join as Volunteer",
    "ctaLearn": "Learn More"
  },
  "impact": {
    "sanskritTitle": "प्रभाव",
    "title": "Our",
    "titleHighlight": "Impact",
    "activeVolunteers": "Active Volunteers",
    "eventsOrganized": "Events Organized",
    "citiesReached": "Cities Reached",
    "livesTouched": "Lives Touched"
  },
  "areas": {
    "sanskritTitle": "सेवा के क्षेत्र",
    "title": "Ways to",
    "titleHighlight": "Volunteer",
    "subtitle": "Choose how you'd like to serve and make a difference",
    "kumbhMela": {
      "title": "Kumbh Mela Seva",
      "description": "Join the sacred service during Maha Kumbh — from devotee assistance to environmental stewardship at the world's largest gathering."
    },
    "ashramSeva": {
      "title": "Ashram Seva",
      "description": "Contribute to daily operations at Harihar Ashram, Kankhal — hospitality, kitchen service, maintenance, and spiritual program support."
    },
    "communityOutreach": {
      "title": "Community Outreach",
      "description": "Participate in healthcare camps, food distribution drives, and education programs in underserved communities across India."
    },
    "volunteers": "volunteers"
  },
  "register": {
    "title": "Register as a Volunteer",
    "subtitle": "Fill out the form below to join our seva family",
    "fullName": "Full Name",
    "namePlaceholder": "Your name",
    "emailAddress": "Email Address",
    "emailPlaceholder": "your@email.com",
    "phoneNumber": "Phone Number",
    "phonePlaceholder": "+91 XXXXX XXXXX",
    "areaOfInterest": "Area of Interest",
    "selectArea": "Select your preferred area",
    "eventSupport": "Event Support",
    "communityService": "Community Service",
    "ashramActivities": "Ashram Activities",
    "allAreas": "All Areas",
    "availability": "Availability",
    "weekdays": "Weekdays",
    "weekends": "Weekends",
    "flexible": "Flexible",
    "aboutYourself": "Tell Us About Yourself",
    "aboutPlaceholder": "Share your motivation to serve and any relevant experience...",
    "submitting": "Submitting...",
    "submitApplication": "Submit Application",
    "successMessage": "Thank you for your interest in volunteering! We will contact you soon.",
    "errorMessage": "Failed to submit application. Please try again later.",
    "privacyNote": "By submitting, you agree to be contacted about volunteer opportunities.",
    "privacyRespect": "We respect your privacy."
  },
  "testimonial": {
    "quote": "Seva is not just about giving your time or effort; it is about offering your heart. Through selfless service, we dissolve the ego and experience the divine within ourselves and others.",
    "author": "Swami Avdheshanand Giri Ji"
  }
}
```

- [ ] **4.9** Create `website/public/locales/en/articles.json`:

```json
{
  "hero": {
    "sanskritTitle": "लेख",
    "title": "Articles &",
    "titleHighlight": "Insights",
    "subtitle": "Spiritual wisdom, reflections, and teachings from Swami Avdheshanand Giri Ji Maharaj."
  },
  "readArticle": "Read Article",
  "noArticles": "No articles available at this time.",
  "category": "Category",
  "publishedOn": "Published on",
  "readTime": "min read",
  "allCategories": "All Categories"
}
```

- [ ] **4.10** Create `website/public/locales/en/books.json`:

```json
{
  "hero": {
    "sanskritTitle": "पुस्तकें",
    "title": "Sacred",
    "titleHighlight": "Books",
    "subtitle": "Explore the literary works of Swami Avdheshanand Giri Ji Maharaj — profound teachings on Vedanta, spirituality, and conscious living."
  },
  "viewBook": "View Book",
  "buyNow": "Buy Now",
  "noBooks": "No books available at this time.",
  "author": "Author",
  "price": "Price",
  "language": "Language",
  "allBooks": "All Books"
}
```

- [ ] **4.11** Create `website/public/locales/en/videos.json`:

```json
{
  "hero": {
    "sanskritTitle": "प्रवचन",
    "title": "Video",
    "titleHighlight": "Discourses",
    "subtitle": "Watch Swami Ji's transformative discourses on Vedanta, meditation, and the path to self-realization."
  },
  "watchNow": "Watch Now",
  "noVideos": "No videos available at this time.",
  "duration": "Duration",
  "views": "Views",
  "allSeries": "All Series"
}
```

- [ ] **4.12** Create `website/public/locales/en/podcasts.json`:

```json
{
  "hero": {
    "sanskritTitle": "श्रवण",
    "title": "Spiritual",
    "titleHighlight": "Podcasts",
    "subtitle": "Listen to Swami Ji's discourses and spiritual conversations — wisdom for your daily journey."
  },
  "listenNow": "Listen Now",
  "noPodcasts": "No podcasts available at this time.",
  "duration": "Duration",
  "episode": "Episode",
  "allPodcasts": "All Podcasts"
}
```

- [ ] **4.13** Create `website/public/locales/en/gallery.json`:

```json
{
  "hero": {
    "sanskritTitle": "दर्शन",
    "title": "Photo",
    "titleHighlight": "Gallery",
    "subtitle": "Glimpses of divine moments — satsangs, discourses, Kumbh Mela, and sacred gatherings from Swami Ji's journey."
  },
  "viewImage": "View Image",
  "noImages": "No images available at this time.",
  "allPhotos": "All Photos",
  "loadMore": "Load More"
}
```

- [ ] **4.14** Create `website/public/locales/en/auth.json`:

```json
{
  "welcomeBack": "Welcome Back",
  "hariOmTatSat": "Hari Om Tat Sat",
  "email": "Email",
  "password": "Password",
  "forgotPassword": "Forgot Password?",
  "signIn": "Sign In",
  "or": "or",
  "continueWithGoogle": "Continue with Google",
  "noAccount": "Don't have an account?",
  "register": "Register",
  "browseWithoutSignIn": "Browse without signing in",
  "createAccount": "Create Account",
  "fullName": "Full Name",
  "confirmPassword": "Confirm Password",
  "alreadyHaveAccount": "Already have an account?",
  "login": "Login",
  "otpTitle": "Verify Your Email",
  "otpSubtitle": "Enter the OTP sent to your email",
  "verifyOtp": "Verify OTP",
  "resendOtp": "Resend OTP",
  "resetPassword": "Reset Password",
  "resetSubtitle": "Enter your email to receive reset instructions",
  "sendResetLink": "Send Reset Link",
  "backToLogin": "Back to Login",
  "loginFailed": "Login Failed",
  "invalidCredentials": "Invalid credentials",
  "fillAllFields": "Please fill in all fields"
}
```

---

## Task 5: Website Hindi Translation Files

- [ ] **5.1** Create `website/public/locales/hi/common.json`:

```json
{
  "loading": "लोड हो रहा है...",
  "loadingCauses": "कारण लोड हो रहे हैं...",
  "error": "त्रुटि",
  "retry": "पुनः प्रयास करें",
  "submit": "जमा करें",
  "cancel": "रद्द करें",
  "close": "बंद करें",
  "learnMore": "और जानें",
  "seeAll": "सभी देखें",
  "readMore": "और पढ़ें",
  "viewAll": "सभी देखें",
  "backToHome": "मुख्य पृष्ठ पर वापस जाएं",
  "comingSoon": "जल्द आ रहा है",
  "nothingFound": "कुछ नहीं मिला",
  "swipeToExplore": "जानने के लिए स्वाइप करें",
  "securePayment": "सुरक्षित भुगतान",
  "taxDeductible": "कर में छूट",
  "raised": "प्राप्त",
  "goal": "लक्ष्य",
  "privacyPolicy": "गोपनीयता नीति",
  "termsOfService": "सेवा की शर्तें",
  "copyright": "अवधेशानंद मिशन।",
  "forSpiritualSeekers": "आध्यात्मिक साधकों के लिए।",
  "sarveBlessing": "सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः"
}
```

- [ ] **5.2** Create `website/public/locales/hi/nav.json`:

```json
{
  "home": "मुख्य पृष्ठ",
  "about": "परिचय",
  "wisdomLibrary": "ज्ञान पुस्तकालय",
  "books": "पुस्तकें",
  "podcasts": "पॉडकास्ट",
  "articles": "लेख",
  "videos": "वीडियो",
  "schedule": "कार्यक्रम",
  "gallery": "दर्शन",
  "volunteer": "सेवादार",
  "donate": "दान करें",
  "donateWithLove": "प्रेम से दान करें",
  "menu": "मेन्यू"
}
```

- [ ] **5.3** Create `website/public/locales/hi/footer.json`:

```json
{
  "tagline": "वेदांत की शाश्वत विद्या के माध्यम से आत्माओं को आंतरिक जागृति की ओर मार्गदर्शन।",
  "quickLinks": "त्वरित लिंक",
  "contactUs": "संपर्क करें",
  "stayConnected": "जुड़े रहें",
  "newsletterText": "आध्यात्मिक अंतर्दृष्टि और अपडेट सीधे अपने इनबॉक्स में प्राप्त करें।",
  "emailPlaceholder": "आपका ईमेल पता",
  "subscribeWithLove": "प्रेम से सब्सक्राइब करें",
  "address": "कनखल आश्रम, हरिद्वार,\nउत्तराखंड, भारत",
  "phone": "+91 XXX XXX XXXX",
  "email": "info@avdheshanandg.org"
}
```

- [ ] **5.4** Create `website/public/locales/hi/home.json`:

```json
{
  "hero": {
    "blessing": "॥ श्री गुरवे नमः ॥",
    "badge": "आचार्य महामण्डलेश्वर · जूना अखाड़ा",
    "titleLine1": "स्वामी अवधेशानंद",
    "titleLine2": "गिरि जी महाराज",
    "subtitle": "विश्वभर में लाखों लोगों के लिए वेदांत का मार्ग प्रज्वलित करते हुए",
    "shloka": "सत्यं शिवं सुन्दरम्",
    "ctaExplore": "उनकी यात्रा जानें",
    "ctaWatch": "प्रवचन देखें",
    "scrollDiscover": "जानें"
  },
  "lifeStory": {
    "title": "सत्य के प्रति समर्पित जीवन",
    "subtitle": "खोज से प्रकाश तक की पवित्र यात्रा",
    "milestones": {
      "divineBirth": {
        "year": "1962",
        "title": "दिव्य जन्म",
        "description": "उत्तर प्रदेश के बुलंदशहर जिले के खुर्जा में एक भक्त ब्राह्मण परिवार में जन्म। बचपन से ही उन्होंने असाधारण आध्यात्मिक प्रवृत्तियां दिखाईं, अक्सर परिवार के सदस्यों के साथ पूर्व जन्मों की स्मृतियां साझा करते थे।"
      },
      "callOfHimalayas": {
        "year": "1980",
        "title": "हिमालय की पुकार",
        "description": "18 वर्ष की आयु में, सत्य को जानने की तीव्र लालसा से प्रेरित होकर, उन्होंने सांसारिक जीवन का त्याग किया और हिमालय की ओर प्रस्थान किया। \"जब आप सत्य को जानने की लालसा विकसित करते हैं, तो पहाड़ और गुफाएं आपको आकर्षित करने लगती हैं,\" उन्होंने बाद में कहा।"
      },
      "gurusGrace": {
        "year": "1980-85",
        "title": "गुरु की कृपा",
        "description": "हिमालय श्रृंखलाओं में महीनों भटकने के बाद, उन्हें अपने गुरु — स्वामी अवधूत प्रकाश महाराज, एक आत्मसाक्षात्कारी योगी और वैदिक गुरु — मिले। उनके मार्गदर्शन में, उन्होंने वेदों, शास्त्रों और कठोर योगिक साधना के अध्ययन में स्वयं को डुबो दिया।"
      },
      "sacredRenunciation": {
        "year": "1985",
        "title": "पवित्र संन्यास",
        "description": "हिमालय की गुफाओं में वर्षों की गहन साधना के बाद, एक परिपक्व योगी का उदय हुआ। उन्होंने स्वामी सत्यमित्रानंद गिरि से संन्यास दीक्षा प्राप्त की और औपचारिक रूप से प्राचीन जूना अखाड़े में प्रवेश किया, जहां उन्हें स्वामी अवधेशानंद गिरि नाम प्राप्त हुआ।"
      },
      "ascendingSeat": {
        "year": "1998",
        "title": "पवित्र पीठ पर आरूढ़",
        "description": "एक ऐतिहासिक पट्टाभिषेकम समारोह में, उन्हें औपचारिक रूप से जूना अखाड़े के आचार्य महामण्डलेश्वर के रूप में अभिषिक्त किया गया — जो सबसे प्राचीन और सबसे बड़े हिंदू मठीय संगठनों में से एक के सर्वोच्च आध्यात्मिक नेता बने, जिसमें 5,00,000 से अधिक संन्यासी हैं।"
      },
      "worldInService": {
        "year": "वर्तमान",
        "title": "सेवा में विश्व",
        "description": "आज, हिंदू धर्म आचार्य सभा के अध्यक्ष के रूप में, वे वेदांत की शिक्षाओं के माध्यम से लाखों लोगों का मार्गदर्शन करते हैं। टाइम्स स्क्वायर से कुंभ मेले तक, उनका सार्वभौमिक चेतना और करुणामय सेवा का संदेश विश्व के हर कोने तक पहुंचता है।"
      }
    },
    "swipeToExplore": "जानने के लिए स्वाइप करें"
  },
  "coreTeachings": {
    "title": "मूल शिक्षाएं",
    "subtitle": "आधुनिक साधक के लिए शाश्वत ज्ञान",
    "meditation": {
      "title": "ध्यान एवं साधना",
      "tagline": "अंतर्मन का मार्ग",
      "description": "स्वामी जी सिखाते हैं कि ध्यान — गहन साधना — के प्राचीन अभ्यास के माध्यम से हम चंचल मन को पार करते हैं और भीतर निवास करने वाली अनंत शांति की खोज करते हैं। नियमित ध्यान अहंकार को विलीन करता है और शुद्ध चेतना के रूप में हमारे वास्तविक स्वरूप को प्रकट करता है।"
    },
    "advaita": {
      "title": "अद्वैत वेदांत",
      "tagline": "अद्वैत ज्ञान",
      "description": "आदि शंकराचार्य की शिक्षाओं में निहित, स्वामी जी अद्वैत के गहन सत्य को प्रकाशित करते हैं — कि जीवात्मा और परमात्मा एक हैं। 'हम सागर में लहरें हैं, अपने उद्गम से मिलने को आतुर,' वे सिखाते हैं।"
    },
    "consciousLiving": {
      "title": "सचेत जीवन",
      "tagline": "दैनिक जीवन में धर्म",
      "description": "स्वामी जी दैनिक जीवन को आध्यात्मिक साधना में बदलने पर बल देते हैं। अनुशासन, आत्मसंयम और सचेत जागरूकता के माध्यम से, हर क्षण विकास का अवसर बन जाता है। सत्य और अहिंसा के अनुसार जीवन जीना स्थायी शांति लाता है।"
    },
    "seva": {
      "title": "सेवा — निःस्वार्थ सेवा",
      "tagline": "कर्म में प्रेम",
      "description": "'यह सेवा का युग है,' स्वामी जी घोषणा करते हैं। निःस्वार्थ सेवा के माध्यम से, हम अहंकार की सीमाओं को विलीन करते हैं और सभी प्राणियों में दिव्यता का अनुभव करते हैं। मानवता की करुणामय सेवा सर्वोच्च आध्यात्मिक साधना है।"
    }
  },
  "initiatives": {
    "title": "सेवा कार्यों में",
    "subtitle": "करुणा और प्रतिबद्धता से जीवन को रूपांतरित करना",
    "shivganga": {
      "title": "शिवगंगा परियोजना",
      "location": "झाबुआ, मध्य प्रदेश",
      "description": "भारत के सबसे शुष्क और अविकसित क्षेत्रों में से एक में जल संरक्षण, सतत कृषि, कौशल विकास और सामुदायिक सशक्तिकरण के माध्यम से जीवन को बदलना — स्थानीय रीति-रिवाजों और सांस्कृतिक पहचान को संरक्षित करते हुए।",
      "impactLabel": "जीवन रूपांतरित"
    },
    "greenKumbh": {
      "title": "हरित कुंभ पहल",
      "location": "प्रयागराज और अन्य",
      "description": "विश्व के सबसे बड़े आध्यात्मिक आयोजन को पर्यावरण के अनुकूल बनाने की अग्रणी पहल। चिकित्सा शिविरों से लेकर कचरा प्रबंधन तक, पर्यावरण-सचेत आध्यात्मिक आयोजनों के लिए नए मानक स्थापित करना।",
      "impactLabel": "लाखों भक्तों की सेवा"
    },
    "futureSkilling": {
      "title": "भविष्य कौशल संस्थान",
      "location": "नई दिल्ली",
      "description": "लाडली फाउंडेशन के साथ साझेदारी में, 2,000+ युवाओं — जिनमें 100+ ट्रांसजेंडर प्रशिक्षार्थी शामिल हैं — को डिजिटल प्रौद्योगिकियों और एआई में सशक्त बनाना, प्राचीन ज्ञान को आधुनिक नवाचार से जोड़ना।",
      "impactLabel": "युवा सशक्त"
    },
    "bhopalVidyaPeeth": {
      "title": "भोपाल विद्यापीठ",
      "location": "भोपाल, मध्य प्रदेश",
      "description": "संस्कृत, वेद, आयुर्वेद, जैविक खेती और आधुनिक भाषाओं में व्यापक प्रशिक्षण के माध्यम से 'धर्म दूतों' का पोषण करने वाली शैक्षिक पहल — सनातन मूल्यों को वैश्विक स्तर पर ले जाने के लिए युवाओं को तैयार करना।",
      "impactLabel": "अगली पीढ़ी के नेता"
    }
  }
}
```

- [ ] **5.5** Create `website/public/locales/hi/about.json`:

```json
{
  "hero": {
    "title": "स्वामी जी के बारे में",
    "subtitle": "एक आध्यात्मिक दिव्य विभूति की यात्रा",
    "badge": "आचार्य महामण्डलेश्वर · जूना अखाड़ा"
  },
  "introduction": {
    "title": "आध्यात्मिक प्रकाश की किरण",
    "paragraph1": "परम पूज्य स्वामी अवधेशानंद गिरि जी महाराज जूना अखाड़े के आचार्य महामण्डलेश्वर हैं — जो सबसे प्राचीन और सबसे सम्मानित हिंदू मठीय संगठनों में से एक है। 5,00,000 से अधिक संन्यासियों के सर्वोच्च आध्यात्मिक प्रमुख के रूप में, वे आदि शंकराचार्य की अद्वैत वेदांत परंपरा की अखंड वंशावली को आगे बढ़ाते हैं।",
    "paragraph2": "1962 में उत्तर प्रदेश के खुर्जा में जन्मे, स्वामी जी ने 18 वर्ष की आयु में सांसारिक जीवन का त्याग किया और हिमालय की एकांत यात्रा पर निकल पड़े। अपने गुरु, स्वामी अवधूत प्रकाश महाराज के मार्गदर्शन में, उन्होंने हिमालय की गुफाओं में वर्षों तक गहन साधना की।",
    "paragraph3": "आज, हिंदू धर्म आचार्य सभा के अध्यक्ष के रूप में, वे प्राचीन ज्ञान को समकालीन चुनौतियों से जोड़ते हैं, विश्वभर में लाखों लोगों को आंतरिक जागृति और धर्मपूर्ण जीवन की ओर मार्गदर्शन करते हैं।"
  },
  "roles": {
    "title": "भूमिकाएं और उत्तरदायित्व",
    "acharyaMahamandaleshwar": "आचार्य महामण्डलेश्वर, जूना अखाड़ा",
    "presidentSabha": "अध्यक्ष, हिंदू धर्म आचार्य सभा",
    "founderMission": "संस्थापक, अवधेशानंद मिशन",
    "vedantaScholar": "वेदांत विद्वान एवं लेखक",
    "globalSpeaker": "वैश्विक आध्यात्मिक वक्ता"
  },
  "philosophy": {
    "title": "दर्शन एवं दृष्टि",
    "description": "स्वामी जी का दर्शन अद्वैत वेदांत की नींव पर टिका है — यह अद्वैत बोध कि जीवात्मा और सार्वभौमिक चेतना एक हैं। वे सिखाते हैं कि सच्चा ज्ञान सूचना नहीं बल्कि रूपांतरण है।",
    "quote": "सच्चा ज्ञान केवल सूचना नहीं है; यह रूपांतरण है। जब ज्ञान हृदय में प्रवेश करता है, तो यह न केवल हमारी सोच को बदलता है बल्कि हमारे जीवन को भी बदल देता है।",
    "quoteAuthor": "— स्वामी अवधेशानंद गिरि जी"
  },
  "timeline": {
    "title": "जीवन यात्रा",
    "birth": "खुर्जा, उत्तर प्रदेश में जन्म",
    "renunciation": "18 वर्ष की आयु में सांसारिक जीवन का त्याग",
    "guruDiksha": "गुरु का मार्गदर्शन प्राप्त",
    "sannyasDiksha": "संन्यास दीक्षा प्राप्त",
    "pattabhishekam": "आचार्य महामण्डलेश्वर के रूप में अभिषिक्त",
    "present": "विश्वभर में लाखों का मार्गदर्शन"
  }
}
```

- [ ] **5.6** Create `website/public/locales/hi/schedule.json`:

```json
{
  "hero": {
    "sanskritTitle": "आगामी कार्यक्रम",
    "title": "कार्यक्रम एवं",
    "titleHighlight": "आयोजन",
    "subtitle": "पवित्र सभाओं में हमारे साथ जुड़ें जो आत्मा को पोषित करती हैं और आत्मा को जागृत करती हैं। दिव्य सत्संगों और रूपांतरकारी आध्यात्मिक आयोजनों का अनुभव करें।"
  },
  "upcomingEvents": "आगामी कार्यक्रम",
  "noEvents": "इस समय कोई आगामी कार्यक्रम निर्धारित नहीं है।",
  "registerNow": "अभी पंजीकरण करें",
  "registered": "पंजीकृत",
  "viewDetails": "विवरण देखें",
  "location": "स्थान",
  "date": "तिथि",
  "time": "समय"
}
```

- [ ] **5.7** Create `website/public/locales/hi/donate.json`:

```json
{
  "hero": {
    "title": "प्रेम से",
    "titleHighlight": "दान करें",
    "subtitle": "आपका उदार योगदान स्वामी जी के आध्यात्मिक ज्ञान के प्रसार और मानवता की सेवा के मिशन को बनाए रखने में सहायता करता है। हर अर्पण, चाहे बड़ा हो या छोटा, एक दिव्य अंतर लाता है।"
  },
  "causes": {
    "sanskritTitle": "सेवा",
    "title": "हमारे कार्यों का",
    "titleHighlight": "समर्थन करें",
    "subtitle": "अपने हृदय के निकट एक कार्य चुनें और सार्थक योगदान दें"
  },
  "noCauses": {
    "title": "कोई कार्य नहीं मिला",
    "subtitle": "दान के अवसरों के लिए बाद में पुनः देखें।"
  },
  "donateNow": "अभी दान करें",
  "customDonation": {
    "title": "अपनी इच्छानुसार दान राशि",
    "subtitle": "हर योगदान, चाहे कितना भी हो, आशीर्वाद लाता है",
    "placeholder": "राशि दर्ज करें"
  },
  "donateWithLove": "प्रेम से दान करें",
  "impact": {
    "title": "आपका प्रभाव",
    "subtitle": "देखें कि आपके दान ने प्रकाश और प्रेम फैलाने में कैसे मदद की",
    "mealsServed": "भोजन परोसे गए",
    "studentsEducated": "छात्र शिक्षित",
    "healthcareCamps": "स्वास्थ्य शिविर"
  }
}
```

- [ ] **5.8** Create `website/public/locales/hi/volunteer.json`:

```json
{
  "hero": {
    "sanskritTitle": "सेवा भाव",
    "title": "प्रेम से",
    "titleHighlight": "सेवा करें",
    "subtitle": "हमारे समर्पित सेवादारों के समुदाय में शामिल हों और स्वामी जी के आध्यात्मिक उत्थान और मानवता की सेवा के मिशन में योगदान दें।",
    "ctaJoin": "सेवादार बनें",
    "ctaLearn": "और जानें"
  },
  "impact": {
    "sanskritTitle": "प्रभाव",
    "title": "हमारा",
    "titleHighlight": "प्रभाव",
    "activeVolunteers": "सक्रिय सेवादार",
    "eventsOrganized": "आयोजित कार्यक्रम",
    "citiesReached": "शहरों तक पहुंच",
    "livesTouched": "जीवन प्रभावित"
  },
  "areas": {
    "sanskritTitle": "सेवा के क्षेत्र",
    "title": "सेवा के",
    "titleHighlight": "तरीके",
    "subtitle": "चुनें कि आप कैसे सेवा करना और अंतर लाना चाहते हैं",
    "kumbhMela": {
      "title": "कुंभ मेला सेवा",
      "description": "महा कुंभ के दौरान पवित्र सेवा में शामिल हों — भक्तों की सहायता से लेकर विश्व के सबसे बड़े आयोजन में पर्यावरण प्रबंधन तक।"
    },
    "ashramSeva": {
      "title": "आश्रम सेवा",
      "description": "हरिहर आश्रम, कनखल में दैनिक कार्यों में योगदान दें — आतिथ्य, रसोई सेवा, रखरखाव और आध्यात्मिक कार्यक्रम सहायता।"
    },
    "communityOutreach": {
      "title": "सामुदायिक सेवा",
      "description": "भारत भर में वंचित समुदायों में स्वास्थ्य शिविरों, भोजन वितरण अभियानों और शिक्षा कार्यक्रमों में भाग लें।"
    },
    "volunteers": "सेवादार"
  },
  "register": {
    "title": "सेवादार के रूप में पंजीकरण करें",
    "subtitle": "हमारे सेवा परिवार में शामिल होने के लिए नीचे फॉर्म भरें",
    "fullName": "पूरा नाम",
    "namePlaceholder": "आपका नाम",
    "emailAddress": "ईमेल पता",
    "emailPlaceholder": "your@email.com",
    "phoneNumber": "फोन नंबर",
    "phonePlaceholder": "+91 XXXXX XXXXX",
    "areaOfInterest": "रुचि का क्षेत्र",
    "selectArea": "अपना पसंदीदा क्षेत्र चुनें",
    "eventSupport": "कार्यक्रम सहायता",
    "communityService": "सामुदायिक सेवा",
    "ashramActivities": "आश्रम गतिविधियां",
    "allAreas": "सभी क्षेत्र",
    "availability": "उपलब्धता",
    "weekdays": "कार्यदिवस",
    "weekends": "सप्ताहांत",
    "flexible": "लचीला",
    "aboutYourself": "अपने बारे में बताएं",
    "aboutPlaceholder": "सेवा की प्रेरणा और कोई प्रासंगिक अनुभव साझा करें...",
    "submitting": "जमा हो रहा है...",
    "submitApplication": "आवेदन जमा करें",
    "successMessage": "सेवा में रुचि के लिए धन्यवाद! हम जल्द ही आपसे संपर्क करेंगे।",
    "errorMessage": "आवेदन जमा करने में विफल। कृपया बाद में पुनः प्रयास करें।",
    "privacyNote": "जमा करके, आप सेवा अवसरों के बारे में संपर्क किए जाने के लिए सहमत हैं।",
    "privacyRespect": "हम आपकी गोपनीयता का सम्मान करते हैं।"
  },
  "testimonial": {
    "quote": "सेवा केवल अपना समय या प्रयास देने के बारे में नहीं है; यह अपना हृदय अर्पित करने के बारे में है। निःस्वार्थ सेवा के माध्यम से, हम अहंकार को विलीन करते हैं और स्वयं में और दूसरों में दिव्यता का अनुभव करते हैं।",
    "author": "स्वामी अवधेशानंद गिरि जी"
  }
}
```

- [ ] **5.9** Create `website/public/locales/hi/articles.json`:

```json
{
  "hero": {
    "sanskritTitle": "लेख",
    "title": "लेख एवं",
    "titleHighlight": "अंतर्दृष्टि",
    "subtitle": "स्वामी अवधेशानंद गिरि जी महाराज के आध्यात्मिक ज्ञान, चिंतन और शिक्षाएं।"
  },
  "readArticle": "लेख पढ़ें",
  "noArticles": "इस समय कोई लेख उपलब्ध नहीं है।",
  "category": "श्रेणी",
  "publishedOn": "प्रकाशित",
  "readTime": "मिनट पढ़ने का समय",
  "allCategories": "सभी श्रेणियां"
}
```

- [ ] **5.10** Create `website/public/locales/hi/books.json`:

```json
{
  "hero": {
    "sanskritTitle": "पुस्तकें",
    "title": "पवित्र",
    "titleHighlight": "पुस्तकें",
    "subtitle": "स्वामी अवधेशानंद गिरि जी महाराज की साहित्यिक कृतियों का अन्वेषण करें — वेदांत, आध्यात्मिकता और सचेत जीवन पर गहन शिक्षाएं।"
  },
  "viewBook": "पुस्तक देखें",
  "buyNow": "अभी खरीदें",
  "noBooks": "इस समय कोई पुस्तक उपलब्ध नहीं है।",
  "author": "लेखक",
  "price": "मूल्य",
  "language": "भाषा",
  "allBooks": "सभी पुस्तकें"
}
```

- [ ] **5.11** Create `website/public/locales/hi/videos.json`:

```json
{
  "hero": {
    "sanskritTitle": "प्रवचन",
    "title": "वीडियो",
    "titleHighlight": "प्रवचन",
    "subtitle": "स्वामी जी के वेदांत, ध्यान और आत्म-साक्षात्कार के मार्ग पर रूपांतरकारी प्रवचन देखें।"
  },
  "watchNow": "अभी देखें",
  "noVideos": "इस समय कोई वीडियो उपलब्ध नहीं है।",
  "duration": "अवधि",
  "views": "दृश्य",
  "allSeries": "सभी श्रृंखला"
}
```

- [ ] **5.12** Create `website/public/locales/hi/podcasts.json`:

```json
{
  "hero": {
    "sanskritTitle": "श्रवण",
    "title": "आध्यात्मिक",
    "titleHighlight": "पॉडकास्ट",
    "subtitle": "स्वामी जी के प्रवचन और आध्यात्मिक वार्ताएं सुनें — आपकी दैनिक यात्रा के लिए ज्ञान।"
  },
  "listenNow": "अभी सुनें",
  "noPodcasts": "इस समय कोई पॉडकास्ट उपलब्ध नहीं है।",
  "duration": "अवधि",
  "episode": "एपिसोड",
  "allPodcasts": "सभी पॉडकास्ट"
}
```

- [ ] **5.13** Create `website/public/locales/hi/gallery.json`:

```json
{
  "hero": {
    "sanskritTitle": "दर्शन",
    "title": "फोटो",
    "titleHighlight": "गैलरी",
    "subtitle": "दिव्य क्षणों की झलकियां — सत्संग, प्रवचन, कुंभ मेला और स्वामी जी की यात्रा के पवित्र आयोजन।"
  },
  "viewImage": "चित्र देखें",
  "noImages": "इस समय कोई चित्र उपलब्ध नहीं है।",
  "allPhotos": "सभी फोटो",
  "loadMore": "और लोड करें"
}
```

- [ ] **5.14** Create `website/public/locales/hi/auth.json`:

```json
{
  "welcomeBack": "पुनः स्वागत है",
  "hariOmTatSat": "हरि ॐ तत् सत्",
  "email": "ईमेल",
  "password": "पासवर्ड",
  "forgotPassword": "पासवर्ड भूल गए?",
  "signIn": "साइन इन करें",
  "or": "या",
  "continueWithGoogle": "Google से जारी रखें",
  "noAccount": "खाता नहीं है?",
  "register": "पंजीकरण करें",
  "browseWithoutSignIn": "बिना साइन इन किए ब्राउज़ करें",
  "createAccount": "खाता बनाएं",
  "fullName": "पूरा नाम",
  "confirmPassword": "पासवर्ड की पुष्टि करें",
  "alreadyHaveAccount": "पहले से खाता है?",
  "login": "लॉग इन",
  "otpTitle": "अपना ईमेल सत्यापित करें",
  "otpSubtitle": "आपके ईमेल पर भेजा गया OTP दर्ज करें",
  "verifyOtp": "OTP सत्यापित करें",
  "resendOtp": "OTP पुनः भेजें",
  "resetPassword": "पासवर्ड रीसेट करें",
  "resetSubtitle": "रीसेट निर्देश प्राप्त करने के लिए अपना ईमेल दर्ज करें",
  "sendResetLink": "रीसेट लिंक भेजें",
  "backToLogin": "लॉग इन पर वापस जाएं",
  "loginFailed": "लॉग इन विफल",
  "invalidCredentials": "अमान्य प्रमाण-पत्र",
  "fillAllFields": "कृपया सभी फ़ील्ड भरें"
}
```

---

## Task 6: Update Website Components to Use Translations

- [ ] **6.1** Update `website/components/sections/Hero.tsx` — Add `useTranslation` hook and replace hardcoded text:

Add at top of file:
```typescript
import { useTranslation } from 'react-i18next';
```

Inside the `Hero` component function, add:
```typescript
const { t } = useTranslation('home');
```

Replace hardcoded text with `t()` calls:
```tsx
{/* Sanskrit blessing at top */}
<span className="...">{t('hero.blessing')}</span>

{/* Badge/Tagline */}
<span className="...">{t('hero.badge')}</span>

{/* Main Title */}
<span className="block text-white ...">{t('hero.titleLine1')}</span>
<span className="block text-gradient-gold mt-2">{t('hero.titleLine2')}</span>

{/* Subtitle */}
<motion.p ...>{t('hero.subtitle')}</motion.p>

{/* Sanskrit Shloka — keeps Sanskrit in both languages */}
<span className="font-sanskrit ...">{t('hero.shloka')}</span>

{/* CTA Buttons */}
<span>{t('hero.ctaExplore')}</span>
<span>{t('hero.ctaWatch')}</span>

{/* Scroll Indicator */}
<span className="...">{t('hero.scrollDiscover')}</span>
```

- [ ] **6.2** Update `website/components/sections/LifeStory.tsx` — Replace hardcoded milestones array with `t()`:

Add import and hook:
```typescript
import { useTranslation } from 'react-i18next';
```

Inside the component:
```typescript
const { t } = useTranslation('home');
```

Replace the static `milestones` array with one that reads from `t()`:
```typescript
const milestones = [
  {
    year: t('lifeStory.milestones.divineBirth.year'),
    title: t('lifeStory.milestones.divineBirth.title'),
    description: t('lifeStory.milestones.divineBirth.description'),
    Icon: Star,
  },
  {
    year: t('lifeStory.milestones.callOfHimalayas.year'),
    title: t('lifeStory.milestones.callOfHimalayas.title'),
    description: t('lifeStory.milestones.callOfHimalayas.description'),
    Icon: Mountain,
  },
  {
    year: t('lifeStory.milestones.gurusGrace.year'),
    title: t('lifeStory.milestones.gurusGrace.title'),
    description: t('lifeStory.milestones.gurusGrace.description'),
    Icon: BookOpen,
  },
  {
    year: t('lifeStory.milestones.sacredRenunciation.year'),
    title: t('lifeStory.milestones.sacredRenunciation.title'),
    description: t('lifeStory.milestones.sacredRenunciation.description'),
    Icon: Flame,
  },
  {
    year: t('lifeStory.milestones.ascendingSeat.year'),
    title: t('lifeStory.milestones.ascendingSeat.title'),
    description: t('lifeStory.milestones.ascendingSeat.description'),
    Icon: Crown,
  },
  {
    year: t('lifeStory.milestones.worldInService.year'),
    title: t('lifeStory.milestones.worldInService.title'),
    description: t('lifeStory.milestones.worldInService.description'),
    Icon: Globe,
  },
];
```

Move the milestones definition inside the component body (after the `useTranslation` hook call).

Update the SectionHeading call:
```tsx
<SectionHeading
  title={t('lifeStory.title')}
  subtitle={t('lifeStory.subtitle')}
/>
```

Update the swipe text:
```tsx
<p className="text-center text-spiritual-warmGray text-sm mt-4 md:hidden">
  <span className="inline-flex items-center gap-2">
    <ChevronLeft className="w-4 h-4" />
    {t('lifeStory.swipeToExplore')}
    <ChevronRight className="w-4 h-4" />
  </span>
</p>
```

- [ ] **6.3** Update `website/components/sections/CoreTeachings.tsx` — Replace `teachings` array:

Add import and hook (inside the component):
```typescript
import { useTranslation } from 'react-i18next';

// Inside CoreTeachings component:
const { t } = useTranslation('home');

const teachings = [
  {
    title: t('coreTeachings.meditation.title'),
    tagline: t('coreTeachings.meditation.tagline'),
    description: t('coreTeachings.meditation.description'),
    image: '/newassets/meditation.webp',
    icon: Eye,
  },
  {
    title: t('coreTeachings.advaita.title'),
    tagline: t('coreTeachings.advaita.tagline'),
    description: t('coreTeachings.advaita.description'),
    image: '/newassets/vedant.webp',
    icon: BookOpen,
  },
  {
    title: t('coreTeachings.consciousLiving.title'),
    tagline: t('coreTeachings.consciousLiving.tagline'),
    description: t('coreTeachings.consciousLiving.description'),
    image: '/newassets/conscious.webp',
    icon: Sun,
  },
  {
    title: t('coreTeachings.seva.title'),
    tagline: t('coreTeachings.seva.tagline'),
    description: t('coreTeachings.seva.description'),
    image: '/newassets/service.webp',
    icon: Heart,
  },
];
```

Update SectionHeading:
```tsx
<SectionHeading
  title={t('coreTeachings.title')}
  subtitle={t('coreTeachings.subtitle')}
/>
```

- [ ] **6.4** Update `website/components/sections/Initiatives.tsx` — Replace `initiatives` array:

Same pattern. Inside the component:
```typescript
const { t } = useTranslation('home');

const initiatives = [
  {
    title: t('initiatives.shivganga.title'),
    location: t('initiatives.shivganga.location'),
    description: t('initiatives.shivganga.description'),
    impact: t('initiatives.shivganga.impactLabel'),
    impactNumber: 5000,
    impactSuffix: '+',
    impactLabel: t('initiatives.shivganga.impactLabel'),
    icon: Droplets,
  },
  {
    title: t('initiatives.greenKumbh.title'),
    location: t('initiatives.greenKumbh.location'),
    description: t('initiatives.greenKumbh.description'),
    impact: t('initiatives.greenKumbh.impactLabel'),
    impactNumber: null,
    impactSuffix: '',
    impactLabel: t('initiatives.greenKumbh.impactLabel'),
    icon: Leaf,
  },
  {
    title: t('initiatives.futureSkilling.title'),
    location: t('initiatives.futureSkilling.location'),
    description: t('initiatives.futureSkilling.description'),
    impact: t('initiatives.futureSkilling.impactLabel'),
    impactNumber: 2000,
    impactSuffix: '+',
    impactLabel: t('initiatives.futureSkilling.impactLabel'),
    icon: GraduationCap,
  },
  {
    title: t('initiatives.bhopalVidyaPeeth.title'),
    location: t('initiatives.bhopalVidyaPeeth.location'),
    description: t('initiatives.bhopalVidyaPeeth.description'),
    impact: t('initiatives.bhopalVidyaPeeth.impactLabel'),
    impactNumber: null,
    impactSuffix: '',
    impactLabel: t('initiatives.bhopalVidyaPeeth.impactLabel'),
    icon: School,
  },
];
```

Update SectionHeading:
```tsx
<SectionHeading
  title={t('initiatives.title')}
  subtitle={t('initiatives.subtitle')}
/>
```

- [ ] **6.5** Update `website/components/layout/Footer.tsx` — Replace all hardcoded text:

Add import and hook:
```typescript
import { useTranslation } from 'react-i18next';

// Inside Footer component:
const { t } = useTranslation(['footer', 'nav', 'common']);
```

Replace text strings:
```tsx
{/* Tagline */}
<p className="text-gold-200/80 leading-relaxed mb-6 font-body">
  {t('footer:tagline')}
</p>

{/* Quick Links heading */}
<h3 className="...">{t('footer:quickLinks')}</h3>

{/* Quick links use nav namespace */}
const quickLinks = [
  { name: t('nav:home'), href: '/' },
  { name: t('nav:about'), href: '/about' },
  { name: t('nav:schedule'), href: '/schedule' },
  { name: t('nav:books'), href: '/books' },
  { name: t('nav:videos'), href: '/videos' },
  { name: t('nav:volunteer'), href: '/volunteer' },
];

{/* Contact Us heading */}
<h3 className="...">{t('footer:contactUs')}</h3>

{/* Address, phone, email */}
<span className="text-gold-200/80">{t('footer:address')}</span>
<span className="text-gold-200/80">{t('footer:phone')}</span>
<span className="text-gold-200/80">{t('footer:email')}</span>

{/* Stay Connected heading */}
<h3 className="...">{t('footer:stayConnected')}</h3>
<p className="...">{t('footer:newsletterText')}</p>
<input placeholder={t('footer:emailPlaceholder')} ... />
<button ...>{t('footer:subscribeWithLove')}<Heart ... /></button>

{/* Sanskrit blessing */}
<p className="...">{t('common:sarveBlessing')}</p>

{/* Copyright */}
<p className="...">
  &copy; {new Date().getFullYear()} {t('common:copyright')}{' '}
  <Heart className="w-4 h-4 inline text-primary-400" /> {t('common:forSpiritualSeekers')}
</p>

{/* Legal links */}
<Link href="/privacy" ...>{t('common:privacyPolicy')}</Link>
<Link href="/terms" ...>{t('common:termsOfService')}</Link>
```

- [ ] **6.6** Update `website/app/donate/page.tsx` — Add translation hook:

```typescript
import { useTranslation } from 'react-i18next';

// Inside DonatePage component:
const { t } = useTranslation('donate');
```

Replace key strings:
```tsx
{/* Hero */}
<h1 ...>{t('hero.title')} <span ...>{t('hero.titleHighlight')}</span></h1>
<p ...>{t('hero.subtitle')}</p>

{/* Causes section heading */}
<span ...>{t('causes.sanskritTitle')}</span>
<h2 ...>{t('causes.title')} <span ...>{t('causes.titleHighlight')}</span></h2>
<p ...>{t('causes.subtitle')}</p>

{/* Empty state */}
<h3 ...>{t('noCauses.title')}</h3>
<p ...>{t('noCauses.subtitle')}</p>

{/* Donate button */}
<button ...>{t('donateNow')}</button>

{/* Custom donation */}
<h3 ...>{t('customDonation.title')}</h3>
<p ...>{t('customDonation.subtitle')}</p>
<input placeholder={t('customDonation.placeholder')} ... />
<button ...>{t('donateWithLove')}</button>

{/* Impact section */}
<h2 ...>{t('impact.title')}</h2>
<p ...>{t('impact.subtitle')}</p>
{/* Use t() for stat labels: */}
{ value: '50,000+', label: t('impact.mealsServed'), icon: '...' },
{ value: '2,000+', label: t('impact.studentsEducated'), icon: '...' },
{ value: '100+', label: t('impact.healthcareCamps'), icon: '...' },
```

- [ ] **6.7** Update remaining page components (`schedule/page.tsx`, `volunteer/page.tsx`, `articles/page.tsx`, `books/page.tsx`, `videos/page.tsx`, `podcasts/page.tsx`, `gallery/page.tsx`) following the same pattern shown above:

For each page:
1. Add `import { useTranslation } from 'react-i18next';`
2. Add `const { t } = useTranslation('{namespace}');` inside the component
3. Replace every hardcoded English string with `t('key')` using the corresponding namespace JSON keys

**Note for Server Components:** The `schedule/page.tsx` is currently a Server Component (no `'use client'` directive). It must be converted to a Client Component by adding `'use client';` at the top, OR the translatable text should be extracted into a child Client Component. The recommended approach is to create a `ScheduleHero` client component:

```typescript
// website/components/sections/ScheduleHero.tsx
'use client';

import { useTranslation } from 'react-i18next';

export function ScheduleHero() {
  const { t } = useTranslation('schedule');

  return (
    <section className="relative bg-parchment py-20 overflow-hidden">
      {/* ... existing decorative elements ... */}
      <div className="container-custom relative z-10 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow animate-breathe">
          {/* calendar icon */}
        </div>
        <span className="text-gold-500 font-sanskrit text-lg tracking-wider">
          {t('hero.sanskritTitle')}
        </span>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-spiritual-maroon mt-2 mb-6">
          {t('hero.title')} <span className="text-gradient-gold">{t('hero.titleHighlight')}</span>
        </h1>
        <p className="max-w-2xl mx-auto text-spiritual-warmGray text-lg md:text-xl font-body leading-relaxed">
          {t('hero.subtitle')}
        </p>
      </div>
    </section>
  );
}
```

Apply the same pattern for `about/page.tsx`, `articles/page.tsx`, `books/page.tsx`, `videos/page.tsx`, `podcasts/page.tsx`, and `gallery/page.tsx` if they are Server Components — extract hero sections into Client Components that use `useTranslation`.

---

## Task 7: Mobile App i18n Configuration

- [ ] **7.1** Create `mobile/user-app/src/i18n/index.ts`:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import hi from './locales/hi.json';

const LANGUAGE_STORAGE_KEY = '@app_language';

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      const savedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLang) {
        callback(savedLang);
        return;
      }
    } catch (error) {
      console.error('Error reading language from storage:', error);
    }

    // Fall back to device locale
    const deviceLocales = Localization.getLocales();
    const deviceLang = deviceLocales?.[0]?.languageCode || 'en';
    const supportedLang = ['en', 'hi'].includes(deviceLang) ? deviceLang : 'en';
    callback(supportedLang);
  },
  init: () => {},
  cacheUserLanguage: async (lang: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (error) {
      console.error('Error saving language to storage:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
```

- [ ] **7.2** Create `mobile/user-app/src/i18n/locales/en.json`:

```json
{
  "tabs": {
    "home": "Home",
    "explore": "Explore",
    "schedule": "Schedule",
    "donate": "Donate",
    "profile": "Profile"
  },
  "home": {
    "hariOm": "Hari Om",
    "heroQuote": "\"The mind is everything. What you think, you become.\"",
    "upcomingEvents": "Upcoming Events",
    "seeAll": "See All",
    "latestArticles": "Latest Articles",
    "featuredCampaign": "Featured Campaign",
    "quickLinks": {
      "schedule": "Schedule",
      "books": "Books",
      "videos": "Videos",
      "podcasts": "Podcasts",
      "gallery": "Gallery",
      "volunteer": "Volunteer"
    },
    "loading": "Loading...",
    "noEvents": "No upcoming events",
    "noArticles": "No articles available",
    "donateNow": "Donate Now"
  },
  "explore": {
    "title": "Explore",
    "searchPlaceholder": "Search...",
    "categories": {
      "articles": "Articles",
      "videos": "Videos",
      "books": "Books",
      "podcasts": "Podcasts",
      "gallery": "Gallery"
    },
    "noResults": "No results found",
    "readMore": "Read More",
    "watchNow": "Watch Now",
    "listenNow": "Listen Now",
    "viewBook": "View Book",
    "readTime": "min read"
  },
  "schedule": {
    "title": "Schedule",
    "events": "Events",
    "schedules": "Schedules",
    "noEvents": "No upcoming events",
    "noSchedules": "No schedules available",
    "registerNow": "Register Now",
    "registered": "Registered",
    "loginToRegister": "Login to register",
    "location": "Location",
    "date": "Date",
    "appointment": "By Appointment"
  },
  "donate": {
    "title": "Donate",
    "heroTitle": "Donate with Love",
    "heroSubtitle": "Your contribution sustains Swami Ji's mission of spreading spiritual wisdom and serving humanity.",
    "activeCampaigns": "Active Campaigns",
    "noCampaigns": "No active campaigns",
    "customAmount": "Custom Amount",
    "enterAmount": "Enter amount",
    "donateNow": "Donate Now",
    "loginToDonate": "Login to donate",
    "raised": "Raised",
    "goal": "Goal",
    "securePayment": "Secure & Encrypted Payment",
    "taxBenefits": "Tax Benefits under 80G"
  },
  "profile": {
    "title": "Profile",
    "myRegistrations": "My Registrations",
    "myRegistrationsSubtitle": "Events and schedules you registered for",
    "donationHistory": "Donation History",
    "donationHistorySubtitle": "View your past donations",
    "myBookings": "My Bookings",
    "myBookingsSubtitle": "Room and accommodation bookings",
    "settings": "Settings",
    "settingsSubtitle": "App preferences and notifications",
    "helpSupport": "Help & Support",
    "helpSupportSubtitle": "FAQs and contact information",
    "about": "About",
    "aboutSubtitle": "About this app",
    "language": "Language",
    "languageSubtitle": "Choose your preferred language",
    "logout": "Logout",
    "logoutConfirm": "Are you sure you want to logout?",
    "cancel": "Cancel",
    "comingSoon": "Coming Soon",
    "comingSoonMessage": "will be available soon.",
    "loginPrompt": {
      "title": "Welcome, Seeker",
      "subtitle": "Sign in to access your spiritual journey",
      "signIn": "Sign In",
      "createAccount": "Create Account",
      "browsing": "Continue Browsing"
    }
  },
  "auth": {
    "welcomeBack": "Welcome Back",
    "hariOmTatSat": "Hari Om Tat Sat",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot Password?",
    "signIn": "Sign In",
    "or": "or",
    "continueWithGoogle": "Continue with Google",
    "noAccount": "Don't have an account?",
    "register": "Register",
    "browseWithoutSignIn": "Browse without signing in",
    "createAccount": "Create Account",
    "joinCommunity": "Join our spiritual community",
    "fullName": "Full Name",
    "phone": "Phone Number",
    "confirmPassword": "Confirm Password",
    "alreadyHaveAccount": "Already have an account?",
    "login": "Login",
    "loginFailed": "Login Failed",
    "registrationFailed": "Registration Failed",
    "error": "Error",
    "fillAllFields": "Please fill in all fields",
    "passwordMismatch": "Passwords do not match",
    "otpTitle": "Verify Email",
    "otpSubtitle": "Enter the OTP sent to",
    "verifyOtp": "Verify OTP",
    "resendOtp": "Resend OTP",
    "verificationFailed": "Verification Failed",
    "enterOtp": "Please enter the OTP",
    "forgotPasswordTitle": "Reset Password",
    "forgotPasswordSubtitle": "Enter your email to receive a reset link",
    "sendResetLink": "Send Reset Link",
    "backToLogin": "Back to Login",
    "resetSuccess": "Reset link sent to your email",
    "resetFailed": "Reset Failed"
  },
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "retry": "Retry",
    "noData": "No data available",
    "pullToRefresh": "Pull to refresh",
    "viewAll": "View All"
  }
}
```

- [ ] **7.3** Create `mobile/user-app/src/i18n/locales/hi.json`:

```json
{
  "tabs": {
    "home": "होम",
    "explore": "खोजें",
    "schedule": "कार्यक्रम",
    "donate": "दान",
    "profile": "प्रोफाइल"
  },
  "home": {
    "hariOm": "हरि ॐ",
    "heroQuote": "\"मन ही सब कुछ है। जो आप सोचते हैं, वही आप बन जाते हैं।\"",
    "upcomingEvents": "आगामी कार्यक्रम",
    "seeAll": "सभी देखें",
    "latestArticles": "नवीनतम लेख",
    "featuredCampaign": "विशेष अभियान",
    "quickLinks": {
      "schedule": "कार्यक्रम",
      "books": "पुस्तकें",
      "videos": "वीडियो",
      "podcasts": "पॉडकास्ट",
      "gallery": "गैलरी",
      "volunteer": "सेवादार"
    },
    "loading": "लोड हो रहा है...",
    "noEvents": "कोई आगामी कार्यक्रम नहीं",
    "noArticles": "कोई लेख उपलब्ध नहीं",
    "donateNow": "अभी दान करें"
  },
  "explore": {
    "title": "खोजें",
    "searchPlaceholder": "खोजें...",
    "categories": {
      "articles": "लेख",
      "videos": "वीडियो",
      "books": "पुस्तकें",
      "podcasts": "पॉडकास्ट",
      "gallery": "गैलरी"
    },
    "noResults": "कोई परिणाम नहीं मिला",
    "readMore": "और पढ़ें",
    "watchNow": "अभी देखें",
    "listenNow": "अभी सुनें",
    "viewBook": "पुस्तक देखें",
    "readTime": "मिनट पढ़ने का समय"
  },
  "schedule": {
    "title": "कार्यक्रम",
    "events": "कार्यक्रम",
    "schedules": "अनुसूची",
    "noEvents": "कोई आगामी कार्यक्रम नहीं",
    "noSchedules": "कोई अनुसूची उपलब्ध नहीं",
    "registerNow": "अभी पंजीकरण करें",
    "registered": "पंजीकृत",
    "loginToRegister": "पंजीकरण के लिए लॉग इन करें",
    "location": "स्थान",
    "date": "तिथि",
    "appointment": "अपॉइंटमेंट द्वारा"
  },
  "donate": {
    "title": "दान",
    "heroTitle": "प्रेम से दान करें",
    "heroSubtitle": "आपका योगदान स्वामी जी के आध्यात्मिक ज्ञान के प्रसार और मानवता की सेवा के मिशन को बनाए रखता है।",
    "activeCampaigns": "सक्रिय अभियान",
    "noCampaigns": "कोई सक्रिय अभियान नहीं",
    "customAmount": "अपनी राशि",
    "enterAmount": "राशि दर्ज करें",
    "donateNow": "अभी दान करें",
    "loginToDonate": "दान करने के लिए लॉग इन करें",
    "raised": "प्राप्त",
    "goal": "लक्ष्य",
    "securePayment": "सुरक्षित एवं एन्क्रिप्टेड भुगतान",
    "taxBenefits": "80G के तहत कर लाभ"
  },
  "profile": {
    "title": "प्रोफाइल",
    "myRegistrations": "मेरे पंजीकरण",
    "myRegistrationsSubtitle": "जिन कार्यक्रमों में आपने पंजीकरण किया",
    "donationHistory": "दान इतिहास",
    "donationHistorySubtitle": "अपने पिछले दान देखें",
    "myBookings": "मेरी बुकिंग",
    "myBookingsSubtitle": "कमरे और आवास बुकिंग",
    "settings": "सेटिंग्स",
    "settingsSubtitle": "ऐप प्राथमिकताएं और सूचनाएं",
    "helpSupport": "सहायता एवं समर्थन",
    "helpSupportSubtitle": "अक्सर पूछे जाने वाले प्रश्न और संपर्क जानकारी",
    "about": "ऐप के बारे में",
    "aboutSubtitle": "इस ऐप के बारे में",
    "language": "भाषा",
    "languageSubtitle": "अपनी पसंदीदा भाषा चुनें",
    "logout": "लॉग आउट",
    "logoutConfirm": "क्या आप वाकई लॉग आउट करना चाहते हैं?",
    "cancel": "रद्द करें",
    "comingSoon": "जल्द आ रहा है",
    "comingSoonMessage": "जल्द ही उपलब्ध होगा।",
    "loginPrompt": {
      "title": "स्वागत है, साधक",
      "subtitle": "अपनी आध्यात्मिक यात्रा तक पहुंचने के लिए साइन इन करें",
      "signIn": "साइन इन करें",
      "createAccount": "खाता बनाएं",
      "browsing": "ब्राउज़ करना जारी रखें"
    }
  },
  "auth": {
    "welcomeBack": "पुनः स्वागत है",
    "hariOmTatSat": "हरि ॐ तत् सत्",
    "email": "ईमेल",
    "password": "पासवर्ड",
    "forgotPassword": "पासवर्ड भूल गए?",
    "signIn": "साइन इन करें",
    "or": "या",
    "continueWithGoogle": "Google से जारी रखें",
    "noAccount": "खाता नहीं है?",
    "register": "पंजीकरण करें",
    "browseWithoutSignIn": "बिना साइन इन किए ब्राउज़ करें",
    "createAccount": "खाता बनाएं",
    "joinCommunity": "हमारे आध्यात्मिक समुदाय से जुड़ें",
    "fullName": "पूरा नाम",
    "phone": "फोन नंबर",
    "confirmPassword": "पासवर्ड की पुष्टि करें",
    "alreadyHaveAccount": "पहले से खाता है?",
    "login": "लॉग इन",
    "loginFailed": "लॉग इन विफल",
    "registrationFailed": "पंजीकरण विफल",
    "error": "त्रुटि",
    "fillAllFields": "कृपया सभी फ़ील्ड भरें",
    "passwordMismatch": "पासवर्ड मेल नहीं खाते",
    "otpTitle": "ईमेल सत्यापित करें",
    "otpSubtitle": "पर भेजा गया OTP दर्ज करें",
    "verifyOtp": "OTP सत्यापित करें",
    "resendOtp": "OTP पुनः भेजें",
    "verificationFailed": "सत्यापन विफल",
    "enterOtp": "कृपया OTP दर्ज करें",
    "forgotPasswordTitle": "पासवर्ड रीसेट करें",
    "forgotPasswordSubtitle": "रीसेट लिंक प्राप्त करने के लिए अपना ईमेल दर्ज करें",
    "sendResetLink": "रीसेट लिंक भेजें",
    "backToLogin": "लॉग इन पर वापस जाएं",
    "resetSuccess": "रीसेट लिंक आपके ईमेल पर भेजा गया",
    "resetFailed": "रीसेट विफल"
  },
  "common": {
    "loading": "लोड हो रहा है...",
    "error": "त्रुटि",
    "retry": "पुनः प्रयास करें",
    "noData": "कोई डेटा उपलब्ध नहीं",
    "pullToRefresh": "रिफ्रेश करने के लिए खींचें",
    "viewAll": "सभी देखें"
  }
}
```

---

## Task 8: Mobile App Integration

- [ ] **8.1** Update `mobile/user-app/App.tsx` — Import i18n initialization:

```typescript
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SplashScreen } from './src/screens/SplashScreen';
import { colors } from './src/theme';

// Initialize i18n — must be imported before any component uses useTranslation
import './src/i18n';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary.saffron,
    secondary: colors.primary.maroon,
    tertiary: colors.gold.main,
    surface: colors.background.warmWhite,
    background: colors.background.parchment,
  },
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
```

- [ ] **8.2** Update `mobile/user-app/src/navigation/AppNavigator.tsx` — Translate tab labels:

Add import:
```typescript
import { useTranslation } from 'react-i18next';
```

Inside `MainTabs` component:
```typescript
const { t } = useTranslation();
```

Update each Tab.Screen `options.title`:
```tsx
<Tab.Screen
  name="Home"
  component={HomeScreen}
  options={{ title: t('tabs.home'), headerShown: false }}
/>
<Tab.Screen
  name="Explore"
  component={ExploreScreen}
  options={{ title: t('tabs.explore') }}
/>
<Tab.Screen
  name="Schedule"
  component={ScheduleScreen}
  options={{ title: t('tabs.schedule') }}
/>
<Tab.Screen
  name="Donate"
  component={DonateScreen}
  options={{ title: t('tabs.donate'), headerShown: false }}
/>
<Tab.Screen
  name="Profile"
  component={ProfileTabScreen}
  options={{ title: t('tabs.profile'), headerShown: false }}
/>
```

- [ ] **8.3** Create `mobile/user-app/src/components/LanguageSwitcher.tsx`:

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius } from '../theme';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const isHindi = i18n.language === 'hi';

  const toggleLanguage = () => {
    const newLang = isHindi ? 'en' : 'hi';
    i18n.changeLanguage(newLang);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={toggleLanguage}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <Icon
          name="translate"
          size={22}
          color={colors.primary.maroon}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t('profile.language')}</Text>
          <Text style={styles.subtitle}>
            {isHindi ? 'हिंदी' : 'English'}
          </Text>
        </View>
        <View style={styles.toggleContainer}>
          <View style={[styles.toggleOption, !isHindi && styles.activeOption]}>
            <Text style={[styles.toggleText, !isHindi && styles.activeText]}>En</Text>
          </View>
          <View style={[styles.toggleOption, isHindi && styles.activeOption]}>
            <Text style={[styles.toggleText, isHindi && styles.activeText]}>हि</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary.maroon,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.parchment,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.gold as string,
  },
  toggleOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  activeOption: {
    backgroundColor: colors.primary.saffron,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  activeText: {
    color: colors.text.white,
  },
});
```

- [ ] **8.4** Update `mobile/user-app/src/screens/profile/ProfileScreen.tsx` — Add LanguageSwitcher:

Add imports:
```typescript
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
```

Inside the component:
```typescript
const { t } = useTranslation();
```

Replace hardcoded menu items with `t()` calls:
```typescript
const menuItems: MenuItem[] = [
  {
    icon: 'calendar-check',
    title: t('profile.myRegistrations'),
    subtitle: t('profile.myRegistrationsSubtitle'),
    onPress: () => handleMenuPress(t('profile.myRegistrations')),
    showChevron: true,
  },
  {
    icon: 'hand-heart',
    title: t('profile.donationHistory'),
    subtitle: t('profile.donationHistorySubtitle'),
    onPress: () => handleMenuPress(t('profile.donationHistory')),
    showChevron: true,
  },
  {
    icon: 'home-city',
    title: t('profile.myBookings'),
    subtitle: t('profile.myBookingsSubtitle'),
    onPress: () => handleMenuPress(t('profile.myBookings')),
    showChevron: true,
  },
  {
    icon: 'cog',
    title: t('profile.settings'),
    subtitle: t('profile.settingsSubtitle'),
    onPress: () => handleMenuPress(t('profile.settings')),
    showChevron: true,
  },
  // ... other items
];
```

Add `<LanguageSwitcher />` in the profile screen, between the menu items and the logout button:
```tsx
{/* Language Switcher */}
<LanguageSwitcher />

{/* Logout Button */}
<TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
  <Icon name="logout" size={22} color={colors.text.error} />
  <Text style={styles.logoutText}>{t('profile.logout')}</Text>
</TouchableOpacity>
```

Update the Alert in `handleLogout`:
```typescript
const handleLogout = () => {
  Alert.alert(
    t('profile.logout'),
    t('profile.logoutConfirm'),
    [
      { text: t('profile.cancel'), style: 'cancel' },
      {
        text: t('profile.logout'),
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]
  );
};
```

- [ ] **8.5** Update `mobile/user-app/src/screens/home/HomeScreen.tsx` — Replace hardcoded strings:

Add import and hook:
```typescript
import { useTranslation } from 'react-i18next';

// Inside HomeScreen:
const { t } = useTranslation();
```

Replace strings:
```tsx
{/* Hero */}
<Text style={styles.heroGreeting}>{t('home.hariOm')}</Text>
<Text style={styles.heroQuote}>{t('home.heroQuote')}</Text>

{/* Section headers */}
<Text style={styles.sectionTitle}>{t('home.upcomingEvents')}</Text>
<Text style={styles.seeAll}>{t('home.seeAll')}</Text>
<Text style={styles.sectionTitle}>{t('home.latestArticles')}</Text>

{/* Quick links */}
const quickLinks = [
  { icon: 'calendar' as const, label: t('home.quickLinks.schedule'), tab: 'Schedule' },
  { icon: 'book-open-variant' as const, label: t('home.quickLinks.books'), category: 'Books' },
  { icon: 'video' as const, label: t('home.quickLinks.videos'), category: 'Videos' },
  { icon: 'podcast' as const, label: t('home.quickLinks.podcasts'), category: 'Podcasts' },
  { icon: 'image-multiple' as const, label: t('home.quickLinks.gallery'), screen: 'GalleryFull' },
  { icon: 'hand-heart' as const, label: t('home.quickLinks.volunteer'), screen: 'VolunteerForm' },
];

{/* Loading */}
<Text style={styles.loadingText}>{t('home.loading')}</Text>
```

- [ ] **8.6** Update `mobile/user-app/src/screens/auth/LoginScreen.tsx` — Replace hardcoded strings:

Add import and hook:
```typescript
import { useTranslation } from 'react-i18next';

// Inside LoginScreen:
const { t } = useTranslation();
```

Replace strings:
```tsx
<Text style={styles.title}>{t('auth.welcomeBack')}</Text>
<Text style={styles.subtitle}>{t('auth.hariOmTatSat')}</Text>

<TextInput label={t('auth.email')} ... />
<TextInput label={t('auth.password')} ... />

<Text style={styles.forgotPassword}>{t('auth.forgotPassword')}</Text>

<Button ...>{t('auth.signIn')}</Button>

<Text style={styles.dividerText}>{t('auth.or')}</Text>

<Button ...>{t('auth.continueWithGoogle')}</Button>

<Text style={styles.registerText}>{t('auth.noAccount')} </Text>
<Text style={styles.registerLink}>{t('auth.register')}</Text>

<Text style={styles.skipText}>{t('auth.browseWithoutSignIn')}</Text>
```

Update error Alert:
```typescript
if (!email.trim() || !password.trim()) {
  Alert.alert(t('auth.error'), t('auth.fillAllFields'));
  return;
}
// ... catch:
Alert.alert(t('auth.loginFailed'), error.response?.data?.message || t('auth.fillAllFields'));
```

- [ ] **8.7** Update remaining mobile screens (`ExploreScreen.tsx`, `ScheduleScreen.tsx`, `DonateScreen.tsx`, `RegisterScreen.tsx`, `OTPScreen.tsx`, `ForgotPasswordScreen.tsx`, `ProfileLoginPrompt.tsx`) following the same pattern:

For each screen:
1. Add `import { useTranslation } from 'react-i18next';`
2. Add `const { t } = useTranslation();` inside the component
3. Replace every hardcoded English string with the corresponding `t('section.key')` call
4. Move any data arrays that contain translatable strings inside the component body (after the hook call)

---

## Task 9: Delete Old Translation Files

- [ ] **9.1** Delete the old monolithic translation files that came from the backup React app:

```bash
rm website/public/locales/en/translation.json
rm website/public/locales/hi/translation.json
```

These are replaced by the namespace-based files created in Tasks 4 and 5.

---

## Task 10: Testing & Verification

- [ ] **10.1** Website — Verify i18n initialization:
  - Run `cd website && npm run dev`
  - Open http://localhost:3000
  - Verify English text loads correctly on homepage
  - Click the language switcher in the Navbar
  - Verify all visible text switches to Hindi
  - Refresh the page — verify Hindi persists (check `localStorage` for `i18nextLng` key)
  - Switch back to English, refresh — verify English persists

- [ ] **10.2** Website — Verify all pages translate correctly:
  - Navigate to each page (/, /about, /schedule, /donate, /volunteer, /articles, /books, /videos, /podcasts, /gallery)
  - Toggle language on each page
  - Verify no English text "leaks through" when Hindi is selected
  - Verify no translation keys show as raw strings (e.g., `home.hero.title` should not appear)
  - Verify Sanskrit/Devanagari text (blessings, shlokas) renders correctly in both languages

- [ ] **10.3** Website — Verify mobile menu language switcher:
  - Resize browser to mobile viewport
  - Open the hamburger menu
  - Verify language switcher appears in the mobile menu panel
  - Toggle language within the mobile menu
  - Verify all menu items update immediately

- [ ] **10.4** Mobile — Verify i18n initialization:
  - Run `cd mobile/user-app && npx expo start`
  - Open on iOS Simulator or Android Emulator
  - Verify English text loads on Home screen
  - Navigate to Profile screen
  - Tap the language switcher
  - Verify all visible text (tabs, headers, buttons) switches to Hindi
  - Kill and restart the app — verify Hindi persists

- [ ] **10.5** Mobile — Verify all screens translate:
  - Check Home, Explore, Schedule, Donate, Profile tabs
  - Check Login, Register, OTP, Forgot Password screens
  - Verify no raw translation keys appear
  - Verify date formatting still works (`toLocaleDateString` should use the current language locale)

- [ ] **10.6** Cross-check translation completeness:
  - Compare every key in `en/*.json` has a corresponding key in `hi/*.json` (website)
  - Compare every key in `en.json` has a corresponding key in `hi.json` (mobile)
  - Verify no missing translations by temporarily setting `i18next` `debug: true` and checking console for missing key warnings

---

## Self-Review Checklist

Before marking this implementation as complete, verify:

- [ ] **No hardcoded English strings remain** in any modified component — every user-visible string uses `t()` or is a proper noun/brand name that should not be translated
- [ ] **All translation files parse as valid JSON** — no trailing commas, unescaped quotes, or missing braces
- [ ] **Hindi translations are accurate and natural** — not machine-translated gibberish; they read naturally to a Hindi speaker
- [ ] **Language persists across sessions** — localStorage (web) and AsyncStorage (mobile) store the user's choice
- [ ] **Language switcher is accessible** — has proper `aria-label`, is keyboard-navigable (web), is touch-friendly (mobile)
- [ ] **No layout breakage in Hindi** — Hindi text may be longer/shorter than English; verify no text overflow, truncation, or layout shift
- [ ] **Noto Serif Devanagari font is loaded** — already configured in `layout.tsx` via `next/font/google` with `--font-noto-serif` variable
- [ ] **Server Components are not broken** — `useTranslation()` is only called in Client Components (`'use client'` directive present)
- [ ] **i18n import runs exactly once** — the `import '@/lib/i18n'` in `layout.tsx` initializes i18next as a side effect; no duplicate initialization
- [ ] **Mobile app does not crash on first launch** — AsyncStorage language detection handles the case where no language is stored yet
- [ ] **Build succeeds** — `npm run build` in `website/` completes without errors related to i18n
- [ ] **No sensitive data in translation files** — translation JSONs contain only UI strings, no API keys or secrets
- [ ] **Devanagari numerals are NOT used** — Hindi translations use Western Arabic numerals (1, 2, 3...) to match the existing app style and avoid confusion with phone numbers, dates, and amounts
