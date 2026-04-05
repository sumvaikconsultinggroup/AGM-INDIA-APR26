# Audio/Bhajan Library & Sadhana Practice Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete devotional audio library (bhajans, kirtans, mantras, pravachan recordings, aarti, chants) with Spotify-style persistent playback across all platforms, and a mobile-first daily sadhana practice tracker with streak mechanics, weekly/monthly summaries, and motivational spiritual messaging -- matching the engagement depth of ISKCON MySadhana, Sadhguru Mandala, and YouVersion Bible app.

**Architecture:** Audio files stored on Cloudinary (audio resource_type), metadata in MongoDB with full-text search across Hindi+English titles and tags. Audio collections group tracks into themed albums. Website features a persistent bottom-bar audio player (Spotify-style) powered by HTML5 Audio API and React Context for global state. Mobile uses expo-av for background playback with download-for-offline via expo-file-system. Sadhana tracker uses per-user daily logs with server-computed streaks stored in a dedicated SadhanaStreak model. All API routes follow the existing `{ success, data, message }` response pattern with `isDeleted` soft-delete convention.

**Tech Stack:** Next.js 15 App Router, MongoDB/Mongoose, Cloudinary (audio uploads), React Context (audio player state), HTML5 Audio API, Framer Motion (website animations), Tailwind CSS (spiritual theme), expo-av (mobile audio), expo-file-system (offline downloads), React Native (mobile UI), expo-notifications (streak reminders).

**Peer Benchmark:**
| Feature | ISKCON Desire Tree | Art of Living | Isha/Sounds of Isha | Insight Timer | Plum Village | **Our Target** |
|---------|-------------------|--------------|---------------------|---------------|-------------|----------------|
| Audio Library Size | 8000+ hrs | 1000+ songs | 200+ songs | 100K+ | 100+ | Start 50+, scale to 500+ |
| Categories | Bhajans, Lectures | Devotional, Guided | Songs, Chants | Meditation, Music | Meditation | 7 categories (bhajan, kirtan, mantra, pravachan, chant, aarti, stuti) |
| Audio Player | Basic embed | In-app player | Spotify-like | Full player | Simple | Persistent bottom bar (Spotify-style) |
| Offline Download | No | Premium | No | Premium | Yes | Yes (mobile) |
| Albums/Collections | Playlists | Course-based | Albums | Playlists | None | Themed collections |
| Background Play | No | Yes | Yes | Yes | Yes | Yes (mobile) |

| Feature | ISKCON MySadhana | Sadhguru Mandala | YouVersion Bible | Heartfulness | BeeZone | **Our Target** |
|---------|-----------------|------------------|-----------------|--------------|---------|----------------|
| Practice Types | Chanting, worship | Shambhavi only | Bible reading | Meditation only | Virtue tracking | 5 types (meditation, japa, reading, seva, pranayama) |
| Streak Tracking | Basic counter | 40-day mandala | Streak + badges | Habit streaks | Daily challenge | Consecutive-day streaks with milestones |
| Summary View | Weekly | 40-day cycle | Annual stats | Monthly | Daily | Weekly + monthly charts |
| Social/Mentor | Mentor sharing | None | Friends | Trainer sharing | None | Private (phase 1), mentor (phase 2) |
| Reminders | Manual | App notification | Push + email | Push | Push | Push notification |

---

## File Structure

### New Files to Create

**Dashboard (Admin) -- Models:**
- `dashboard-next/src/models/AudioTrack.ts` -- Audio track model (bhajan/kirtan/mantra/etc.)
- `dashboard-next/src/models/AudioCollection.ts` -- Album/collection grouping model
- `dashboard-next/src/models/SadhanaLog.ts` -- Individual daily practice log entry
- `dashboard-next/src/models/SadhanaStreak.ts` -- Per-user streak tracking model

**Dashboard (Admin) -- API Routes:**
- `dashboard-next/src/app/api/audio-tracks/route.ts` -- GET list + POST create audio tracks
- `dashboard-next/src/app/api/audio-tracks/[id]/route.ts` -- GET/PUT/DELETE single audio track
- `dashboard-next/src/app/api/audio-collections/route.ts` -- GET list + POST create collections
- `dashboard-next/src/app/api/audio-collections/[id]/route.ts` -- GET/PUT/DELETE single collection
- `dashboard-next/src/app/api/audio-collections/[id]/tracks/route.ts` -- Add/remove tracks from collection
- `dashboard-next/src/app/api/sadhana/log/route.ts` -- GET user logs + POST new log
- `dashboard-next/src/app/api/sadhana/log/[id]/route.ts` -- PUT/DELETE single log
- `dashboard-next/src/app/api/sadhana/streak/route.ts` -- GET user streak info
- `dashboard-next/src/app/api/sadhana/summary/route.ts` -- GET weekly/monthly summary

**Dashboard (Admin) -- Pages:**
- `dashboard-next/src/app/dashboard/website/audio/page.tsx` -- Audio library admin listing
- `dashboard-next/src/app/dashboard/website/audio/new/page.tsx` -- Create new audio track
- `dashboard-next/src/app/dashboard/website/audio/[id]/page.tsx` -- Edit audio track
- `dashboard-next/src/app/dashboard/website/audio/audio-table.tsx` -- Audio tracks data table
- `dashboard-next/src/app/dashboard/website/audio/audio-form.tsx` -- Audio track form component
- `dashboard-next/src/app/dashboard/website/audio/collections/page.tsx` -- Collections admin listing
- `dashboard-next/src/app/dashboard/website/audio/collections/new/page.tsx` -- Create new collection
- `dashboard-next/src/app/dashboard/website/audio/collections/[id]/page.tsx` -- Edit collection
- `dashboard-next/src/app/dashboard/website/audio/collections/collection-form.tsx` -- Collection form
- `dashboard-next/src/app/dashboard/website/audio/collections/collections-table.tsx` -- Collections table
- `dashboard-next/src/app/dashboard/sadhana/page.tsx` -- Sadhana admin overview (stats)

**Website (Public):**
- `website/app/audio/page.tsx` -- Audio library browse page
- `website/app/audio/[id]/page.tsx` -- Single audio track detail page
- `website/app/audio/collections/page.tsx` -- Browse collections
- `website/app/audio/collections/[id]/page.tsx` -- Single collection page
- `website/components/audio/AudioPlayer.tsx` -- Persistent bottom bar audio player
- `website/components/audio/AudioPlayerProvider.tsx` -- React Context for global audio state
- `website/components/audio/TrackCard.tsx` -- Individual track card component
- `website/components/audio/CollectionCard.tsx` -- Collection card component
- `website/components/audio/CategoryFilter.tsx` -- Category filter pills

**Mobile User App:**
- `mobile/user-app/src/screens/audio/AudioLibraryScreen.tsx` -- Audio library browse screen
- `mobile/user-app/src/screens/audio/AudioPlayerScreen.tsx` -- Full-screen audio player
- `mobile/user-app/src/screens/audio/CollectionScreen.tsx` -- Collection detail screen
- `mobile/user-app/src/screens/sadhana/SadhanaScreen.tsx` -- Main sadhana tracker screen
- `mobile/user-app/src/screens/sadhana/LogPracticeScreen.tsx` -- Log a practice session
- `mobile/user-app/src/screens/sadhana/SadhanaSummaryScreen.tsx` -- Weekly/monthly summary
- `mobile/user-app/src/context/AudioPlayerContext.tsx` -- Global audio player context
- `mobile/user-app/src/services/audioDownload.ts` -- Offline download service

### Files to Modify

- `website/app/layout.tsx` -- Wrap with AudioPlayerProvider, add persistent AudioPlayer
- `website/components/layout/Navbar.tsx` -- Add "Audio" nav link
- `mobile/user-app/src/navigation/AppNavigator.tsx` -- Add AudioLibrary, AudioPlayer, Collection, Sadhana routes
- `mobile/user-app/src/types/index.ts` -- Add AudioTrack, AudioCollection, SadhanaLog, SadhanaStreak types
- `mobile/user-app/src/screens/explore/ExploreScreen.tsx` -- Add Audio Library and Sadhana cards
- `mobile/user-app/src/screens/home/HomeScreen.tsx` -- Add Sadhana streak widget and "Continue Listening" section

---

## Task 1: AudioTrack MongoDB Model

**Files:**
- Create: `dashboard-next/src/models/AudioTrack.ts`

- [ ] **Step 1: Create the AudioTrack model with full schema**

```typescript
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAudioTrack extends Document {
  titleHindi: string;
  titleEnglish: string;
  artist: string;
  description?: string;
  duration: number; // in seconds
  durationFormatted: string; // "HH:MM:SS" or "MM:SS"
  category: 'bhajan' | 'kirtan' | 'mantra' | 'pravachan_audio' | 'chant' | 'aarti' | 'stuti';
  language: string;
  audioUrl: string; // Cloudinary URL
  audioPublicId?: string; // Cloudinary public_id for deletion
  coverImage?: string;
  lyrics?: string;
  lyricsHindi?: string;
  tags: string[];
  collections: mongoose.Types.ObjectId[];
  playCount: number;
  downloadCount: number;
  featured: boolean;
  sortOrder: number;
  isPublished: boolean;
  uploadedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AudioTrackSchema = new Schema<IAudioTrack>(
  {
    titleHindi: {
      type: String,
      required: [true, 'Hindi title is required'],
      trim: true,
      maxlength: [300, 'Hindi title cannot exceed 300 characters'],
    },
    titleEnglish: {
      type: String,
      required: [true, 'English title is required'],
      trim: true,
      maxlength: [300, 'English title cannot exceed 300 characters'],
      index: true,
    },
    artist: {
      type: String,
      required: [true, 'Artist/speaker name is required'],
      trim: true,
      maxlength: [200, 'Artist name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration in seconds is required'],
      min: [1, 'Duration must be at least 1 second'],
    },
    durationFormatted: {
      type: String,
      required: [true, 'Formatted duration is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['bhajan', 'kirtan', 'mantra', 'pravachan_audio', 'chant', 'aarti', 'stuti'],
        message: '{VALUE} is not a valid category',
      },
      index: true,
    },
    language: {
      type: String,
      default: 'Hindi',
      trim: true,
    },
    audioUrl: {
      type: String,
      required: [true, 'Audio URL is required'],
      trim: true,
    },
    audioPublicId: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      default: '/placeholder-audio.jpg',
      trim: true,
    },
    lyrics: {
      type: String,
      maxlength: [10000, 'Lyrics cannot exceed 10000 characters'],
    },
    lyricsHindi: {
      type: String,
      maxlength: [10000, 'Hindi lyrics cannot exceed 10000 characters'],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 20;
        },
        message: 'Maximum 20 tags allowed',
      },
    },
    collections: [
      {
        type: Schema.Types.ObjectId,
        ref: 'AudioCollection',
      },
    ],
    playCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

// Text index for search across titles, artist, description, tags
AudioTrackSchema.index({
  titleHindi: 'text',
  titleEnglish: 'text',
  artist: 'text',
  description: 'text',
  tags: 'text',
});

// Compound indexes for common queries
AudioTrackSchema.index({ category: 1, isDeleted: 1, isPublished: 1 });
AudioTrackSchema.index({ featured: 1, isDeleted: 1 });
AudioTrackSchema.index({ playCount: -1 });
AudioTrackSchema.index({ createdAt: -1 });

const AudioTrack: Model<IAudioTrack> =
  mongoose.models.AudioTrack || mongoose.model<IAudioTrack>('AudioTrack', AudioTrackSchema);

export default AudioTrack;
```

- [ ] **Step 2: Verify model compiles**

Run: `cd /Users/apple/Downloads/agm-india-dashboard-website-master/dashboard-next && npx tsc --noEmit src/models/AudioTrack.ts 2>&1 | head -20`

Expected: No errors, or only errors from missing module resolution (acceptable in isolation).

---

## Task 2: AudioCollection MongoDB Model

**Files:**
- Create: `dashboard-next/src/models/AudioCollection.ts`

- [ ] **Step 1: Create the AudioCollection model**

```typescript
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAudioCollection extends Document {
  title: string;
  titleHindi?: string;
  description?: string;
  coverImage?: string;
  category: 'bhajan' | 'kirtan' | 'mantra' | 'pravachan_audio' | 'chant' | 'aarti' | 'stuti' | 'mixed';
  tracks: mongoose.Types.ObjectId[];
  trackCount: number;
  totalDuration: number; // total seconds of all tracks
  featured: boolean;
  sortOrder: number;
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AudioCollectionSchema = new Schema<IAudioCollection>(
  {
    title: {
      type: String,
      required: [true, 'Collection title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
      index: true,
    },
    titleHindi: {
      type: String,
      trim: true,
      maxlength: [300, 'Hindi title cannot exceed 300 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    coverImage: {
      type: String,
      default: '/placeholder-collection.jpg',
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: ['bhajan', 'kirtan', 'mantra', 'pravachan_audio', 'chant', 'aarti', 'stuti', 'mixed'],
        message: '{VALUE} is not a valid category',
      },
      default: 'mixed',
    },
    tracks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'AudioTrack',
      },
    ],
    trackCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

AudioCollectionSchema.index({ title: 'text', description: 'text' });
AudioCollectionSchema.index({ category: 1, isDeleted: 1, isPublished: 1 });
AudioCollectionSchema.index({ featured: 1, isDeleted: 1 });

const AudioCollection: Model<IAudioCollection> =
  mongoose.models.AudioCollection ||
  mongoose.model<IAudioCollection>('AudioCollection', AudioCollectionSchema);

export default AudioCollection;
```

- [ ] **Step 2: Verify model compiles**

Run: `cd /Users/apple/Downloads/agm-india-dashboard-website-master/dashboard-next && npx tsc --noEmit src/models/AudioCollection.ts 2>&1 | head -20`

---

## Task 3: SadhanaLog MongoDB Model

**Files:**
- Create: `dashboard-next/src/models/SadhanaLog.ts`

- [ ] **Step 1: Create the SadhanaLog model for individual practice entries**

```typescript
import mongoose, { Document, Schema, Model } from 'mongoose';

export type PracticeType = 'meditation' | 'japa' | 'scripture_reading' | 'seva' | 'pranayama';

export interface ISadhanaLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date; // normalized to midnight UTC for the practice day
  practiceType: PracticeType;
  durationMinutes?: number; // for meditation, pranayama, seva, scripture_reading (time-based)
  count?: number; // for japa (mala rounds), scripture_reading (pages)
  notes?: string;
  mood?: 'peaceful' | 'focused' | 'distracted' | 'joyful' | 'grateful';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SadhanaLogSchema = new Schema<ISadhanaLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Practice date is required'],
      index: true,
    },
    practiceType: {
      type: String,
      required: [true, 'Practice type is required'],
      enum: {
        values: ['meditation', 'japa', 'scripture_reading', 'seva', 'pranayama'],
        message: '{VALUE} is not a valid practice type',
      },
    },
    durationMinutes: {
      type: Number,
      min: [1, 'Duration must be at least 1 minute'],
      max: [1440, 'Duration cannot exceed 24 hours'],
      validate: {
        validator: function (this: ISadhanaLog, val: number | undefined) {
          // Duration required for time-based practices
          if (['meditation', 'pranayama', 'seva'].includes(this.practiceType)) {
            return val != null && val > 0;
          }
          return true;
        },
        message: 'Duration is required for this practice type',
      },
    },
    count: {
      type: Number,
      min: [1, 'Count must be at least 1'],
      max: [10000, 'Count cannot exceed 10000'],
      validate: {
        validator: function (this: ISadhanaLog, val: number | undefined) {
          // Count required for japa (rounds)
          if (this.practiceType === 'japa') {
            return val != null && val > 0;
          }
          return true;
        },
        message: 'Round count is required for japa practice',
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    mood: {
      type: String,
      enum: ['peaceful', 'focused', 'distracted', 'joyful', 'grateful'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

// Compound index for user daily lookups
SadhanaLogSchema.index({ userId: 1, date: 1, practiceType: 1 });
// Index for summary aggregation queries
SadhanaLogSchema.index({ userId: 1, date: -1, isDeleted: 1 });

const SadhanaLog: Model<ISadhanaLog> =
  mongoose.models.SadhanaLog || mongoose.model<ISadhanaLog>('SadhanaLog', SadhanaLogSchema);

export default SadhanaLog;
```

- [ ] **Step 2: Verify model compiles**

Run: `cd /Users/apple/Downloads/agm-india-dashboard-website-master/dashboard-next && npx tsc --noEmit src/models/SadhanaLog.ts 2>&1 | head -20`

---

## Task 4: SadhanaStreak MongoDB Model

**Files:**
- Create: `dashboard-next/src/models/SadhanaStreak.ts`

- [ ] **Step 1: Create the SadhanaStreak model for tracking consecutive practice days**

```typescript
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISadhanaStreak extends Document {
  userId: mongoose.Types.ObjectId;
  currentStreak: number; // current consecutive days
  longestStreak: number; // all-time longest streak
  lastPracticeDate: Date; // last date user logged any practice
  totalPracticeDays: number; // total unique days with at least one practice
  totalMinutes: number; // cumulative minutes across all practices
  totalJapaRounds: number; // cumulative japa rounds
  streakStartDate?: Date; // when the current streak began
  milestones: number[]; // streak milestones achieved (e.g., [7, 21, 40, 108])
  weeklyGoal: number; // target days per week (default 7)
  reminderEnabled: boolean;
  reminderTime?: string; // "HH:MM" format, e.g. "05:30"
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SadhanaStreakSchema = new Schema<ISadhanaStreak>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastPracticeDate: {
      type: Date,
    },
    totalPracticeDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalJapaRounds: {
      type: Number,
      default: 0,
      min: 0,
    },
    streakStartDate: {
      type: Date,
    },
    milestones: {
      type: [Number],
      default: [],
    },
    weeklyGoal: {
      type: Number,
      default: 7,
      min: 1,
      max: 7,
    },
    reminderEnabled: {
      type: Boolean,
      default: false,
    },
    reminderTime: {
      type: String,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Reminder time must be in HH:MM format'],
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

const SadhanaStreak: Model<ISadhanaStreak> =
  mongoose.models.SadhanaStreak ||
  mongoose.model<ISadhanaStreak>('SadhanaStreak', SadhanaStreakSchema);

export default SadhanaStreak;
```

- [ ] **Step 2: Verify model compiles**

Run: `cd /Users/apple/Downloads/agm-india-dashboard-website-master/dashboard-next && npx tsc --noEmit src/models/SadhanaStreak.ts 2>&1 | head -20`

---

## Task 5: Audio Tracks API Routes

**Files:**
- Create: `dashboard-next/src/app/api/audio-tracks/route.ts`
- Create: `dashboard-next/src/app/api/audio-tracks/[id]/route.ts`

- [ ] **Step 1: Create the main audio-tracks API route (GET list + POST create)**

```typescript
import AudioTrack, { IAudioTrack } from '@/models/AudioTrack';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import getCloudinary from '@/utils/cloudinary';
import { UploadApiResponse } from 'cloudinary';

type ApiResponse = {
  success: boolean;
  message: string;
  data?: IAudioTrack | IAudioTrack[] | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const errorResponse = (message: string, error?: string, status = 500) => {
  return NextResponse.json<ApiResponse>(
    { success: false, message, ...(error && { error }) } as ApiResponse,
    {
      status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
};

const successResponse = (
  message: string,
  data?: IAudioTrack | IAudioTrack[] | null,
  status = 200,
  pagination?: ApiResponse['pagination']
) => {
  return NextResponse.json<ApiResponse>(
    { success: true, message, data, ...(pagination && { pagination }) },
    {
      status,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        'Surrogate-Control': 'max-age=300',
        Vary: 'Accept-Encoding, Cookie',
      },
    }
  );
};

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // Build query filter
    const filter: Record<string, unknown> = { isDeleted: false, isPublished: true };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [tracks, total] = await Promise.all([
      AudioTrack.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      AudioTrack.countDocuments(filter),
    ]);

    return successResponse(
      'Audio tracks retrieved successfully',
      tracks as unknown as IAudioTrack[],
      200,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error) {
    console.error('Error fetching audio tracks:', error);
    return errorResponse(
      'Failed to fetch audio tracks',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const formData = await request.formData();

    const titleHindi = formData.get('titleHindi') as string;
    const titleEnglish = formData.get('titleEnglish') as string;
    const artist = formData.get('artist') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const language = (formData.get('language') as string) || 'Hindi';
    const lyrics = formData.get('lyrics') as string;
    const lyricsHindi = formData.get('lyricsHindi') as string;
    const tagsStr = formData.get('tags') as string;
    const featured = formData.get('featured') === 'true';
    const sortOrder = parseInt((formData.get('sortOrder') as string) || '0', 10);

    // Get the audio file
    const audioFile = formData.get('audioFile') as File | null;
    // Get the cover image
    const coverImageFile = formData.get('coverImage') as File | string | null;

    if (!titleHindi || !titleEnglish || !artist || !category) {
      return errorResponse('Title (Hindi), Title (English), artist, and category are required', undefined, 400);
    }

    if (!audioFile || !(audioFile instanceof File) || audioFile.size === 0) {
      return errorResponse('Audio file is required', undefined, 400);
    }

    // Validate file size (max 100MB)
    if (audioFile.size > 100 * 1024 * 1024) {
      return errorResponse('Audio file must be less than 100MB', undefined, 400);
    }

    // Upload audio to Cloudinary
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const cloudinary = getCloudinary();

    const audioUpload = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'audio-library/tracks',
            resource_type: 'video', // Cloudinary uses 'video' for audio files
            public_id: `audio-${Date.now()}-${titleEnglish.toLowerCase().replace(/\s+/g, '-').slice(0, 40)}`,
            format: 'mp3',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as UploadApiResponse);
          }
        )
        .end(audioBuffer);
    });

    // Extract duration from Cloudinary response
    const durationSeconds = Math.round(audioUpload.duration || 0);
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const seconds = durationSeconds % 60;
    const durationFormatted = hours > 0
      ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Upload cover image if provided
    let coverImageUrl = '/placeholder-audio.jpg';
    if (coverImageFile) {
      if (coverImageFile instanceof File && coverImageFile.size > 0) {
        const imgBuffer = Buffer.from(await coverImageFile.arrayBuffer());
        const imgUpload = await new Promise<UploadApiResponse>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: 'audio-library/covers',
                resource_type: 'image',
                transformation: [
                  { width: 500, height: 500, crop: 'fill' },
                  { quality: 'auto:good' },
                ],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result as UploadApiResponse);
              }
            )
            .end(imgBuffer);
        });
        coverImageUrl = imgUpload.secure_url;
      } else if (typeof coverImageFile === 'string' && coverImageFile.trim()) {
        coverImageUrl = coverImageFile;
      }
    }

    // Parse tags
    const tags = tagsStr
      ? tagsStr.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const newTrack = new AudioTrack({
      titleHindi,
      titleEnglish,
      artist,
      description,
      duration: durationSeconds,
      durationFormatted,
      category,
      language,
      audioUrl: audioUpload.secure_url,
      audioPublicId: audioUpload.public_id,
      coverImage: coverImageUrl,
      lyrics,
      lyricsHindi,
      tags,
      featured,
      sortOrder,
      isPublished: true,
    });

    const savedTrack = await newTrack.save();
    return successResponse('Audio track created successfully', savedTrack, 201);
  } catch (error) {
    console.error('Error creating audio track:', error);

    if (error instanceof Error && error.name === 'ValidationError') {
      return errorResponse('Validation error', error.message, 400);
    }

    return errorResponse(
      'Failed to create audio track',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}
```

- [ ] **Step 2: Create the single audio track API route (GET/PUT/DELETE)**

```typescript
import AudioTrack, { IAudioTrack } from '@/models/AudioTrack';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import getCloudinary from '@/utils/cloudinary';

type ApiResponse = {
  success: boolean;
  message: string;
  data?: IAudioTrack | null;
};

const errorResponse = (message: string, error?: string, status = 500) => {
  return NextResponse.json<ApiResponse>(
    { success: false, message } as ApiResponse,
    { status }
  );
};

const successResponse = (message: string, data?: IAudioTrack | null, status = 200) => {
  return NextResponse.json<ApiResponse>(
    { success: true, message, data },
    { status }
  );
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const { id } = await params;

    const track = await AudioTrack.findOne({ _id: id, isDeleted: false }).lean();

    if (!track) {
      return errorResponse('Audio track not found', undefined, 404);
    }

    // Increment play count (fire-and-forget)
    AudioTrack.updateOne({ _id: id }, { $inc: { playCount: 1 } }).catch(() => {});

    return successResponse('Audio track retrieved successfully', track as unknown as IAudioTrack);
  } catch (error) {
    console.error('Error fetching audio track:', error);
    return errorResponse(
      'Failed to fetch audio track',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const { id } = await params;

    const formData = await request.formData();

    const updateData: Record<string, unknown> = {};

    // Extract text fields
    const textFields = [
      'titleHindi', 'titleEnglish', 'artist', 'description',
      'category', 'language', 'lyrics', 'lyricsHindi',
    ];

    for (const field of textFields) {
      const value = formData.get(field);
      if (value !== null) {
        updateData[field] = value;
      }
    }

    // Handle tags
    const tagsStr = formData.get('tags') as string;
    if (tagsStr !== null) {
      updateData.tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    }

    // Handle boolean fields
    const featuredVal = formData.get('featured');
    if (featuredVal !== null) {
      updateData.featured = featuredVal === 'true';
    }

    const isPublishedVal = formData.get('isPublished');
    if (isPublishedVal !== null) {
      updateData.isPublished = isPublishedVal === 'true';
    }

    // Handle sort order
    const sortOrderVal = formData.get('sortOrder');
    if (sortOrderVal !== null) {
      updateData.sortOrder = parseInt(sortOrderVal as string, 10);
    }

    // Handle new audio file upload (replace existing)
    const audioFile = formData.get('audioFile') as File | null;
    if (audioFile && audioFile instanceof File && audioFile.size > 0) {
      if (audioFile.size > 100 * 1024 * 1024) {
        return errorResponse('Audio file must be less than 100MB', undefined, 400);
      }

      const cloudinary = getCloudinary();
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

      // Delete old audio from Cloudinary
      const existingTrack = await AudioTrack.findById(id);
      if (existingTrack?.audioPublicId) {
        cloudinary.uploader.destroy(existingTrack.audioPublicId, { resource_type: 'video' }).catch(() => {});
      }

      const audioUpload = await new Promise<import('cloudinary').UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: 'audio-library/tracks',
              resource_type: 'video',
              format: 'mp3',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as import('cloudinary').UploadApiResponse);
            }
          )
          .end(audioBuffer);
      });

      updateData.audioUrl = audioUpload.secure_url;
      updateData.audioPublicId = audioUpload.public_id;

      const durationSeconds = Math.round(audioUpload.duration || 0);
      const hours = Math.floor(durationSeconds / 3600);
      const minutes = Math.floor((durationSeconds % 3600) / 60);
      const seconds = durationSeconds % 60;
      updateData.duration = durationSeconds;
      updateData.durationFormatted = hours > 0
        ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Handle cover image
    const coverImageFile = formData.get('coverImage') as File | string | null;
    if (coverImageFile) {
      if (coverImageFile instanceof File && coverImageFile.size > 0) {
        const cloudinary = getCloudinary();
        const imgBuffer = Buffer.from(await coverImageFile.arrayBuffer());
        const imgUpload = await new Promise<import('cloudinary').UploadApiResponse>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: 'audio-library/covers',
                resource_type: 'image',
                transformation: [
                  { width: 500, height: 500, crop: 'fill' },
                  { quality: 'auto:good' },
                ],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result as import('cloudinary').UploadApiResponse);
              }
            )
            .end(imgBuffer);
        });
        updateData.coverImage = imgUpload.secure_url;
      } else if (typeof coverImageFile === 'string' && coverImageFile.trim()) {
        updateData.coverImage = coverImageFile;
      }
    }

    const updatedTrack = await AudioTrack.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedTrack) {
      return errorResponse('Audio track not found', undefined, 404);
    }

    return successResponse('Audio track updated successfully', updatedTrack);
  } catch (error) {
    console.error('Error updating audio track:', error);
    return errorResponse(
      'Failed to update audio track',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const { id } = await params;

    const track = await AudioTrack.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!track) {
      return errorResponse('Audio track not found', undefined, 404);
    }

    return successResponse('Audio track deleted successfully', track);
  } catch (error) {
    console.error('Error deleting audio track:', error);
    return errorResponse(
      'Failed to delete audio track',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}
```

---

## Task 6: Audio Collections API Routes

**Files:**
- Create: `dashboard-next/src/app/api/audio-collections/route.ts`
- Create: `dashboard-next/src/app/api/audio-collections/[id]/route.ts`
- Create: `dashboard-next/src/app/api/audio-collections/[id]/tracks/route.ts`

- [ ] **Step 1: Create the main audio-collections API route (GET + POST)**

```typescript
import AudioCollection, { IAudioCollection } from '@/models/AudioCollection';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import getCloudinary from '@/utils/cloudinary';
import { UploadApiResponse } from 'cloudinary';

type ApiResponse = {
  success: boolean;
  message: string;
  data?: IAudioCollection | IAudioCollection[] | null;
};

const errorResponse = (message: string, error?: string, status = 500) => {
  return NextResponse.json<ApiResponse>(
    { success: false, message } as ApiResponse,
    { status }
  );
};

const successResponse = (message: string, data?: IAudioCollection | IAudioCollection[] | null, status = 200) => {
  return NextResponse.json<ApiResponse>(
    { success: true, message, data },
    {
      status,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    }
  );
};

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const filter: Record<string, unknown> = { isDeleted: false, isPublished: true };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    const collections = await AudioCollection.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .populate({
        path: 'tracks',
        match: { isDeleted: false, isPublished: true },
        select: 'titleEnglish titleHindi artist duration durationFormatted coverImage audioUrl category',
      })
      .lean();

    return successResponse('Audio collections retrieved successfully', collections as unknown as IAudioCollection[]);
  } catch (error) {
    console.error('Error fetching audio collections:', error);
    return errorResponse(
      'Failed to fetch audio collections',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const formData = await request.formData();

    const title = formData.get('title') as string;
    const titleHindi = formData.get('titleHindi') as string;
    const description = formData.get('description') as string;
    const category = (formData.get('category') as string) || 'mixed';
    const featured = formData.get('featured') === 'true';
    const sortOrder = parseInt((formData.get('sortOrder') as string) || '0', 10);
    const coverImageFile = formData.get('coverImage') as File | string | null;

    if (!title) {
      return errorResponse('Collection title is required', undefined, 400);
    }

    let coverImageUrl = '/placeholder-collection.jpg';
    if (coverImageFile) {
      if (coverImageFile instanceof File && coverImageFile.size > 0) {
        const cloudinary = getCloudinary();
        const imgBuffer = Buffer.from(await coverImageFile.arrayBuffer());
        const imgUpload = await new Promise<UploadApiResponse>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: 'audio-library/collection-covers',
                resource_type: 'image',
                transformation: [
                  { width: 800, height: 800, crop: 'fill' },
                  { quality: 'auto:good' },
                ],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result as UploadApiResponse);
              }
            )
            .end(imgBuffer);
        });
        coverImageUrl = imgUpload.secure_url;
      } else if (typeof coverImageFile === 'string' && coverImageFile.trim()) {
        coverImageUrl = coverImageFile;
      }
    }

    const newCollection = new AudioCollection({
      title,
      titleHindi,
      description,
      coverImage: coverImageUrl,
      category,
      featured,
      sortOrder,
      isPublished: true,
    });

    const savedCollection = await newCollection.save();
    return successResponse('Audio collection created successfully', savedCollection, 201);
  } catch (error) {
    console.error('Error creating audio collection:', error);
    return errorResponse(
      'Failed to create audio collection',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}
```

- [ ] **Step 2: Create the single collection API route (GET/PUT/DELETE)**

```typescript
import AudioCollection, { IAudioCollection } from '@/models/AudioCollection';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

type ApiResponse = {
  success: boolean;
  message: string;
  data?: IAudioCollection | null;
};

const errorResponse = (message: string, error?: string, status = 500) => {
  return NextResponse.json<ApiResponse>({ success: false, message } as ApiResponse, { status });
};

const successResponse = (message: string, data?: IAudioCollection | null, status = 200) => {
  return NextResponse.json<ApiResponse>({ success: true, message, data }, { status });
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const { id } = await params;

    const collection = await AudioCollection.findOne({ _id: id, isDeleted: false })
      .populate({
        path: 'tracks',
        match: { isDeleted: false, isPublished: true },
        select: 'titleEnglish titleHindi artist duration durationFormatted coverImage audioUrl category playCount',
      })
      .lean();

    if (!collection) {
      return errorResponse('Audio collection not found', undefined, 404);
    }

    return successResponse('Audio collection retrieved successfully', collection as unknown as IAudioCollection);
  } catch (error) {
    console.error('Error fetching audio collection:', error);
    return errorResponse('Failed to fetch audio collection', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['title', 'titleHindi', 'description', 'coverImage', 'category', 'featured', 'sortOrder', 'isPublished'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updatedCollection = await AudioCollection.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedCollection) {
      return errorResponse('Audio collection not found', undefined, 404);
    }

    return successResponse('Audio collection updated successfully', updatedCollection);
  } catch (error) {
    console.error('Error updating audio collection:', error);
    return errorResponse('Failed to update audio collection', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const { id } = await params;

    const collection = await AudioCollection.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!collection) {
      return errorResponse('Audio collection not found', undefined, 404);
    }

    return successResponse('Audio collection deleted successfully', collection);
  } catch (error) {
    console.error('Error deleting audio collection:', error);
    return errorResponse('Failed to delete audio collection', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}
```

- [ ] **Step 3: Create the collection tracks management route (add/remove tracks)**

```typescript
import AudioCollection from '@/models/AudioCollection';
import AudioTrack from '@/models/AudioTrack';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

type ApiResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const { id } = await params;
    const { trackIds } = await request.json();

    if (!Array.isArray(trackIds) || trackIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'trackIds array is required' },
        { status: 400 }
      );
    }

    // Verify all tracks exist
    const existingTracks = await AudioTrack.find({
      _id: { $in: trackIds },
      isDeleted: false,
    }).select('_id duration');

    if (existingTracks.length !== trackIds.length) {
      return NextResponse.json(
        { success: false, message: 'Some track IDs are invalid or deleted' },
        { status: 400 }
      );
    }

    // Add tracks to collection (avoid duplicates)
    const collection = await AudioCollection.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        $addToSet: { tracks: { $each: trackIds } },
      },
      { new: true }
    );

    if (!collection) {
      return NextResponse.json(
        { success: false, message: 'Audio collection not found' },
        { status: 404 }
      );
    }

    // Recalculate trackCount and totalDuration
    const allTracks = await AudioTrack.find({
      _id: { $in: collection.tracks },
      isDeleted: false,
    }).select('duration');

    collection.trackCount = allTracks.length;
    collection.totalDuration = allTracks.reduce((sum, t) => sum + (t.duration || 0), 0);
    await collection.save();

    // Update tracks to reference this collection
    await AudioTrack.updateMany(
      { _id: { $in: trackIds } },
      { $addToSet: { collections: id } }
    );

    return NextResponse.json({
      success: true,
      message: `${trackIds.length} track(s) added to collection`,
      data: collection,
    });
  } catch (error) {
    console.error('Error adding tracks to collection:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add tracks to collection' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const { id } = await params;
    const { trackIds } = await request.json();

    if (!Array.isArray(trackIds) || trackIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'trackIds array is required' },
        { status: 400 }
      );
    }

    const collection = await AudioCollection.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $pull: { tracks: { $in: trackIds } } },
      { new: true }
    );

    if (!collection) {
      return NextResponse.json(
        { success: false, message: 'Audio collection not found' },
        { status: 404 }
      );
    }

    // Recalculate
    const remainingTracks = await AudioTrack.find({
      _id: { $in: collection.tracks },
      isDeleted: false,
    }).select('duration');

    collection.trackCount = remainingTracks.length;
    collection.totalDuration = remainingTracks.reduce((sum, t) => sum + (t.duration || 0), 0);
    await collection.save();

    // Remove collection reference from tracks
    await AudioTrack.updateMany(
      { _id: { $in: trackIds } },
      { $pull: { collections: id } }
    );

    return NextResponse.json({
      success: true,
      message: `${trackIds.length} track(s) removed from collection`,
      data: collection,
    });
  } catch (error) {
    console.error('Error removing tracks from collection:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove tracks from collection' },
      { status: 500 }
    );
  }
}
```

---

## Task 7: Sadhana API Routes

**Files:**
- Create: `dashboard-next/src/app/api/sadhana/log/route.ts`
- Create: `dashboard-next/src/app/api/sadhana/log/[id]/route.ts`
- Create: `dashboard-next/src/app/api/sadhana/streak/route.ts`
- Create: `dashboard-next/src/app/api/sadhana/summary/route.ts`

- [ ] **Step 1: Create the sadhana log API route (GET user's logs + POST new log)**

```typescript
import SadhanaLog, { ISadhanaLog } from '@/models/SadhanaLog';
import SadhanaStreak from '@/models/SadhanaStreak';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

type ApiResponse = {
  success: boolean;
  message: string;
  data?: ISadhanaLog | ISadhanaLog[] | null;
};

function normalizeDate(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function isConsecutiveDay(date1: Date, date2: Date): boolean {
  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);
  const diffMs = Math.abs(d1.getTime() - d2.getTime());
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays === 1;
}

function isSameDay(date1: Date, date2: Date): boolean {
  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);
  return d1.getTime() === d2.getTime();
}

// Milestone thresholds for spiritual significance
const STREAK_MILESTONES = [3, 7, 11, 21, 40, 48, 90, 108, 365];

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const practiceType = searchParams.get('practiceType');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId is required' },
        { status: 400 }
      );
    }

    const filter: Record<string, unknown> = { userId, isDeleted: false };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) (filter.date as Record<string, unknown>).$gte = normalizeDate(new Date(startDate));
      if (endDate) (filter.date as Record<string, unknown>).$lte = normalizeDate(new Date(endDate));
    }

    if (practiceType) {
      filter.practiceType = practiceType;
    }

    const logs = await SadhanaLog.find(filter)
      .sort({ date: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Sadhana logs retrieved successfully',
      data: logs as unknown as ISadhanaLog[],
    });
  } catch (error) {
    console.error('Error fetching sadhana logs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sadhana logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, date, practiceType, durationMinutes, count, notes, mood } = body;

    if (!userId || !date || !practiceType) {
      return NextResponse.json(
        { success: false, message: 'userId, date, and practiceType are required' },
        { status: 400 }
      );
    }

    const practiceDate = normalizeDate(new Date(date));
    const today = normalizeDate(new Date());

    // Don't allow logging future dates
    if (practiceDate.getTime() > today.getTime()) {
      return NextResponse.json(
        { success: false, message: 'Cannot log practice for future dates' },
        { status: 400 }
      );
    }

    // Create the log entry
    const newLog = new SadhanaLog({
      userId,
      date: practiceDate,
      practiceType,
      durationMinutes,
      count,
      notes,
      mood,
    });

    const savedLog = await newLog.save();

    // Update streak information
    let streak = await SadhanaStreak.findOne({ userId });

    if (!streak) {
      streak = new SadhanaStreak({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastPracticeDate: practiceDate,
        totalPracticeDays: 1,
        totalMinutes: durationMinutes || 0,
        totalJapaRounds: practiceType === 'japa' ? (count || 0) : 0,
        streakStartDate: practiceDate,
        milestones: [],
      });
    } else {
      // Update totals
      streak.totalMinutes += durationMinutes || 0;
      if (practiceType === 'japa') {
        streak.totalJapaRounds += count || 0;
      }

      if (!streak.lastPracticeDate) {
        // First ever log
        streak.currentStreak = 1;
        streak.lastPracticeDate = practiceDate;
        streak.streakStartDate = practiceDate;
        streak.totalPracticeDays = 1;
      } else if (isSameDay(practiceDate, streak.lastPracticeDate)) {
        // Same day, no streak change (additional practice on same day)
      } else if (isConsecutiveDay(practiceDate, streak.lastPracticeDate)) {
        // Consecutive day -- extend streak
        streak.currentStreak += 1;
        streak.lastPracticeDate = practiceDate;
        streak.totalPracticeDays += 1;
      } else if (practiceDate.getTime() > streak.lastPracticeDate.getTime()) {
        // Streak broken -- start new one
        streak.currentStreak = 1;
        streak.lastPracticeDate = practiceDate;
        streak.streakStartDate = practiceDate;
        streak.totalPracticeDays += 1;
      } else {
        // Backfilling an older date -- just update totals, don't change streak
        streak.totalPracticeDays += 1;
      }

      // Update longest streak
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }

      // Check milestones
      for (const milestone of STREAK_MILESTONES) {
        if (streak.currentStreak >= milestone && !streak.milestones.includes(milestone)) {
          streak.milestones.push(milestone);
        }
      }
    }

    await streak.save();

    return NextResponse.json({
      success: true,
      message: 'Practice logged successfully',
      data: savedLog,
    }, { status: 201 });
  } catch (error) {
    console.error('Error logging sadhana:', error);

    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, message: 'Validation error: ' + error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to log practice' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create the single sadhana log route (PUT/DELETE)**

```typescript
import SadhanaLog, { ISadhanaLog } from '@/models/SadhanaLog';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

type ApiResponse = {
  success: boolean;
  message: string;
  data?: ISadhanaLog | null;
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const allowedFields = ['durationMinutes', 'count', 'notes', 'mood'];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updatedLog = await SadhanaLog.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedLog) {
      return NextResponse.json(
        { success: false, message: 'Sadhana log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Practice log updated successfully',
      data: updatedLog,
    });
  } catch (error) {
    console.error('Error updating sadhana log:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update practice log' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const { id } = await params;

    const log = await SadhanaLog.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!log) {
      return NextResponse.json(
        { success: false, message: 'Sadhana log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Practice log deleted successfully',
      data: log,
    });
  } catch (error) {
    console.error('Error deleting sadhana log:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete practice log' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Create the streak API route (GET user streak)**

```typescript
import SadhanaStreak, { ISadhanaStreak } from '@/models/SadhanaStreak';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

type ApiResponse = {
  success: boolean;
  message: string;
  data?: (ISadhanaStreak & { motivationalMessage: string; nextMilestone: number | null }) | null;
};

const MOTIVATIONAL_MESSAGES: Record<string, string> = {
  '0': '"The journey of a thousand miles begins with a single step." -- Start your sadhana today!',
  '1': '"You have taken the first step. The divine is watching." -- Swami Avdheshanand Giri Ji',
  '3': '"Three days of dedication! Your will is awakening." -- Keep going, seeker.',
  '7': '"One week of unbroken practice! The rhythm of the cosmos flows through you."',
  '11': '"Eleven days! In the Ekadashi tradition, this is a sacred number. You are blessed."',
  '21': '"Twenty-one days -- a habit is forming. Your sadhana is becoming your nature."',
  '40': '"Forty days! A spiritual mandala complete. You have transformed."',
  '48': '"Forty-eight days of fire! Like the Navadurga cycle magnified. Extraordinary!"',
  '90': '"Ninety days! Three months of unwavering devotion. You are an inspiration."',
  '108': '"108 days -- the sacred mala complete! You embody the 108 names of the Divine."',
  '365': '"One full year of daily sadhana! You have walked the complete cycle. Jai Gurudev!"',
};

function getMotivationalMessage(streak: number): string {
  // Check exact milestone messages first
  if (MOTIVATIONAL_MESSAGES[streak.toString()]) {
    return MOTIVATIONAL_MESSAGES[streak.toString()];
  }

  // Fallback messages based on ranges
  if (streak < 3) return '"Every moment is a fresh beginning." -- Begin with devotion today.';
  if (streak < 7) return '"Consistency is the bridge between intention and realization." -- Keep going!';
  if (streak < 21) return '"Your dedication is blossoming. The divine witnesses your effort."';
  if (streak < 40) return '"Steady practice dissolves all obstacles. You are on the path."';
  if (streak < 108) return '"Your sadhana flame burns brightly. Nothing can extinguish this fire."';
  return '"You are an embodiment of devotion. Your practice illuminates the world."';
}

function getNextMilestone(currentStreak: number): number | null {
  const milestones = [3, 7, 11, 21, 40, 48, 90, 108, 365];
  for (const m of milestones) {
    if (currentStreak < m) return m;
  }
  return null;
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId is required' },
        { status: 400 }
      );
    }

    let streak = await SadhanaStreak.findOne({ userId, isDeleted: false }).lean();

    if (!streak) {
      // Return empty streak for new users
      return NextResponse.json({
        success: true,
        message: 'No streak data found. Start your sadhana!',
        data: {
          currentStreak: 0,
          longestStreak: 0,
          totalPracticeDays: 0,
          totalMinutes: 0,
          totalJapaRounds: 0,
          milestones: [],
          weeklyGoal: 7,
          motivationalMessage: getMotivationalMessage(0),
          nextMilestone: 3,
        } as unknown as ISadhanaStreak & { motivationalMessage: string; nextMilestone: number | null },
      });
    }

    // Check if streak is still active (last practice was yesterday or today)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const streakData = streak as unknown as ISadhanaStreak;

    if (streakData.lastPracticeDate) {
      const lastPractice = new Date(streakData.lastPracticeDate);
      lastPractice.setUTCHours(0, 0, 0, 0);

      if (lastPractice.getTime() < yesterday.getTime()) {
        // Streak is broken -- update it
        await SadhanaStreak.updateOne(
          { userId },
          { $set: { currentStreak: 0, streakStartDate: null } }
        );
        (streak as Record<string, unknown>).currentStreak = 0;
        (streak as Record<string, unknown>).streakStartDate = null;
      }
    }

    const currentStreak = (streak as Record<string, unknown>).currentStreak as number;

    return NextResponse.json({
      success: true,
      message: 'Streak data retrieved successfully',
      data: {
        ...streak,
        motivationalMessage: getMotivationalMessage(currentStreak),
        nextMilestone: getNextMilestone(currentStreak),
      } as unknown as ISadhanaStreak & { motivationalMessage: string; nextMilestone: number | null },
    });
  } catch (error) {
    console.error('Error fetching streak data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch streak data' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 4: Create the sadhana summary API route (weekly/monthly stats)**

```typescript
import SadhanaLog from '@/models/SadhanaLog';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

interface PracticeSummary {
  practiceType: string;
  totalDuration: number;
  totalCount: number;
  sessionCount: number;
}

interface DailySummary {
  date: string;
  practices: PracticeSummary[];
  totalMinutes: number;
}

type ApiResponse = {
  success: boolean;
  message: string;
  data?: {
    period: string;
    startDate: string;
    endDate: string;
    dailySummaries: DailySummary[];
    practiceBreakdown: PracticeSummary[];
    activeDays: number;
    totalDays: number;
    totalMinutes: number;
    totalJapaRounds: number;
    completionRate: number; // percentage of days with at least one practice
  } | null;
};

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const period = searchParams.get('period') || 'week'; // 'week' or 'month'

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId is required' },
        { status: 400 }
      );
    }

    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    let startDate: Date;
    let totalDays: number;

    if (period === 'month') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 29); // Last 30 days
      totalDays = 30;
    } else {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6); // Last 7 days
      totalDays = 7;
    }

    const logs = await SadhanaLog.find({
      userId,
      isDeleted: false,
      date: { $gte: startDate, $lte: now },
    })
      .sort({ date: 1 })
      .lean();

    // Group by date
    const dailyMap = new Map<string, typeof logs>();
    for (const log of logs) {
      const dateKey = new Date(log.date).toISOString().split('T')[0];
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, []);
      }
      dailyMap.get(dateKey)!.push(log);
    }

    // Build daily summaries
    const dailySummaries: DailySummary[] = [];
    for (const [dateKey, dayLogs] of dailyMap.entries()) {
      const practices: PracticeSummary[] = [];
      const typeMap = new Map<string, PracticeSummary>();

      for (const log of dayLogs) {
        if (!typeMap.has(log.practiceType)) {
          typeMap.set(log.practiceType, {
            practiceType: log.practiceType,
            totalDuration: 0,
            totalCount: 0,
            sessionCount: 0,
          });
        }
        const entry = typeMap.get(log.practiceType)!;
        entry.totalDuration += log.durationMinutes || 0;
        entry.totalCount += log.count || 0;
        entry.sessionCount += 1;
      }

      practices.push(...typeMap.values());

      dailySummaries.push({
        date: dateKey,
        practices,
        totalMinutes: practices.reduce((s, p) => s + p.totalDuration, 0),
      });
    }

    // Build overall practice breakdown
    const overallTypeMap = new Map<string, PracticeSummary>();
    for (const log of logs) {
      if (!overallTypeMap.has(log.practiceType)) {
        overallTypeMap.set(log.practiceType, {
          practiceType: log.practiceType,
          totalDuration: 0,
          totalCount: 0,
          sessionCount: 0,
        });
      }
      const entry = overallTypeMap.get(log.practiceType)!;
      entry.totalDuration += log.durationMinutes || 0;
      entry.totalCount += log.count || 0;
      entry.sessionCount += 1;
    }

    const activeDays = dailyMap.size;
    const totalMinutes = logs.reduce((s, l) => s + (l.durationMinutes || 0), 0);
    const totalJapaRounds = logs
      .filter(l => l.practiceType === 'japa')
      .reduce((s, l) => s + (l.count || 0), 0);

    return NextResponse.json({
      success: true,
      message: 'Summary retrieved successfully',
      data: {
        period,
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
        dailySummaries,
        practiceBreakdown: Array.from(overallTypeMap.values()),
        activeDays,
        totalDays,
        totalMinutes,
        totalJapaRounds,
        completionRate: Math.round((activeDays / totalDays) * 100),
      },
    });
  } catch (error) {
    console.error('Error fetching sadhana summary:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}
```

---

## Task 8: Admin Audio Management Pages

**Files:**
- Create: `dashboard-next/src/app/dashboard/website/audio/page.tsx`
- Create: `dashboard-next/src/app/dashboard/website/audio/audio-table.tsx`
- Create: `dashboard-next/src/app/dashboard/website/audio/new/page.tsx`
- Create: `dashboard-next/src/app/dashboard/website/audio/audio-form.tsx`
- Create: `dashboard-next/src/app/dashboard/website/audio/[id]/page.tsx`

- [ ] **Step 1: Create the audio library admin listing page**

```tsx
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { AudioTable } from './audio-table';

export default function AudioLibraryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Audio Library</h1>
          <p className="text-muted-foreground">
            Manage bhajans, kirtans, mantras, and other devotional audio.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/website/audio/collections">
              Collections
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/website/audio/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload Audio
            </Link>
          </Button>
        </div>
      </div>

      <AudioTable />
    </div>
  );
}
```

- [ ] **Step 2: Create the audio tracks data table**

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, MoreHorizontal, Trash, Star, StarOff, Music, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { toast } from 'sonner';

interface AudioTrack {
  _id: string;
  titleHindi: string;
  titleEnglish: string;
  artist: string;
  duration: number;
  durationFormatted: string;
  category: string;
  language: string;
  audioUrl: string;
  coverImage?: string;
  playCount: number;
  downloadCount: number;
  featured: boolean;
  isPublished: boolean;
  tags: string[];
  createdAt: string;
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'bhajan', label: 'Bhajan' },
  { value: 'kirtan', label: 'Kirtan' },
  { value: 'mantra', label: 'Mantra' },
  { value: 'pravachan_audio', label: 'Pravachan' },
  { value: 'chant', label: 'Chant' },
  { value: 'aarti', label: 'Aarti' },
  { value: 'stuti', label: 'Stuti' },
];

export function AudioTable() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (searchQuery) params.set('search', searchQuery);

      const response = await axios.get(`/api/audio-tracks?${params.toString()}`);
      if (response.data.success) {
        setTracks(response.data.data || []);
      } else {
        toast.error('Error loading audio tracks');
      }
    } catch (error) {
      console.error('Error fetching audio tracks:', error);
      toast.error('Failed to load audio tracks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, [categoryFilter]);

  const handleSearch = () => {
    fetchTracks();
  };

  const handleDelete = (id: string) => {
    setTrackToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!trackToDelete) return;

    try {
      const response = await axios.delete(`/api/audio-tracks/${trackToDelete}`);
      if (response.data.success) {
        setTracks(tracks.filter(t => t._id !== trackToDelete));
        toast.success('Audio track deleted successfully');
      } else {
        toast.error(response.data.message || 'Failed to delete track');
      }
    } catch (error) {
      console.error('Error deleting track:', error);
      toast.error('An error occurred while deleting the track');
    } finally {
      setDeleteDialogOpen(false);
      setTrackToDelete(null);
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const formData = new FormData();
      formData.append('featured', String(!currentStatus));

      const response = await axios.put(`/api/audio-tracks/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setTracks(tracks.map(t => (t._id === id ? { ...t, featured: !currentStatus } : t)));
        toast.success(`Track ${!currentStatus ? 'featured' : 'unfeatured'} successfully`);
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Failed to update track');
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colorMap: Record<string, string> = {
      bhajan: 'bg-orange-50 text-orange-700',
      kirtan: 'bg-purple-50 text-purple-700',
      mantra: 'bg-blue-50 text-blue-700',
      pravachan_audio: 'bg-green-50 text-green-700',
      chant: 'bg-yellow-50 text-yellow-700',
      aarti: 'bg-red-50 text-red-700',
      stuti: 'bg-pink-50 text-pink-700',
    };
    return colorMap[category] || '';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Track</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden md:table-cell">Duration</TableHead>
                <TableHead className="hidden md:table-cell">Plays</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map(i => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-12 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="flex gap-4 items-center mb-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Input
            placeholder="Search tracks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-64"
          />
          <Button variant="outline" onClick={handleSearch}>
            Search
          </Button>
        </div>
      </div>

      {tracks.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <Music className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium">No audio tracks found</h3>
          <p className="text-muted-foreground mt-1">Upload your first bhajan or kirtan.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/website/audio/new">Upload Audio</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Track</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden md:table-cell">Duration</TableHead>
                <TableHead className="hidden md:table-cell">Plays</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tracks.map(track => (
                <TableRow key={track._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 flex-shrink-0">
                        <Image
                          src={track.coverImage || '/placeholder-audio.jpg'}
                          alt={track.titleEnglish}
                          fill
                          sizes="40px"
                          style={{ objectFit: 'cover' }}
                          className="rounded"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{track.titleEnglish}</div>
                        <div className="text-xs text-muted-foreground">{track.artist}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getCategoryBadgeColor(track.category)}>
                      {track.category.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{track.durationFormatted}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2 text-sm">
                      <span>{track.playCount.toLocaleString()}</span>
                      {track.downloadCount > 0 && (
                        <span className="text-muted-foreground flex items-center gap-0.5">
                          <Download className="h-3 w-3" />
                          {track.downloadCount}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {track.featured ? (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Featured</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/website/audio/${track._id}`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleFeatured(track._id, track.featured)}>
                          {track.featured ? (
                            <><StarOff className="mr-2 h-4 w-4" /> Unfeature</>
                          ) : (
                            <><Star className="mr-2 h-4 w-4" /> Feature</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(track._id)}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Audio Track?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the audio track from the library. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

- [ ] **Step 3: Create the audio track form component**

```tsx
'use client';

import type React from 'react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { Upload, Music, X } from 'lucide-react';

interface AudioFormProps {
  initialData?: {
    _id?: string;
    titleHindi?: string;
    titleEnglish?: string;
    artist?: string;
    description?: string;
    category?: string;
    language?: string;
    coverImage?: string;
    lyrics?: string;
    lyricsHindi?: string;
    tags?: string[];
    featured?: boolean;
    audioUrl?: string;
    durationFormatted?: string;
  };
}

const categoryOptions = [
  { value: 'bhajan', label: 'Bhajan' },
  { value: 'kirtan', label: 'Kirtan' },
  { value: 'mantra', label: 'Mantra' },
  { value: 'pravachan_audio', label: 'Pravachan (Audio)' },
  { value: 'chant', label: 'Chant' },
  { value: 'aarti', label: 'Aarti' },
  { value: 'stuti', label: 'Stuti' },
];

export function AudioForm({ initialData }: AudioFormProps) {
  const router = useRouter();
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(initialData?.coverImage || null);

  const [formData, setFormData] = useState({
    titleHindi: initialData?.titleHindi || '',
    titleEnglish: initialData?.titleEnglish || '',
    artist: initialData?.artist || '',
    description: initialData?.description || '',
    category: initialData?.category || 'bhajan',
    language: initialData?.language || 'Hindi',
    lyrics: initialData?.lyrics || '',
    lyricsHindi: initialData?.lyricsHindi || '',
    tags: initialData?.tags?.join(', ') || '',
    featured: initialData?.featured || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Audio file must be less than 100MB');
        return;
      }
      setAudioFile(file);
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titleHindi || !formData.titleEnglish || !formData.artist || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!initialData?._id && !audioFile) {
      toast.error('Please select an audio file to upload');
      return;
    }

    try {
      setIsSubmitting(true);

      const submitData = new FormData();
      submitData.append('titleHindi', formData.titleHindi);
      submitData.append('titleEnglish', formData.titleEnglish);
      submitData.append('artist', formData.artist);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('language', formData.language);
      submitData.append('lyrics', formData.lyrics);
      submitData.append('lyricsHindi', formData.lyricsHindi);
      submitData.append('tags', formData.tags);
      submitData.append('featured', formData.featured.toString());

      if (audioFile) {
        submitData.append('audioFile', audioFile);
      }
      if (coverFile) {
        submitData.append('coverImage', coverFile);
      }

      let response;
      if (initialData?._id) {
        response = await axios.put(`/api/audio-tracks/${initialData._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000, // 2 min for large audio uploads
        });
      } else {
        response = await axios.post('/api/audio-tracks', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000,
        });
      }

      if (response.data.success) {
        toast.success(initialData?._id ? 'Audio track updated successfully' : 'Audio track uploaded successfully');
        router.push('/dashboard/website/audio');
        router.refresh();
      } else {
        toast.error(response.data.message || 'An error occurred');
      }
    } catch (error: unknown) {
      console.error('Error submitting audio track:', error);
      const errorMessage = (() => {
        if (error && typeof error === 'object' && 'response' in error) {
          const response = (error as { response?: { data?: { message?: string } } }).response;
          return response?.data?.message || 'Failed to save audio track';
        }
        return 'Failed to save audio track';
      })();
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            {/* Audio File Upload */}
            <div className="grid gap-3">
              <Label>
                Audio File {!initialData?._id && <span className="text-destructive">*</span>}
              </Label>
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => audioInputRef.current?.click()}
              >
                {audioFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <Music className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{audioFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={e => { e.stopPropagation(); setAudioFile(null); }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : initialData?.audioUrl ? (
                  <div className="flex items-center justify-center gap-2">
                    <Music className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Current: {initialData.durationFormatted} -- Click to replace
                    </span>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload audio (MP3, WAV, AAC -- max 100MB)</p>
                  </div>
                )}
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleAudioSelect}
                />
              </div>
            </div>

            {/* Title fields */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="grid gap-3">
                <Label htmlFor="titleEnglish">
                  Title (English) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="titleEnglish"
                  name="titleEnglish"
                  value={formData.titleEnglish}
                  onChange={handleChange}
                  placeholder="e.g., Morning Aarti"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="titleHindi">
                  Title (Hindi) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="titleHindi"
                  name="titleHindi"
                  value={formData.titleHindi}
                  onChange={handleChange}
                  placeholder="e.g., प्रातः आरती"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Artist + Category */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="grid gap-3">
                <Label htmlFor="artist">
                  Artist / Speaker <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="artist"
                  name="artist"
                  value={formData.artist}
                  onChange={handleChange}
                  placeholder="e.g., Swami Avdheshanand Giri Ji"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={value => handleSelectChange('category', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Language */}
            <div className="grid gap-3">
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language}
                onValueChange={value => handleSelectChange('language', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Hindi', 'Sanskrit', 'English', 'Gujarati', 'Marathi', 'Bengali', 'Punjabi', 'Tamil', 'Telugu'].map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            {/* Cover Image */}
            <div className="grid gap-3">
              <Label>Cover Image</Label>
              <div className="flex items-center gap-4">
                {coverPreview && (
                  <div className="relative h-20 w-20">
                    <Image
                      src={coverPreview}
                      alt="Cover preview"
                      fill
                      sizes="80px"
                      style={{ objectFit: 'cover' }}
                      className="rounded"
                      unoptimized={!coverPreview.startsWith('/')}
                    />
                  </div>
                )}
                <Button type="button" variant="outline" onClick={() => coverInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  {coverPreview ? 'Change' : 'Upload'} Cover
                </Button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverSelect}
                />
              </div>
            </div>

            {/* Lyrics */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="grid gap-3">
                <Label htmlFor="lyrics">Lyrics (English / Transliteration)</Label>
                <Textarea
                  id="lyrics"
                  name="lyrics"
                  value={formData.lyrics}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Optional: Paste lyrics here..."
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="lyricsHindi">Lyrics (Hindi / Devanagari)</Label>
                <Textarea
                  id="lyricsHindi"
                  name="lyricsHindi"
                  value={formData.lyricsHindi}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Optional: हिंदी गीत पाठ..."
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="grid gap-3">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="comma-separated: morning, aarti, shiva, devotional"
                disabled={isSubmitting}
              />
              <p className="text-sm text-muted-foreground">Separate tags with commas. Max 20 tags.</p>
            </div>

            {/* Featured toggle */}
            <div className="flex items-center gap-3">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, featured: checked }))}
                disabled={isSubmitting}
              />
              <Label htmlFor="featured">Featured Track</Label>
              <p className="text-sm text-muted-foreground ml-2">
                Featured tracks appear prominently on the audio library page.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/website/audio')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="mr-2">{initialData?._id ? 'Updating...' : 'Uploading...'}</span>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </>
          ) : initialData?._id ? (
            'Update Track'
          ) : (
            'Upload Track'
          )}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Create the new audio track page**

```tsx
import { AudioForm } from '../audio-form';

export default function NewAudioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Upload Audio Track</h1>
        <p className="text-muted-foreground">
          Add a new bhajan, kirtan, mantra, or other devotional audio to the library.
        </p>
      </div>
      <AudioForm />
    </div>
  );
}
```

- [ ] **Step 5: Create the edit audio track page**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { AudioForm } from '../audio-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditAudioPage() {
  const params = useParams();
  const [track, setTrack] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const response = await axios.get(`/api/audio-tracks/${params.id}`);
        if (response.data.success) {
          setTrack(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching track:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrack();
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold">Track not found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Edit Audio Track</h1>
        <p className="text-muted-foreground">Update the audio track details.</p>
      </div>
      <AudioForm
        initialData={{
          _id: track._id as string,
          titleHindi: track.titleHindi as string,
          titleEnglish: track.titleEnglish as string,
          artist: track.artist as string,
          description: track.description as string,
          category: track.category as string,
          language: track.language as string,
          coverImage: track.coverImage as string,
          lyrics: track.lyrics as string,
          lyricsHindi: track.lyricsHindi as string,
          tags: track.tags as string[],
          featured: track.featured as boolean,
          audioUrl: track.audioUrl as string,
          durationFormatted: track.durationFormatted as string,
        }}
      />
    </div>
  );
}
```

---

## Task 9: Admin Collection Management Pages

**Files:**
- Create: `dashboard-next/src/app/dashboard/website/audio/collections/page.tsx`
- Create: `dashboard-next/src/app/dashboard/website/audio/collections/collections-table.tsx`
- Create: `dashboard-next/src/app/dashboard/website/audio/collections/collection-form.tsx`
- Create: `dashboard-next/src/app/dashboard/website/audio/collections/new/page.tsx`
- Create: `dashboard-next/src/app/dashboard/website/audio/collections/[id]/page.tsx`

- [ ] **Step 1: Create the collections listing page**

```tsx
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CollectionsTable } from './collections-table';

export default function CollectionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/website/audio">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-semibold">Audio Collections</h1>
          </div>
          <p className="text-muted-foreground ml-10">
            Group audio tracks into themed albums and collections.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/website/audio/collections/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Collection
          </Link>
        </Button>
      </div>
      <CollectionsTable />
    </div>
  );
}
```

- [ ] **Step 2: Create the collections data table**

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, MoreHorizontal, Trash, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import { toast } from 'sonner';

interface Collection {
  _id: string;
  title: string;
  titleHindi?: string;
  category: string;
  trackCount: number;
  totalDuration: number;
  coverImage?: string;
  featured: boolean;
  createdAt: string;
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

export function CollectionsTable() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    axios.get('/api/audio-collections')
      .then(r => {
        if (r.data.success) setCollections(r.data.data || []);
      })
      .catch(() => toast.error('Failed to load collections'))
      .finally(() => setLoading(false));
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const r = await axios.delete(`/api/audio-collections/${deleteId}`);
      if (r.data.success) {
        setCollections(collections.filter(c => c._id !== deleteId));
        toast.success('Collection deleted');
      }
    } catch { toast.error('Failed to delete'); }
    finally { setDeleteId(null); }
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Collection</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tracks</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map(i => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <Music className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-medium">No collections yet</h3>
        <p className="text-muted-foreground mt-1">Create your first album or collection.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/website/audio/collections/new">Create Collection</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Collection</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tracks</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.map(c => (
              <TableRow key={c._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10">
                      <Image
                        src={c.coverImage || '/placeholder-collection.jpg'}
                        alt={c.title}
                        fill sizes="40px"
                        style={{ objectFit: 'cover' }}
                        className="rounded"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{c.title}</div>
                      {c.titleHindi && <div className="text-xs text-muted-foreground">{c.titleHindi}</div>}
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline">{c.category}</Badge></TableCell>
                <TableCell>{c.trackCount} tracks</TableCell>
                <TableCell>{formatDuration(c.totalDuration)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/website/audio/collections/${c._id}`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(c._id)}>
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the collection (tracks will remain in the library).</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

- [ ] **Step 3: Create the collection form, new page, and edit page**

`collections/collection-form.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CollectionFormProps {
  initialData?: {
    _id?: string;
    title?: string;
    titleHindi?: string;
    description?: string;
    category?: string;
    featured?: boolean;
    coverImage?: string;
  };
}

const categoryOptions = [
  { value: 'mixed', label: 'Mixed' },
  { value: 'bhajan', label: 'Bhajan' },
  { value: 'kirtan', label: 'Kirtan' },
  { value: 'mantra', label: 'Mantra' },
  { value: 'pravachan_audio', label: 'Pravachan' },
  { value: 'chant', label: 'Chant' },
  { value: 'aarti', label: 'Aarti' },
  { value: 'stuti', label: 'Stuti' },
];

export function CollectionForm({ initialData }: CollectionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    titleHindi: initialData?.titleHindi || '',
    description: initialData?.description || '',
    category: initialData?.category || 'mixed',
    featured: initialData?.featured || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) { toast.error('Title is required'); return; }

    try {
      setIsSubmitting(true);
      const submitData = new FormData();
      Object.entries(formData).forEach(([k, v]) => submitData.append(k, String(v)));

      const url = initialData?._id ? `/api/audio-collections/${initialData._id}` : '/api/audio-collections';
      const method = initialData?._id ? 'put' : 'post';

      const response = initialData?._id
        ? await axios.put(url, formData)
        : await axios.post(url, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });

      if (response.data.success) {
        toast.success(initialData?._id ? 'Collection updated' : 'Collection created');
        router.push('/dashboard/website/audio/collections');
        router.refresh();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="grid gap-3">
              <Label htmlFor="title">Title (English) <span className="text-destructive">*</span></Label>
              <Input id="title" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} required disabled={isSubmitting} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="titleHindi">Title (Hindi)</Label>
              <Input id="titleHindi" value={formData.titleHindi} onChange={e => setFormData(p => ({ ...p, titleHindi: e.target.value }))} disabled={isSubmitting} />
            </div>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} disabled={isSubmitting} />
          </div>
          <div className="grid gap-3">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={v => setFormData(p => ({ ...p, category: v }))} disabled={isSubmitting}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categoryOptions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="featured" checked={formData.featured} onCheckedChange={c => setFormData(p => ({ ...p, featured: c }))} disabled={isSubmitting} />
            <Label htmlFor="featured">Featured Collection</Label>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push('/dashboard/website/audio/collections')} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData?._id ? 'Update Collection' : 'Create Collection'}
        </Button>
      </div>
    </form>
  );
}
```

`collections/new/page.tsx`:
```tsx
import { CollectionForm } from '../collection-form';

export default function NewCollectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">New Audio Collection</h1>
        <p className="text-muted-foreground">Create a themed album or collection of audio tracks.</p>
      </div>
      <CollectionForm />
    </div>
  );
}
```

`collections/[id]/page.tsx`:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { CollectionForm } from '../collection-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditCollectionPage() {
  const params = useParams();
  const [collection, setCollection] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/audio-collections/${params.id}`)
      .then(r => { if (r.data.success) setCollection(r.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-64" /><Skeleton className="h-[400px] w-full" /></div>;
  if (!collection) return <div className="text-center py-20"><h2 className="text-2xl font-semibold">Collection not found</h2></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Edit Collection</h1>
        <p className="text-muted-foreground">Update collection details and manage tracks.</p>
      </div>
      <CollectionForm initialData={{
        _id: collection._id as string,
        title: collection.title as string,
        titleHindi: collection.titleHindi as string,
        description: collection.description as string,
        category: collection.category as string,
        featured: collection.featured as boolean,
        coverImage: collection.coverImage as string,
      }} />
    </div>
  );
}
```

---

## Task 10: Website Audio Player Provider (Global State)

**Files:**
- Create: `website/components/audio/AudioPlayerProvider.tsx`

- [ ] **Step 1: Create the AudioPlayerProvider context for global audio state**

```tsx
'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

interface AudioTrack {
  _id: string;
  titleEnglish: string;
  titleHindi: string;
  artist: string;
  audioUrl: string;
  coverImage?: string;
  durationFormatted: string;
  duration: number;
  category: string;
}

interface AudioPlayerState {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: AudioTrack[];
  queueIndex: number;
}

interface AudioPlayerContextType extends AudioPlayerState {
  play: (track: AudioTrack, queue?: AudioTrack[]) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  addToQueue: (track: AudioTrack) => void;
  clearQueue: () => void;
  closePlayer: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
}

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    queue: [],
    queueIndex: -1,
  });

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };
    const onLoadedMetadata = () => {
      setState(prev => ({ ...prev, duration: audio.duration }));
    };
    const onEnded = () => {
      // Auto-play next track in queue
      setState(prev => {
        if (prev.queueIndex < prev.queue.length - 1) {
          const nextIndex = prev.queueIndex + 1;
          const nextTrack = prev.queue[nextIndex];
          audio.src = nextTrack.audioUrl;
          audio.play();
          return {
            ...prev,
            currentTrack: nextTrack,
            queueIndex: nextIndex,
            isPlaying: true,
            currentTime: 0,
          };
        }
        return { ...prev, isPlaying: false, currentTime: 0 };
      });
    };
    const onPlay = () => setState(prev => ({ ...prev, isPlaying: true }));
    const onPause = () => setState(prev => ({ ...prev, isPlaying: false }));

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const play = useCallback((track: AudioTrack, queue?: AudioTrack[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = track.audioUrl;
    audio.play();

    const newQueue = queue || [track];
    const queueIndex = queue ? queue.findIndex(t => t._id === track._id) : 0;

    setState(prev => ({
      ...prev,
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
      queue: newQueue,
      queueIndex: queueIndex >= 0 ? queueIndex : 0,
    }));
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play();
  }, []);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [state.isPlaying, pause, resume]);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      setState(prev => ({ ...prev, volume }));
    }
  }, []);

  const playNext = useCallback(() => {
    setState(prev => {
      if (prev.queueIndex < prev.queue.length - 1) {
        const nextIndex = prev.queueIndex + 1;
        const nextTrack = prev.queue[nextIndex];
        const audio = audioRef.current;
        if (audio) {
          audio.src = nextTrack.audioUrl;
          audio.play();
        }
        return {
          ...prev,
          currentTrack: nextTrack,
          queueIndex: nextIndex,
          isPlaying: true,
          currentTime: 0,
        };
      }
      return prev;
    });
  }, []);

  const playPrevious = useCallback(() => {
    setState(prev => {
      if (prev.queueIndex > 0) {
        const prevIndex = prev.queueIndex - 1;
        const prevTrack = prev.queue[prevIndex];
        const audio = audioRef.current;
        if (audio) {
          audio.src = prevTrack.audioUrl;
          audio.play();
        }
        return {
          ...prev,
          currentTrack: prevTrack,
          queueIndex: prevIndex,
          isPlaying: true,
          currentTime: 0,
        };
      }
      return prev;
    });
  }, []);

  const addToQueue = useCallback((track: AudioTrack) => {
    setState(prev => ({
      ...prev,
      queue: [...prev.queue, track],
    }));
  }, []);

  const clearQueue = useCallback(() => {
    setState(prev => ({
      ...prev,
      queue: prev.currentTrack ? [prev.currentTrack] : [],
      queueIndex: 0,
    }));
  }, []);

  const closePlayer = useCallback(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.src = '';
    setState({
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      queue: [],
      queueIndex: -1,
    });
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        ...state,
        play,
        pause,
        resume,
        togglePlay,
        seekTo,
        setVolume,
        playNext,
        playPrevious,
        addToQueue,
        clearQueue,
        closePlayer,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}
```

---

## Task 11: Website Persistent Audio Player (Bottom Bar)

**Files:**
- Create: `website/components/audio/AudioPlayer.tsx`

- [ ] **Step 1: Create the Spotify-style persistent bottom bar audio player**

```tsx
'use client';

import { useAudioPlayer } from './AudioPlayerProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { useState, useCallback } from 'react';

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function AudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    queue,
    queueIndex,
    togglePlay,
    seekTo,
    setVolume,
    playNext,
    playPrevious,
    closePlayer,
  } = useAudioPlayer();

  const [expanded, setExpanded] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      seekTo(percent * duration);
    },
    [duration, seekTo]
  );

  const toggleMute = useCallback(() => {
    if (volume > 0) {
      setPreviousVolume(volume);
      setVolume(0);
    } else {
      setVolume(previousVolume);
    }
  }, [volume, previousVolume, setVolume]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(parseFloat(e.target.value));
    },
    [setVolume]
  );

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        {/* Progress bar (thin line at top) */}
        <div
          className="h-1 bg-spiritual-warmWhite/30 cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-gradient-to-r from-spiritual-saffron to-gold-400 transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Main player bar */}
        <div className="bg-gradient-to-r from-spiritual-maroon via-[#600018] to-spiritual-maroon backdrop-blur-lg border-t border-gold-400/20 px-4 py-2">
          <div className="container-custom flex items-center gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative h-12 w-12 flex-shrink-0 rounded-md overflow-hidden">
                <Image
                  src={currentTrack.coverImage || '/placeholder-audio.jpg'}
                  alt={currentTrack.titleEnglish}
                  fill
                  sizes="48px"
                  style={{ objectFit: 'cover' }}
                  unoptimized={currentTrack.coverImage?.startsWith('http') || false}
                />
              </div>
              <div className="min-w-0">
                <p className="text-gold-100 font-medium text-sm truncate">
                  {currentTrack.titleEnglish}
                </p>
                <p className="text-gold-300/60 text-xs truncate">
                  {currentTrack.artist}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={playPrevious}
                disabled={queueIndex <= 0}
                className="text-gold-300 hover:text-gold-100 disabled:opacity-30 transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-gold-400 hover:bg-gold-300 flex items-center justify-center text-spiritual-maroon transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
              <button
                onClick={playNext}
                disabled={queueIndex >= queue.length - 1}
                className="text-gold-300 hover:text-gold-100 disabled:opacity-30 transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Time + Seekbar (desktop) */}
            <div className="hidden md:flex items-center gap-3 flex-1">
              <span className="text-gold-300/60 text-xs w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <div
                className="flex-1 h-1.5 bg-gold-300/20 rounded-full cursor-pointer group"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-gold-400 rounded-full relative group-hover:bg-gold-300 transition-colors"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-gold-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <span className="text-gold-300/60 text-xs w-10">
                {formatTime(duration)}
              </span>
            </div>

            {/* Volume (desktop) */}
            <div className="hidden lg:flex items-center gap-2">
              <button onClick={toggleMute} className="text-gold-300 hover:text-gold-100">
                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 accent-gold-400"
              />
            </div>

            {/* Close */}
            <button
              onClick={closePlayer}
              className="text-gold-300/40 hover:text-gold-100 transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## Task 12: Website Audio Library Page

**Files:**
- Create: `website/app/audio/page.tsx`
- Create: `website/components/audio/TrackCard.tsx`
- Create: `website/components/audio/CategoryFilter.tsx`

- [ ] **Step 1: Create the TrackCard component**

```tsx
'use client';

import { useAudioPlayer } from './AudioPlayerProvider';
import { Play, Pause } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface AudioTrack {
  _id: string;
  titleEnglish: string;
  titleHindi: string;
  artist: string;
  audioUrl: string;
  coverImage?: string;
  durationFormatted: string;
  duration: number;
  category: string;
}

interface TrackCardProps {
  track: AudioTrack;
  index: number;
  allTracks: AudioTrack[];
}

export function TrackCard({ track, index, allTracks }: TrackCardProps) {
  const { currentTrack, isPlaying, play, togglePlay } = useAudioPlayer();
  const isCurrentTrack = currentTrack?._id === track._id;

  const handlePlay = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      play(track, allTracks);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`card-temple p-4 flex items-center gap-4 group hover:shadow-temple transition-all duration-300 cursor-pointer ${
        isCurrentTrack ? 'ring-2 ring-gold-400 bg-gold-50/30' : ''
      }`}
      onClick={handlePlay}
    >
      {/* Cover Image */}
      <div className="relative h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden">
        <Image
          src={track.coverImage || '/placeholder-audio.jpg'}
          alt={track.titleEnglish}
          fill
          sizes="56px"
          style={{ objectFit: 'cover' }}
          unoptimized={track.coverImage?.startsWith('http') || false}
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isCurrentTrack && isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white ml-0.5" />
          )}
        </div>
        {isCurrentTrack && isPlaying && (
          <div className="absolute bottom-1 left-1 right-1 flex items-end gap-0.5 h-3">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="w-1 bg-gold-400 rounded-full"
                animate={{ height: [4, 10, 4] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="flex-grow min-w-0">
        <h3 className={`font-display text-base truncate transition-colors ${
          isCurrentTrack ? 'text-spiritual-saffron' : 'text-spiritual-maroon group-hover:text-spiritual-saffron'
        }`}>
          {track.titleEnglish}
        </h3>
        <p className="text-spiritual-warmGray text-sm truncate">
          {track.artist}
        </p>
      </div>

      {/* Duration */}
      <span className="text-sm text-gold-600 flex-shrink-0 hidden sm:block">
        {track.durationFormatted}
      </span>
    </motion.div>
  );
}
```

- [ ] **Step 2: Create the CategoryFilter component**

```tsx
'use client';

import { motion } from 'framer-motion';

interface CategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
}

const categories = [
  { value: 'all', label: 'All', labelHindi: 'सभी' },
  { value: 'bhajan', label: 'Bhajans', labelHindi: 'भजन' },
  { value: 'kirtan', label: 'Kirtan', labelHindi: 'कीर्तन' },
  { value: 'mantra', label: 'Mantras', labelHindi: 'मंत्र' },
  { value: 'pravachan_audio', label: 'Pravachan', labelHindi: 'प्रवचन' },
  { value: 'chant', label: 'Chants', labelHindi: 'जाप' },
  { value: 'aarti', label: 'Aarti', labelHindi: 'आरती' },
  { value: 'stuti', label: 'Stuti', labelHindi: 'स्तुति' },
];

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {categories.map(cat => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            selected === cat.value
              ? 'text-white'
              : 'text-spiritual-maroon bg-gold-50 hover:bg-gold-100 border border-gold-200'
          }`}
        >
          {selected === cat.value && (
            <motion.div
              layoutId="activeCategoryBg"
              className="absolute inset-0 bg-gradient-to-r from-spiritual-saffron to-primary-600 rounded-full"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create the Audio Library browse page**

```tsx
'use client';

import { motion } from 'framer-motion';
import { Music, Search, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { TrackCard } from '@/components/audio/TrackCard';
import { CategoryFilter } from '@/components/audio/CategoryFilter';

interface AudioTrack {
  _id: string;
  titleEnglish: string;
  titleHindi: string;
  artist: string;
  audioUrl: string;
  coverImage?: string;
  durationFormatted: string;
  duration: number;
  category: string;
}

export default function AudioLibraryPage() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category !== 'all') params.set('category', category);
        if (searchQuery) params.set('search', searchQuery);

        const response = await api.get(`/audio-tracks?${params.toString()}`);
        const data = response.data?.data || response.data || [];
        setTracks(data);
      } catch {
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, [category]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (searchQuery) params.set('search', searchQuery);

      const response = await api.get(`/audio-tracks?${params.toString()}`);
      const data = response.data?.data || response.data || [];
      setTracks(data);
    } catch {
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative bg-maroon-gradient py-24 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="flex items-end gap-1 h-32">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gold-400 rounded-full"
                animate={{ height: [20, Math.random() * 100 + 30, 20] }}
                transition={{ duration: 1 + Math.random(), repeat: Infinity, repeatType: 'reverse', delay: i * 0.05 }}
              />
            ))}
          </div>
        </div>

        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

        <div className="container-custom relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow animate-breathe">
              <Music className="w-10 h-10 text-white" />
            </div>
            <span className="text-gold-300/80 font-sanskrit text-lg tracking-wider">भक्ति संगीत</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-gold-200 mt-2 mb-6">
              Divine <span className="text-gradient-gold">Audio Library</span>
            </h1>
            <p className="text-gold-100/80 text-lg md:text-xl leading-relaxed font-body">
              Immerse yourself in devotional bhajans, kirtans, mantras, and sacred chants
              from the tradition of Swami Avdheshanand Giri Ji Maharaj.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="divider-rangoli" />

      {/* Search + Filters + Tracks */}
      <section className="section-padding bg-parchment">
        <div className="container-custom">
          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-400" />
              <input
                type="text"
                placeholder="Search bhajans, kirtans, mantras..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gold-200 bg-white/80 focus:border-gold-400 focus:outline-none font-body text-spiritual-maroon placeholder:text-gold-300"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-12">
            <CategoryFilter selected={category} onChange={setCategory} />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-spiritual-saffron animate-spin mb-4" />
              <p className="text-spiritual-warmGray font-body">Loading audio tracks...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && tracks.length === 0 && (
            <div className="text-center py-20">
              <Music className="w-16 h-16 text-gold-400 mx-auto mb-4" />
              <h3 className="font-display text-2xl text-spiritual-maroon mb-2">No Audio Found</h3>
              <p className="text-spiritual-warmGray">Try a different category or check back later.</p>
            </div>
          )}

          {/* Tracks Grid */}
          {!loading && tracks.length > 0 && (
            <div className="max-w-4xl mx-auto space-y-3">
              {tracks.map((track, index) => (
                <TrackCard key={track._id} track={track} index={index} allTracks={tracks} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom spacer for audio player bar */}
      <div className="h-20" />
    </div>
  );
}
```

---

## Task 13: Integrate Audio Player into Website Layout

**Files:**
- Modify: `website/app/layout.tsx`
- Modify: `website/components/layout/Navbar.tsx`

- [ ] **Step 1: Wrap layout with AudioPlayerProvider and add persistent AudioPlayer**

In `website/app/layout.tsx`, add imports and wrap `<body>` children:

```tsx
// ADD these imports at the top:
import { AudioPlayerProvider } from '@/components/audio/AudioPlayerProvider';
import { AudioPlayer } from '@/components/audio/AudioPlayer';

// MODIFY the body content to wrap with AudioPlayerProvider:
// Change:
//   <Navbar />
//   <PageTransition>...</PageTransition>
//   <Footer />
//   <WhatsAppButton />
//
// To:
//   <AudioPlayerProvider>
//     <Navbar />
//     <PageTransition>...</PageTransition>
//     <Footer />
//     <AudioPlayer />
//     <WhatsAppButton />
//   </AudioPlayerProvider>
```

- [ ] **Step 2: Add "Audio" link to Navbar**

In `website/components/layout/Navbar.tsx`, add a new nav link entry:

```tsx
// Add to the nav links array (alongside existing links like 'podcasts', 'videos', etc.):
{ href: '/audio', label: 'Audio Library' }
```

---

## Task 14: Mobile Types Update

**Files:**
- Modify: `mobile/user-app/src/types/index.ts`

- [ ] **Step 1: Add AudioTrack, AudioCollection, SadhanaLog, and SadhanaStreak types**

Append to the end of the existing types file:

```typescript
export interface AudioTrack {
  _id: string;
  titleHindi: string;
  titleEnglish: string;
  artist: string;
  description?: string;
  duration: number;
  durationFormatted: string;
  category: 'bhajan' | 'kirtan' | 'mantra' | 'pravachan_audio' | 'chant' | 'aarti' | 'stuti';
  language: string;
  audioUrl: string;
  coverImage?: string;
  lyrics?: string;
  lyricsHindi?: string;
  tags: string[];
  playCount: number;
  featured: boolean;
}

export interface AudioCollection {
  _id: string;
  title: string;
  titleHindi?: string;
  description?: string;
  coverImage?: string;
  category: string;
  tracks: AudioTrack[];
  trackCount: number;
  totalDuration: number;
  featured: boolean;
}

export type PracticeType = 'meditation' | 'japa' | 'scripture_reading' | 'seva' | 'pranayama';

export interface SadhanaLog {
  _id: string;
  userId: string;
  date: string;
  practiceType: PracticeType;
  durationMinutes?: number;
  count?: number;
  notes?: string;
  mood?: 'peaceful' | 'focused' | 'distracted' | 'joyful' | 'grateful';
  createdAt: string;
}

export interface SadhanaStreak {
  _id?: string;
  userId?: string;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate?: string;
  totalPracticeDays: number;
  totalMinutes: number;
  totalJapaRounds: number;
  streakStartDate?: string;
  milestones: number[];
  weeklyGoal: number;
  motivationalMessage: string;
  nextMilestone: number | null;
}

export interface SadhanaSummary {
  period: string;
  startDate: string;
  endDate: string;
  activeDays: number;
  totalDays: number;
  totalMinutes: number;
  totalJapaRounds: number;
  completionRate: number;
  practiceBreakdown: {
    practiceType: string;
    totalDuration: number;
    totalCount: number;
    sessionCount: number;
  }[];
  dailySummaries: {
    date: string;
    totalMinutes: number;
    practices: {
      practiceType: string;
      totalDuration: number;
      totalCount: number;
      sessionCount: number;
    }[];
  }[];
}
```

---

## Task 15: Mobile Audio Player Context

**Files:**
- Create: `mobile/user-app/src/context/AudioPlayerContext.tsx`

- [ ] **Step 1: Create the mobile audio player context using expo-av**

```tsx
import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import { AudioTrack } from '../types';

interface AudioPlayerState {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  queue: AudioTrack[];
  queueIndex: number;
}

interface AudioPlayerContextType extends AudioPlayerState {
  play: (track: AudioTrack, queue?: AudioTrack[]) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seekTo: (positionMillis: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  stop: () => Promise<void>;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  return context;
}

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    queue: [],
    queueIndex: -1,
  });

  // Configure audio session for background playback
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const onPlaybackStatusUpdate = useCallback((status: Audio.AudioStatus) => {
    if (!status.isLoaded) return;

    setState(prev => ({
      ...prev,
      isPlaying: status.isPlaying,
      currentTime: status.positionMillis / 1000,
      duration: (status.durationMillis || 0) / 1000,
      isLoading: status.isBuffering,
    }));

    if (status.didJustFinish) {
      // Auto-play next
      setState(prev => {
        if (prev.queueIndex < prev.queue.length - 1) {
          const nextIndex = prev.queueIndex + 1;
          loadAndPlay(prev.queue[nextIndex], prev.queue, nextIndex);
        }
        return { ...prev, isPlaying: false };
      });
    }
  }, []);

  const loadAndPlay = async (track: AudioTrack, queue: AudioTrack[], index: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;

      setState(prev => ({
        ...prev,
        currentTrack: track,
        isPlaying: true,
        currentTime: 0,
        isLoading: false,
        queue,
        queueIndex: index,
      }));
    } catch (error) {
      console.error('Error playing audio:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const play = useCallback(async (track: AudioTrack, queue?: AudioTrack[]) => {
    const trackQueue = queue || [track];
    const index = queue ? queue.findIndex(t => t._id === track._id) : 0;
    await loadAndPlay(track, trackQueue, index >= 0 ? index : 0);
  }, [onPlaybackStatusUpdate]);

  const pause = useCallback(async () => {
    await soundRef.current?.pauseAsync();
  }, []);

  const resume = useCallback(async () => {
    await soundRef.current?.playAsync();
  }, []);

  const togglePlay = useCallback(async () => {
    if (state.isPlaying) await pause();
    else await resume();
  }, [state.isPlaying, pause, resume]);

  const seekTo = useCallback(async (positionMillis: number) => {
    await soundRef.current?.setPositionAsync(positionMillis);
  }, []);

  const playNext = useCallback(async () => {
    if (state.queueIndex < state.queue.length - 1) {
      const nextIndex = state.queueIndex + 1;
      await loadAndPlay(state.queue[nextIndex], state.queue, nextIndex);
    }
  }, [state.queueIndex, state.queue, onPlaybackStatusUpdate]);

  const playPrevious = useCallback(async () => {
    if (state.queueIndex > 0) {
      const prevIndex = state.queueIndex - 1;
      await loadAndPlay(state.queue[prevIndex], state.queue, prevIndex);
    }
  }, [state.queueIndex, state.queue, onPlaybackStatusUpdate]);

  const stop = useCallback(async () => {
    await soundRef.current?.stopAsync();
    await soundRef.current?.unloadAsync();
    soundRef.current = null;
    setState({
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isLoading: false,
      queue: [],
      queueIndex: -1,
    });
  }, []);

  return (
    <AudioPlayerContext.Provider value={{ ...state, play, pause, resume, togglePlay, seekTo, playNext, playPrevious, stop }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}
```

---

## Task 16: Mobile Audio Library Screen

**Files:**
- Create: `mobile/user-app/src/screens/audio/AudioLibraryScreen.tsx`

- [ ] **Step 1: Create the audio library browse screen for mobile**

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Image, TextInput, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { AudioTrack } from '../../types';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'music-note' as const },
  { key: 'bhajan', label: 'Bhajan', icon: 'music' as const },
  { key: 'kirtan', label: 'Kirtan', icon: 'music-circle' as const },
  { key: 'mantra', label: 'Mantra', icon: 'om' as const },
  { key: 'aarti', label: 'Aarti', icon: 'candle' as const },
  { key: 'chant', label: 'Chant', icon: 'bell' as const },
  { key: 'stuti', label: 'Stuti', icon: 'book-open-variant' as const },
  { key: 'pravachan_audio', label: 'Pravachan', icon: 'microphone' as const },
];

export function AudioLibraryScreen() {
  const navigation = useNavigation();
  const { currentTrack, isPlaying, play } = useAudioPlayer();
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTracks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (searchQuery) params.set('search', searchQuery);

      const response = await api.get(`/audio-tracks?${params.toString()}`);
      setTracks(response.data || []);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery]);

  useEffect(() => { fetchTracks(); }, [category]);

  const handlePlayTrack = (track: AudioTrack) => {
    play(track, tracks);
    (navigation as any).navigate('AudioPlayer');
  };

  const renderTrackItem = ({ item, index }: { item: AudioTrack; index: number }) => {
    const isActive = currentTrack?._id === item._id;
    return (
      <TouchableOpacity
        style={[styles.trackItem, isActive && styles.trackItemActive]}
        onPress={() => handlePlayTrack(item)}
        activeOpacity={0.7}
      >
        <View style={styles.trackCover}>
          {item.coverImage ? (
            <Image source={{ uri: item.coverImage }} style={styles.coverImage} />
          ) : (
            <LinearGradient colors={[colors.primary.saffron, colors.primary.maroon]} style={styles.coverPlaceholder}>
              <Icon name="music" size={20} color={colors.gold.light} />
            </LinearGradient>
          )}
          {isActive && isPlaying && (
            <View style={styles.playingIndicator}>
              {[1, 2, 3].map(i => (
                <View key={i} style={[styles.soundBar, { height: 4 + (i % 3) * 4 }]} />
              ))}
            </View>
          )}
        </View>
        <View style={styles.trackInfo}>
          <Text style={[styles.trackTitle, isActive && styles.trackTitleActive]} numberOfLines={1}>
            {item.titleEnglish}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
        </View>
        <Text style={styles.trackDuration}>{item.durationFormatted}</Text>
        <Icon
          name={isActive && isPlaying ? 'pause-circle' : 'play-circle'}
          size={32}
          color={isActive ? colors.primary.saffron : colors.gold.main}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[colors.primary.maroon, colors.primary.deepRed]} style={styles.header}>
        <Text style={styles.headerSubtitle}>भक्ति संगीत</Text>
        <Text style={styles.headerTitle}>Audio Library</Text>
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={colors.gold.main} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search bhajans, kirtans..."
          placeholderTextColor={colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={fetchTracks}
          returnKeyType="search"
        />
      </View>

      {/* Category Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContent}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.categoryPill, category === cat.key && styles.categoryPillActive]}
            onPress={() => setCategory(cat.key)}
          >
            <Icon name={cat.icon} size={16} color={category === cat.key ? colors.text.white : colors.gold.dark} />
            <Text style={[styles.categoryLabel, category === cat.key && styles.categoryLabelActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Track List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.saffron} />
          <Text style={styles.loadingText}>Loading tracks...</Text>
        </View>
      ) : tracks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="music-off" size={64} color={colors.text.secondary} />
          <Text style={styles.emptyText}>No tracks found</Text>
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={item => item._id}
          renderItem={renderTrackItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.parchment },
  header: { paddingTop: spacing.xxl + 10, paddingBottom: spacing.lg, paddingHorizontal: spacing.lg, alignItems: 'center' },
  headerSubtitle: { color: colors.gold.light, fontSize: 14, marginBottom: 4 },
  headerTitle: { color: colors.gold.light, fontSize: 28, fontWeight: '700' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginTop: -spacing.md, backgroundColor: colors.background.warmWhite, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border.gold as string, ...shadows.warm },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, paddingVertical: spacing.md, fontSize: 15, color: colors.text.primary },
  categoryScroll: { marginTop: spacing.md, maxHeight: 48 },
  categoryContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  categoryPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.background.cream, borderWidth: 1, borderColor: colors.border.gold as string },
  categoryPillActive: { backgroundColor: colors.primary.saffron, borderColor: colors.primary.saffron },
  categoryLabel: { fontSize: 13, fontWeight: '500', color: colors.gold.dark },
  categoryLabelActive: { color: colors.text.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: spacing.md, color: colors.text.secondary },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: spacing.md, fontSize: 16, color: colors.text.secondary },
  listContent: { padding: spacing.lg, paddingBottom: 100 },
  trackItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, marginBottom: spacing.sm, backgroundColor: colors.background.warmWhite, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border.gold as string },
  trackItemActive: { borderColor: colors.primary.saffron, backgroundColor: '#FFF5EB' },
  trackCover: { width: 48, height: 48, borderRadius: borderRadius.sm, overflow: 'hidden', marginRight: spacing.md },
  coverImage: { width: 48, height: 48 },
  coverPlaceholder: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  playingIndicator: { position: 'absolute', bottom: 2, left: 2, right: 2, flexDirection: 'row', alignItems: 'flex-end', gap: 2, justifyContent: 'center' },
  soundBar: { width: 3, backgroundColor: colors.gold.main, borderRadius: 1 },
  trackInfo: { flex: 1, marginRight: spacing.sm },
  trackTitle: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  trackTitleActive: { color: colors.primary.saffron },
  trackArtist: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  trackDuration: { fontSize: 12, color: colors.text.secondary, marginRight: spacing.sm },
});
```

---

## Task 17: Mobile Sadhana Tracker Screen

**Files:**
- Create: `mobile/user-app/src/screens/sadhana/SadhanaScreen.tsx`
- Create: `mobile/user-app/src/screens/sadhana/LogPracticeScreen.tsx`

- [ ] **Step 1: Create the main Sadhana Tracker screen with streak display**

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { SadhanaStreak, SadhanaLog } from '../../types';

const PRACTICE_TYPES = [
  { key: 'meditation', label: 'Meditation', icon: 'meditation' as const, color: '#6B4EFF', unit: 'min' },
  { key: 'japa', label: 'Japa', icon: 'counter' as const, color: '#FF6B00', unit: 'rounds' },
  { key: 'scripture_reading', label: 'Scripture', icon: 'book-open-page-variant' as const, color: '#00897B', unit: 'min' },
  { key: 'seva', label: 'Seva', icon: 'hand-heart' as const, color: '#E91E63', unit: 'hrs' },
  { key: 'pranayama', label: 'Pranayama', icon: 'weather-windy' as const, color: '#2196F3', unit: 'min' },
];

const MILESTONE_ICONS: Record<number, string> = {
  3: 'numeric-3-circle',
  7: 'numeric-7-circle',
  11: 'star-circle',
  21: 'trophy',
  40: 'fire',
  48: 'shield-star',
  90: 'diamond-stone',
  108: 'om',
  365: 'crown',
};

export function SadhanaScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [streak, setStreak] = useState<SadhanaStreak | null>(null);
  const [todayLogs, setTodayLogs] = useState<SadhanaLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?._id) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const [streakRes, logsRes] = await Promise.all([
        api.get(`/sadhana/streak?userId=${user._id}`),
        api.get(`/sadhana/log?userId=${user._id}&startDate=${today}&endDate=${today}`),
      ]);
      setStreak(streakRes.data);
      setTodayLogs(logsRes.data || []);
    } catch (error) {
      console.error('Error fetching sadhana data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const todayPracticeTypes = new Set(todayLogs.map(l => l.practiceType));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.saffron} />
        <Text style={styles.loadingText}>Loading your sadhana...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.saffron} />}
      >
        {/* Streak Hero */}
        <LinearGradient colors={[colors.primary.maroon, colors.primary.deepRed]} style={styles.streakHero}>
          <Text style={styles.heroSubtitle}>साधना ट्रैकर</Text>
          <Text style={styles.heroTitle}>Your Sadhana</Text>

          {/* Streak Circle */}
          <View style={styles.streakCircleOuter}>
            <LinearGradient colors={[colors.gold.main, colors.gold.dark]} style={styles.streakCircle}>
              <Text style={styles.streakNumber}>{streak?.currentStreak || 0}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </LinearGradient>
          </View>

          {/* Motivational Message */}
          <Text style={styles.motivationalMessage}>
            {streak?.motivationalMessage || '"Begin your sadhana today."'}
          </Text>

          {/* Next Milestone */}
          {streak?.nextMilestone && (
            <View style={styles.nextMilestone}>
              <Icon name="flag-checkered" size={14} color={colors.gold.light} />
              <Text style={styles.nextMilestoneText}>
                Next milestone: {streak.nextMilestone} days ({streak.nextMilestone - (streak.currentStreak || 0)} to go)
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{streak?.longestStreak || 0}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{streak?.totalPracticeDays || 0}</Text>
            <Text style={styles.statLabel}>Total Days</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{Math.round((streak?.totalMinutes || 0) / 60)}</Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{streak?.totalJapaRounds || 0}</Text>
            <Text style={styles.statLabel}>Japa Rounds</Text>
          </View>
        </View>

        {/* Milestones */}
        {streak?.milestones && streak.milestones.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Milestones Achieved</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.milestonesRow}>
              {streak.milestones.sort((a, b) => a - b).map(m => (
                <View key={m} style={styles.milestoneBadge}>
                  <Icon name={(MILESTONE_ICONS[m] || 'star') as any} size={24} color={colors.gold.main} />
                  <Text style={styles.milestoneNumber}>{m}</Text>
                  <Text style={styles.milestoneLabel}>days</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Today's Practices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today&apos;s Practice</Text>
          <View style={styles.practiceGrid}>
            {PRACTICE_TYPES.map(practice => {
              const done = todayPracticeTypes.has(practice.key as any);
              return (
                <TouchableOpacity
                  key={practice.key}
                  style={[styles.practiceCard, done && styles.practiceCardDone]}
                  onPress={() => (navigation as any).navigate('LogPractice', { practiceType: practice.key })}
                >
                  <View style={[styles.practiceIconWrap, { backgroundColor: done ? practice.color : colors.background.cream }]}>
                    <Icon name={practice.icon} size={24} color={done ? colors.text.white : practice.color} />
                  </View>
                  <Text style={styles.practiceLabel}>{practice.label}</Text>
                  {done && <Icon name="check-circle" size={18} color={colors.accent.sage} style={styles.checkIcon} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.summaryButton}
            onPress={() => (navigation as any).navigate('SadhanaSummary')}
          >
            <LinearGradient colors={[colors.primary.saffron, colors.primary.vermillion]} style={styles.summaryButtonGradient}>
              <Icon name="chart-line" size={24} color={colors.text.white} />
              <Text style={styles.summaryButtonText}>View Weekly Summary</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.parchment },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.parchment },
  loadingText: { marginTop: spacing.md, color: colors.text.secondary },
  streakHero: { paddingTop: spacing.xxl + 10, paddingBottom: spacing.xl, alignItems: 'center', paddingHorizontal: spacing.lg },
  heroSubtitle: { color: colors.gold.light, fontSize: 14, marginBottom: 4 },
  heroTitle: { color: colors.gold.light, fontSize: 28, fontWeight: '700', marginBottom: spacing.lg },
  streakCircleOuter: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: colors.gold.light, padding: 4, marginBottom: spacing.md },
  streakCircle: { flex: 1, borderRadius: 67, justifyContent: 'center', alignItems: 'center' },
  streakNumber: { fontSize: 48, fontWeight: '800', color: colors.text.white },
  streakLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginTop: -4 },
  motivationalMessage: { color: colors.gold.light, fontSize: 14, fontStyle: 'italic', textAlign: 'center', paddingHorizontal: spacing.lg, lineHeight: 22 },
  nextMilestone: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  nextMilestoneText: { color: colors.gold.light, fontSize: 12, fontWeight: '500' },
  statsRow: { flexDirection: 'row', marginHorizontal: spacing.lg, marginTop: -spacing.lg, gap: spacing.sm },
  statCard: { flex: 1, backgroundColor: colors.background.warmWhite, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border.gold as string, ...shadows.warm },
  statNumber: { fontSize: 22, fontWeight: '700', color: colors.primary.maroon },
  statLabel: { fontSize: 10, color: colors.text.secondary, marginTop: 2, textAlign: 'center' },
  section: { marginTop: spacing.lg, paddingHorizontal: spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.primary.maroon, marginBottom: spacing.md },
  milestonesRow: { gap: spacing.md, paddingRight: spacing.lg },
  milestoneBadge: { alignItems: 'center', backgroundColor: colors.background.cream, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border.gold as string, minWidth: 70 },
  milestoneNumber: { fontSize: 16, fontWeight: '700', color: colors.primary.maroon, marginTop: 4 },
  milestoneLabel: { fontSize: 10, color: colors.text.secondary },
  practiceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  practiceCard: { width: '48%' as any, backgroundColor: colors.background.warmWhite, borderRadius: borderRadius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border.gold as string },
  practiceCardDone: { borderColor: colors.accent.sage, backgroundColor: '#F0FFF4' },
  practiceIconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  practiceLabel: { fontSize: 14, fontWeight: '600', color: colors.text.primary, flex: 1 },
  checkIcon: { position: 'absolute', top: 8, right: 8 },
  summaryButton: { borderRadius: borderRadius.lg, overflow: 'hidden', ...shadows.warm },
  summaryButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, gap: spacing.sm },
  summaryButtonText: { fontSize: 16, fontWeight: '700', color: colors.text.white },
});
```

- [ ] **Step 2: Create the Log Practice screen**

```tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { colors, spacing, borderRadius, shadows } from '../../theme';

const PRACTICE_META: Record<string, { label: string; icon: string; inputLabel: string; inputType: 'duration' | 'count'; color: string }> = {
  meditation: { label: 'Meditation', icon: 'meditation', inputLabel: 'Duration (minutes)', inputType: 'duration', color: '#6B4EFF' },
  japa: { label: 'Japa / Chanting', icon: 'counter', inputLabel: 'Mala Rounds', inputType: 'count', color: '#FF6B00' },
  scripture_reading: { label: 'Scripture Reading', icon: 'book-open-page-variant', inputLabel: 'Duration (minutes)', inputType: 'duration', color: '#00897B' },
  seva: { label: 'Seva (Service)', icon: 'hand-heart', inputLabel: 'Duration (minutes)', inputType: 'duration', color: '#E91E63' },
  pranayama: { label: 'Pranayama', icon: 'weather-windy', inputLabel: 'Duration (minutes)', inputType: 'duration', color: '#2196F3' },
};

const MOODS = [
  { key: 'peaceful', label: 'Peaceful', icon: 'peace' },
  { key: 'focused', label: 'Focused', icon: 'target' },
  { key: 'joyful', label: 'Joyful', icon: 'emoticon-happy' },
  { key: 'grateful', label: 'Grateful', icon: 'heart' },
  { key: 'distracted', label: 'Distracted', icon: 'weather-cloudy' },
];

export function LogPracticeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const practiceType = (route.params as any)?.practiceType || 'meditation';
  const meta = PRACTICE_META[practiceType];

  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!value || parseInt(value) <= 0) {
      Alert.alert('Required', `Please enter ${meta.inputLabel.toLowerCase()}`);
      return;
    }

    try {
      setSubmitting(true);
      const payload: Record<string, unknown> = {
        userId: user?._id,
        date: new Date().toISOString().split('T')[0],
        practiceType,
        notes: notes || undefined,
        mood: mood || undefined,
      };

      if (meta.inputType === 'duration') {
        payload.durationMinutes = parseInt(value);
      } else {
        payload.count = parseInt(value);
      }

      const response = await api.post('/sadhana/log', payload);
      if (response.data) {
        Alert.alert(
          'Practice Logged',
          'Your sadhana has been recorded. Keep going!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error logging practice:', error);
      Alert.alert('Error', 'Failed to log practice. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.primary.maroon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Practice</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Practice Type Banner */}
        <View style={[styles.typeBanner, { backgroundColor: meta.color + '15' }]}>
          <View style={[styles.typeIcon, { backgroundColor: meta.color }]}>
            <Icon name={meta.icon as any} size={32} color={colors.text.white} />
          </View>
          <Text style={[styles.typeLabel, { color: meta.color }]}>{meta.label}</Text>
        </View>

        {/* Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{meta.inputLabel}</Text>
          <TextInput
            style={styles.numberInput}
            value={value}
            onChangeText={setValue}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.text.secondary}
            maxLength={4}
          />
          <Text style={styles.inputHint}>
            {meta.inputType === 'count' ? 'Each mala = 108 beads' : 'Enter total minutes'}
          </Text>
        </View>

        {/* Mood */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>How do you feel?</Text>
          <View style={styles.moodRow}>
            {MOODS.map(m => (
              <TouchableOpacity
                key={m.key}
                style={[styles.moodChip, mood === m.key && styles.moodChipActive]}
                onPress={() => setMood(mood === m.key ? null : m.key)}
              >
                <Icon name={m.icon as any} size={20} color={mood === m.key ? colors.text.white : colors.gold.dark} />
                <Text style={[styles.moodLabel, mood === m.key && styles.moodLabelActive]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any reflections from your practice..."
            placeholderTextColor={colors.text.secondary}
            multiline
            maxLength={500}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
          <LinearGradient colors={[colors.primary.saffron, colors.primary.vermillion]} style={styles.submitGradient}>
            {submitting ? (
              <ActivityIndicator color={colors.text.white} />
            ) : (
              <>
                <Icon name="check-circle" size={24} color={colors.text.white} />
                <Text style={styles.submitText}>Log Practice</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.parchment },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: spacing.xxl, paddingBottom: spacing.md, backgroundColor: colors.background.warmWhite, borderBottomWidth: 1, borderBottomColor: colors.border.gold as string },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background.sandstone, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.primary.maroon },
  content: { padding: spacing.lg, paddingBottom: 100 },
  typeBanner: { borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.lg },
  typeIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  typeLabel: { fontSize: 22, fontWeight: '700' },
  inputSection: { marginBottom: spacing.lg },
  inputLabel: { fontSize: 16, fontWeight: '600', color: colors.primary.maroon, marginBottom: spacing.sm },
  numberInput: { fontSize: 48, fontWeight: '700', color: colors.primary.maroon, textAlign: 'center', backgroundColor: colors.background.warmWhite, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 2, borderColor: colors.border.gold as string },
  inputHint: { fontSize: 12, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.xs },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  moodChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.background.cream, borderWidth: 1, borderColor: colors.border.gold as string },
  moodChipActive: { backgroundColor: colors.primary.saffron, borderColor: colors.primary.saffron },
  moodLabel: { fontSize: 13, color: colors.gold.dark, fontWeight: '500' },
  moodLabelActive: { color: colors.text.white },
  notesInput: { backgroundColor: colors.background.warmWhite, borderRadius: borderRadius.md, padding: spacing.md, fontSize: 15, color: colors.text.primary, minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: colors.border.gold as string },
  submitButton: { borderRadius: borderRadius.lg, overflow: 'hidden', marginTop: spacing.md, ...shadows.warm },
  submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, gap: spacing.sm },
  submitText: { fontSize: 18, fontWeight: '700', color: colors.text.white },
});
```

---

## Task 18: Mobile Navigation Updates

**Files:**
- Modify: `mobile/user-app/src/navigation/AppNavigator.tsx`

- [ ] **Step 1: Add Audio and Sadhana routes to the navigator**

Add imports at top:
```typescript
import { AudioLibraryScreen } from '../screens/audio/AudioLibraryScreen';
import { AudioPlayerScreen } from '../screens/audio/AudioPlayerScreen';
import { CollectionScreen } from '../screens/audio/CollectionScreen';
import { SadhanaScreen } from '../screens/sadhana/SadhanaScreen';
import { LogPracticeScreen } from '../screens/sadhana/LogPracticeScreen';
import { SadhanaSummaryScreen } from '../screens/sadhana/SadhanaSummaryScreen';
import { AudioPlayerProvider } from '../context/AudioPlayerContext';
```

Add to `RootStackParamList`:
```typescript
AudioLibrary: undefined;
AudioPlayer: undefined;
AudioCollection: { collectionId: string };
Sadhana: undefined;
LogPractice: { practiceType: string };
SadhanaSummary: undefined;
```

Add Stack.Screen entries inside the Stack.Navigator (after the existing detail screens):
```tsx
<Stack.Screen
  name="AudioLibrary"
  component={AudioLibraryScreen}
  options={{ headerShown: false, animation: 'slide_from_right' }}
/>
<Stack.Screen
  name="AudioPlayer"
  component={AudioPlayerScreen}
  options={{ headerShown: false, animation: 'slide_from_bottom', presentation: 'modal' }}
/>
<Stack.Screen
  name="AudioCollection"
  component={CollectionScreen}
  options={{ headerShown: false, animation: 'slide_from_right' }}
/>
<Stack.Screen
  name="Sadhana"
  component={SadhanaScreen}
  options={{ headerShown: false, animation: 'slide_from_right' }}
/>
<Stack.Screen
  name="LogPractice"
  component={LogPracticeScreen}
  options={{ headerShown: false, animation: 'slide_from_bottom', presentation: 'modal' }}
/>
<Stack.Screen
  name="SadhanaSummary"
  component={SadhanaSummaryScreen}
  options={{ headerShown: false, animation: 'slide_from_right' }}
/>
```

Wrap the NavigationContainer with AudioPlayerProvider:
```tsx
<AudioPlayerProvider>
  <NavigationContainer>
    ...
  </NavigationContainer>
</AudioPlayerProvider>
```

---

## Task 19: Mobile Audio Player Screen (Full-Screen)

**Files:**
- Create: `mobile/user-app/src/screens/audio/AudioPlayerScreen.tsx`

- [ ] **Step 1: Create the full-screen audio player for mobile**

```tsx
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { colors, spacing, borderRadius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ARTWORK_SIZE = SCREEN_WIDTH - 80;

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function AudioPlayerScreen() {
  const navigation = useNavigation();
  const {
    currentTrack, isPlaying, currentTime, duration, isLoading,
    togglePlay, seekTo, playNext, playPrevious, queue, queueIndex,
  } = useAudioPlayer();

  if (!currentTrack) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="music-off" size={64} color={colors.text.secondary} />
        <Text style={styles.emptyText}>No track playing</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.emptyLink}>Go to Audio Library</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient colors={[colors.primary.maroon, '#2A0008']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Icon name="chevron-down" size={28} color={colors.gold.light} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Now Playing</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Artwork */}
      <View style={styles.artworkContainer}>
        {currentTrack.coverImage ? (
          <Image source={{ uri: currentTrack.coverImage }} style={styles.artwork} />
        ) : (
          <LinearGradient colors={[colors.primary.saffron, colors.gold.dark]} style={styles.artworkPlaceholder}>
            <Icon name="music" size={80} color={colors.gold.light} />
          </LinearGradient>
        )}
      </View>

      {/* Track Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{currentTrack.titleEnglish}</Text>
        <Text style={styles.titleHindi} numberOfLines={1}>{currentTrack.titleHindi}</Text>
        <Text style={styles.artist}>{currentTrack.artist}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration || 1}
          value={currentTime}
          onSlidingComplete={val => seekTo(val * 1000)}
          minimumTrackTintColor={colors.gold.main}
          maximumTrackTintColor="rgba(255,255,255,0.2)"
          thumbTintColor={colors.gold.light}
        />
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={playPrevious} disabled={queueIndex <= 0}>
          <Icon name="skip-previous" size={36} color={queueIndex > 0 ? colors.gold.light : 'rgba(255,255,255,0.3)'} />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlay} style={styles.playBtn}>
          {isLoading ? (
            <Icon name="loading" size={36} color={colors.primary.maroon} />
          ) : (
            <Icon name={isPlaying ? 'pause' : 'play'} size={36} color={colors.primary.maroon} />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={playNext} disabled={queueIndex >= queue.length - 1}>
          <Icon name="skip-next" size={36} color={queueIndex < queue.length - 1 ? colors.gold.light : 'rgba(255,255,255,0.3)'} />
        </TouchableOpacity>
      </View>

      {/* Queue Info */}
      <Text style={styles.queueInfo}>
        {queueIndex + 1} of {queue.length} tracks
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.xxl },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.parchment },
  emptyText: { fontSize: 18, color: colors.text.secondary, marginTop: spacing.md },
  emptyLink: { color: colors.primary.saffron, fontSize: 16, marginTop: spacing.md, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  closeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: colors.gold.light, fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  artworkContainer: { alignItems: 'center', paddingHorizontal: 40, marginVertical: spacing.lg },
  artwork: { width: ARTWORK_SIZE, height: ARTWORK_SIZE, borderRadius: borderRadius.lg, borderWidth: 2, borderColor: colors.gold.main },
  artworkPlaceholder: { width: ARTWORK_SIZE, height: ARTWORK_SIZE, borderRadius: borderRadius.lg, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.gold.main },
  info: { alignItems: 'center', paddingHorizontal: spacing.xl },
  title: { color: colors.gold.light, fontSize: 22, fontWeight: '700', textAlign: 'center', lineHeight: 30 },
  titleHindi: { color: colors.gold.light, fontSize: 16, textAlign: 'center', marginTop: 4, opacity: 0.7 },
  artist: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 8 },
  progressContainer: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  slider: { width: '100%', height: 40 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -8 },
  timeText: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl, marginTop: spacing.lg },
  playBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.gold.main, justifyContent: 'center', alignItems: 'center' },
  queueInfo: { color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', marginTop: spacing.lg },
});
```

---

## Task 20: Mobile Sadhana Summary Screen

**Files:**
- Create: `mobile/user-app/src/screens/sadhana/SadhanaSummaryScreen.tsx`

- [ ] **Step 1: Create the weekly/monthly summary view**

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { SadhanaSummary } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_MAX_HEIGHT = 80;

const PRACTICE_COLORS: Record<string, string> = {
  meditation: '#6B4EFF',
  japa: '#FF6B00',
  scripture_reading: '#00897B',
  seva: '#E91E63',
  pranayama: '#2196F3',
};

const PRACTICE_LABELS: Record<string, string> = {
  meditation: 'Meditation',
  japa: 'Japa',
  scripture_reading: 'Scripture',
  seva: 'Seva',
  pranayama: 'Pranayama',
};

export function SadhanaSummaryScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [summary, setSummary] = useState<SadhanaSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const response = await api.get(`/sadhana/summary?userId=${user._id}&period=${period}`);
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  }, [user, period]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const maxDailyMinutes = summary
    ? Math.max(...summary.dailySummaries.map(d => d.totalMinutes), 1)
    : 1;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.primary.maroon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sadhana Summary</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Period Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, period === 'week' && styles.toggleBtnActive]}
          onPress={() => setPeriod('week')}
        >
          <Text style={[styles.toggleText, period === 'week' && styles.toggleTextActive]}>This Week</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, period === 'month' && styles.toggleBtnActive]}
          onPress={() => setPeriod('month')}
        >
          <Text style={[styles.toggleText, period === 'month' && styles.toggleTextActive]}>This Month</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.saffron} />
        </View>
      ) : !summary ? (
        <View style={styles.emptyContainer}>
          <Icon name="chart-line" size={64} color={colors.text.secondary} />
          <Text style={styles.emptyText}>No data for this period</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Completion Rate */}
          <View style={styles.completionCard}>
            <Text style={styles.completionRate}>{summary.completionRate}%</Text>
            <Text style={styles.completionLabel}>
              {summary.activeDays} of {summary.totalDays} days
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${summary.completionRate}%` }]} />
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.miniStat}>
              <Icon name="clock-outline" size={20} color={colors.gold.main} />
              <Text style={styles.miniStatValue}>{summary.totalMinutes}</Text>
              <Text style={styles.miniStatLabel}>Minutes</Text>
            </View>
            <View style={styles.miniStat}>
              <Icon name="counter" size={20} color={colors.gold.main} />
              <Text style={styles.miniStatValue}>{summary.totalJapaRounds}</Text>
              <Text style={styles.miniStatLabel}>Japa Rounds</Text>
            </View>
          </View>

          {/* Daily Chart */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Daily Activity</Text>
            <View style={styles.chartContainer}>
              {summary.dailySummaries.map((day, idx) => {
                const barHeight = (day.totalMinutes / maxDailyMinutes) * BAR_MAX_HEIGHT;
                const dayLabel = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <View key={day.date} style={styles.chartBarColumn}>
                    <View style={[styles.chartBar, { height: Math.max(barHeight, 4) }]}>
                      <View style={styles.chartBarFill} />
                    </View>
                    <Text style={styles.chartBarLabel}>{dayLabel}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Practice Breakdown */}
          <View style={styles.breakdownSection}>
            <Text style={styles.sectionTitle}>Practice Breakdown</Text>
            {summary.practiceBreakdown.map(practice => (
              <View key={practice.practiceType} style={styles.breakdownRow}>
                <View style={[styles.breakdownDot, { backgroundColor: PRACTICE_COLORS[practice.practiceType] || colors.gold.main }]} />
                <Text style={styles.breakdownLabel}>{PRACTICE_LABELS[practice.practiceType] || practice.practiceType}</Text>
                <Text style={styles.breakdownValue}>
                  {practice.totalDuration > 0 ? `${practice.totalDuration} min` : ''}
                  {practice.totalCount > 0 ? `${practice.totalCount} rounds` : ''}
                </Text>
                <Text style={styles.breakdownSessions}>{practice.sessionCount} sessions</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.parchment },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: spacing.xxl, paddingBottom: spacing.md, backgroundColor: colors.background.warmWhite, borderBottomWidth: 1, borderBottomColor: colors.border.gold as string },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background.sandstone, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.primary.maroon },
  toggleRow: { flexDirection: 'row', marginHorizontal: spacing.lg, marginTop: spacing.md, backgroundColor: colors.background.sandstone, borderRadius: borderRadius.lg, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: colors.primary.saffron },
  toggleText: { fontSize: 14, fontWeight: '600', color: colors.text.secondary },
  toggleTextActive: { color: colors.text.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: spacing.md, color: colors.text.secondary, fontSize: 16 },
  content: { padding: spacing.lg },
  completionCard: { backgroundColor: colors.background.warmWhite, borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.border.gold as string, marginBottom: spacing.lg, ...shadows.warm },
  completionRate: { fontSize: 48, fontWeight: '800', color: colors.primary.maroon },
  completionLabel: { fontSize: 14, color: colors.text.secondary, marginTop: 4, marginBottom: spacing.md },
  progressBar: { width: '100%', height: 8, backgroundColor: colors.background.sandstone, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary.saffron, borderRadius: 4 },
  statsGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  miniStat: { flex: 1, backgroundColor: colors.background.warmWhite, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border.gold as string },
  miniStatValue: { fontSize: 24, fontWeight: '700', color: colors.primary.maroon, marginTop: 4 },
  miniStatLabel: { fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  chartSection: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.primary.maroon, marginBottom: spacing.md },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: BAR_MAX_HEIGHT + 30, backgroundColor: colors.background.warmWhite, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border.gold as string },
  chartBarColumn: { alignItems: 'center', flex: 1 },
  chartBar: { width: 12, borderRadius: 6, overflow: 'hidden', backgroundColor: colors.background.sandstone },
  chartBarFill: { flex: 1, backgroundColor: colors.primary.saffron, borderRadius: 6 },
  chartBarLabel: { fontSize: 10, color: colors.text.secondary, marginTop: 4 },
  breakdownSection: { marginBottom: spacing.lg },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border.gold as string },
  breakdownDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  breakdownLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.text.primary },
  breakdownValue: { fontSize: 14, color: colors.primary.maroon, fontWeight: '600', marginRight: spacing.sm },
  breakdownSessions: { fontSize: 12, color: colors.text.secondary },
});
```

---

## Task 21: Mobile Offline Download Service

**Files:**
- Create: `mobile/user-app/src/services/audioDownload.ts`

- [ ] **Step 1: Create the offline download service using expo-file-system**

```typescript
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUDIO_DIR = `${FileSystem.documentDirectory}audio/`;
const DOWNLOAD_INDEX_KEY = '@downloaded_audio_tracks';

interface DownloadedTrack {
  trackId: string;
  localUri: string;
  downloadedAt: string;
  fileSize: number;
  titleEnglish: string;
  artist: string;
}

// Ensure audio directory exists
async function ensureDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(AUDIO_DIR, { intermediates: true });
  }
}

// Get all downloaded tracks
export async function getDownloadedTracks(): Promise<DownloadedTrack[]> {
  try {
    const data = await AsyncStorage.getItem(DOWNLOAD_INDEX_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Check if a track is downloaded
export async function isTrackDownloaded(trackId: string): Promise<boolean> {
  const tracks = await getDownloadedTracks();
  const track = tracks.find(t => t.trackId === trackId);
  if (!track) return false;

  // Verify file still exists
  const info = await FileSystem.getInfoAsync(track.localUri);
  return info.exists;
}

// Get local URI for a downloaded track
export async function getLocalUri(trackId: string): Promise<string | null> {
  const tracks = await getDownloadedTracks();
  const track = tracks.find(t => t.trackId === trackId);
  if (!track) return null;

  const info = await FileSystem.getInfoAsync(track.localUri);
  if (!info.exists) {
    // File was deleted, clean up index
    await removeFromIndex(trackId);
    return null;
  }
  return track.localUri;
}

// Download a track for offline playback
export async function downloadTrack(
  trackId: string,
  audioUrl: string,
  titleEnglish: string,
  artist: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  await ensureDir();

  const filename = `${trackId}.mp3`;
  const localUri = `${AUDIO_DIR}${filename}`;

  const downloadResumable = FileSystem.createDownloadResumable(
    audioUrl,
    localUri,
    {},
    (downloadProgress) => {
      const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
      onProgress?.(progress);
    }
  );

  const result = await downloadResumable.downloadAsync();
  if (!result) {
    throw new Error('Download failed');
  }

  // Save to index
  const tracks = await getDownloadedTracks();
  const newEntry: DownloadedTrack = {
    trackId,
    localUri: result.uri,
    downloadedAt: new Date().toISOString(),
    fileSize: 0, // expo-file-system doesn't return size in downloadAsync
    titleEnglish,
    artist,
  };

  // Get file info for size
  const fileInfo = await FileSystem.getInfoAsync(result.uri);
  if (fileInfo.exists && 'size' in fileInfo) {
    newEntry.fileSize = fileInfo.size || 0;
  }

  // Remove existing entry for this track if any
  const filtered = tracks.filter(t => t.trackId !== trackId);
  filtered.push(newEntry);

  await AsyncStorage.setItem(DOWNLOAD_INDEX_KEY, JSON.stringify(filtered));

  return result.uri;
}

// Delete a downloaded track
export async function deleteDownload(trackId: string): Promise<void> {
  const tracks = await getDownloadedTracks();
  const track = tracks.find(t => t.trackId === trackId);

  if (track) {
    const info = await FileSystem.getInfoAsync(track.localUri);
    if (info.exists) {
      await FileSystem.deleteAsync(track.localUri);
    }
    await removeFromIndex(trackId);
  }
}

// Remove from download index
async function removeFromIndex(trackId: string): Promise<void> {
  const tracks = await getDownloadedTracks();
  const filtered = tracks.filter(t => t.trackId !== trackId);
  await AsyncStorage.setItem(DOWNLOAD_INDEX_KEY, JSON.stringify(filtered));
}

// Get total download size
export async function getTotalDownloadSize(): Promise<number> {
  const tracks = await getDownloadedTracks();
  return tracks.reduce((sum, t) => sum + t.fileSize, 0);
}

// Delete all downloads
export async function clearAllDownloads(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);
  if (dirInfo.exists) {
    await FileSystem.deleteAsync(AUDIO_DIR, { idempotent: true });
  }
  await AsyncStorage.removeItem(DOWNLOAD_INDEX_KEY);
}
```

---

## Task 22: Admin Sadhana Overview Page

**Files:**
- Create: `dashboard-next/src/app/dashboard/sadhana/page.tsx`

- [ ] **Step 1: Create the admin sadhana overview page with aggregate stats**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';

interface SadhanaStats {
  totalUsers: number;
  totalLogs: number;
  activeStreaks: number;
  avgStreak: number;
}

export default function SadhanaAdminPage() {
  const [stats, setStats] = useState<SadhanaStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, show placeholder stats. A dedicated admin stats API can be added later.
    setStats({
      totalUsers: 0,
      totalLogs: 0,
      activeStreaks: 0,
      avgStreak: 0,
    });
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Sadhana Tracker</h1>
        <p className="text-muted-foreground">
          Overview of devotee practice tracking across the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-16" /></CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Practitioners</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{stats?.totalUsers || 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Practice Logs</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{stats?.totalLogs || 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Streaks</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{stats?.activeStreaks || 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg. Streak Length</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{stats?.avgStreak || 0} days</p></CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About Sadhana Tracker</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2">
          <p>The Sadhana Tracker allows devotees to log their daily spiritual practices:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Meditation</strong> -- Track duration in minutes</li>
            <li><strong>Japa (Chanting)</strong> -- Track mala rounds</li>
            <li><strong>Scripture Reading</strong> -- Track time or pages</li>
            <li><strong>Seva (Service)</strong> -- Track hours of service</li>
            <li><strong>Pranayama</strong> -- Track duration in minutes</li>
          </ul>
          <p>Streaks are calculated automatically based on consecutive days of practice. Milestone badges are awarded at spiritually significant numbers: 3, 7, 11, 21, 40, 48, 90, 108, and 365 days.</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Self-Review Checklist

Before marking any task complete, verify:

- [ ] **Models:** All 4 models (AudioTrack, AudioCollection, SadhanaLog, SadhanaStreak) follow existing patterns: `isDeleted: boolean`, `timestamps: true`, `versionKey: false`, `strict: true`, model registration with `mongoose.models.X || mongoose.model()`.
- [ ] **API Response Format:** All routes return `{ success: boolean, data: any, message?: string }` matching the existing pattern.
- [ ] **Soft Deletes:** DELETE operations set `isDeleted: true` instead of removing documents.
- [ ] **Type Safety:** All TypeScript interfaces are complete with proper typing, no `any` leakage in public interfaces.
- [ ] **Cloudinary:** Audio uploads use `resource_type: 'video'` (Cloudinary's requirement for audio). Cover images use `resource_type: 'image'` with appropriate transformations.
- [ ] **File Size Limits:** Audio files capped at 100MB. Validation occurs before upload.
- [ ] **Text Search:** AudioTrack model has text index across titleHindi, titleEnglish, artist, description, tags.
- [ ] **Pagination:** Audio tracks GET supports page/limit/sort parameters.
- [ ] **Website Player:** AudioPlayerProvider wraps the entire layout. AudioPlayer bar renders at bottom, fixed position. Player only appears when a track is selected.
- [ ] **Mobile Audio:** expo-av configured with `staysActiveInBackground: true` for background playback. AudioPlayerContext wraps NavigationContainer.
- [ ] **Streak Logic:** Consecutive day calculation handles timezone normalization (UTC midnight). Streak breaks when gap > 1 day. Milestones use spiritually significant numbers (3, 7, 11, 21, 40, 48, 90, 108, 365).
- [ ] **Motivational Messages:** Streak API returns contextual spiritual messages with each response.
- [ ] **Offline Downloads:** expo-file-system saves to documentDirectory. AsyncStorage index tracks download metadata.
- [ ] **Spiritual Theme:** Website uses existing CSS classes (card-temple, bg-parchment, font-display, text-spiritual-maroon, text-gradient-gold). Mobile uses theme colors from `../../theme`.
- [ ] **No Placeholders:** Every code block is complete and production-ready.
- [ ] **Next.js 15 Async Params:** All `[id]` route handlers use `params: Promise<{ id: string }>` with `await params`.
- [ ] **Admin Navigation:** Audio library is under `/dashboard/website/audio` matching the existing content management structure.
- [ ] **Mobile Navigation:** New screens are added to RootStackParamList and registered as Stack.Screens.
