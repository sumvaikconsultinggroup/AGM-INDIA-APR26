# AGM India — Spiritual Platform

> Enterprise-grade spiritual platform for Acharya Mahamandaleshwar Swami Avdheshanand Giri Ji Maharaj & Prabhu Premi Sangh.

[![CI/CD](https://github.com/sumvaikconsultinggroup/AGM-INDIA-APR26/actions/workflows/ci.yml/badge.svg)](https://github.com/sumvaikconsultinggroup/AGM-INDIA-APR26/actions)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTS (CONSUMERS)                     │
├──────────────┬──────────────┬──────────────┬───────────────┤
│   Website    │  User App    │  Admin App   │  Admin Dash   │
│   (Next.js)  │ (Expo RN)    │ (Expo RN)    │  (Next.js)    │
│   Port 3000  │  iOS/Android │  iOS/Android │  Port 3001    │
└──────┬───────┴──────┬───────┴──────┬───────┴───────┬───────┘
       │              │              │               │
       └──────────────┴──────────────┴───────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   API LAYER       │
                    │ (Next.js Routes)  │
                    │ /api/*            │
                    │ 79+ Endpoints     │
                    │ Rate Limited      │
                    │ RBAC Protected    │
                    ├───────────────────┤
                    │   Middleware       │
                    │ - Auth (JWT)      │
                    │ - RBAC            │
                    │ - Rate Limiting   │
                    │ - CORS            │
                    │ - Security Headers│
                    └────────┬──────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼───┐  ┌──────▼────┐  ┌──────▼────┐
     │  MongoDB   │  │ Cloudinary│  │  External  │
     │  (Atlas)   │  │  (Media)  │  │  Services  │
     │            │  │           │  │ - Razorpay │
     │ 26 Models  │  │  Images   │  │ - OpenAI   │
     │            │  │  Videos   │  │ - Firebase │
     └────────────┘  └───────────┘  └────────────┘
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Website** | Next.js, React 19, Tailwind CSS | 15.x |
| **Dashboard** | Next.js, shadcn/ui, Recharts | 15.x |
| **Mobile Apps** | Expo SDK 54, React Native 0.81 | 54.x |
| **Database** | MongoDB Atlas + Mongoose | 8.x |
| **Auth** | JWT + bcrypt, Firebase OAuth | - |
| **Media** | Cloudinary CDN | - |
| **Payments** | Razorpay | - |
| **AI** | OpenAI GPT-4o-mini | - |
| **i18n** | 12 Indian languages | - |

## Monorepo Structure

```
/
├── website/            # User-facing Next.js website
│   ├── app/            # Next.js App Router pages (14 pages)
│   ├── components/     # 21 section components + UI
│   ├── lib/            # API client, i18n, utilities
│   └── public/locales/ # 12 languages × 14 namespaces
│
├── dashboard-next/     # Admin dashboard + API backend
│   ├── src/app/api/    # 79 API route files
│   ├── src/app/dashboard/ # 63 dashboard pages
│   ├── src/models/     # 26 Mongoose models
│   ├── src/lib/        # Core utilities (cache, rate limiter, security)
│   ├── src/middleware.ts # RBAC + auth middleware
│   └── src/components/ # 102 dashboard components
│
├── mobile/
│   ├── user-app/       # Expo React Native user app (28 screens)
│   │   ├── src/screens/
│   │   ├── src/context/ # Auth + Theme contexts
│   │   └── src/i18n/    # 12 language files
│   │
│   └── admin-app/      # Expo React Native admin app (14 screens)
│       ├── src/screens/
│       ├── src/context/ # Auth + Permission (RBAC) contexts
│       └── src/components/common/ # PermissionGate, ActionBar
│
├── docs/               # Architecture documentation
│   ├── deep-link-setup.md
│   └── superpowers/plans/ # 7 feature roadmap documents
│
├── .github/workflows/  # CI/CD pipeline
├── Dockerfile          # Multi-stage build
└── docker-compose.yml  # Local development
```

## RBAC (Role-Based Access Control)

The platform implements enterprise-grade RBAC across dashboard and mobile admin app:

| Role | Description | Access Level |
|------|------------|-------------|
| **Super Admin** | Full platform control | All modules, all actions |
| **Admin** | Content & user management | All modules (except services config) |
| **Editor** | Content creation & editing | Content modules: create, edit |
| **Moderator** | Review & approval | View all + approve volunteers/messages |
| **Viewer** | Read-only access | View-only across all modules |

### Permission Modules
`dashboard` · `events` · `donations` · `donationsRecord` · `schedule` · `users` · `books` · `articles` · `videos` · `podcasts` · `rooms` · `volunteers` · `messages` · `glimpse` · `imagelibrary` · `printMedia` · `mantraDiksha` · `dailySchedule` · `livestream` · `tvSchedule` · `dailyVichar` · `chatbot` · `notifications` · `website` · `services`

### Permission Actions
`view` · `create` · `edit` · `delete` · `export` · `approve`

## API Endpoints (79+ Routes)

### Authentication
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/auth/signin` | Admin login (rate-limited, lockout) |
| POST | `/api/creduser/login` | User login (rate-limited, lockout) |
| POST | `/api/creduser/register` | User registration |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/verify` | Verify JWT |
| POST | `/api/user/generate-otp` | OTP generation |
| POST | `/api/user/verify-otp` | OTP verification |
| POST | `/api/user/reset-password` | Password reset |

### Content Management
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET/POST | `/api/events` | Events CRUD |
| GET/POST | `/api/articles` | Articles CRUD |
| GET/POST | `/api/allbooks` | Books CRUD |
| GET/POST | `/api/podcasts` | Podcasts CRUD |
| GET/POST | `/api/videoseries` | Video Series CRUD |
| GET/POST | `/api/schedule` | Schedule CRUD |
| GET/POST | `/api/glimpse` | Gallery CRUD |
| GET/POST | `/api/printmedia` | Print Media CRUD |

### Donations & Payments
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET/POST | `/api/donate` | Donation campaigns |
| GET | `/api/donationsRecord` | Razorpay records |
| POST | `/api/webhook` | Payment webhooks |

### Users & Admin
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/users` | List users (paginated) |
| GET/PUT | `/api/users/permissions` | RBAC permissions |
| GET | `/api/dashboard/stats` | Real-time dashboard statistics |
| GET | `/api/health` | Health check |

### Specialized Features
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/panchang/today` | Hindu calendar (Panchang) |
| POST | `/api/chat-bot/message` | AI Chatbot |
| POST | `/api/notifications/send` | Push notifications |
| GET/POST | `/api/livestream` | Live streaming |
| GET | `/api/daily-vichar/today` | Thought of the Day |
| POST | `/api/compare-face` | Face comparison |

## Security

- **Rate Limiting**: Auth endpoints (10 req/15min), OTP (3 req/min), API (120 req/min)
- **Account Lockout**: 5 failed attempts → 15-minute lockout
- **Security Headers**: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **JWT**: 24h expiry for both admin and user tokens
- **Password Policy**: Min 8 chars, max 128 chars, requires uppercase + lowercase + number
- **Input Sanitization**: HTML tag stripping, XSS prevention
- **CORS**: Whitelisted origins only

## Internationalization

Supported languages across website and mobile apps:

| Language | Code | Coverage |
|----------|------|----------|
| English | en | Full |
| Hindi | hi | Full |
| Bengali | bn | Full |
| Tamil | ta | Full |
| Telugu | te | Full |
| Marathi | mr | Full |
| Gujarati | gu | Full |
| Kannada | kn | Full |
| Malayalam | ml | Full |
| Punjabi | pa | Full |
| Odia | or | Full |
| Assamese | as | Full |

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB Atlas cluster
- Cloudinary account
- Razorpay account
- OpenAI API key

### Setup

```bash
# Clone repository
git clone https://github.com/sumvaikconsultinggroup/AGM-INDIA-APR26.git
cd AGM-INDIA-APR26

# Dashboard + API Backend
cd dashboard-next
cp .env.example .env  # Edit with your credentials
pnpm install
pnpm dev

# Website
cd ../website
cp .env.example .env
pnpm install
pnpm dev

# Mobile User App
cd ../mobile/user-app
cp .env.example .env
npx expo install
npx expo start

# Mobile Admin App
cd ../mobile/admin-app
cp .env.example .env
npx expo install
npx expo start
```

### Docker Setup

```bash
docker-compose up --build
```

## Environment Variables

See `.env.example` files in each component directory:
- `dashboard-next/.env.example`
- `website/.env.example`
- `mobile/user-app/.env.example`
- `mobile/admin-app/.env.example`

## License

Proprietary — Sumvaik Consulting Group / Prabhu Premi Sangh
