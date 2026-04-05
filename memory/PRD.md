# AGM-INDIA-APR26 — Spiritual Platform PRD

## Original Problem Statement
Build a world-class spiritual platform with Hindu Panchang (calendar), multi-language i18n support, RBAC for mobile admin app, and daily push notifications. The platform consists of:
- **Website** (Next.js 15) — User-facing frontend
- **Dashboard-next** (Next.js 15) — Admin panel + Backend API monolith
- **Mobile User App** (Expo React Native) — End user mobile app
- **Mobile Admin App** (Expo React Native) — Admin RBAC mobile app

## Architecture
```
/app/
├── website/             # Next.js 15 User-facing frontend
│   ├── app/             # Pages (panchang, events, etc.)
│   ├── components/      # Sections, UI, layout
│   └── public/locales/  # 12 Indian language i18n JSONs
├── dashboard-next/      # Next.js 15 Admin Panel + Backend API Monolith
│   ├── src/app/api/     # All API Routes
│   │   ├── panchang/    # today, cities, festivals
│   │   ├── notifications/ # preferences, daily-panchang, send, stats
│   │   ├── auth/        # signin, signup
│   │   └── ...          # 79+ routes total
│   ├── src/lib/panchang/ # Calculation engine
│   │   ├── panchangService.ts    # Main service (builds complete panchang)
│   │   ├── enhancedCalculator.ts # Rashi, Hora, Disha Shool, DayQuality
│   │   ├── calculator.ts         # Core tithi/nakshatra/yoga/karana
│   │   ├── astronomy.ts          # astronomy-engine wrapper
│   │   ├── muhurta.ts            # Muhurta calculations
│   │   ├── festivals.ts          # Festival data
│   │   └── types.ts              # TypeScript interfaces
│   └── src/models/      # Mongoose models
│       ├── NotificationPreference.ts  # Push notification prefs (NEW)
│       └── PanchangCache.ts
├── mobile/
│   ├── user-app/        # Expo React Native (End users)
│   │   ├── src/screens/panchang/
│   │   │   ├── PanchangScreen.tsx              # OVERHAULED — shows all enhanced data
│   │   │   ├── PanchangCalendarScreen.tsx       # Monthly calendar view
│   │   │   ├── NotificationPreferencesScreen.tsx # NEW — push notification settings
│   │   │   └── CityPickerModal.tsx              # City selection
│   │   ├── src/screens/home/PanchangCard.tsx    # ENHANCED — richer home card
│   │   └── src/services/
│   │       ├── notifications.ts   # UPDATED — channels, Brahma Muhurta scheduling
│   │       └── panchangApi.ts     # API service for panchang data
│   └── admin-app/       # Expo React Native (Admin RBAC)
│       └── src/screens/team/TeamManagementScreen.tsx
└── docs/
```

## What's Been Implemented

### Session 1 (Previous Agent)
- [x] Deep codebase audit (14 parameters, 1-10 ratings)
- [x] Backend core infrastructure: rate limiting, pagination, API standardization, security headers
- [x] Mobile RBAC: PermissionContext, PermissionGate, TeamManagementScreen
- [x] DevOps: README, Dockerfile, docker-compose.yml, GitHub Actions CI
- [x] Panchang engine overhaul: Rashi, Hora, Disha Shool using astronomy-engine
- [x] Panchang i18n: 12 language panchang.json files
- [x] SEO/PWA: sitemap.ts, robots.ts

### Session 2 (Current — Feb 2026)
- [x] **Mobile Panchang Screen Complete Overhaul** — Now shows ALL enhanced data:
  - Day Quality score with 10-dot visualization
  - Tithi with paksha badge and end time
  - Nakshatra with deity and pada
  - Yoga with nature badge (shubh/ashubh)
  - Karana
  - Moon Rashi & Sun Rashi cards with lord and degree
  - Current Hora with planet, nature, and suitable activities
  - All Muhurta timings: Brahma Muhurta, Abhijit, Rahu Kaal, Yamaghanda, Gulika Kaal, Dur Muhurta, Varjyam
  - Disha Shool with direction, avoidance, and remedy
  - Auspicious Activities list with suitable/unsuitable status
  - Choghadiya (day + night periods)
  - Hindu Calendar info (month, ritu, ayana, samvat)
  - Vrat Days
  - Upcoming Festivals
  - Full Calendar navigation button
  - Notification bell in top bar
- [x] **Fixed "Panchang comes same" issue** — Removed hardcoded fallback cycling, proper empty state instead
- [x] **Panchang Push Notification System**:
  - Backend: `NotificationPreference` Mongoose model
  - API: `POST/GET/DELETE /api/notifications/preferences`
  - API: `POST /api/notifications/daily-panchang` — Cron endpoint for Brahma Muhurta 4:30 AM
  - API: `GET /api/notifications/stats` — Admin dashboard stats
  - Mobile: `NotificationPreferencesScreen` with:
    - Toggle daily panchang, festival alerts, Brahma Muhurta reminder
    - 12-language selector for notification language
    - Push token registration
    - Server sync
  - Android notification channels: `panchang_daily`, `festival_alerts`
  - Local scheduling fallback for Brahma Muhurta
  - i18n notification templates in 12 languages
  - Location-grouped Panchang calculation for efficiency
  - Invalid token auto-cleanup
- [x] **Enhanced PanchangCard (Home Screen)** — Shows day quality, moon rashi, festival, notification bell
- [x] **Enhanced Website PanchangSummary** — Shows day quality, moon rashi, Brahma Muhurta timing, Rahu Kaal, next festival countdown
- [x] **Share/Print on Website Panchang Page** — Web Share API + clipboard fallback, print button with print CSS
- [x] **Navigation updated** — NotificationPreferences screen added to AppNavigator

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/panchang/today | Today's complete panchang for location |
| GET | /api/panchang/cities | Search/filter Indian cities |
| GET | /api/panchang/festivals | Upcoming festivals |
| POST | /api/notifications/preferences | Register/update push prefs |
| GET | /api/notifications/preferences | Get user's push prefs |
| DELETE | /api/notifications/preferences | Deactivate notifications |
| POST | /api/notifications/daily-panchang | Cron: send daily panchang alerts |
| GET | /api/notifications/stats | Admin notification stats |
| POST | /api/notifications/send | General push notification (Firebase) |
| POST | /api/auth/signin | User authentication |

## 3rd Party Integrations
- **astronomy-engine** — Precise astronomical calculations for Panchang
- **Firebase Admin SDK** — Push notifications (requires FIREBASE_ADMIN_SDK_JSON)
- **expo-notifications** — Mobile push token registration and local scheduling
- **OpenAI GPT-4o-mini** — Chatbot (via Emergent LLM Key)
- **Razorpay/Stripe** — Donations (requires user API key)
- **Cloudinary** — Image uploads (requires user API key)

## Known Issues / Backlog
- [ ] P1: Separate backend API from dashboard-next monolith
- [ ] P1: Dark mode for website
- [ ] P2: i18n for Panchang data values (tithi/nakshatra names in regional scripts)
- [ ] P2: Convert remaining .js API routes to .ts
- [ ] P2: Full regression testing across all platforms
- [ ] P3: A/B testing infrastructure
