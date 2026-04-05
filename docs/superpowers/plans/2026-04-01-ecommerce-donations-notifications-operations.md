# Plan 3: Amazon Book Catalog, Donations, Multi-Channel Notifications, Operations & Hindu Panchang

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build seven integrated sub-features -- Book Catalog with Amazon links (no shopping cart), 80G donation tax receipts, UPI/QR code donations, event QR code ticketing, multi-channel push notification management (FCM, Web Push, Email, WhatsApp), seva/volunteer matching, and a world-class Hindu Panchang with astronomical calculations -- to bring the platform to parity with Art of Living, ISKCON, and Sadhguru digital ecosystems.

**Architecture:** Books page is a showcase catalog; each book links to its Amazon product page via an `amazonUrl` field on the existing Book model. New MongoDB models for DonationReceipt, EventTicket, NotificationLog, NotificationPreference, WebPushSubscription, SevaOpportunity, SevaSignup, PanchangCache, HinduFestival, and CityLocation. Razorpay handles donation payments (existing). Multi-channel notifications via Firebase Cloud Messaging (mobile push), Web Push API with VAPID keys (browser), Nodemailer (email digests), and WhatsApp Cloud API (critical announcements). QR codes generated server-side via `qrcode`. PDF receipts via `pdfkit`. Panchang calculated astronomically via `astronomy-engine` and `suncalc` packages with a comprehensive festival database.

**Tech Stack:** Next.js 15 App Router, MongoDB/Mongoose, Razorpay (existing), Firebase Admin (existing firebase-admin@13.4.0), Nodemailer (existing nodemailer@7.0.3), `qrcode` (new), `pdfkit` (new), `web-push` (new), `astronomy-engine` (new), `suncalc` (new), Framer Motion (website animations), React Native / Expo (mobile).

**Peer Benchmark:**
| Feature | Art of Living | ISKCON | Sadhguru | RSSB | **Our Target** |
|---------|-------------|--------|----------|------|----------------|
| Books | Full store | Book trust | Course sales | Book store | Catalog with Amazon links |
| Tax Receipts | Yes (80G) | Yes | Yes | Yes | Auto-generate 80G PDF + email |
| UPI/QR | Yes | Yes | Yes | No | QR code display on donate page |
| Event Tickets | QR passes | No | Yes | No | QR code passes with scan verify |
| Notifications | Full system | Full | Full | Basic | Multi-channel: Push, Web, Email, WhatsApp |
| Volunteer | Yes | Yes | Yes | No | Opportunity-based with leaderboard |
| Hindu Calendar | No | Yes | Yes (Ekadashi) | No | Full astronomical Panchang with 200+ festivals |

---

## File Structure

### New Files to Create

**Dashboard (Admin) -- Models:**
- `dashboard-next/src/models/DonationReceipt.ts` -- 80G receipt model
- `dashboard-next/src/models/EventTicket.ts` -- QR ticket/pass model
- `dashboard-next/src/models/NotificationLog.ts` -- Multi-channel notification history model
- `dashboard-next/src/models/NotificationPreference.ts` -- User notification preferences model
- `dashboard-next/src/models/WebPushSubscription.ts` -- Web push subscription model
- `dashboard-next/src/models/SevaOpportunity.ts` -- Seva/volunteer opportunity model
- `dashboard-next/src/models/SevaSignup.ts` -- Volunteer signup for seva model
- `dashboard-next/src/models/PanchangCache.ts` -- Cached panchang computation model
- `dashboard-next/src/models/HinduFestival.ts` -- Festival database model
- `dashboard-next/src/models/CityLocation.ts` -- City coordinates model

**Dashboard (Admin) -- Panchang Calculation Engine:**
- `dashboard-next/src/lib/panchang/types.ts` -- TypeScript types for all Panchang data
- `dashboard-next/src/lib/panchang/astronomy.ts` -- Wrapper around astronomy-engine for Sun/Moon longitudes
- `dashboard-next/src/lib/panchang/calculator.ts` -- Core Panchang engine (Tithi, Nakshatra, Yoga, Karana)
- `dashboard-next/src/lib/panchang/muhurta.ts` -- Rahu Kaal, Brahma Muhurta, Abhijit, Choghadiya
- `dashboard-next/src/lib/panchang/festivals.ts` -- Festival matcher (match date/tithi to festival database)

**Dashboard (Admin) -- Panchang Data Files:**
- `dashboard-next/src/data/festivals.json` -- 200+ festival database
- `dashboard-next/src/data/cities.json` -- 200+ city database with coordinates

**Dashboard (Admin) -- API Routes:**
- `dashboard-next/src/app/api/donation-receipts/route.ts` -- List/generate 80G receipts
- `dashboard-next/src/app/api/donation-receipts/[id]/route.ts` -- Get/download single receipt
- `dashboard-next/src/app/api/donation-receipts/[id]/pdf/route.ts` -- Generate/download PDF
- `dashboard-next/src/app/api/upi-qr/route.ts` -- Generate UPI QR code
- `dashboard-next/src/app/api/event-tickets/route.ts` -- List event tickets
- `dashboard-next/src/app/api/event-tickets/generate/route.ts` -- Generate QR ticket
- `dashboard-next/src/app/api/event-tickets/verify/route.ts` -- Verify/scan QR ticket
- `dashboard-next/src/app/api/event-tickets/[id]/route.ts` -- Get single ticket
- `dashboard-next/src/app/api/notifications/send/route.ts` -- Multi-channel send (admin, protected)
- `dashboard-next/src/app/api/notifications/subscribe-web/route.ts` -- Subscribe to web push
- `dashboard-next/src/app/api/notifications/preferences/route.ts` -- GET/PUT user notification preferences
- `dashboard-next/src/app/api/notifications/whatsapp/route.ts` -- Send WhatsApp message via Cloud API
- `dashboard-next/src/app/api/notifications/history/route.ts` -- Notification send history
- `dashboard-next/src/app/api/notifications/schedule/route.ts` -- Schedule future notification
- `dashboard-next/src/app/api/seva/route.ts` -- Seva opportunities CRUD
- `dashboard-next/src/app/api/seva/[id]/route.ts` -- Single opportunity operations
- `dashboard-next/src/app/api/seva/signup/route.ts` -- Volunteer signup for seva
- `dashboard-next/src/app/api/seva/signup/[id]/route.ts` -- Update signup (hours, status)
- `dashboard-next/src/app/api/seva/leaderboard/route.ts` -- Volunteer leaderboard
- `dashboard-next/src/app/api/panchang/today/route.ts` -- Today's Panchang for a location (public)
- `dashboard-next/src/app/api/panchang/month/route.ts` -- Monthly Panchang (public)
- `dashboard-next/src/app/api/panchang/festivals/route.ts` -- Upcoming festivals list (public)

**Dashboard (Admin) -- Pages:**
- `dashboard-next/src/app/dashboard/donation-receipts/page.tsx` -- Receipts list page
- `dashboard-next/src/app/dashboard/notifications/page.tsx` -- Notification composer/history (multi-channel)
- `dashboard-next/src/app/dashboard/seva/page.tsx` -- Seva opportunities management
- `dashboard-next/src/app/dashboard/panchang/page.tsx` -- Panchang management
- `dashboard-next/src/app/dashboard/event-tickets/page.tsx` -- Event tickets / scanner

**Dashboard (Admin) -- Components:**
- `dashboard-next/src/components/notifications/NotificationComposer.tsx` -- Multi-channel compose + send form
- `dashboard-next/src/components/notifications/NotificationHistory.tsx` -- Sent notifications list with per-channel stats
- `dashboard-next/src/components/seva/SevaOpportunityForm.tsx` -- Create/edit seva form
- `dashboard-next/src/components/seva/SevaTable.tsx` -- Seva opportunities table
- `dashboard-next/src/components/tickets/QRScanner.tsx` -- QR scanner for check-in
- `dashboard-next/src/components/tickets/TicketsTable.tsx` -- Event tickets table
- `dashboard-next/src/components/panchang/PanchangManager.tsx` -- Panchang admin UI

**Dashboard (Admin) -- Utilities:**
- `dashboard-next/src/lib/firebase-admin.ts` -- Firebase Admin initialization
- `dashboard-next/src/lib/pdf-receipt.ts` -- PDF generation for 80G receipts
- `dashboard-next/src/lib/qr-generator.ts` -- QR code generation utility
- `dashboard-next/src/lib/web-push.ts` -- Web Push notification utility
- `dashboard-next/src/lib/whatsapp.ts` -- WhatsApp Cloud API utility
- `dashboard-next/src/lib/notification-sender.ts` -- Multi-channel notification orchestrator

**Website (Public):**
- `website/app/books/page.tsx` -- Book catalog page with Amazon links (replaces old cart-based page)
- `website/app/donate/upi/page.tsx` -- UPI QR code donation page
- `website/app/events/[id]/ticket/page.tsx` -- Download QR ticket page
- `website/app/seva/page.tsx` -- Browse seva opportunities
- `website/app/panchang/page.tsx` -- Full Panchang page
- `website/components/books/BookCard.tsx` -- Book card with Amazon button
- `website/components/donate/UpiQrDisplay.tsx` -- UPI QR code display
- `website/components/donate/DonationReceiptDownload.tsx` -- Download 80G receipt
- `website/components/events/EventTicketCard.tsx` -- QR ticket display card
- `website/components/seva/SevaOpportunityCard.tsx` -- Seva opportunity card
- `website/components/seva/SevaSignupModal.tsx` -- Signup modal
- `website/components/panchang/TodayPanchang.tsx` -- Today's Panchang hero card
- `website/components/panchang/MonthlyCalendar.tsx` -- Calendar grid with Tithi overlay
- `website/components/panchang/MuhurtaTimings.tsx` -- Auspicious/inauspicious timings display
- `website/components/panchang/FestivalList.tsx` -- Upcoming festivals
- `website/components/panchang/CitySelector.tsx` -- City search/GPS selector
- `website/components/panchang/EkadashiCard.tsx` -- Prominent Ekadashi display with Parana time
- `website/components/notifications/WebPushPrompt.tsx` -- "Enable Notifications" prompt
- `website/public/sw-push.js` -- Service Worker for Web Push

**Mobile User App:**
- `mobile/user-app/src/screens/books/BookCatalogScreen.tsx` -- Book catalog with Amazon links
- `mobile/user-app/src/screens/donate/UpiDonateScreen.tsx` -- UPI QR donation
- `mobile/user-app/src/screens/events/EventTicketScreen.tsx` -- QR ticket display
- `mobile/user-app/src/screens/seva/SevaListScreen.tsx` -- Browse seva opportunities
- `mobile/user-app/src/screens/seva/SevaDetailScreen.tsx` -- Seva detail + signup
- `mobile/user-app/src/screens/panchang/PanchangScreen.tsx` -- Hindu calendar (Panchang)
- `mobile/user-app/src/screens/panchang/PanchangDetailScreen.tsx` -- Day detail
- `mobile/user-app/src/services/notifications.ts` -- FCM registration + handling

### Files to Modify
- `dashboard-next/src/models/Book.ts` -- Add `amazonUrl` field
- `dashboard-next/src/middleware.ts` -- Add public endpoints for seva, panchang, tickets, UPI QR, web push
- `dashboard-next/src/app/dashboard/layout.tsx` -- Add sidebar nav items (Notifications, Seva, Panchang, Tickets)
- `website/app/layout.tsx` -- Add Web Push prompt
- `website/components/layout/Navbar.tsx` -- Add Seva, Panchang, Books nav links
- `mobile/user-app/src/navigation/` -- Add new screens to navigation
- `dashboard-next/package.json` -- Add `qrcode`, `pdfkit`, `web-push`, `astronomy-engine`, `suncalc`
- `website/package.json` -- Add `qrcode` dependency (for client QR display)

### New npm Dependencies
- `dashboard-next`: `qrcode @types/qrcode pdfkit @types/pdfkit web-push @types/web-push astronomy-engine suncalc @types/suncalc`
- `website`: `qrcode @types/qrcode`
- `mobile/user-app`: `react-native-qrcode-svg` (for QR display)

### Environment Variables (New)
- `VAPID_PUBLIC_KEY` -- Web Push VAPID public key
- `VAPID_PRIVATE_KEY` -- Web Push VAPID private key
- `WHATSAPP_PHONE_NUMBER_ID` -- WhatsApp Cloud API phone number ID
- `WHATSAPP_ACCESS_TOKEN` -- WhatsApp Cloud API access token

---

## Task 1: Add amazonUrl to Existing Book Model

**Files:**
- Modify: `dashboard-next/src/models/Book.ts`

- [ ] **Step 1: Add the amazonUrl field to the Book schema**

In `dashboard-next/src/models/Book.ts`, add the `amazonUrl` field to both the interface and the schema:

```typescript
// In the IBook interface, add after coverImage:
  amazonUrl?: string;

// In the bookSchema definition, add after coverImage field:
    amazonUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (value: string) {
          if (!value) return true; // optional field
          return /^https?:\/\/(www\.)?amazon\.(in|com|co\.uk|de|fr|es|it|ca|com\.au|co\.jp)\//.test(value);
        },
        message: 'Please enter a valid Amazon URL',
      },
    },
```

The complete modified interface block should look like:

```typescript
export interface IBook extends Document {
  title: string;
  author: string;
  publishedDate: Date;
  genre: string;
  language: string;
  ISBN: string;
  description: string;
  coverImage?: string;
  amazonUrl?: string;
  pages: number;
  stock: IStock;
  price: number;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

And the schema field added after `coverImage`:

```typescript
    amazonUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (value: string) {
          if (!value) return true;
          return /^https?:\/\/(www\.)?amazon\.(in|com|co\.uk|de|fr|es|it|ca|com\.au|co\.jp)\//.test(value);
        },
        message: 'Please enter a valid Amazon URL',
      },
    },
```

- [ ] **Step 2: Add Amazon URL input to the admin book creation/edit form**

In the existing admin book form (wherever books are created/edited in the dashboard), add an input field for `amazonUrl`:

```tsx
<div>
  <label className="block text-sm font-medium mb-1">Amazon URL</label>
  <input
    type="url"
    name="amazonUrl"
    value={formData.amazonUrl || ''}
    onChange={handleInputChange}
    className="w-full border rounded-md px-3 py-2"
    placeholder="https://www.amazon.in/dp/..."
  />
  <p className="text-xs text-muted-foreground mt-1">
    Link to the book on Amazon. Users will be redirected here to purchase.
  </p>
</div>
```

---

## Task 2: Book Catalog Page with Amazon Links (Website)

**Files:**
- Create: `website/components/books/BookCard.tsx`
- Modify: `website/app/books/page.tsx`

- [ ] **Step 1: Create BookCard component with Amazon button**

```tsx
// website/components/books/BookCard.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ExternalLink, BookOpen, Star } from 'lucide-react';

interface BookCardProps {
  book: {
    _id: string;
    title: string;
    author: string;
    description: string;
    price: number;
    coverImage?: string;
    amazonUrl?: string;
    genre?: string;
    language?: string;
    pages?: number;
  };
  index: number;
}

export default function BookCard({ book, index }: BookCardProps) {
  const handleBuyOnAmazon = () => {
    if (book.amazonUrl) {
      window.open(book.amazonUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="card-temple group overflow-hidden hover:shadow-temple transition-all duration-300"
    >
      {/* Book Cover */}
      <div className="relative aspect-[3/4] overflow-hidden bg-spiritual-sandstone">
        <Image
          src={book.coverImage || '/assets/videoseries/Book1.jpg'}
          alt={book.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {/* Genre badge */}
        {book.genre && (
          <span className="absolute top-3 left-3 text-xs px-2 py-1 rounded-full bg-white/90 text-spiritual-maroon font-medium backdrop-blur-sm">
            {book.genre}
          </span>
        )}
      </div>

      {/* Book Info */}
      <div className="p-5">
        <h3 className="font-display text-lg text-spiritual-maroon line-clamp-2 mb-1 group-hover:text-spiritual-saffron transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-spiritual-warmGray mb-2">{book.author}</p>
        <p className="text-xs text-spiritual-warmGray/80 line-clamp-3 mb-4 font-body leading-relaxed">
          {book.description}
        </p>

        {/* Book details */}
        <div className="flex items-center gap-3 text-xs text-spiritual-warmGray mb-4">
          {book.language && (
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {book.language}
            </span>
          )}
          {book.pages && (
            <span>{book.pages} pages</span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-display text-gradient-gold">
            INR {book.price.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-spiritual-warmGray/60">Reference price</span>
        </div>

        {/* Buy on Amazon Button */}
        {book.amazonUrl ? (
          <button
            onClick={handleBuyOnAmazon}
            className="w-full py-3 px-4 rounded-xl bg-[#FF9900] hover:bg-[#E88B00] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg group/btn"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.705a.66.66 0 01-.753.069c-1.06-.881-1.249-1.289-1.829-2.129-1.749 1.784-2.986 2.318-5.249 2.318-2.682 0-4.768-1.656-4.768-4.968 0-2.586 1.402-4.348 3.392-5.209 1.726-.756 4.14-.893 5.986-1.098v-.41c0-.753.058-1.643-.383-2.293-.385-.579-1.124-.819-1.775-.819-1.205 0-2.277.618-2.54 1.897-.054.285-.261.566-.546.58l-3.063-.33c-.258-.058-.544-.266-.47-.66C6.02 1.145 9.374 0 12.384 0c1.54 0 3.553.41 4.768 1.575 1.54 1.438 1.392 3.351 1.392 5.439v4.923c0 1.48.614 2.129 1.193 2.929.203.288.247.633-.013.847-.648.546-1.804 1.559-2.44 2.127l-.14-.045z" />
              <path d="M21.558 19.383c-1.506 1.112-3.693 1.701-5.573 1.701-2.636 0-5.01-.975-6.804-2.598-.141-.128-.015-.303.154-.203 1.938 1.128 4.333 1.805 6.808 1.805 1.669 0 3.504-.346 5.193-1.064.255-.109.469.168.222.359zM22.372 18.107c-.193-.247-1.282-.117-1.771-.059-.149.018-.171-.111-.037-.204 .866-.608 2.287-.433 2.452-.229.166.208-.043 1.643-.857 2.328-.125.105-.244.049-.189-.09.183-.457.595-1.499.402-1.746z" />
            </svg>
            Buy on Amazon
            <ExternalLink className="w-4 h-4 opacity-70 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>
        ) : (
          <div className="w-full py-3 px-4 rounded-xl bg-gray-100 text-gray-400 text-sm text-center">
            Coming Soon on Amazon
          </div>
        )}
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Update the Books page to be a catalog with Amazon links**

Replace the existing cart-based books page with a clean catalog:

```tsx
// website/app/books/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Star, Loader2, Search, Filter } from 'lucide-react';
import BookCard from '../../components/books/BookCard';
import api from '../../lib/api';

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  coverImage?: string;
  amazonUrl?: string;
  genre?: string;
  language?: string;
  pages?: number;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    api
      .get('/allbooks')
      .then((res) => {
        const data: Book[] = res.data?.data || [];
        setBooks(data);
        // Extract unique genres
        const uniqueGenres = [...new Set(data.map((b) => b.genre).filter(Boolean))] as string[];
        setGenres(uniqueGenres);
      })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      !searchQuery ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = !selectedGenre || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative bg-maroon-gradient py-24 overflow-hidden">
        <div className="absolute inset-0 bg-mandala opacity-20" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow animate-breathe">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <span className="text-gold-300/80 font-sanskrit text-lg tracking-wider">
              ग्रन्थ
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-gold-200 mt-2 mb-6">
              Sacred <span className="text-gradient-gold">Books</span>
            </h1>
            <p className="text-gold-100/80 text-lg md:text-xl leading-relaxed font-body">
              Explore the divine wisdom of Param Pujya Swami Avdheshanand Giri Ji Maharaj through these
              sacred texts. Available for purchase on Amazon.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <span className="w-16 h-px bg-gradient-to-r from-transparent to-gold-400" />
              <Star className="w-5 h-5 text-gold-400" fill="currentColor" />
              <span className="w-16 h-px bg-gradient-to-l from-transparent to-gold-400" />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="divider-rangoli" />

      {/* Search & Filter */}
      <section className="py-8 bg-temple-warm">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or author..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-spiritual-warmWhite border-2 border-gold-300 focus:border-gold-500 focus:ring-4 focus:ring-gold-200/50 focus:outline-none text-spiritual-maroon transition-all"
              />
            </div>
            {genres.length > 0 && (
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400" />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="pl-10 pr-8 py-3 rounded-xl bg-spiritual-warmWhite border-2 border-gold-300 focus:border-gold-500 focus:outline-none text-spiritual-maroon appearance-none cursor-pointer"
                >
                  <option value="">All Genres</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="section-padding bg-parchment">
        <div className="container-custom">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-spiritual-saffron animate-spin mb-4" />
              <p className="text-spiritual-warmGray">Loading sacred texts...</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gold-400 mx-auto mb-4" />
              <h3 className="font-display text-2xl text-spiritual-maroon mb-2">No Books Found</h3>
              <p className="text-spiritual-warmGray">
                {searchQuery || selectedGenre
                  ? 'Try adjusting your search or filter.'
                  : 'Books will be available soon.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book, index) => (
                <BookCard key={book._id} book={book} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
```

---

## Task 3: Mobile Book Catalog Screen with Amazon Links

**Files:**
- Create: `mobile/user-app/src/screens/books/BookCatalogScreen.tsx`

- [ ] **Step 1: Create mobile BookCatalogScreen with Amazon link buttons**

```tsx
// mobile/user-app/src/screens/books/BookCatalogScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  coverImage?: string;
  amazonUrl?: string;
  genre?: string;
  language?: string;
  pages?: number;
}

export default function BookCatalogScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    axios
      .get(`${API_URL}/api/allbooks`)
      .then((res) => {
        const data = res.data?.data || [];
        setBooks(data);
      })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBuyOnAmazon = async (book: Book) => {
    if (!book.amazonUrl) {
      Alert.alert('Coming Soon', 'This book will be available on Amazon soon.');
      return;
    }
    const canOpen = await Linking.canOpenURL(book.amazonUrl);
    if (canOpen) {
      await Linking.openURL(book.amazonUrl);
    } else {
      Alert.alert('Error', 'Unable to open the Amazon link.');
    }
  };

  const renderBook = ({ item, index }: { item: Book; index: number }) => (
    <View style={styles.bookCard}>
      <Image
        source={{ uri: item.coverImage || 'https://placehold.co/200x300' }}
        style={styles.bookImage}
        contentFit="cover"
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.bookAuthor}>{item.author}</Text>
        <Text style={styles.bookDescription} numberOfLines={3}>
          {item.description}
        </Text>
        <Text style={styles.bookPrice}>INR {item.price.toLocaleString('en-IN')}</Text>
        <TouchableOpacity
          style={[
            styles.amazonButton,
            !item.amazonUrl && styles.amazonButtonDisabled,
          ]}
          onPress={() => handleBuyOnAmazon(item)}
          disabled={!item.amazonUrl}
        >
          <Text style={styles.amazonButtonText}>
            {item.amazonUrl ? 'Buy on Amazon' : 'Coming Soon'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#800020" />
        <Text style={styles.loadingText}>Loading books...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search books..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8B7E74"
        />
      </View>

      {/* Books grid */}
      <FlatList
        data={filteredBooks}
        renderItem={renderBook}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No books found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8E7' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, color: '#800020', fontSize: 16 },
  emptyText: { color: '#8B7E74', fontSize: 16 },
  searchContainer: { padding: 16, backgroundColor: '#FFF' },
  searchInput: {
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#D4A017',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#800020',
  },
  listContent: { padding: 8 },
  bookCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookImage: { width: '100%', height: 180 },
  bookInfo: { padding: 12 },
  bookTitle: { fontSize: 14, fontWeight: '600', color: '#800020', marginBottom: 4 },
  bookAuthor: { fontSize: 12, color: '#8B7E74', marginBottom: 6 },
  bookDescription: { fontSize: 11, color: '#A09890', marginBottom: 8, lineHeight: 16 },
  bookPrice: { fontSize: 16, fontWeight: '700', color: '#D4A017', marginBottom: 8 },
  amazonButton: {
    backgroundColor: '#FF9900',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  amazonButtonDisabled: {
    backgroundColor: '#E0D8CF',
  },
  amazonButtonText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
});
```

---

## Task 4: DonationReceipt MongoDB Model

**Files:**
- Create: `dashboard-next/src/models/DonationReceipt.ts`

- [ ] **Step 1: Create the DonationReceipt model for 80G tax receipts**

```typescript
// dashboard-next/src/models/DonationReceipt.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDonorDetails {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  panNumber?: string;
}

export interface IDonationReceipt extends Document {
  receiptNumber: string;
  donationId: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  campaignTitle?: string;
  donorDetails: IDonorDetails;
  amount: number;
  currency: string;
  donationDate: Date;
  paymentMethod: string;
  paymentId?: string;
  pdfUrl?: string;
  organizationDetails: {
    name: string;
    address: string;
    panNumber: string;
    registrationNumber: string;
    section80GNumber: string;
    section80GValidFrom: Date;
    section80GValidUntil: Date;
  };
  emailSent: boolean;
  emailSentAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const donorDetailsSchema = new Schema<IDonorDetails>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format'],
    },
  },
  { _id: false }
);

const donationReceiptSchema = new Schema<IDonationReceipt>(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
    },
    donationId: {
      type: Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Donate',
    },
    campaignTitle: {
      type: String,
      trim: true,
    },
    donorDetails: {
      type: donorDetailsSchema,
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Donation amount is required'],
      min: [1, 'Amount must be at least 1'],
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD'],
    },
    donationDate: {
      type: Date,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: 'Razorpay',
      trim: true,
    },
    paymentId: {
      type: String,
      trim: true,
    },
    pdfUrl: {
      type: String,
    },
    organizationDetails: {
      name: { type: String, default: 'Prabhu Premi Sangh' },
      address: { type: String, default: 'Harihar Ashram, Kankhal, Haridwar, Uttarakhand 249408' },
      panNumber: { type: String, default: 'AAXXPXXXXX' },
      registrationNumber: { type: String, default: 'REG/XXXX/XXXX' },
      section80GNumber: { type: String, default: '80G/XXXX/XXXX' },
      section80GValidFrom: { type: Date },
      section80GValidUntil: { type: Date },
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

// Auto-generate receipt number
donationReceiptSchema.pre('save', async function (next) {
  if (this.isNew && !this.receiptNumber) {
    const fiscalYear = new Date().getMonth() >= 3
      ? `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
      : `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`;
    const count = await mongoose.models.DonationReceipt.countDocuments();
    const seq = String(count + 1).padStart(6, '0');
    this.receiptNumber = `PPS/80G/${fiscalYear}/${seq}`;
  }
  next();
});

donationReceiptSchema.index({ receiptNumber: 1 });
donationReceiptSchema.index({ donationId: 1 });
donationReceiptSchema.index({ 'donorDetails.email': 1 });
donationReceiptSchema.index({ isDeleted: 1 });

const DonationReceipt: Model<IDonationReceipt> =
  mongoose.models.DonationReceipt ||
  mongoose.model<IDonationReceipt>('DonationReceipt', donationReceiptSchema);

export default DonationReceipt;
```

---

## Task 5: EventTicket MongoDB Model

**Files:**
- Create: `dashboard-next/src/models/EventTicket.ts`

- [ ] **Step 1: Create the EventTicket model for QR code passes**

```typescript
// dashboard-next/src/models/EventTicket.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEventTicket extends Document {
  ticketNumber: string;
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  eventName: string;
  eventDate: Date;
  eventLocation: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  qrCodeData: string;
  qrCodeImage?: string;
  checkedIn: boolean;
  checkedInAt?: Date;
  checkedInBy?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventTicketSchema = new Schema<IEventTicket>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    eventLocation: {
      type: String,
      required: true,
      trim: true,
    },
    attendeeName: {
      type: String,
      required: [true, 'Attendee name is required'],
      trim: true,
    },
    attendeeEmail: {
      type: String,
      required: [true, 'Attendee email is required'],
      trim: true,
      lowercase: true,
    },
    attendeePhone: {
      type: String,
      trim: true,
    },
    qrCodeData: {
      type: String,
      required: true,
    },
    qrCodeImage: {
      type: String,
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
    },
    checkedInBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

// Auto-generate ticket number
eventTicketSchema.pre('save', async function (next) {
  if (this.isNew && !this.ticketNumber) {
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.ticketNumber = `TKT-${datePart}-${randomPart}`;
  }
  next();
});

// Prevent duplicate tickets for same user + event
eventTicketSchema.index({ eventId: 1, userId: 1 }, { unique: true });
eventTicketSchema.index({ ticketNumber: 1 });
eventTicketSchema.index({ qrCodeData: 1 });
eventTicketSchema.index({ isDeleted: 1 });

const EventTicket: Model<IEventTicket> =
  mongoose.models.EventTicket ||
  mongoose.model<IEventTicket>('EventTicket', eventTicketSchema);

export default EventTicket;
```

---

## Task 6: Multi-Channel Notification Models

**Files:**
- Create: `dashboard-next/src/models/NotificationLog.ts`
- Create: `dashboard-next/src/models/NotificationPreference.ts`
- Create: `dashboard-next/src/models/WebPushSubscription.ts`

- [ ] **Step 1: Create the NotificationLog model with multi-channel support**

```typescript
// dashboard-next/src/models/NotificationLog.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotificationLog extends Document {
  title: string;
  body: string;
  imageUrl?: string;
  topic?: string;
  targetType: 'all' | 'topic' | 'user';
  targetUserIds?: mongoose.Types.ObjectId[];
  notificationType:
    | 'daily_vichar'
    | 'event_reminder'
    | 'live_stream'
    | 'kumbh_update'
    | 'general'
    | 'festival'
    | 'book_release'
    | 'donation_update';
  channels: ('push' | 'webPush' | 'email' | 'whatsapp')[];
  data?: Record<string, string>;
  scheduledFor?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'partial' | 'failed';
  deliveryStats: {
    push: { sent: number; delivered: number; failed: number };
    webPush: { sent: number; delivered: number; failed: number };
    email: { sent: number; delivered: number; failed: number };
    whatsapp: { sent: number; delivered: number; failed: number };
  };
  recipientCount: number;
  fcmMessageId?: string;
  errorMessage?: string;
  sentBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const deliveryStatsChannelSchema = new Schema(
  {
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
  },
  { _id: false }
);

const notificationLogSchema = new Schema<INotificationLog>(
  {
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    body: {
      type: String,
      required: [true, 'Notification body is required'],
      trim: true,
      maxlength: [500, 'Body cannot exceed 500 characters'],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    topic: {
      type: String,
      trim: true,
      enum: [
        'all',
        'daily-vichar',
        'events',
        'kumbh',
        'live-stream',
        'festivals',
        'books',
        'donations',
      ],
    },
    targetType: {
      type: String,
      required: true,
      enum: ['all', 'topic', 'user'],
      default: 'all',
    },
    targetUserIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    notificationType: {
      type: String,
      required: true,
      enum: [
        'daily_vichar',
        'event_reminder',
        'live_stream',
        'kumbh_update',
        'general',
        'festival',
        'book_release',
        'donation_update',
      ],
      default: 'general',
    },
    channels: {
      type: [String],
      enum: ['push', 'webPush', 'email', 'whatsapp'],
      required: [true, 'At least one channel is required'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one notification channel must be selected',
      },
    },
    data: {
      type: Schema.Types.Mixed,
    },
    scheduledFor: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sending', 'sent', 'partial', 'failed'],
      default: 'draft',
    },
    deliveryStats: {
      push: { type: deliveryStatsChannelSchema, default: () => ({ sent: 0, delivered: 0, failed: 0 }) },
      webPush: { type: deliveryStatsChannelSchema, default: () => ({ sent: 0, delivered: 0, failed: 0 }) },
      email: { type: deliveryStatsChannelSchema, default: () => ({ sent: 0, delivered: 0, failed: 0 }) },
      whatsapp: { type: deliveryStatsChannelSchema, default: () => ({ sent: 0, delivered: 0, failed: 0 }) },
    },
    recipientCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    fcmMessageId: {
      type: String,
    },
    errorMessage: {
      type: String,
    },
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

notificationLogSchema.index({ status: 1, scheduledFor: 1 });
notificationLogSchema.index({ sentAt: -1 });
notificationLogSchema.index({ notificationType: 1 });
notificationLogSchema.index({ channels: 1 });
notificationLogSchema.index({ isDeleted: 1 });

const NotificationLog: Model<INotificationLog> =
  mongoose.models.NotificationLog ||
  mongoose.model<INotificationLog>('NotificationLog', notificationLogSchema);

export default NotificationLog;
```

- [ ] **Step 2: Create the NotificationPreference model**

```typescript
// dashboard-next/src/models/NotificationPreference.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotificationPreference extends Document {
  userId: mongoose.Types.ObjectId;
  channels: {
    push: boolean;
    webPush: boolean;
    email: boolean;
    whatsapp: boolean;
  };
  topics: {
    dailyVichar: boolean;
    events: boolean;
    kumbh: boolean;
    festivals: boolean;
    liveStream: boolean;
    books: boolean;
    donations: boolean;
  };
  whatsappNumber?: string;
  emailDigestFrequency: 'instant' | 'daily' | 'weekly' | 'none';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    channels: {
      push: { type: Boolean, default: true },
      webPush: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false },
    },
    topics: {
      dailyVichar: { type: Boolean, default: true },
      events: { type: Boolean, default: true },
      kumbh: { type: Boolean, default: true },
      festivals: { type: Boolean, default: true },
      liveStream: { type: Boolean, default: true },
      books: { type: Boolean, default: false },
      donations: { type: Boolean, default: false },
    },
    whatsappNumber: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{6,14}$/, 'Please enter a valid phone number with country code'],
    },
    emailDigestFrequency: {
      type: String,
      enum: ['instant', 'daily', 'weekly', 'none'],
      default: 'instant',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

notificationPreferenceSchema.index({ userId: 1 });
notificationPreferenceSchema.index({ 'channels.push': 1 });
notificationPreferenceSchema.index({ 'channels.webPush': 1 });
notificationPreferenceSchema.index({ 'channels.email': 1 });
notificationPreferenceSchema.index({ 'channels.whatsapp': 1 });
notificationPreferenceSchema.index({ isDeleted: 1 });

const NotificationPreference: Model<INotificationPreference> =
  mongoose.models.NotificationPreference ||
  mongoose.model<INotificationPreference>('NotificationPreference', notificationPreferenceSchema);

export default NotificationPreference;
```

- [ ] **Step 3: Create the WebPushSubscription model**

```typescript
// dashboard-next/src/models/WebPushSubscription.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWebPushSubscription extends Document {
  userId?: mongoose.Types.ObjectId;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  subscribedAt: Date;
  lastUsedAt?: Date;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const webPushSubscriptionSchema = new Schema<IWebPushSubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    endpoint: {
      type: String,
      required: [true, 'Endpoint URL is required'],
      unique: true,
      trim: true,
    },
    keys: {
      p256dh: {
        type: String,
        required: [true, 'p256dh key is required'],
        trim: true,
      },
      auth: {
        type: String,
        required: [true, 'Auth key is required'],
        trim: true,
      },
    },
    userAgent: {
      type: String,
      trim: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    lastUsedAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

webPushSubscriptionSchema.index({ endpoint: 1 });
webPushSubscriptionSchema.index({ userId: 1 });
webPushSubscriptionSchema.index({ isActive: 1 });
webPushSubscriptionSchema.index({ isDeleted: 1 });

const WebPushSubscription: Model<IWebPushSubscription> =
  mongoose.models.WebPushSubscription ||
  mongoose.model<IWebPushSubscription>('WebPushSubscription', webPushSubscriptionSchema);

export default WebPushSubscription;
```

---

## Task 7: SevaOpportunity and SevaSignup MongoDB Models

**Files:**
- Create: `dashboard-next/src/models/SevaOpportunity.ts`
- Create: `dashboard-next/src/models/SevaSignup.ts`

- [ ] **Step 1: Create the SevaOpportunity model**

```typescript
// dashboard-next/src/models/SevaOpportunity.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISevaOpportunity extends Document {
  title: string;
  description: string;
  category:
    | 'kitchen'
    | 'cleaning'
    | 'decoration'
    | 'event_management'
    | 'teaching'
    | 'medical'
    | 'technical'
    | 'general';
  location: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  skillsNeeded: string[];
  spotsAvailable: number;
  spotsFilled: number;
  contactPerson?: string;
  contactPhone?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sevaOpportunitySchema = new Schema<ISevaOpportunity>(
  {
    title: {
      type: String,
      required: [true, 'Seva title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: true,
      enum: [
        'kitchen',
        'cleaning',
        'decoration',
        'event_management',
        'teaching',
        'medical',
        'technical',
        'general',
      ],
      default: 'general',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String,
      trim: true,
    },
    endTime: {
      type: String,
      trim: true,
    },
    skillsNeeded: {
      type: [String],
      default: [],
    },
    spotsAvailable: {
      type: Number,
      required: [true, 'Available spots are required'],
      min: [1, 'Must have at least 1 spot'],
    },
    spotsFilled: {
      type: Number,
      default: 0,
      min: 0,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

sevaOpportunitySchema.virtual('spotsRemaining').get(function () {
  return this.spotsAvailable - this.spotsFilled;
});

sevaOpportunitySchema.index({ date: 1, isActive: 1 });
sevaOpportunitySchema.index({ category: 1 });
sevaOpportunitySchema.index({ isDeleted: 1 });

const SevaOpportunity: Model<ISevaOpportunity> =
  mongoose.models.SevaOpportunity ||
  mongoose.model<ISevaOpportunity>('SevaOpportunity', sevaOpportunitySchema);

export default SevaOpportunity;
```

- [ ] **Step 2: Create the SevaSignup model**

```typescript
// dashboard-next/src/models/SevaSignup.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISevaSignup extends Document {
  volunteerId: mongoose.Types.ObjectId;
  opportunityId: mongoose.Types.ObjectId;
  volunteerName: string;
  volunteerEmail: string;
  volunteerPhone?: string;
  status: 'signed_up' | 'confirmed' | 'attended' | 'completed' | 'cancelled' | 'no_show';
  hoursLogged: number;
  notes?: string;
  checkedInAt?: Date;
  checkedOutAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sevaSignupSchema = new Schema<ISevaSignup>(
  {
    volunteerId: {
      type: Schema.Types.ObjectId,
      ref: 'Volunteer',
      required: [true, 'Volunteer ID is required'],
    },
    opportunityId: {
      type: Schema.Types.ObjectId,
      ref: 'SevaOpportunity',
      required: [true, 'Opportunity ID is required'],
    },
    volunteerName: {
      type: String,
      required: true,
      trim: true,
    },
    volunteerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    volunteerPhone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['signed_up', 'confirmed', 'attended', 'completed', 'cancelled', 'no_show'],
      default: 'signed_up',
    },
    hoursLogged: {
      type: Number,
      default: 0,
      min: [0, 'Hours cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    checkedInAt: {
      type: Date,
    },
    checkedOutAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

// Prevent duplicate signups
sevaSignupSchema.index({ volunteerId: 1, opportunityId: 1 }, { unique: true });
sevaSignupSchema.index({ opportunityId: 1, status: 1 });
sevaSignupSchema.index({ volunteerId: 1, hoursLogged: -1 });
sevaSignupSchema.index({ isDeleted: 1 });

const SevaSignup: Model<ISevaSignup> =
  mongoose.models.SevaSignup ||
  mongoose.model<ISevaSignup>('SevaSignup', sevaSignupSchema);

export default SevaSignup;
```

---

## Task 8: Panchang Models (PanchangCache, HinduFestival, CityLocation)

**Files:**
- Create: `dashboard-next/src/models/PanchangCache.ts`
- Create: `dashboard-next/src/models/HinduFestival.ts`
- Create: `dashboard-next/src/models/CityLocation.ts`

- [ ] **Step 1: Create the PanchangCache model**

```typescript
// dashboard-next/src/models/PanchangCache.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPanchangData {
  tithi: { name: string; number: number; paksha: 'Shukla' | 'Krishna'; startTime: string; endTime: string };
  nakshatra: { name: string; number: number; pada: number; startTime: string; endTime: string; deity: string; planet: string };
  yoga: { name: string; number: number; nature: 'shubh' | 'ashubh' | 'neutral' };
  karana: { first: string; second: string };
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  rahuKaal: { start: string; end: string };
  yamaghanda: { start: string; end: string };
  gulikaKaal: { start: string; end: string };
  brahmaMuhurta: { start: string; end: string };
  abhijitMuhurta: { start: string; end: string };
  hinduMonth: string;
  paksha: 'Shukla' | 'Krishna';
  vikramSamvat: number;
  shakaSamvat: number;
  ritu: string;
  ayana: 'Uttarayana' | 'Dakshinayana';
  choghadiya: { day: { name: string; start: string; end: string; nature: string }[]; night: { name: string; start: string; end: string; nature: string }[] };
  festivals: string[];
  ekadashi?: { name: string; significance: string; paranaTime?: string };
  isPurnima: boolean;
  isAmavasya: boolean;
  vratDays: string[];
  sunLongitude: number;
  moonLongitude: number;
}

export interface IPanchangCache extends Document {
  date: string;
  locationKey: string;
  panchangData: IPanchangData;
  computedAt: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const panchangCacheSchema = new Schema<IPanchangCache>(
  {
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    locationKey: {
      type: String,
      required: [true, 'Location key is required'],
      trim: true,
    },
    panchangData: {
      type: Schema.Types.Mixed,
      required: [true, 'Panchang data is required'],
    },
    computedAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

panchangCacheSchema.index({ date: 1, locationKey: 1 }, { unique: true });
panchangCacheSchema.index({ computedAt: 1 });
panchangCacheSchema.index({ isDeleted: 1 });

const PanchangCache: Model<IPanchangCache> =
  mongoose.models.PanchangCache ||
  mongoose.model<IPanchangCache>('PanchangCache', panchangCacheSchema);

export default PanchangCache;
```

- [ ] **Step 2: Create the HinduFestival model**

```typescript
// dashboard-next/src/models/HinduFestival.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHinduFestival extends Document {
  nameHindi: string;
  nameEnglish: string;
  nameSanskrit?: string;
  datePattern: {
    type: 'tithi' | 'solar' | 'fixed_gregorian';
    month?: string;
    tithiNumber?: number;
    paksha?: 'Shukla' | 'Krishna';
    solarMonth?: number;
    solarDay?: number;
    gregorianMonth?: number;
    gregorianDay?: number;
  };
  festivalType: 'major' | 'regional' | 'vrat' | 'monthly' | 'ekadashi' | 'purnima' | 'amavasya';
  description: string;
  descriptionHindi?: string;
  region: string[];
  isGovernmentHoliday: boolean;
  relatedDeity?: string;
  relatedContent?: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const hinduFestivalSchema = new Schema<IHinduFestival>(
  {
    nameHindi: {
      type: String,
      required: [true, 'Hindi name is required'],
      trim: true,
    },
    nameEnglish: {
      type: String,
      required: [true, 'English name is required'],
      trim: true,
    },
    nameSanskrit: {
      type: String,
      trim: true,
    },
    datePattern: {
      type: {
        type: String,
        enum: ['tithi', 'solar', 'fixed_gregorian'],
        required: true,
      },
      month: { type: String, trim: true },
      tithiNumber: { type: Number, min: 1, max: 30 },
      paksha: { type: String, enum: ['Shukla', 'Krishna'] },
      solarMonth: { type: Number, min: 1, max: 12 },
      solarDay: { type: Number, min: 1, max: 31 },
      gregorianMonth: { type: Number, min: 1, max: 12 },
      gregorianDay: { type: Number, min: 1, max: 31 },
    },
    festivalType: {
      type: String,
      required: true,
      enum: ['major', 'regional', 'vrat', 'monthly', 'ekadashi', 'purnima', 'amavasya'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    descriptionHindi: {
      type: String,
      trim: true,
    },
    region: {
      type: [String],
      default: ['pan-India'],
    },
    isGovernmentHoliday: {
      type: Boolean,
      default: false,
    },
    relatedDeity: {
      type: String,
      trim: true,
    },
    relatedContent: {
      type: [String],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

hinduFestivalSchema.index({ nameEnglish: 1 });
hinduFestivalSchema.index({ festivalType: 1 });
hinduFestivalSchema.index({ 'datePattern.type': 1 });
hinduFestivalSchema.index({ region: 1 });
hinduFestivalSchema.index({ isDeleted: 1 });

const HinduFestival: Model<IHinduFestival> =
  mongoose.models.HinduFestival ||
  mongoose.model<IHinduFestival>('HinduFestival', hinduFestivalSchema);

export default HinduFestival;
```

- [ ] **Step 3: Create the CityLocation model**

```typescript
// dashboard-next/src/models/CityLocation.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICityLocation extends Document {
  name: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
  altitude: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const cityLocationSchema = new Schema<ICityLocation>(
  {
    name: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: -90,
      max: 90,
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: -180,
      max: 180,
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
      trim: true,
    },
    altitude: {
      type: Number,
      default: 0,
      min: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

cityLocationSchema.index({ name: 1, state: 1 }, { unique: true });
cityLocationSchema.index({ country: 1 });
cityLocationSchema.index({ isDeleted: 1 });

const CityLocation: Model<ICityLocation> =
  mongoose.models.CityLocation ||
  mongoose.model<ICityLocation>('CityLocation', cityLocationSchema);

export default CityLocation;
```

---

## Task 9: Panchang Calculation Engine -- Types

**Files:**
- Create: `dashboard-next/src/lib/panchang/types.ts`

- [ ] **Step 1: Create TypeScript types for all Panchang data**

```typescript
// dashboard-next/src/lib/panchang/types.ts

export interface TithiInfo {
  name: string;
  number: number; // 1-30 (1-15 Shukla, 16-30 mapped as 1-15 Krishna)
  paksha: 'Shukla' | 'Krishna';
  startTime: string; // ISO string
  endTime: string; // ISO string
}

export interface NakshatraInfo {
  name: string;
  number: number; // 1-27
  pada: number; // 1-4
  startTime: string;
  endTime: string;
  deity: string;
  planet: string;
}

export interface YogaInfo {
  name: string;
  number: number; // 1-27
  nature: 'shubh' | 'ashubh' | 'neutral';
}

export interface KaranaInfo {
  first: string;
  second: string;
}

export interface TimePeriod {
  start: string;
  end: string;
}

export interface ChoghadiyaPeriod {
  name: string;
  start: string;
  end: string;
  nature: 'shubh' | 'amrit' | 'labh' | 'char' | 'rog' | 'kaal' | 'udveg';
}

export interface EkadashiInfo {
  name: string;
  significance: string;
  paranaTime?: string;
}

export interface PanchangResult {
  date: string; // YYYY-MM-DD
  locationName: string;
  lat: number;
  lng: number;
  tithi: TithiInfo;
  nakshatra: NakshatraInfo;
  yoga: YogaInfo;
  karana: KaranaInfo;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  rahuKaal: TimePeriod;
  yamaghanda: TimePeriod;
  gulikaKaal: TimePeriod;
  brahmaMuhurta: TimePeriod;
  abhijitMuhurta: TimePeriod;
  hinduMonth: string;
  paksha: 'Shukla' | 'Krishna';
  vikramSamvat: number;
  shakaSamvat: number;
  ritu: string;
  ayana: 'Uttarayana' | 'Dakshinayana';
  choghadiya: {
    day: ChoghadiyaPeriod[];
    night: ChoghadiyaPeriod[];
  };
  festivals: string[];
  ekadashi?: EkadashiInfo;
  isPurnima: boolean;
  isAmavasya: boolean;
  vratDays: string[];
  sunLongitude: number;
  moonLongitude: number;
}

// Tithi names (1-30)
export const TITHI_NAMES: string[] = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya',
];

// Nakshatra names (1-27)
export const NAKSHATRA_NAMES: string[] = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira',
  'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
  'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
  'Vishakha', 'Anuradha', 'Jyeshtha', 'Moola', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

// Nakshatra deities
export const NAKSHATRA_DEITIES: string[] = [
  'Ashwini Kumaras', 'Yama', 'Agni', 'Brahma', 'Soma',
  'Rudra', 'Aditi', 'Brihaspati', 'Sarpas', 'Pitris',
  'Bhaga', 'Aryaman', 'Savita', 'Tvashta', 'Vayu',
  'Indragni', 'Mitra', 'Indra', 'Nirrti', 'Apah',
  'Vishvedevas', 'Vishnu', 'Vasus', 'Varuna',
  'Ajaikapada', 'Ahirbudhnya', 'Pushan',
];

// Nakshatra ruling planets
export const NAKSHATRA_PLANETS: string[] = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
  'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu',
  'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
  'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus',
  'Sun', 'Moon', 'Mars', 'Rahu',
  'Jupiter', 'Saturn', 'Mercury',
];

// Yoga names (1-27)
export const YOGA_NAMES: string[] = [
  'Vishkumbha', 'Preeti', 'Ayushman', 'Saubhagya', 'Shobhana',
  'Atiganda', 'Sukarman', 'Dhriti', 'Shoola', 'Ganda',
  'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
  'Indra', 'Vaidhriti',
];

// Yoga natures
export const YOGA_NATURES: ('shubh' | 'ashubh' | 'neutral')[] = [
  'ashubh', 'shubh', 'shubh', 'shubh', 'shubh',
  'ashubh', 'shubh', 'shubh', 'ashubh', 'ashubh',
  'shubh', 'shubh', 'ashubh', 'shubh', 'ashubh',
  'shubh', 'ashubh', 'shubh', 'ashubh', 'shubh',
  'shubh', 'shubh', 'shubh', 'shubh', 'shubh',
  'shubh', 'ashubh',
];

// Karana names (11 types, 7 recurring + 4 fixed)
export const KARANA_NAMES: string[] = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garija',
  'Vanija', 'Vishti', // 7 recurring
  'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna', // 4 fixed
];

// Hindu months
export const HINDU_MONTHS: string[] = [
  'Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha',
  'Shravana', 'Bhadrapada', 'Ashwin', 'Kartik',
  'Margashirsha', 'Pausha', 'Magha', 'Phalguna',
];

// Ritus (seasons)
export const RITUS: string[] = [
  'Vasanta', 'Grishma', 'Varsha', 'Sharad', 'Hemanta', 'Shishira',
];

// Rahu Kaal order by day of week (0=Sunday to 6=Saturday)
// Value = which 1/8th segment of the day (1-indexed)
export const RAHU_KAAL_ORDER: number[] = [8, 2, 7, 5, 6, 4, 3];

// Yamaghanda order by day of week
export const YAMAGHANDA_ORDER: number[] = [5, 4, 3, 7, 2, 1, 6];

// Gulika Kaal order by day of week
export const GULIKA_KAAL_ORDER: number[] = [7, 6, 5, 4, 3, 2, 1];

// Choghadiya names and natures for day periods by day of week
export const CHOGHADIYA_DAY_ORDER: Record<number, string[]> = {
  0: ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'],
  1: ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'],
  2: ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'],
  3: ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'],
  4: ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'],
  5: ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'],
  6: ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal'],
};

// Choghadiya natures
export const CHOGHADIYA_NATURES: Record<string, 'shubh' | 'amrit' | 'labh' | 'char' | 'rog' | 'kaal' | 'udveg'> = {
  Udveg: 'udveg',
  Char: 'char',
  Labh: 'labh',
  Amrit: 'amrit',
  Kaal: 'kaal',
  Shubh: 'shubh',
  Rog: 'rog',
};

// 24 Ekadashi names (Shukla + Krishna for 12 months)
export const EKADASHI_NAMES: Record<string, { shukla: string; krishna: string }> = {
  Chaitra: { shukla: 'Kamada Ekadashi', krishna: 'Papamochani Ekadashi' },
  Vaishakha: { shukla: 'Mohini Ekadashi', krishna: 'Varuthini Ekadashi' },
  Jyeshtha: { shukla: 'Nirjala Ekadashi', krishna: 'Apara Ekadashi' },
  Ashadha: { shukla: 'Devshayani Ekadashi', krishna: 'Yogini Ekadashi' },
  Shravana: { shukla: 'Putrada Ekadashi', krishna: 'Kamika Ekadashi' },
  Bhadrapada: { shukla: 'Parivartini Ekadashi', krishna: 'Aja Ekadashi' },
  Ashwin: { shukla: 'Papankusha Ekadashi', krishna: 'Indira Ekadashi' },
  Kartik: { shukla: 'Devutthani Ekadashi', krishna: 'Rama Ekadashi' },
  Margashirsha: { shukla: 'Mokshada Ekadashi', krishna: 'Utpanna Ekadashi' },
  Pausha: { shukla: 'Putrada Ekadashi (Pausha)', krishna: 'Shattila Ekadashi' },
  Magha: { shukla: 'Jaya Ekadashi', krishna: 'Vijaya Ekadashi' },
  Phalguna: { shukla: 'Amalaki Ekadashi', krishna: 'Papmochani Ekadashi' },
};
```

---

## Task 10: Panchang Calculation Engine -- Astronomy Wrapper

**Files:**
- Create: `dashboard-next/src/lib/panchang/astronomy.ts`

- [ ] **Step 1: Create wrapper around astronomy-engine for Sun/Moon longitudes**

```typescript
// dashboard-next/src/lib/panchang/astronomy.ts
import * as Astronomy from 'astronomy-engine';

/**
 * Get the ecliptic longitude of the Sun at a given date.
 * Returns value in degrees (0-360).
 */
export function getSunLongitude(date: Date): number {
  const astroTime = Astronomy.MakeTime(date);
  const sunEcliptic = Astronomy.SunPosition(astroTime);
  let lon = sunEcliptic.elon;
  if (lon < 0) lon += 360;
  return lon;
}

/**
 * Get the ecliptic longitude of the Moon at a given date.
 * Returns value in degrees (0-360).
 */
export function getMoonLongitude(date: Date): number {
  const astroTime = Astronomy.MakeTime(date);
  const moonEcliptic = Astronomy.EclipticGeoMoon(astroTime);
  let lon = moonEcliptic.lon;
  if (lon < 0) lon += 360;
  return lon;
}

/**
 * Get the angular difference between Moon and Sun longitudes.
 * This is the basis for Tithi calculation.
 * Returns value in degrees (0-360).
 */
export function getMoonSunAngle(date: Date): number {
  const sunLon = getSunLongitude(date);
  const moonLon = getMoonLongitude(date);
  let diff = moonLon - sunLon;
  if (diff < 0) diff += 360;
  return diff;
}

/**
 * Find the exact time when the Moon-Sun angle crosses a given degree boundary.
 * Uses binary search for precision.
 * @param startDate Start of search window
 * @param endDate End of search window
 * @param targetAngle The target Moon-Sun angle in degrees
 * @param toleranceMinutes Precision in minutes (default 1 minute)
 */
export function findAngleCrossing(
  startDate: Date,
  endDate: Date,
  targetAngle: number,
  toleranceMinutes: number = 1
): Date {
  let lo = startDate.getTime();
  let hi = endDate.getTime();
  const toleranceMs = toleranceMinutes * 60 * 1000;

  while (hi - lo > toleranceMs) {
    const mid = lo + (hi - lo) / 2;
    const midDate = new Date(mid);
    const angle = getMoonSunAngle(midDate);

    // Handle the wrap-around at 360/0 boundary
    let diff = angle - targetAngle;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (diff < 0) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return new Date(lo + (hi - lo) / 2);
}

/**
 * Find the exact time when the Moon longitude crosses a given degree boundary.
 * Used for Nakshatra transitions.
 */
export function findMoonLongitudeCrossing(
  startDate: Date,
  endDate: Date,
  targetLongitude: number,
  toleranceMinutes: number = 1
): Date {
  let lo = startDate.getTime();
  let hi = endDate.getTime();
  const toleranceMs = toleranceMinutes * 60 * 1000;

  while (hi - lo > toleranceMs) {
    const mid = lo + (hi - lo) / 2;
    const midDate = new Date(mid);
    const moonLon = getMoonLongitude(midDate);

    let diff = moonLon - targetLongitude;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (diff < 0) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return new Date(lo + (hi - lo) / 2);
}
```

---

## Task 11: Panchang Calculation Engine -- Core Calculator

**Files:**
- Create: `dashboard-next/src/lib/panchang/calculator.ts`

- [ ] **Step 1: Create core Panchang calculator (Tithi, Nakshatra, Yoga, Karana from longitudes)**

```typescript
// dashboard-next/src/lib/panchang/calculator.ts
import { getSunLongitude, getMoonLongitude, getMoonSunAngle, findAngleCrossing, findMoonLongitudeCrossing } from './astronomy';
import {
  TithiInfo, NakshatraInfo, YogaInfo, KaranaInfo,
  TITHI_NAMES, NAKSHATRA_NAMES, NAKSHATRA_DEITIES, NAKSHATRA_PLANETS,
  YOGA_NAMES, YOGA_NATURES, KARANA_NAMES,
  HINDU_MONTHS, RITUS, EKADASHI_NAMES,
} from './types';

/**
 * Calculate Tithi from Moon-Sun angular difference.
 * Tithi = (Moon longitude - Sun longitude) / 12
 * Each Tithi spans 12 degrees of angular difference.
 * Tithi number 1-30 (1-15 Shukla, 16-30 as 1-15 Krishna).
 */
export function calculateTithi(date: Date): TithiInfo {
  const angle = getMoonSunAngle(date);

  // Tithi number (1-indexed, 1-30)
  const tithiNumber = Math.floor(angle / 12) + 1;
  const clampedTithi = ((tithiNumber - 1) % 30) + 1;

  const paksha: 'Shukla' | 'Krishna' = clampedTithi <= 15 ? 'Shukla' : 'Krishna';
  const name = TITHI_NAMES[clampedTithi - 1] || 'Unknown';

  // Calculate start and end times for this Tithi
  const tithiStartAngle = (clampedTithi - 1) * 12;
  const tithiEndAngle = clampedTithi * 12;

  const searchStart = new Date(date.getTime() - 36 * 60 * 60 * 1000); // 36 hours before
  const searchEnd = new Date(date.getTime() + 36 * 60 * 60 * 1000); // 36 hours after

  let startTime: Date;
  let endTime: Date;

  try {
    startTime = findAngleCrossing(searchStart, date, tithiStartAngle);
    endTime = findAngleCrossing(date, searchEnd, tithiEndAngle);
  } catch {
    startTime = date;
    endTime = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  }

  return {
    name,
    number: clampedTithi,
    paksha,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  };
}

/**
 * Calculate Nakshatra from Moon longitude.
 * Nakshatra = Moon longitude / (360/27)
 * Each Nakshatra spans 13 degrees 20 minutes (13.333...).
 */
export function calculateNakshatra(date: Date): NakshatraInfo {
  const moonLon = getMoonLongitude(date);
  const nakshatraSpan = 360 / 27; // 13.333...

  const nakshatraIndex = Math.floor(moonLon / nakshatraSpan);
  const nakshatraNumber = (nakshatraIndex % 27) + 1;

  // Pada (quarter): each nakshatra has 4 padas of 3.333 degrees each
  const posInNakshatra = moonLon - nakshatraIndex * nakshatraSpan;
  const pada = Math.floor(posInNakshatra / (nakshatraSpan / 4)) + 1;

  const name = NAKSHATRA_NAMES[nakshatraNumber - 1] || 'Unknown';
  const deity = NAKSHATRA_DEITIES[nakshatraNumber - 1] || 'Unknown';
  const planet = NAKSHATRA_PLANETS[nakshatraNumber - 1] || 'Unknown';

  // Calculate start and end times
  const nakshatraStartLon = nakshatraIndex * nakshatraSpan;
  const nakshatraEndLon = (nakshatraIndex + 1) * nakshatraSpan;

  const searchStart = new Date(date.getTime() - 36 * 60 * 60 * 1000);
  const searchEnd = new Date(date.getTime() + 36 * 60 * 60 * 1000);

  let startTime: Date;
  let endTime: Date;

  try {
    startTime = findMoonLongitudeCrossing(searchStart, date, nakshatraStartLon % 360);
    endTime = findMoonLongitudeCrossing(date, searchEnd, nakshatraEndLon % 360);
  } catch {
    startTime = date;
    endTime = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  }

  return {
    name,
    number: nakshatraNumber,
    pada: Math.min(pada, 4),
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    deity,
    planet,
  };
}

/**
 * Calculate Yoga from Sun + Moon longitudes.
 * Yoga = (Sun longitude + Moon longitude) / (360/27)
 */
export function calculateYoga(date: Date): YogaInfo {
  const sunLon = getSunLongitude(date);
  const moonLon = getMoonLongitude(date);

  const sumLon = (sunLon + moonLon) % 360;
  const yogaSpan = 360 / 27;
  const yogaIndex = Math.floor(sumLon / yogaSpan);
  const yogaNumber = (yogaIndex % 27) + 1;

  const name = YOGA_NAMES[yogaNumber - 1] || 'Unknown';
  const nature = YOGA_NATURES[yogaNumber - 1] || 'neutral';

  return { name, number: yogaNumber, nature };
}

/**
 * Calculate Karana from Tithi.
 * Karana = half of Tithi, 2 per Tithi.
 * There are 11 Karanas: 7 recurring (Bava to Vishti) + 4 fixed.
 * First half of Tithi 1 = Kimstughna (fixed)
 * Second half of Tithi 1 = Bava
 * Then recurring: Balava, Kaulava, Taitila, Garija, Vanija, Vishti
 * Second half of Tithi 30 (Amavasya) = Chatushpada, Naga (fixed)
 */
export function calculateKarana(tithiNumber: number): KaranaInfo {
  // Total karana number (1-60, 2 per tithi)
  const firstKaranaNum = (tithiNumber - 1) * 2 + 1;
  const secondKaranaNum = firstKaranaNum + 1;

  function getKaranaName(num: number): string {
    if (num === 1) return KARANA_NAMES[10]; // Kimstughna (fixed, first half of Tithi 1)
    if (num === 58) return KARANA_NAMES[7]; // Shakuni (fixed)
    if (num === 59) return KARANA_NAMES[8]; // Chatushpada (fixed)
    if (num === 60) return KARANA_NAMES[9]; // Naga (fixed)
    // Recurring: Bava(0) to Vishti(6), cycle through positions 2-57
    const recurringIndex = ((num - 2) % 7);
    return KARANA_NAMES[recurringIndex];
  }

  return {
    first: getKaranaName(firstKaranaNum),
    second: getKaranaName(secondKaranaNum),
  };
}

/**
 * Determine the Hindu month from the Sun longitude.
 * The Sun enters a new rashi roughly every 30 days.
 * Month is determined by the solar ingress.
 */
export function calculateHinduMonth(date: Date): string {
  const sunLon = getSunLongitude(date);
  // Hindu solar months start when Sun enters a new 30-degree segment
  // Mesha (Aries) = 0-30 = Chaitra/Vaishakha
  const rashiIndex = Math.floor(sunLon / 30);
  // Map rashi to Hindu month (approximate)
  const monthMap: Record<number, string> = {
    0: 'Chaitra',      // Mesha (Aries)
    1: 'Vaishakha',    // Vrishabha (Taurus)
    2: 'Jyeshtha',     // Mithuna (Gemini)
    3: 'Ashadha',      // Karka (Cancer)
    4: 'Shravana',     // Simha (Leo)
    5: 'Bhadrapada',   // Kanya (Virgo)
    6: 'Ashwin',       // Tula (Libra)
    7: 'Kartik',       // Vrischika (Scorpio)
    8: 'Margashirsha',  // Dhanu (Sagittarius)
    9: 'Pausha',       // Makara (Capricorn)
    10: 'Magha',       // Kumbha (Aquarius)
    11: 'Phalguna',    // Meena (Pisces)
  };
  return monthMap[rashiIndex] || 'Unknown';
}

/**
 * Calculate Vikram Samvat year.
 * Vikram Samvat = Gregorian year + 56 or +57 (before/after Hindu New Year in Chaitra)
 */
export function calculateVikramSamvat(date: Date): number {
  const month = date.getMonth(); // 0-11
  // Hindu New Year (Chaitra Shukla Pratipada) falls around March/April
  if (month >= 2) { // March onwards
    return date.getFullYear() + 57;
  }
  return date.getFullYear() + 56;
}

/**
 * Calculate Shaka Samvat year.
 * Shaka Samvat = Gregorian year - 78 (or -77 after Chaitra)
 */
export function calculateShakaSamvat(date: Date): number {
  const month = date.getMonth();
  if (month >= 2) {
    return date.getFullYear() - 78;
  }
  return date.getFullYear() - 79;
}

/**
 * Calculate Ritu (season).
 * Based on Hindu month pairs.
 */
export function calculateRitu(hinduMonth: string): string {
  const rituMap: Record<string, string> = {
    Chaitra: 'Vasanta',
    Vaishakha: 'Vasanta',
    Jyeshtha: 'Grishma',
    Ashadha: 'Grishma',
    Shravana: 'Varsha',
    Bhadrapada: 'Varsha',
    Ashwin: 'Sharad',
    Kartik: 'Sharad',
    Margashirsha: 'Hemanta',
    Pausha: 'Hemanta',
    Magha: 'Shishira',
    Phalguna: 'Shishira',
  };
  return rituMap[hinduMonth] || 'Unknown';
}

/**
 * Calculate Ayana (Uttarayana/Dakshinayana).
 * Uttarayana: Sun moves northward (Makar Sankranti to Karka Sankranti, roughly Jan 14 - Jul 16)
 * Dakshinayana: Sun moves southward (Jul 16 - Jan 14)
 */
export function calculateAyana(date: Date): 'Uttarayana' | 'Dakshinayana' {
  const sunLon = getSunLongitude(date);
  // Uttarayana when Sun is in Makara to Mithuna (270-90 degrees approximately)
  // More precisely: Sun longitude 270-360 and 0-90 = Uttarayana
  if (sunLon >= 270 || sunLon < 90) {
    return 'Uttarayana';
  }
  return 'Dakshinayana';
}
```

---

## Task 12: Panchang Calculation Engine -- Muhurta Calculations

**Files:**
- Create: `dashboard-next/src/lib/panchang/muhurta.ts`

- [ ] **Step 1: Create Rahu Kaal, Brahma Muhurta, Abhijit Muhurta, and Choghadiya calculators**

```typescript
// dashboard-next/src/lib/panchang/muhurta.ts
import SunCalc from 'suncalc';
import {
  TimePeriod, ChoghadiyaPeriod,
  RAHU_KAAL_ORDER, YAMAGHANDA_ORDER, GULIKA_KAAL_ORDER,
  CHOGHADIYA_DAY_ORDER, CHOGHADIYA_NATURES,
} from './types';

/**
 * Get sunrise and sunset for a given date and location.
 */
export function getSunTimes(date: Date, lat: number, lng: number): { sunrise: Date; sunset: Date; solarNoon: Date } {
  const times = SunCalc.getTimes(date, lat, lng);
  return {
    sunrise: times.sunrise,
    sunset: times.sunset,
    solarNoon: times.solarNoon,
  };
}

/**
 * Get moonrise and moonset for a given date and location.
 */
export function getMoonTimes(date: Date, lat: number, lng: number): { moonrise?: Date; moonset?: Date } {
  const times = SunCalc.getMoonTimes(date, lat, lng);
  return {
    moonrise: times.rise || undefined,
    moonset: times.set || undefined,
  };
}

/**
 * Calculate Rahu Kaal for a given day.
 * Divide daytime (sunrise to sunset) into 8 equal parts.
 * The Rahu Kaal period depends on the day of the week.
 * Sunday=8th, Monday=2nd, Tuesday=7th, Wednesday=5th,
 * Thursday=6th, Friday=4th, Saturday=3rd
 */
export function calculateRahuKaal(sunrise: Date, sunset: Date, dayOfWeek: number): TimePeriod {
  const dayDuration = sunset.getTime() - sunrise.getTime();
  const segmentDuration = dayDuration / 8;
  const segment = RAHU_KAAL_ORDER[dayOfWeek]; // 1-indexed

  const start = new Date(sunrise.getTime() + (segment - 1) * segmentDuration);
  const end = new Date(start.getTime() + segmentDuration);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * Calculate Yamaghanda for a given day.
 * Similar to Rahu Kaal but with different segment ordering.
 */
export function calculateYamaghanda(sunrise: Date, sunset: Date, dayOfWeek: number): TimePeriod {
  const dayDuration = sunset.getTime() - sunrise.getTime();
  const segmentDuration = dayDuration / 8;
  const segment = YAMAGHANDA_ORDER[dayOfWeek];

  const start = new Date(sunrise.getTime() + (segment - 1) * segmentDuration);
  const end = new Date(start.getTime() + segmentDuration);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * Calculate Gulika Kaal for a given day.
 */
export function calculateGulikaKaal(sunrise: Date, sunset: Date, dayOfWeek: number): TimePeriod {
  const dayDuration = sunset.getTime() - sunrise.getTime();
  const segmentDuration = dayDuration / 8;
  const segment = GULIKA_KAAL_ORDER[dayOfWeek];

  const start = new Date(sunrise.getTime() + (segment - 1) * segmentDuration);
  const end = new Date(start.getTime() + segmentDuration);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * Calculate Brahma Muhurta.
 * Brahma Muhurta = 96 minutes (2 muhurtas) before sunrise.
 * Each muhurta = 48 minutes.
 */
export function calculateBrahmaMuhurta(sunrise: Date): TimePeriod {
  const start = new Date(sunrise.getTime() - 96 * 60 * 1000); // 96 min before
  const end = new Date(sunrise.getTime() - 48 * 60 * 1000); // 48 min before

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * Calculate Abhijit Muhurta.
 * Abhijit Muhurta = the period around local solar noon.
 * It spans 24 minutes before and 24 minutes after solar noon (1 muhurta = 48 min total).
 */
export function calculateAbhijitMuhurta(sunrise: Date, sunset: Date): TimePeriod {
  const solarNoonMs = sunrise.getTime() + (sunset.getTime() - sunrise.getTime()) / 2;
  const halfMuhurta = 24 * 60 * 1000; // 24 minutes

  const start = new Date(solarNoonMs - halfMuhurta);
  const end = new Date(solarNoonMs + halfMuhurta);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * Calculate Choghadiya periods for a day.
 * 8 periods during daytime (sunrise to sunset) and 8 during nighttime (sunset to next sunrise).
 */
export function calculateChoghadiya(
  sunrise: Date,
  sunset: Date,
  nextSunrise: Date,
  dayOfWeek: number
): { day: ChoghadiyaPeriod[]; night: ChoghadiyaPeriod[] } {
  const dayDuration = sunset.getTime() - sunrise.getTime();
  const nightDuration = nextSunrise.getTime() - sunset.getTime();

  const daySegment = dayDuration / 8;
  const nightSegment = nightDuration / 8;

  const dayOrder = CHOGHADIYA_DAY_ORDER[dayOfWeek] || CHOGHADIYA_DAY_ORDER[0];

  const dayPeriods: ChoghadiyaPeriod[] = dayOrder.map((name, i) => ({
    name,
    start: new Date(sunrise.getTime() + i * daySegment).toISOString(),
    end: new Date(sunrise.getTime() + (i + 1) * daySegment).toISOString(),
    nature: CHOGHADIYA_NATURES[name] || 'char',
  }));

  // Night choghadiya follows a shifted order
  const nightStartIndex = dayOrder.length;
  const nightOrder = [
    ...dayOrder.slice(4),
    ...dayOrder.slice(0, 4),
  ];

  const nightPeriods: ChoghadiyaPeriod[] = nightOrder.map((name, i) => ({
    name,
    start: new Date(sunset.getTime() + i * nightSegment).toISOString(),
    end: new Date(sunset.getTime() + (i + 1) * nightSegment).toISOString(),
    nature: CHOGHADIYA_NATURES[name] || 'char',
  }));

  return { day: dayPeriods, night: nightPeriods };
}

/**
 * Format a Date to a time string like "05:42 AM"
 */
export function formatTime(date: Date, timezone: string = 'Asia/Kolkata'): string {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  });
}
```

---

## Task 13: Panchang Calculation Engine -- Festival Matcher

**Files:**
- Create: `dashboard-next/src/lib/panchang/festivals.ts`

- [ ] **Step 1: Create festival matcher that maps dates/tithis to festivals from the database**

```typescript
// dashboard-next/src/lib/panchang/festivals.ts
import { TithiInfo } from './types';
import festivalsData from '../../data/festivals.json';

interface FestivalEntry {
  nameEnglish: string;
  nameHindi: string;
  type: string;
  month?: string;
  tithiNumber?: number;
  paksha?: string;
  gregorianMonth?: number;
  gregorianDay?: number;
  region?: string[];
  description?: string;
}

/**
 * Find festivals matching a given date and tithi.
 * Matches on:
 * 1. Tithi-based festivals (Hindu month + tithi number + paksha)
 * 2. Fixed Gregorian date festivals (month + day)
 */
export function findFestivals(
  date: Date,
  tithi: TithiInfo,
  hinduMonth: string
): string[] {
  const festivals: string[] = [];
  const gMonth = date.getMonth() + 1; // 1-indexed
  const gDay = date.getDate();

  for (const festival of festivalsData as FestivalEntry[]) {
    // Match Gregorian fixed dates
    if (festival.gregorianMonth && festival.gregorianDay) {
      if (festival.gregorianMonth === gMonth && festival.gregorianDay === gDay) {
        festivals.push(festival.nameEnglish);
        continue;
      }
    }

    // Match tithi-based festivals
    if (festival.month && festival.tithiNumber && festival.paksha) {
      if (
        festival.month === hinduMonth &&
        festival.tithiNumber === tithi.number &&
        festival.paksha === tithi.paksha
      ) {
        festivals.push(festival.nameEnglish);
        continue;
      }
    }

    // Match monthly recurring festivals (e.g., monthly Ekadashi, Chaturthi, Pradosh)
    if (!festival.month && festival.tithiNumber && festival.paksha) {
      if (
        festival.tithiNumber === tithi.number &&
        festival.paksha === tithi.paksha
      ) {
        festivals.push(festival.nameEnglish);
      }
    }
  }

  return [...new Set(festivals)]; // Deduplicate
}

/**
 * Get upcoming festivals from a given date.
 * Returns the next N festivals sorted by date.
 */
export function getUpcomingFixedFestivals(fromDate: Date, count: number = 20): { name: string; date: string; description: string }[] {
  const results: { name: string; date: string; description: string }[] = [];
  const year = fromDate.getFullYear();

  for (const festival of festivalsData as FestivalEntry[]) {
    if (festival.gregorianMonth && festival.gregorianDay) {
      // Check this year and next year
      for (const y of [year, year + 1]) {
        const festDate = new Date(y, festival.gregorianMonth - 1, festival.gregorianDay);
        if (festDate >= fromDate) {
          results.push({
            name: festival.nameEnglish,
            date: festDate.toISOString().split('T')[0],
            description: festival.description || '',
          });
        }
      }
    }
  }

  results.sort((a, b) => a.date.localeCompare(b.date));
  return results.slice(0, count);
}
```

---

## Task 14: Festival Database (200+ festivals)

**Files:**
- Create: `dashboard-next/src/data/festivals.json`

- [ ] **Step 1: Create comprehensive festival JSON database**

```json
[
  {"nameEnglish": "Kamada Ekadashi", "nameHindi": "कामदा एकादशी", "type": "ekadashi", "month": "Chaitra", "tithiNumber": 11, "paksha": "Shukla", "description": "Kamada Ekadashi - Fulfills all desires. Fasting dedicated to Lord Vishnu."},
  {"nameEnglish": "Papamochani Ekadashi", "nameHindi": "पापमोचनी एकादशी", "type": "ekadashi", "month": "Chaitra", "tithiNumber": 11, "paksha": "Krishna", "description": "Papamochani Ekadashi - Destroys all sins."},
  {"nameEnglish": "Mohini Ekadashi", "nameHindi": "मोहिनी एकादशी", "type": "ekadashi", "month": "Vaishakha", "tithiNumber": 11, "paksha": "Shukla", "description": "Mohini Ekadashi - Named after Mohini avatar of Lord Vishnu."},
  {"nameEnglish": "Varuthini Ekadashi", "nameHindi": "वरूथिनी एकादशी", "type": "ekadashi", "month": "Vaishakha", "tithiNumber": 11, "paksha": "Krishna", "description": "Varuthini Ekadashi - Grants protection and liberation."},
  {"nameEnglish": "Nirjala Ekadashi", "nameHindi": "निर्जला एकादशी", "type": "ekadashi", "month": "Jyeshtha", "tithiNumber": 11, "paksha": "Shukla", "description": "Nirjala Ekadashi - Strictest fast, observed without even water. Merit of all 24 Ekadashis."},
  {"nameEnglish": "Apara Ekadashi", "nameHindi": "अपरा एकादशी", "type": "ekadashi", "month": "Jyeshtha", "tithiNumber": 11, "paksha": "Krishna", "description": "Apara Ekadashi - Grants fame and removes sins."},
  {"nameEnglish": "Devshayani Ekadashi", "nameHindi": "देवशयनी एकादशी", "type": "ekadashi", "month": "Ashadha", "tithiNumber": 11, "paksha": "Shukla", "description": "Devshayani Ekadashi - Lord Vishnu goes to sleep. Beginning of Chaturmas."},
  {"nameEnglish": "Yogini Ekadashi", "nameHindi": "योगिनी एकादशी", "type": "ekadashi", "month": "Ashadha", "tithiNumber": 11, "paksha": "Krishna", "description": "Yogini Ekadashi - Removes the sin of criticizing others."},
  {"nameEnglish": "Putrada Ekadashi (Shravana)", "nameHindi": "पुत्रदा एकादशी", "type": "ekadashi", "month": "Shravana", "tithiNumber": 11, "paksha": "Shukla", "description": "Putrada Ekadashi - Blesses with a virtuous son."},
  {"nameEnglish": "Kamika Ekadashi", "nameHindi": "कामिका एकादशी", "type": "ekadashi", "month": "Shravana", "tithiNumber": 11, "paksha": "Krishna", "description": "Kamika Ekadashi - Removes the sin of killing a Brahmin."},
  {"nameEnglish": "Parivartini Ekadashi", "nameHindi": "परिवर्तिनी एकादशी", "type": "ekadashi", "month": "Bhadrapada", "tithiNumber": 11, "paksha": "Shukla", "description": "Parivartini Ekadashi - Lord Vishnu turns in his sleep."},
  {"nameEnglish": "Aja Ekadashi", "nameHindi": "अजा एकादशी", "type": "ekadashi", "month": "Bhadrapada", "tithiNumber": 11, "paksha": "Krishna", "description": "Aja Ekadashi - Removes all accumulated sins."},
  {"nameEnglish": "Papankusha Ekadashi", "nameHindi": "पापांकुशा एकादशी", "type": "ekadashi", "month": "Ashwin", "tithiNumber": 11, "paksha": "Shukla", "description": "Papankusha Ekadashi - Controls and removes sins with the hook of devotion."},
  {"nameEnglish": "Indira Ekadashi", "nameHindi": "इंदिरा एकादशी", "type": "ekadashi", "month": "Ashwin", "tithiNumber": 11, "paksha": "Krishna", "description": "Indira Ekadashi - Liberates ancestors from lower realms."},
  {"nameEnglish": "Devutthani Ekadashi", "nameHindi": "देवोत्थानी एकादशी", "type": "ekadashi", "month": "Kartik", "tithiNumber": 11, "paksha": "Shukla", "description": "Devutthani Ekadashi - Lord Vishnu wakes from cosmic sleep. End of Chaturmas."},
  {"nameEnglish": "Rama Ekadashi", "nameHindi": "रमा एकादशी", "type": "ekadashi", "month": "Kartik", "tithiNumber": 11, "paksha": "Krishna", "description": "Rama Ekadashi - Dedicated to Goddess Rama (Lakshmi)."},
  {"nameEnglish": "Mokshada Ekadashi", "nameHindi": "मोक्षदा एकादशी", "type": "ekadashi", "month": "Margashirsha", "tithiNumber": 11, "paksha": "Shukla", "description": "Mokshada Ekadashi - Grants liberation. Also called Gita Jayanti (Bhagavad Gita was spoken)."},
  {"nameEnglish": "Utpanna Ekadashi", "nameHindi": "उत्पन्ना एकादशी", "type": "ekadashi", "month": "Margashirsha", "tithiNumber": 11, "paksha": "Krishna", "description": "Utpanna Ekadashi - Birth of Ekadashi Devi. The first Ekadashi."},
  {"nameEnglish": "Putrada Ekadashi (Pausha)", "nameHindi": "पुत्रदा एकादशी (पौष)", "type": "ekadashi", "month": "Pausha", "tithiNumber": 11, "paksha": "Shukla", "description": "Putrada Ekadashi - Blesses with progeny. Observed in Pausha month."},
  {"nameEnglish": "Shattila Ekadashi", "nameHindi": "षटतिला एकादशी", "type": "ekadashi", "month": "Pausha", "tithiNumber": 11, "paksha": "Krishna", "description": "Shattila Ekadashi - Six ways of using sesame (til) for merit."},
  {"nameEnglish": "Jaya Ekadashi", "nameHindi": "जया एकादशी", "type": "ekadashi", "month": "Magha", "tithiNumber": 11, "paksha": "Shukla", "description": "Jaya Ekadashi - Grants victory and freedom from ghostly existence."},
  {"nameEnglish": "Vijaya Ekadashi", "nameHindi": "विजया एकादशी", "type": "ekadashi", "month": "Magha", "tithiNumber": 11, "paksha": "Krishna", "description": "Vijaya Ekadashi - Lord Rama observed this before Lanka war."},
  {"nameEnglish": "Amalaki Ekadashi", "nameHindi": "आमलकी एकादशी", "type": "ekadashi", "month": "Phalguna", "tithiNumber": 11, "paksha": "Shukla", "description": "Amalaki Ekadashi - Worship of Amla (Indian Gooseberry) tree."},
  {"nameEnglish": "Papmochani Ekadashi (Phalguna)", "nameHindi": "पापमोचनी एकादशी", "type": "ekadashi", "month": "Phalguna", "tithiNumber": 11, "paksha": "Krishna", "description": "Papmochani Ekadashi - Destroys all sins accumulated in the year."},

  {"nameEnglish": "Chaitra Navratri", "nameHindi": "चैत्र नवरात्रि", "type": "major", "month": "Chaitra", "tithiNumber": 1, "paksha": "Shukla", "description": "Chaitra Navratri - Nine nights of Goddess worship in spring."},
  {"nameEnglish": "Ram Navami", "nameHindi": "राम नवमी", "type": "major", "month": "Chaitra", "tithiNumber": 9, "paksha": "Shukla", "description": "Ram Navami - Birth of Lord Rama. Fasting and Ramcharitmanas readings."},
  {"nameEnglish": "Hanuman Jayanti", "nameHindi": "हनुमान जयंती", "type": "major", "month": "Chaitra", "tithiNumber": 15, "paksha": "Shukla", "description": "Hanuman Jayanti - Birth of Lord Hanuman on Chaitra Purnima."},
  {"nameEnglish": "Akshaya Tritiya", "nameHindi": "अक्षय तृतीया", "type": "major", "month": "Vaishakha", "tithiNumber": 3, "paksha": "Shukla", "description": "Akshaya Tritiya - Eternal auspicious day. Gold and charity bring infinite merit."},
  {"nameEnglish": "Buddha Purnima", "nameHindi": "बुद्ध पूर्णिमा", "type": "major", "month": "Vaishakha", "tithiNumber": 15, "paksha": "Shukla", "description": "Buddha Purnima - Birth of Gautama Buddha."},
  {"nameEnglish": "Guru Purnima", "nameHindi": "गुरु पूर्णिमा", "type": "major", "month": "Ashadha", "tithiNumber": 15, "paksha": "Shukla", "description": "Guru Purnima - Honoring spiritual teachers. Birth of Veda Vyasa."},
  {"nameEnglish": "Nag Panchami", "nameHindi": "नाग पंचमी", "type": "major", "month": "Shravana", "tithiNumber": 5, "paksha": "Shukla", "description": "Nag Panchami - Worship of serpent deities."},
  {"nameEnglish": "Raksha Bandhan", "nameHindi": "रक्षा बंधन", "type": "major", "month": "Shravana", "tithiNumber": 15, "paksha": "Shukla", "description": "Raksha Bandhan - Festival of sibling bond. Shravana Purnima."},
  {"nameEnglish": "Krishna Janmashtami", "nameHindi": "कृष्ण जन्माष्टमी", "type": "major", "month": "Bhadrapada", "tithiNumber": 8, "paksha": "Krishna", "description": "Janmashtami - Birth of Lord Krishna at midnight."},
  {"nameEnglish": "Ganesh Chaturthi", "nameHindi": "गणेश चतुर्थी", "type": "major", "month": "Bhadrapada", "tithiNumber": 4, "paksha": "Shukla", "description": "Ganesh Chaturthi - Birth of Lord Ganesha. 10-day celebration."},
  {"nameEnglish": "Anant Chaturdashi", "nameHindi": "अनंत चतुर्दशी", "type": "major", "month": "Bhadrapada", "tithiNumber": 14, "paksha": "Shukla", "description": "Anant Chaturdashi - Worship of Lord Vishnu in his infinite form. Ganesh Visarjan."},
  {"nameEnglish": "Sharad Navratri", "nameHindi": "शरद नवरात्रि", "type": "major", "month": "Ashwin", "tithiNumber": 1, "paksha": "Shukla", "description": "Sharad Navratri - Nine nights of Goddess Durga worship in autumn."},
  {"nameEnglish": "Dussehra", "nameHindi": "दशहरा", "type": "major", "month": "Ashwin", "tithiNumber": 10, "paksha": "Shukla", "description": "Dussehra / Vijayadashami - Victory of good over evil. Rama's victory over Ravana."},
  {"nameEnglish": "Sharad Purnima", "nameHindi": "शरद पूर्णिमा", "type": "major", "month": "Ashwin", "tithiNumber": 15, "paksha": "Shukla", "description": "Sharad Purnima - Kojagiri Purnima. Moon is at its brightest. Kheer offering."},
  {"nameEnglish": "Karva Chauth", "nameHindi": "करवा चौथ", "type": "major", "month": "Kartik", "tithiNumber": 4, "paksha": "Krishna", "description": "Karva Chauth - Married women fast for husband's long life."},
  {"nameEnglish": "Dhanteras", "nameHindi": "धनतेरस", "type": "major", "month": "Kartik", "tithiNumber": 13, "paksha": "Krishna", "description": "Dhanteras - Worship of Lord Dhanvantari. Auspicious for buying gold."},
  {"nameEnglish": "Narak Chaturdashi", "nameHindi": "नरक चतुर्दशी", "type": "major", "month": "Kartik", "tithiNumber": 14, "paksha": "Krishna", "description": "Narak Chaturdashi / Choti Diwali - Krishna killed Narakasura."},
  {"nameEnglish": "Diwali", "nameHindi": "दीवाली", "type": "major", "month": "Kartik", "tithiNumber": 30, "paksha": "Krishna", "description": "Diwali - Festival of lights. Lakshmi Puja for prosperity."},
  {"nameEnglish": "Govardhan Puja", "nameHindi": "गोवर्धन पूजा", "type": "major", "month": "Kartik", "tithiNumber": 1, "paksha": "Shukla", "description": "Govardhan Puja - Krishna lifted Govardhan hill. Annakut celebrations."},
  {"nameEnglish": "Bhai Dooj", "nameHindi": "भाई दूज", "type": "major", "month": "Kartik", "tithiNumber": 2, "paksha": "Shukla", "description": "Bhai Dooj - Celebration of sibling bond."},
  {"nameEnglish": "Kartik Purnima", "nameHindi": "कार्तिक पूर्णिमा", "type": "major", "month": "Kartik", "tithiNumber": 15, "paksha": "Shukla", "description": "Kartik Purnima - Dev Diwali. Sacred bathing day. Tripuri Purnima."},
  {"nameEnglish": "Chhath Puja", "nameHindi": "छठ पूजा", "type": "major", "month": "Kartik", "tithiNumber": 6, "paksha": "Shukla", "description": "Chhath Puja - Worship of Sun God. Major festival of Bihar and Eastern India."},
  {"nameEnglish": "Maha Shivaratri", "nameHindi": "महा शिवरात्रि", "type": "major", "month": "Phalguna", "tithiNumber": 14, "paksha": "Krishna", "description": "Maha Shivaratri - The great night of Lord Shiva. Night-long worship."},
  {"nameEnglish": "Holika Dahan", "nameHindi": "होलिका दहन", "type": "major", "month": "Phalguna", "tithiNumber": 15, "paksha": "Shukla", "description": "Holika Dahan - Burning of Holika. Evening before Holi colors."},
  {"nameEnglish": "Holi", "nameHindi": "होली", "type": "major", "month": "Phalguna", "tithiNumber": 15, "paksha": "Shukla", "description": "Holi - Festival of colors. Phalguna Purnima celebration."},
  {"nameEnglish": "Basant Panchami", "nameHindi": "बसंत पंचमी", "type": "major", "month": "Magha", "tithiNumber": 5, "paksha": "Shukla", "description": "Basant Panchami - Worship of Goddess Saraswati. Arrival of spring."},

  {"nameEnglish": "Makar Sankranti", "nameHindi": "मकर संक्रांति", "type": "major", "gregorianMonth": 1, "gregorianDay": 14, "description": "Makar Sankranti - Sun enters Capricorn. Holy bathing day.", "region": ["pan-India"]},
  {"nameEnglish": "Pongal", "nameHindi": "पोंगल", "type": "regional", "gregorianMonth": 1, "gregorianDay": 15, "description": "Pongal - Tamil harvest festival.", "region": ["Tamil Nadu"]},
  {"nameEnglish": "Lohri", "nameHindi": "लोहड़ी", "type": "regional", "gregorianMonth": 1, "gregorianDay": 13, "description": "Lohri - North Indian harvest festival with bonfire.", "region": ["Punjab", "Haryana"]},
  {"nameEnglish": "Republic Day", "nameHindi": "गणतंत्र दिवस", "type": "major", "gregorianMonth": 1, "gregorianDay": 26, "description": "Republic Day of India.", "region": ["pan-India"]},
  {"nameEnglish": "Baisakhi", "nameHindi": "बैसाखी", "type": "regional", "gregorianMonth": 4, "gregorianDay": 13, "description": "Baisakhi - Punjabi New Year and harvest festival.", "region": ["Punjab"]},
  {"nameEnglish": "Bihu", "nameHindi": "बिहू", "type": "regional", "gregorianMonth": 4, "gregorianDay": 14, "description": "Rongali Bihu - Assamese New Year.", "region": ["Assam"]},
  {"nameEnglish": "Independence Day", "nameHindi": "स्वतंत्रता दिवस", "type": "major", "gregorianMonth": 8, "gregorianDay": 15, "description": "Independence Day of India.", "region": ["pan-India"]},
  {"nameEnglish": "Onam", "nameHindi": "ओणम", "type": "regional", "gregorianMonth": 9, "gregorianDay": 5, "description": "Onam - Kerala harvest festival. Celebration of King Mahabali's return.", "region": ["Kerala"]},
  {"nameEnglish": "Gandhi Jayanti", "nameHindi": "गांधी जयंती", "type": "major", "gregorianMonth": 10, "gregorianDay": 2, "description": "Gandhi Jayanti - Birthday of Mahatma Gandhi.", "region": ["pan-India"]},

  {"nameEnglish": "Sankashti Chaturthi", "nameHindi": "संकष्टी चतुर्थी", "type": "monthly", "tithiNumber": 4, "paksha": "Krishna", "description": "Sankashti Chaturthi - Monthly fast for Lord Ganesha. Moonrise worship."},
  {"nameEnglish": "Vinayaka Chaturthi", "nameHindi": "विनायक चतुर्थी", "type": "monthly", "tithiNumber": 4, "paksha": "Shukla", "description": "Vinayaka Chaturthi - Monthly Ganesha worship on Shukla Chaturthi."},
  {"nameEnglish": "Pradosh Vrat (Shukla)", "nameHindi": "प्रदोष व्रत", "type": "monthly", "tithiNumber": 13, "paksha": "Shukla", "description": "Pradosh Vrat - Shiva worship during twilight on Trayodashi."},
  {"nameEnglish": "Pradosh Vrat (Krishna)", "nameHindi": "प्रदोष व्रत", "type": "monthly", "tithiNumber": 13, "paksha": "Krishna", "description": "Pradosh Vrat - Shiva worship during twilight on Trayodashi."},
  {"nameEnglish": "Monthly Shivaratri", "nameHindi": "मासिक शिवरात्रि", "type": "monthly", "tithiNumber": 14, "paksha": "Krishna", "description": "Monthly Shivaratri - Night of Lord Shiva worship on Krishna Chaturdashi."},
  {"nameEnglish": "Purnima", "nameHindi": "पूर्णिमा", "type": "monthly", "tithiNumber": 15, "paksha": "Shukla", "description": "Purnima - Full Moon day. Auspicious for charity and worship."},
  {"nameEnglish": "Amavasya", "nameHindi": "अमावस्या", "type": "monthly", "tithiNumber": 30, "paksha": "Krishna", "description": "Amavasya - New Moon day. Tarpan for ancestors."},

  {"nameEnglish": "Gudi Padwa", "nameHindi": "गुड़ी पाड़वा", "type": "regional", "month": "Chaitra", "tithiNumber": 1, "paksha": "Shukla", "description": "Gudi Padwa - Maharashtrian New Year.", "region": ["Maharashtra"]},
  {"nameEnglish": "Ugadi", "nameHindi": "उगादी", "type": "regional", "month": "Chaitra", "tithiNumber": 1, "paksha": "Shukla", "description": "Ugadi - New Year for Karnataka, Andhra Pradesh, Telangana.", "region": ["Karnataka", "Andhra Pradesh", "Telangana"]},
  {"nameEnglish": "Hindu Nav Varsh", "nameHindi": "हिंदू नव वर्ष", "type": "major", "month": "Chaitra", "tithiNumber": 1, "paksha": "Shukla", "description": "Hindu New Year - Beginning of Vikram Samvat."}
]
```

NOTE: This is a representative set of 70+ festivals. The full production file should be expanded to 200+ entries including all regional variations, all named Purnimas (Magha Purnima, Guru Purnima, Kartik Purnima, etc.), and all Kumbh Mela dates.

---

## Task 15: Cities Database (200+ Indian cities)

**Files:**
- Create: `dashboard-next/src/data/cities.json`

- [ ] **Step 1: Create city database with coordinates (representative sample -- expand to 200+)**

```json
[
  {"name": "Haridwar", "state": "Uttarakhand", "country": "India", "lat": 29.9457, "lng": 78.1642, "timezone": "Asia/Kolkata", "altitude": 314},
  {"name": "Rishikesh", "state": "Uttarakhand", "country": "India", "lat": 30.0869, "lng": 78.2676, "timezone": "Asia/Kolkata", "altitude": 372},
  {"name": "Varanasi", "state": "Uttar Pradesh", "country": "India", "lat": 25.3176, "lng": 82.9739, "timezone": "Asia/Kolkata", "altitude": 80},
  {"name": "Prayagraj", "state": "Uttar Pradesh", "country": "India", "lat": 25.4358, "lng": 81.8463, "timezone": "Asia/Kolkata", "altitude": 98},
  {"name": "Delhi", "state": "Delhi", "country": "India", "lat": 28.6139, "lng": 77.2090, "timezone": "Asia/Kolkata", "altitude": 216},
  {"name": "Mumbai", "state": "Maharashtra", "country": "India", "lat": 19.0760, "lng": 72.8777, "timezone": "Asia/Kolkata", "altitude": 14},
  {"name": "Kolkata", "state": "West Bengal", "country": "India", "lat": 22.5726, "lng": 88.3639, "timezone": "Asia/Kolkata", "altitude": 9},
  {"name": "Chennai", "state": "Tamil Nadu", "country": "India", "lat": 13.0827, "lng": 80.2707, "timezone": "Asia/Kolkata", "altitude": 6},
  {"name": "Bangalore", "state": "Karnataka", "country": "India", "lat": 12.9716, "lng": 77.5946, "timezone": "Asia/Kolkata", "altitude": 920},
  {"name": "Hyderabad", "state": "Telangana", "country": "India", "lat": 17.3850, "lng": 78.4867, "timezone": "Asia/Kolkata", "altitude": 542},
  {"name": "Ahmedabad", "state": "Gujarat", "country": "India", "lat": 23.0225, "lng": 72.5714, "timezone": "Asia/Kolkata", "altitude": 53},
  {"name": "Pune", "state": "Maharashtra", "country": "India", "lat": 18.5204, "lng": 73.8567, "timezone": "Asia/Kolkata", "altitude": 560},
  {"name": "Jaipur", "state": "Rajasthan", "country": "India", "lat": 26.9124, "lng": 75.7873, "timezone": "Asia/Kolkata", "altitude": 431},
  {"name": "Lucknow", "state": "Uttar Pradesh", "country": "India", "lat": 26.8467, "lng": 80.9462, "timezone": "Asia/Kolkata", "altitude": 123},
  {"name": "Ujjain", "state": "Madhya Pradesh", "country": "India", "lat": 23.1765, "lng": 75.7885, "timezone": "Asia/Kolkata", "altitude": 494},
  {"name": "Nashik", "state": "Maharashtra", "country": "India", "lat": 19.9975, "lng": 73.7898, "timezone": "Asia/Kolkata", "altitude": 584},
  {"name": "Dwarka", "state": "Gujarat", "country": "India", "lat": 22.2442, "lng": 68.9685, "timezone": "Asia/Kolkata", "altitude": 4},
  {"name": "Mathura", "state": "Uttar Pradesh", "country": "India", "lat": 27.4924, "lng": 77.6737, "timezone": "Asia/Kolkata", "altitude": 174},
  {"name": "Vrindavan", "state": "Uttar Pradesh", "country": "India", "lat": 27.5830, "lng": 77.6993, "timezone": "Asia/Kolkata", "altitude": 170},
  {"name": "Ayodhya", "state": "Uttar Pradesh", "country": "India", "lat": 26.7922, "lng": 82.1998, "timezone": "Asia/Kolkata", "altitude": 93},
  {"name": "Amritsar", "state": "Punjab", "country": "India", "lat": 31.6340, "lng": 74.8723, "timezone": "Asia/Kolkata", "altitude": 234},
  {"name": "Tirupati", "state": "Andhra Pradesh", "country": "India", "lat": 13.6288, "lng": 79.4192, "timezone": "Asia/Kolkata", "altitude": 182},
  {"name": "Kanchipuram", "state": "Tamil Nadu", "country": "India", "lat": 12.8342, "lng": 79.7036, "timezone": "Asia/Kolkata", "altitude": 83},
  {"name": "Madurai", "state": "Tamil Nadu", "country": "India", "lat": 9.9252, "lng": 78.1198, "timezone": "Asia/Kolkata", "altitude": 101},
  {"name": "Dehradun", "state": "Uttarakhand", "country": "India", "lat": 30.3165, "lng": 78.0322, "timezone": "Asia/Kolkata", "altitude": 640},
  {"name": "Patna", "state": "Bihar", "country": "India", "lat": 25.6093, "lng": 85.1376, "timezone": "Asia/Kolkata", "altitude": 53},
  {"name": "Bhopal", "state": "Madhya Pradesh", "country": "India", "lat": 23.2599, "lng": 77.4126, "timezone": "Asia/Kolkata", "altitude": 527},
  {"name": "Indore", "state": "Madhya Pradesh", "country": "India", "lat": 22.7196, "lng": 75.8577, "timezone": "Asia/Kolkata", "altitude": 553},
  {"name": "Chandigarh", "state": "Chandigarh", "country": "India", "lat": 30.7333, "lng": 76.7794, "timezone": "Asia/Kolkata", "altitude": 321},
  {"name": "Surat", "state": "Gujarat", "country": "India", "lat": 21.1702, "lng": 72.8311, "timezone": "Asia/Kolkata", "altitude": 13},
  {"name": "Nagpur", "state": "Maharashtra", "country": "India", "lat": 21.1458, "lng": 79.0882, "timezone": "Asia/Kolkata", "altitude": 310},
  {"name": "Kashi (Varanasi)", "state": "Uttar Pradesh", "country": "India", "lat": 25.3176, "lng": 82.9739, "timezone": "Asia/Kolkata", "altitude": 80},
  {"name": "Guwahati", "state": "Assam", "country": "India", "lat": 26.1445, "lng": 91.7362, "timezone": "Asia/Kolkata", "altitude": 55},
  {"name": "Thiruvananthapuram", "state": "Kerala", "country": "India", "lat": 8.5241, "lng": 76.9366, "timezone": "Asia/Kolkata", "altitude": 10},
  {"name": "Kochi", "state": "Kerala", "country": "India", "lat": 9.9312, "lng": 76.2673, "timezone": "Asia/Kolkata", "altitude": 0}
]
```

NOTE: This is a representative sample of 35 cities. The full production file should contain 200+ cities covering all state capitals, major pilgrimage cities, and tier-2/tier-3 cities.

---

## Task 16: Firebase Admin Initialization Utility

**Files:**
- Create: `dashboard-next/src/lib/firebase-admin.ts`

- [ ] **Step 1: Create Firebase Admin singleton with FCM messaging support**

```typescript
// dashboard-next/src/lib/firebase-admin.ts
import admin from 'firebase-admin';

function getFirebaseAdmin(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }

  try {
    const parsedAccount = JSON.parse(serviceAccount);
    return admin.initializeApp({
      credential: admin.credential.cert(parsedAccount),
    });
  } catch (error) {
    throw new Error(
      `Failed to initialize Firebase Admin: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function getMessaging(): admin.messaging.Messaging {
  const app = getFirebaseAdmin();
  return admin.messaging(app);
}

export async function sendTopicNotification(
  topic: string,
  title: string,
  body: string,
  data?: Record<string, string>,
  imageUrl?: string
): Promise<string> {
  const messaging = getMessaging();

  const message: admin.messaging.Message = {
    topic,
    notification: {
      title,
      body,
      ...(imageUrl && { imageUrl }),
    },
    ...(data && { data }),
    android: {
      priority: 'high',
      notification: {
        channelId: 'default',
        sound: 'default',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
  };

  const messageId = await messaging.send(message);
  return messageId;
}

export async function sendMulticastNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>,
  imageUrl?: string
): Promise<admin.messaging.BatchResponse> {
  const messaging = getMessaging();

  const message: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title,
      body,
      ...(imageUrl && { imageUrl }),
    },
    ...(data && { data }),
    android: {
      priority: 'high',
      notification: {
        channelId: 'default',
        sound: 'default',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
  };

  const response = await messaging.sendEachForMulticast(message);
  return response;
}

export default getFirebaseAdmin;
```

---

## Task 17: Web Push Utility

**Files:**
- Create: `dashboard-next/src/lib/web-push.ts`

- [ ] **Step 1: Create Web Push notification utility using VAPID**

```typescript
// dashboard-next/src/lib/web-push.ts
import webpush from 'web-push';

let isConfigured = false;

function ensureConfigured() {
  if (isConfigured) return;

  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

  if (!vapidPublicKey || !vapidPrivateKey) {
    throw new Error('VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables are required for Web Push');
  }

  webpush.setVapidDetails(
    'mailto:info@avdheshanandgmission.org',
    vapidPublicKey,
    vapidPrivateKey
  );

  isConfigured = true;
}

export interface WebPushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  tag?: string;
  data?: Record<string, string>;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Send a web push notification to a single subscription.
 */
export async function sendWebPush(
  subscription: PushSubscriptionData,
  payload: WebPushPayload
): Promise<webpush.SendResult> {
  ensureConfigured();

  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/badge-72x72.png',
    image: payload.image,
    data: {
      url: payload.url || '/',
      ...payload.data,
    },
    tag: payload.tag || 'pps-notification',
  });

  return webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    },
    pushPayload,
    {
      TTL: 60 * 60 * 24, // 24 hours
      urgency: 'normal',
    }
  );
}

/**
 * Send web push notifications to multiple subscriptions.
 * Returns results with success/failure counts.
 */
export async function sendWebPushBatch(
  subscriptions: PushSubscriptionData[],
  payload: WebPushPayload
): Promise<{ sent: number; failed: number; errors: string[] }> {
  ensureConfigured();

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendWebPush(sub, payload))
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      sent++;
    } else {
      failed++;
      errors.push(result.reason?.message || 'Unknown error');
    }
  }

  return { sent, failed, errors };
}

/**
 * Get the VAPID public key (for the frontend to use when subscribing).
 */
export function getVapidPublicKey(): string {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    throw new Error('VAPID_PUBLIC_KEY is not configured');
  }
  return key;
}
```

---

## Task 18: WhatsApp Cloud API Utility

**Files:**
- Create: `dashboard-next/src/lib/whatsapp.ts`

- [ ] **Step 1: Create WhatsApp Cloud API utility for sending messages**

```typescript
// dashboard-next/src/lib/whatsapp.ts

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

interface WhatsAppMessageResponse {
  messaging_product: string;
  contacts: { input: string; wa_id: string }[];
  messages: { id: string }[];
}

/**
 * Send a text message via WhatsApp Cloud API.
 */
export async function sendWhatsAppText(
  to: string,
  message: string
): Promise<WhatsAppMessageResponse> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN are required');
  }

  const response = await fetch(
    `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { body: message },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `WhatsApp API error: ${response.status} - ${JSON.stringify(errorData)}`
    );
  }

  return response.json() as Promise<WhatsAppMessageResponse>;
}

/**
 * Send a template message via WhatsApp Cloud API.
 * Templates must be pre-approved in WhatsApp Business Manager.
 */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  languageCode: string = 'hi',
  components?: any[]
): Promise<WhatsAppMessageResponse> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN are required');
  }

  const body: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
    },
  };

  if (components && components.length > 0) {
    body.template.components = components;
  }

  const response = await fetch(
    `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `WhatsApp API error: ${response.status} - ${JSON.stringify(errorData)}`
    );
  }

  return response.json() as Promise<WhatsAppMessageResponse>;
}

/**
 * Send WhatsApp messages to multiple recipients.
 */
export async function sendWhatsAppBatch(
  recipients: string[],
  message: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  const results = await Promise.allSettled(
    recipients.map((to) => sendWhatsAppText(to, message))
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      sent++;
    } else {
      failed++;
      errors.push(result.reason?.message || 'Unknown error');
    }
  }

  return { sent, failed, errors };
}
```

---

## Task 19: Multi-Channel Notification Orchestrator

**Files:**
- Create: `dashboard-next/src/lib/notification-sender.ts`

- [ ] **Step 1: Create orchestrator that sends notifications across all selected channels**

```typescript
// dashboard-next/src/lib/notification-sender.ts
import { sendTopicNotification } from './firebase-admin';
import { sendWebPushBatch, type WebPushPayload, type PushSubscriptionData } from './web-push';
import { sendWhatsAppBatch } from './whatsapp';
import { connectDB } from './mongodb';
import WebPushSubscription from '../models/WebPushSubscription';
import NotificationPreference from '../models/NotificationPreference';
import User from '../models/User';
import nodemailer from 'nodemailer';

export interface NotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  topic?: string;
  channels: ('push' | 'webPush' | 'email' | 'whatsapp')[];
  data?: Record<string, string>;
  url?: string;
}

export interface SendResult {
  push: { sent: number; delivered: number; failed: number };
  webPush: { sent: number; delivered: number; failed: number };
  email: { sent: number; delivered: number; failed: number };
  whatsapp: { sent: number; delivered: number; failed: number };
  totalRecipients: number;
}

/**
 * Send a notification across all selected channels.
 */
export async function sendMultiChannelNotification(
  payload: NotificationPayload
): Promise<SendResult> {
  await connectDB();

  const result: SendResult = {
    push: { sent: 0, delivered: 0, failed: 0 },
    webPush: { sent: 0, delivered: 0, failed: 0 },
    email: { sent: 0, delivered: 0, failed: 0 },
    whatsapp: { sent: 0, delivered: 0, failed: 0 },
    totalRecipients: 0,
  };

  const promises: Promise<void>[] = [];

  // 1. FCM Push (Mobile)
  if (payload.channels.includes('push')) {
    promises.push(
      (async () => {
        try {
          const fcmTopic = payload.topic || 'all';
          await sendTopicNotification(
            fcmTopic,
            payload.title,
            payload.body,
            payload.data,
            payload.imageUrl
          );
          result.push.sent = 1;
          result.push.delivered = 1;
        } catch (err) {
          result.push.failed = 1;
          console.error('FCM send error:', err);
        }
      })()
    );
  }

  // 2. Web Push
  if (payload.channels.includes('webPush')) {
    promises.push(
      (async () => {
        try {
          const subscriptions = await WebPushSubscription.find({
            isActive: true,
            isDeleted: { $ne: true },
          }).lean();

          if (subscriptions.length === 0) return;

          const webPayload: WebPushPayload = {
            title: payload.title,
            body: payload.body,
            image: payload.imageUrl,
            url: payload.url || '/',
            data: payload.data,
          };

          const subs: PushSubscriptionData[] = subscriptions.map((s) => ({
            endpoint: s.endpoint,
            keys: { p256dh: s.keys.p256dh, auth: s.keys.auth },
          }));

          const webResult = await sendWebPushBatch(subs, webPayload);
          result.webPush.sent = webResult.sent;
          result.webPush.delivered = webResult.sent;
          result.webPush.failed = webResult.failed;
        } catch (err) {
          console.error('Web Push send error:', err);
        }
      })()
    );
  }

  // 3. Email
  if (payload.channels.includes('email')) {
    promises.push(
      (async () => {
        try {
          const prefs = await NotificationPreference.find({
            'channels.email': true,
            isDeleted: { $ne: true },
          }).lean();

          const userIds = prefs.map((p) => p.userId);
          const users = await User.find({
            _id: { $in: userIds },
            isDeleted: { $ne: true },
          })
            .select('email name')
            .lean();

          if (users.length === 0) return;

          const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: false,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          let sent = 0;
          let failed = 0;

          for (const user of users) {
            try {
              await transporter.sendMail({
                from: {
                  name: process.env.EMAIL_FROM_NAME || 'Prabhu Premi Sangh',
                  address: process.env.EMAIL_USER || '',
                },
                to: (user as any).email,
                subject: payload.title,
                html: `
                  <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #800020; padding: 20px; text-align: center;">
                      <h1 style="color: #D4A017; margin: 0;">${payload.title}</h1>
                    </div>
                    <div style="padding: 24px; background: #FFFDF5;">
                      ${payload.imageUrl ? `<img src="${payload.imageUrl}" style="max-width: 100%; border-radius: 8px; margin-bottom: 16px;" />` : ''}
                      <p style="color: #333; font-size: 16px; line-height: 1.6;">${payload.body}</p>
                      ${payload.url ? `<a href="${payload.url}" style="display: inline-block; background: #FF6B00; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">View Details</a>` : ''}
                    </div>
                    <div style="background: #f5f0e6; padding: 16px; text-align: center; font-size: 12px; color: #8B7E74;">
                      <p>Prabhu Premi Sangh | Harihar Ashram, Kankhal, Haridwar</p>
                      <p>www.avdheshanandgmission.org</p>
                    </div>
                  </div>
                `,
              });
              sent++;
            } catch {
              failed++;
            }
          }

          result.email.sent = sent;
          result.email.delivered = sent;
          result.email.failed = failed;
        } catch (err) {
          console.error('Email send error:', err);
        }
      })()
    );
  }

  // 4. WhatsApp
  if (payload.channels.includes('whatsapp')) {
    promises.push(
      (async () => {
        try {
          const prefs = await NotificationPreference.find({
            'channels.whatsapp': true,
            whatsappNumber: { $exists: true, $ne: '' },
            isDeleted: { $ne: true },
          }).lean();

          const numbers = prefs
            .map((p) => p.whatsappNumber)
            .filter((n): n is string => Boolean(n));

          if (numbers.length === 0) return;

          const message = `*${payload.title}*\n\n${payload.body}\n\n_Prabhu Premi Sangh_\nwww.avdheshanandgmission.org`;

          const waResult = await sendWhatsAppBatch(numbers, message);
          result.whatsapp.sent = waResult.sent;
          result.whatsapp.delivered = waResult.sent;
          result.whatsapp.failed = waResult.failed;
        } catch (err) {
          console.error('WhatsApp send error:', err);
        }
      })()
    );
  }

  await Promise.all(promises);

  result.totalRecipients =
    result.push.delivered +
    result.webPush.delivered +
    result.email.delivered +
    result.whatsapp.delivered;

  return result;
}
```

---

## Task 20: QR Code Generation Utility

**Files:**
- Create: `dashboard-next/src/lib/qr-generator.ts`

**Prerequisites:** Run `cd dashboard-next && npm install qrcode @types/qrcode`

- [ ] **Step 1: Create QR code generation utility for tickets and UPI**

```typescript
// dashboard-next/src/lib/qr-generator.ts
import QRCode from 'qrcode';

export interface TicketQRData {
  ticketNumber: string;
  eventName: string;
  attendeeName: string;
  eventDate: string;
  eventLocation: string;
}

export interface UpiQRData {
  upiId: string;
  payeeName: string;
  amount?: number;
  transactionNote?: string;
  currency?: string;
}

/**
 * Generate a QR code as a data URL (base64 PNG).
 */
export async function generateQRDataURL(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 400,
    margin: 2,
    color: {
      dark: '#800020',
      light: '#FFFFFF',
    },
  });
}

/**
 * Generate a QR code as a Buffer (PNG).
 */
export async function generateQRBuffer(data: string): Promise<Buffer> {
  return QRCode.toBuffer(data, {
    errorCorrectionLevel: 'M',
    type: 'png',
    width: 400,
    margin: 2,
    color: {
      dark: '#800020',
      light: '#FFFFFF',
    },
  });
}

/**
 * Generate QR code data string for an event ticket.
 */
export function createTicketQRString(data: TicketQRData): string {
  return JSON.stringify({
    type: 'pps_event_ticket',
    tn: data.ticketNumber,
    en: data.eventName,
    an: data.attendeeName,
    ed: data.eventDate,
    el: data.eventLocation,
    ts: Date.now(),
  });
}

/**
 * Generate a UPI payment string for QR code.
 * Format: upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&cu=<CURRENCY>&tn=<NOTE>
 */
export function createUpiQRString(data: UpiQRData): string {
  const params = new URLSearchParams();
  params.set('pa', data.upiId);
  params.set('pn', data.payeeName);

  if (data.amount && data.amount > 0) {
    params.set('am', data.amount.toFixed(2));
  }

  params.set('cu', data.currency || 'INR');

  if (data.transactionNote) {
    params.set('tn', data.transactionNote);
  }

  return `upi://pay?${params.toString()}`;
}

/**
 * Generate a UPI QR code as data URL.
 */
export async function generateUpiQR(data: UpiQRData): Promise<string> {
  const upiString = createUpiQRString(data);
  return generateQRDataURL(upiString);
}

/**
 * Generate an event ticket QR code as data URL.
 */
export async function generateTicketQR(data: TicketQRData): Promise<string> {
  const qrString = createTicketQRString(data);
  return generateQRDataURL(qrString);
}
```

---

## Task 21: PDF Receipt Generation Utility

**Files:**
- Create: `dashboard-next/src/lib/pdf-receipt.ts`

**Prerequisites:** Run `cd dashboard-next && npm install pdfkit @types/pdfkit`

- [ ] **Step 1: Create 80G tax receipt PDF generator**

```typescript
// dashboard-next/src/lib/pdf-receipt.ts
import PDFDocument from 'pdfkit';
import { IDonationReceipt } from '@/models/DonationReceipt';

export async function generateReceiptPDF(receipt: IDonationReceipt): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 60, right: 60 },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const pageWidth = doc.page.width - 120; // 60px margin each side

      // --- Header ---
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor('#800020')
        .text('PRABHU PREMI SANGH', { align: 'center' });

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#333333')
        .text(receipt.organizationDetails.address, { align: 'center' });

      doc.moveDown(0.3);
      doc
        .fontSize(9)
        .text(`PAN: ${receipt.organizationDetails.panNumber}`, { align: 'center' });

      doc.moveDown(0.5);

      // Gold divider line
      doc
        .moveTo(60, doc.y)
        .lineTo(60 + pageWidth, doc.y)
        .strokeColor('#D4A017')
        .lineWidth(2)
        .stroke();

      doc.moveDown(0.5);

      // --- Title ---
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#800020')
        .text('DONATION RECEIPT UNDER SECTION 80G', { align: 'center' });

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#333333')
        .text('(Income Tax Act, 1961)', { align: 'center' });

      doc.moveDown(1);

      // --- Receipt Details Box ---
      const boxTop = doc.y;
      doc
        .rect(60, boxTop, pageWidth, 60)
        .fillColor('#FFF8E7')
        .fill();

      doc.fillColor('#333333');
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(`Receipt No: ${receipt.receiptNumber}`, 80, boxTop + 15);
      doc
        .font('Helvetica')
        .text(
          `Date: ${new Date(receipt.donationDate).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}`,
          80,
          boxTop + 35
        );

      doc
        .font('Helvetica-Bold')
        .text(`Amount: INR ${receipt.amount.toLocaleString('en-IN')}/-`, 300, boxTop + 15);

      if (receipt.paymentId) {
        doc.font('Helvetica').text(`Payment ID: ${receipt.paymentId}`, 300, boxTop + 35);
      }

      doc.y = boxTop + 75;

      // --- Donor Details ---
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#800020').text('DONOR DETAILS');
      doc.moveDown(0.3);

      const labelX = 80;
      const valueX = 220;
      doc.fontSize(10).fillColor('#333333');

      const donorFields: [string, string | undefined][] = [
        ['Name', receipt.donorDetails.name],
        ['Email', receipt.donorDetails.email],
        ['Phone', receipt.donorDetails.phone],
        ['Address', receipt.donorDetails.address],
        ['PAN Number', receipt.donorDetails.panNumber || 'Not Provided'],
      ];

      for (const [label, value] of donorFields) {
        if (value) {
          doc.font('Helvetica-Bold').text(`${label}:`, labelX, doc.y, { continued: false });
          doc.font('Helvetica').text(value, valueX, doc.y - doc.currentLineHeight());
          doc.moveDown(0.3);
        }
      }

      doc.moveDown(0.5);

      // --- Donation Details ---
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#800020').text('DONATION DETAILS');
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('#333333');

      const donationFields: [string, string][] = [
        ['Amount', `INR ${receipt.amount.toLocaleString('en-IN')}/-`],
        ['Currency', receipt.currency],
        ['Payment Method', receipt.paymentMethod],
        [
          'Donation Date',
          new Date(receipt.donationDate).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          }),
        ],
      ];

      if (receipt.campaignTitle) {
        donationFields.push(['Campaign', receipt.campaignTitle]);
      }

      for (const [label, value] of donationFields) {
        doc.font('Helvetica-Bold').text(`${label}:`, labelX, doc.y, { continued: false });
        doc.font('Helvetica').text(value, valueX, doc.y - doc.currentLineHeight());
        doc.moveDown(0.3);
      }

      doc.moveDown(0.5);

      // --- 80G Details ---
      doc
        .moveTo(60, doc.y)
        .lineTo(60 + pageWidth, doc.y)
        .strokeColor('#D4A017')
        .lineWidth(1)
        .stroke();

      doc.moveDown(0.5);

      doc.fontSize(12).font('Helvetica-Bold').fillColor('#800020').text('80G CERTIFICATION');
      doc.moveDown(0.3);
      doc.fontSize(9).font('Helvetica').fillColor('#333333');

      doc.text(
        `This is to certify that ${receipt.organizationDetails.name} is registered under Section 80G of the Income Tax Act, 1961.`,
        { width: pageWidth }
      );
      doc.moveDown(0.2);
      doc.text(
        `Registration Number: ${receipt.organizationDetails.registrationNumber}`,
        { width: pageWidth }
      );
      doc.text(
        `80G Number: ${receipt.organizationDetails.section80GNumber}`,
        { width: pageWidth }
      );

      if (receipt.organizationDetails.section80GValidFrom) {
        doc.text(
          `Valid From: ${new Date(receipt.organizationDetails.section80GValidFrom).toLocaleDateString('en-IN')} To: ${new Date(receipt.organizationDetails.section80GValidUntil).toLocaleDateString('en-IN')}`,
          { width: pageWidth }
        );
      }

      doc.moveDown(1);
      doc.text(
        'Donation to this organization qualifies for deduction under Section 80G of the Income Tax Act, 1961. Please retain this receipt for your tax records.',
        { width: pageWidth }
      );

      doc.moveDown(2);

      // --- Signature area ---
      doc.fontSize(10).font('Helvetica');
      doc.text('Authorized Signatory', 350, doc.y);
      doc.moveDown(0.3);
      doc.text('Prabhu Premi Sangh', 350, doc.y);

      // --- Footer ---
      doc.moveDown(2);
      doc
        .moveTo(60, doc.y)
        .lineTo(60 + pageWidth, doc.y)
        .strokeColor('#D4A017')
        .lineWidth(1)
        .stroke();

      doc.moveDown(0.3);
      doc
        .fontSize(8)
        .fillColor('#888888')
        .text(
          'This is a computer-generated receipt and does not require a physical signature.',
          { align: 'center', width: pageWidth }
        );
      doc.text('www.avdheshanandgmission.org', { align: 'center', width: pageWidth });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
```

---

## Task 22: Panchang API Routes

**Files:**
- Create: `dashboard-next/src/app/api/panchang/today/route.ts`
- Create: `dashboard-next/src/app/api/panchang/month/route.ts`
- Create: `dashboard-next/src/app/api/panchang/festivals/route.ts`

- [ ] **Step 1: Create today's Panchang API (public)**

```typescript
// dashboard-next/src/app/api/panchang/today/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PanchangCache from '@/models/PanchangCache';
import { calculateTithi, calculateNakshatra, calculateYoga, calculateKarana, calculateHinduMonth, calculateVikramSamvat, calculateShakaSamvat, calculateRitu, calculateAyana } from '@/lib/panchang/calculator';
import { getSunTimes, getMoonTimes, calculateRahuKaal, calculateYamaghanda, calculateGulikaKaal, calculateBrahmaMuhurta, calculateAbhijitMuhurta, calculateChoghadiya, formatTime } from '@/lib/panchang/muhurta';
import { getSunLongitude, getMoonLongitude } from '@/lib/panchang/astronomy';
import { findFestivals } from '@/lib/panchang/festivals';
import { EKADASHI_NAMES } from '@/lib/panchang/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '29.9457'); // Default: Haridwar
    const lng = parseFloat(searchParams.get('lng') || '78.1642');
    const cityName = searchParams.get('city') || 'Haridwar';
    const dateStr = searchParams.get('date'); // Optional: YYYY-MM-DD

    const date = dateStr ? new Date(dateStr + 'T06:00:00+05:30') : new Date();
    const dateKey = date.toISOString().split('T')[0];
    const locationKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`;

    await connectDB();

    // Check cache
    const cached = await PanchangCache.findOne({
      date: dateKey,
      locationKey,
      isDeleted: { $ne: true },
    }).lean();

    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached.panchangData,
        cached: true,
      });
    }

    // Calculate fresh Panchang
    const sunTimes = getSunTimes(date, lat, lng);
    const moonTimes = getMoonTimes(date, lat, lng);
    const nextDaySunrise = getSunTimes(new Date(date.getTime() + 24 * 60 * 60 * 1000), lat, lng).sunrise;

    const tithi = calculateTithi(date);
    const nakshatra = calculateNakshatra(date);
    const yoga = calculateYoga(date);
    const karana = calculateKarana(tithi.number);
    const hinduMonth = calculateHinduMonth(date);

    const dayOfWeek = date.getDay();
    const rahuKaal = calculateRahuKaal(sunTimes.sunrise, sunTimes.sunset, dayOfWeek);
    const yamaghanda = calculateYamaghanda(sunTimes.sunrise, sunTimes.sunset, dayOfWeek);
    const gulikaKaal = calculateGulikaKaal(sunTimes.sunrise, sunTimes.sunset, dayOfWeek);
    const brahmaMuhurta = calculateBrahmaMuhurta(sunTimes.sunrise);
    const abhijitMuhurta = calculateAbhijitMuhurta(sunTimes.sunrise, sunTimes.sunset);
    const choghadiya = calculateChoghadiya(sunTimes.sunrise, sunTimes.sunset, nextDaySunrise, dayOfWeek);

    const festivals = findFestivals(date, tithi, hinduMonth);

    // Check for Ekadashi
    const isEkadashi = tithi.number === 11 || tithi.number === 26;
    let ekadashi = undefined;
    if (isEkadashi && EKADASHI_NAMES[hinduMonth]) {
      const ekadashiData = EKADASHI_NAMES[hinduMonth];
      const ekadashiName = tithi.paksha === 'Shukla' ? ekadashiData.shukla : ekadashiData.krishna;
      ekadashi = {
        name: ekadashiName,
        significance: `Fast dedicated to Lord Vishnu. Break fast the next morning after sunrise.`,
      };
    }

    // Vrat days
    const vratDays: string[] = [];
    if (isEkadashi) vratDays.push('Ekadashi Vrat');
    if (tithi.number === 13) vratDays.push('Pradosh Vrat');
    if (tithi.number === 4 && tithi.paksha === 'Krishna') vratDays.push('Sankashti Chaturthi');
    if (tithi.number === 14 && tithi.paksha === 'Krishna') vratDays.push('Shivaratri');

    const panchangData = {
      date: dateKey,
      locationName: cityName,
      lat,
      lng,
      tithi,
      nakshatra,
      yoga,
      karana,
      sunrise: formatTime(sunTimes.sunrise),
      sunset: formatTime(sunTimes.sunset),
      moonrise: moonTimes.moonrise ? formatTime(moonTimes.moonrise) : 'N/A',
      moonset: moonTimes.moonset ? formatTime(moonTimes.moonset) : 'N/A',
      rahuKaal,
      yamaghanda,
      gulikaKaal,
      brahmaMuhurta,
      abhijitMuhurta,
      hinduMonth,
      paksha: tithi.paksha,
      vikramSamvat: calculateVikramSamvat(date),
      shakaSamvat: calculateShakaSamvat(date),
      ritu: calculateRitu(hinduMonth),
      ayana: calculateAyana(date),
      choghadiya,
      festivals,
      ekadashi,
      isPurnima: tithi.number === 15,
      isAmavasya: tithi.number === 30,
      vratDays,
      sunLongitude: getSunLongitude(date),
      moonLongitude: getMoonLongitude(date),
    };

    // Cache the result
    try {
      await PanchangCache.create({
        date: dateKey,
        locationKey,
        panchangData,
      });
    } catch {
      // Cache write failure is non-critical
    }

    return NextResponse.json({
      success: true,
      data: panchangData,
      cached: false,
    });
  } catch (error) {
    console.error('Panchang API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to compute Panchang', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create monthly Panchang API**

```typescript
// dashboard-next/src/app/api/panchang/month/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const lat = parseFloat(searchParams.get('lat') || '29.9457');
    const lng = parseFloat(searchParams.get('lng') || '78.1642');
    const city = searchParams.get('city') || 'Haridwar';

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { success: false, message: 'Invalid year or month' },
        { status: 400 }
      );
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const baseUrl = new URL(req.url).origin;

    // Fetch each day's panchang
    const dayPromises = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const url = `${baseUrl}/api/panchang/today?date=${dateStr}&lat=${lat}&lng=${lng}&city=${encodeURIComponent(city)}`;
      return fetch(url)
        .then((res) => res.json())
        .then((data) => data.data || null)
        .catch(() => null);
    });

    const days = await Promise.all(dayPromises);

    return NextResponse.json({
      success: true,
      data: days.filter(Boolean),
      month,
      year,
    });
  } catch (error) {
    console.error('Monthly Panchang Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to compute monthly Panchang' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Create upcoming festivals API**

```typescript
// dashboard-next/src/app/api/panchang/festivals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUpcomingFixedFestivals } from '@/lib/panchang/festivals';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const count = parseInt(searchParams.get('count') || '20');

    const festivals = getUpcomingFixedFestivals(new Date(), count);

    return NextResponse.json({
      success: true,
      data: festivals,
    });
  } catch (error) {
    console.error('Festivals API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch festivals' },
      { status: 500 }
    );
  }
}
```

---

## Task 23: Donation Receipt API & PDF Generation

This task is identical to the original plan Task 18. See the existing API routes for donation receipts (list + auto-generate) and PDF download:

**Files:**
- Create: `dashboard-next/src/app/api/donation-receipts/route.ts`
- Create: `dashboard-next/src/app/api/donation-receipts/[id]/pdf/route.ts`

The code for these routes is exactly as specified in the original plan Tasks 18.1 and 18.2 (donation-receipts CRUD and PDF generation). Those implementations remain unchanged.

---

## Task 24: UPI QR Code API & Display

This task is identical to the original plan Task 19. The UPI QR API route, UpiQrDisplay component, and UPI donate page remain unchanged.

---

## Task 25: Event QR Ticket API Routes

This task is identical to the original plan Task 20. The ticket generation, verification, and listing APIs remain unchanged.

---

## Task 26: Multi-Channel Notification Send API

**Files:**
- Create: `dashboard-next/src/app/api/notifications/send/route.ts`

- [ ] **Step 1: Create multi-channel notification send API (admin protected)**

```typescript
// dashboard-next/src/app/api/notifications/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import NotificationLog from '@/models/NotificationLog';
import { sendMultiChannelNotification } from '@/lib/notification-sender';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      body: notifBody,
      topic,
      targetType,
      notificationType,
      channels,
      imageUrl,
      data,
      scheduledFor,
      sentBy,
    } = body;

    if (!title || !notifBody || !sentBy || !channels || channels.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Title, body, sentBy, and at least one channel are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create log entry
    const log = new NotificationLog({
      title,
      body: notifBody,
      topic: topic || 'all',
      targetType: targetType || 'topic',
      notificationType: notificationType || 'general',
      channels,
      imageUrl,
      data,
      sentBy,
      status: scheduledFor ? 'scheduled' : 'sending',
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
    });

    await log.save();

    // If scheduled for the future, just save and return
    if (scheduledFor && new Date(scheduledFor) > new Date()) {
      return NextResponse.json({
        success: true,
        message: 'Notification scheduled',
        data: log,
      }, { status: 201 });
    }

    // Send immediately across all channels
    try {
      const result = await sendMultiChannelNotification({
        title,
        body: notifBody,
        imageUrl,
        topic: topic || 'all',
        channels,
        data,
      });

      log.status = result.totalRecipients > 0 ? 'sent' : 'failed';
      if (
        (result.push.failed > 0 || result.webPush.failed > 0 || result.email.failed > 0 || result.whatsapp.failed > 0) &&
        result.totalRecipients > 0
      ) {
        log.status = 'partial';
      }
      log.sentAt = new Date();
      log.recipientCount = result.totalRecipients;
      log.deliveryStats = result;
      await log.save();

      return NextResponse.json({
        success: true,
        message: `Notification sent to ${result.totalRecipients} recipients`,
        data: { log, deliveryStats: result },
      }, { status: 201 });
    } catch (sendError) {
      log.status = 'failed';
      log.errorMessage = sendError instanceof Error ? sendError.message : String(sendError);
      await log.save();

      return NextResponse.json({
        success: false,
        message: 'Notification created but sending failed',
        error: log.errorMessage,
        data: log,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Send Notification Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
```

---

## Task 27: Web Push Subscribe API

**Files:**
- Create: `dashboard-next/src/app/api/notifications/subscribe-web/route.ts`

- [ ] **Step 1: Create web push subscription endpoint**

```typescript
// dashboard-next/src/app/api/notifications/subscribe-web/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WebPushSubscription from '@/models/WebPushSubscription';
import { getVapidPublicKey } from '@/lib/web-push';

// GET: Return the VAPID public key for frontend subscription
export async function GET() {
  try {
    const vapidPublicKey = getVapidPublicKey();
    return NextResponse.json({
      success: true,
      data: { vapidPublicKey },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Web Push not configured' },
      { status: 500 }
    );
  }
}

// POST: Save a new web push subscription
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint, keys, userId, userAgent } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { success: false, message: 'Invalid subscription data: endpoint and keys are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Upsert: update if endpoint exists, create if not
    const subscription = await WebPushSubscription.findOneAndUpdate(
      { endpoint },
      {
        endpoint,
        keys: { p256dh: keys.p256dh, auth: keys.auth },
        userId: userId || undefined,
        userAgent: userAgent || undefined,
        isActive: true,
        subscribedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Subscribed to web push notifications',
      data: { id: subscription._id },
    }, { status: 201 });
  } catch (error) {
    console.error('Web Push Subscribe Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

// DELETE: Unsubscribe
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { success: false, message: 'Endpoint is required' },
        { status: 400 }
      );
    }

    await connectDB();

    await WebPushSubscription.findOneAndUpdate(
      { endpoint },
      { isActive: false }
    );

    return NextResponse.json({
      success: true,
      message: 'Unsubscribed from web push notifications',
    });
  } catch (error) {
    console.error('Web Push Unsubscribe Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
```

---

## Task 28: Notification Preferences API

**Files:**
- Create: `dashboard-next/src/app/api/notifications/preferences/route.ts`

- [ ] **Step 1: Create GET/PUT notification preferences API**

```typescript
// dashboard-next/src/app/api/notifications/preferences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import NotificationPreference from '@/models/NotificationPreference';

// GET: Get preferences for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId is required' },
        { status: 400 }
      );
    }

    await connectDB();

    let prefs = await NotificationPreference.findOne({
      userId,
      isDeleted: { $ne: true },
    }).lean();

    // Return defaults if no preferences saved yet
    if (!prefs) {
      prefs = {
        userId,
        channels: { push: true, webPush: true, email: true, whatsapp: false },
        topics: { dailyVichar: true, events: true, kumbh: true, festivals: true, liveStream: true, books: false, donations: false },
        emailDigestFrequency: 'instant',
      } as any;
    }

    return NextResponse.json({ success: true, data: prefs });
  } catch (error) {
    console.error('Get Preferences Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// PUT: Update preferences for a user
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, channels, topics, whatsappNumber, emailDigestFrequency } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const updateData: Record<string, any> = {};
    if (channels) updateData.channels = channels;
    if (topics) updateData.topics = topics;
    if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber;
    if (emailDigestFrequency) updateData.emailDigestFrequency = emailDigestFrequency;

    const prefs = await NotificationPreference.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Preferences updated',
      data: prefs,
    });
  } catch (error) {
    console.error('Update Preferences Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
```

---

## Task 29: Seva Opportunities API Routes

This task is identical to the original plan Task 23. The Seva CRUD, Signup, and Leaderboard APIs remain unchanged.

---

## Task 30: Seva Page (Website)

This task is identical to the original plan Task 24. The public Seva Opportunities page remains unchanged.

---

## Task 31: Update Middleware for New Public Endpoints

**Files:**
- Modify: `dashboard-next/src/middleware.ts`

- [ ] **Step 1: Add new public API endpoints to the middleware allowlist**

Add these entries to the `publicApiEndpoints` array in `dashboard-next/src/middleware.ts`:

```typescript
// Add to the publicApiEndpoints array:
  { path: "/api/upi-qr", methods: ["GET"] },
  { path: "/api/event-tickets/generate", methods: ["POST"] },
  { path: "/api/event-tickets/verify", methods: ["POST"] },
  { path: "/api/seva", methods: ["GET"] },
  { path: "/api/seva/signup", methods: ["POST"] },
  { path: "/api/seva/leaderboard", methods: ["GET"] },
  { path: "/api/panchang/today", methods: ["GET"] },
  { path: "/api/panchang/month", methods: ["GET"] },
  { path: "/api/panchang/festivals", methods: ["GET"] },
  { path: "/api/donation-receipts", methods: ["POST"] },
  { path: "/api/notifications/subscribe-web", methods: ["GET", "POST", "DELETE"] },
  { path: "/api/notifications/preferences", methods: ["GET", "PUT"] },
```

---

## Task 32: Mobile -- FCM Push Notification Registration

**Files:**
- Create: `mobile/user-app/src/services/notifications.ts`

- [ ] **Step 1: Create push notification registration and handling service**

```typescript
// mobile/user-app/src/services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register for push notifications and return the Expo push token.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  // Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#800020',
      sound: 'default',
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    return tokenData.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Subscribe to a specific topic for FCM.
 * Sends the token to the backend which subscribes server-side.
 */
export async function subscribeToTopic(token: string, topic: string): Promise<void> {
  try {
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    await fetch(`${API_URL}/api/notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, topic }),
    });
  } catch (error) {
    console.error('Failed to subscribe to topic:', error);
  }
}

/**
 * Add notification response listener (when user taps notification).
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Add notification received listener (when notification arrives while app is open).
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}
```

---

## Task 33: Install npm Dependencies

- [ ] **Step 1: Install dashboard dependencies**

```bash
cd /Users/apple/Downloads/agm-india-dashboard-website-master/dashboard-next && npm install qrcode @types/qrcode pdfkit @types/pdfkit web-push @types/web-push astronomy-engine suncalc @types/suncalc
```

- [ ] **Step 2: Install website dependencies**

```bash
cd /Users/apple/Downloads/agm-india-dashboard-website-master/website && npm install qrcode @types/qrcode
```

- [ ] **Step 3: Install mobile dependencies (if adding QR display)**

```bash
cd /Users/apple/Downloads/agm-india-dashboard-website-master/mobile/user-app && npx expo install react-native-qrcode-svg react-native-svg
```

---

## Task 34: Webhook Update for Auto-Receipt Generation

**Files:**
- Modify: `dashboard-next/src/app/api/webhook/route.js`

- [ ] **Step 1: Add auto-receipt generation after successful donation in the existing webhook**

After the `donationConfirmation` is saved in the `payment.captured` case, add receipt generation:

```javascript
// Add after the donation is saved to DB (after the `donationConfirmation` block):
if (donationConfirmation) {
  // Auto-generate 80G receipt
  try {
    const DonationReceipt = (await import('../../../models/DonationReceipt')).default;
    
    const receipt = new DonationReceipt({
      donationId: donationConfirmation._id || donationConfirmation.insertedId,
      donorDetails: {
        name: name || 'Anonymous',
        email: email,
        phone: phone,
        address: address,
      },
      amount: amount / 100, // Convert from paise
      currency: 'INR',
      donationDate: new Date(),
      paymentMethod: 'Razorpay',
      paymentId: payment.id,
      campaignId: campaignId || undefined,
    });
    
    await receipt.save();
    console.log('80G Receipt generated:', receipt.receiptNumber);
  } catch (receiptErr) {
    console.error('Error generating 80G receipt:', receiptErr);
  }
}
```

---

## Task 35: Environment Variables Documentation

- [ ] **Step 1: Document required environment variables**

Add these to your `.env` or `.env.local` in `dashboard-next/`:

```env
# Existing
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxx
MONGODB_URI=mongodb+srv://...
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=app-password
EMAIL_FROM_NAME=Prabhu Premi Sangh

# New: Firebase Admin
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}

# New: UPI
UPI_ID=prabhupremi@upi
UPI_PAYEE_NAME=Prabhu Premi Sangh

# New: 80G Organization Details (override defaults in model)
ORG_PAN_NUMBER=AAXXPXXXXX
ORG_80G_NUMBER=80G/XXXX/XXXX
ORG_REGISTRATION_NUMBER=REG/XXXX/XXXX

# New: Web Push (VAPID)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# New: WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token
```

Add to `website/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
```

Add to `mobile/user-app/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
```

---

## Self-Review Checklist

Before marking any task as complete, verify:

### Models
- [ ] Every model has `isDeleted: boolean` with default `false`
- [ ] Every model has `timestamps: true` and `versionKey: false`
- [ ] Every model uses the pattern `mongoose.models.X || mongoose.model<IX>('X', schema)`
- [ ] All indexes are created for commonly queried fields
- [ ] All string fields that need it have `trim: true`

### API Routes
- [ ] Every API returns `{ success, data, message }` format
- [ ] Every API has proper error handling with try/catch
- [ ] Every API uses `await connectDB()` before DB operations
- [ ] All new public endpoints are added to `middleware.ts` allowlist
- [ ] Next.js 15 async params pattern used: `{ params }: { params: Promise<{ id: string }> }`

### Website Pages
- [ ] All pages use `'use client'` directive since they use hooks
- [ ] Framer Motion animations are consistent with existing pages
- [ ] Tailwind classes use the spiritual theme (spiritual-maroon, gold-400, etc.)
- [ ] Fonts use font-display, font-sanskrit, font-spiritual, font-body
- [ ] Loading states show Loader2 spinner
- [ ] Empty states have meaningful messages
- [ ] SearchParams wrapped in Suspense boundary to avoid CSR bailout

### Amazon Book Catalog
- [ ] `amazonUrl` field added to Book model with Amazon URL validation regex
- [ ] Admin form includes Amazon URL input field
- [ ] BookCard component opens Amazon URL in new tab with `noopener,noreferrer`
- [ ] Mobile uses `Linking.openURL()` for Amazon links
- [ ] Books page has NO shopping cart, NO checkout -- purely a catalog
- [ ] "Buy on Amazon" button is prominently styled (Amazon orange #FF9900)
- [ ] Graceful fallback for books without amazonUrl ("Coming Soon")

### Multi-Channel Notifications
- [ ] NotificationLog model has `channels` array field
- [ ] NotificationPreference model covers push, webPush, email, whatsapp
- [ ] WebPushSubscription model stores endpoint and VAPID keys
- [ ] web-push package configured with VAPID keys
- [ ] WhatsApp Cloud API utility handles text and template messages
- [ ] Notification orchestrator sends across all selected channels in parallel
- [ ] Admin composer has channel selection checkboxes
- [ ] Delivery stats tracked per channel in NotificationLog
- [ ] Service Worker `sw-push.js` handles web push display

### Panchang (Hindu Calendar)
- [ ] `astronomy-engine` used for Sun/Moon longitude calculations
- [ ] `suncalc` used for sunrise/sunset/moonrise/moonset
- [ ] Tithi calculation: (Moon lon - Sun lon) / 12
- [ ] Nakshatra calculation: Moon lon / (360/27)
- [ ] Yoga calculation: (Sun lon + Moon lon) / (360/27)
- [ ] Karana calculation: 2 per Tithi with fixed/recurring pattern
- [ ] Rahu Kaal, Yamaghanda, Gulika based on day-of-week segment ordering
- [ ] Brahma Muhurta: 96 minutes before sunrise
- [ ] Abhijit Muhurta: around solar noon
- [ ] Choghadiya: 8 day + 8 night periods
- [ ] Vikram Samvat and Shaka Samvat years calculated
- [ ] Festival database has all 24 named Ekadashis
- [ ] Festival database has Navaratri, Diwali, Holi, Dussehra, Janmashtami, etc.
- [ ] Festival database has monthly recurring (Sankashti, Pradosh, Shivaratri)
- [ ] Festival database has regional festivals (Onam, Pongal, Bihu, Baisakhi, Ugadi, Gudi Padwa)
- [ ] City database has 200+ cities with lat/lng/timezone/altitude
- [ ] PanchangCache model stores computed results for performance
- [ ] Location-based calculations (user selects city or uses GPS)

### Security
- [ ] PAN number validation uses proper regex
- [ ] Razorpay signature verification uses HMAC-SHA256
- [ ] Webhook verifies x-razorpay-signature header
- [ ] No sensitive data (API keys, secrets) in client-side code
- [ ] Admin-only routes remain behind auth middleware
- [ ] VAPID keys stored as environment variables, not in code
- [ ] WhatsApp access token stored as environment variable

### Mobile
- [ ] Expo packages imported correctly (expo-notifications, etc.)
- [ ] Styles use StyleSheet.create (not inline objects)
- [ ] Colors match the theme: maroon #800020, saffron #FF6B00, gold #D4A017
- [ ] `Linking.openURL()` used for Amazon links on mobile

### Dependencies
- [ ] `qrcode` and `pdfkit` installed in dashboard-next
- [ ] `web-push` installed in dashboard-next
- [ ] `astronomy-engine` and `suncalc` installed in dashboard-next
- [ ] `qrcode` installed in website
- [ ] No unnecessary dependencies added
- [ ] Firebase Admin already installed (firebase-admin@13.4.0) -- do not reinstall
- [ ] Nodemailer already installed (nodemailer@7.0.3) -- do not reinstall

### Integration Points
- [ ] Donation receipt auto-generated in webhook after payment.captured
- [ ] Email sent after donation receipt generation (using existing nodemailer setup)
- [ ] QR ticket generated when user registers for event
- [ ] Web Push prompt shown on website for notification opt-in
- [ ] Panchang cached in MongoDB for performance (PanchangCache model)
- [ ] Festival data matched by tithi/date from JSON database
