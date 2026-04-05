# Plan 1: Live Streaming & Daily Spiritual Content

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add live satsang/pravachan streaming (YouTube Live integration), daily Vichar (thought of the day) system with push delivery, and TV broadcast schedule — matching capabilities of Art of Living, Sadhguru, and Brahma Kumaris platforms.

**Architecture:** YouTube Live embed for streaming (no custom video infrastructure), MongoDB models for daily content and broadcast schedules, server-side cron-like scheduling for daily content rotation, push notification hooks for new content delivery. All three features share a "daily engagement" pipeline that drives retention.

**Tech Stack:** Next.js 15 App Router, MongoDB/Mongoose, YouTube IFrame API, Firebase Cloud Messaging (already in deps), Framer Motion (website animations), React Native (mobile), Expo Notifications.

**Peer Benchmark:**
| Feature | Sadhguru | Art of Living | Brahma Kumaris | RSSB | **Our Target** |
|---------|----------|--------------|----------------|------|----------------|
| Live Streaming | YouTube Live embed | In-app live | 24/7 multi-location | None | YouTube Live embed |
| Daily Quote | Mystic Quote (daily) | Daily practice | Daily Challenge | Monthly | Daily Vichar + notification |
| TV Schedule | None | None | None | None | Sanskar TV + Aastha TV times |
| Scheduled Content | 6:20 PM Sadhguru Presence | Progress-based | Fresh daily challenge | 10th of month | Morning vichar + evening reminder |

---

## File Structure

### New Files to Create

**Dashboard (Admin):**
- `dashboard-next/src/models/DailyVichar.ts` — Daily spiritual quote/thought model
- `dashboard-next/src/models/LiveStream.ts` — Live stream session model
- `dashboard-next/src/models/TVSchedule.ts` — TV broadcast schedule model
- `dashboard-next/src/app/api/daily-vichar/route.ts` — CRUD for daily vichar
- `dashboard-next/src/app/api/daily-vichar/today/route.ts` — Get today's vichar
- `dashboard-next/src/app/api/livestream/route.ts` — CRUD for live streams
- `dashboard-next/src/app/api/livestream/active/route.ts` — Get currently active stream
- `dashboard-next/src/app/api/tv-schedule/route.ts` — CRUD for TV schedules
- `dashboard-next/src/app/api/notifications/send/route.ts` — Send push notification
- `dashboard-next/src/app/dashboard/daily-vichar/page.tsx` — Admin page for managing daily vichar
- `dashboard-next/src/app/dashboard/livestream/page.tsx` — Admin page for live streams
- `dashboard-next/src/app/dashboard/tv-schedule/page.tsx` — Admin page for TV schedules
- `dashboard-next/src/components/dailyvichar/VicharForm.tsx` — Create/edit vichar form
- `dashboard-next/src/components/dailyvichar/VicharCalendar.tsx` — Calendar view of scheduled vichars
- `dashboard-next/src/components/livestream/StreamManager.tsx` — Manage live stream sessions
- `dashboard-next/src/components/tvschedule/TVScheduleTable.tsx` — TV schedule management table

**Website (Public):**
- `website/app/live/page.tsx` — Live stream viewing page
- `website/components/sections/DailyVichar.tsx` — Daily vichar section for homepage
- `website/components/sections/LiveBanner.tsx` — "Live Now" banner when stream is active
- `website/components/sections/TVSchedule.tsx` — TV broadcast schedule display

**Mobile User App:**
- `mobile/user-app/src/screens/live/LiveStreamScreen.tsx` — Live stream viewing screen
- `mobile/user-app/src/screens/home/DailyVicharCard.tsx` — Daily vichar card component
- `mobile/user-app/src/screens/home/TVScheduleCard.tsx` — TV schedule card component
- `mobile/user-app/src/services/notifications.ts` — (Modify) Add daily vichar notification channel

### Files to Modify

- `dashboard-next/src/middleware.ts` — Add `/api/daily-vichar`, `/api/livestream`, `/api/tv-schedule` to public endpoints
- `website/app/page.tsx` — Add DailyVichar and LiveBanner sections
- `website/components/layout/Navbar.tsx` — Add "Live" nav link with red dot indicator
- `mobile/user-app/src/screens/home/HomeScreen.tsx` — Add DailyVicharCard and LiveBanner
- `mobile/user-app/src/navigation/AppNavigator.tsx` — Add LiveStreamScreen route

---

## Task 1: DailyVichar MongoDB Model

**Files:**
- Create: `dashboard-next/src/models/DailyVichar.ts`

- [ ] **Step 1: Create the DailyVichar model**

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IDailyVichar extends Document {
  date: Date;
  titleHindi: string;
  titleEnglish: string;
  contentHindi: string;
  contentEnglish: string;
  source?: string;
  category: "vedanta" | "yoga" | "dharma" | "life" | "prayer" | "festival";
  imageUrl?: string;
  audioUrl?: string;
  isPublished: boolean;
  notificationSent: boolean;
  createdBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const DailyVicharSchema = new Schema<IDailyVichar>(
  {
    date: {
      type: Date,
      required: [true, "Date is required"],
      unique: true,
      index: true,
    },
    titleHindi: {
      type: String,
      required: [true, "Hindi title is required"],
      maxlength: [200, "Title cannot exceed 200 characters"],
      trim: true,
    },
    titleEnglish: {
      type: String,
      required: [true, "English title is required"],
      maxlength: [200, "Title cannot exceed 200 characters"],
      trim: true,
    },
    contentHindi: {
      type: String,
      required: [true, "Hindi content is required"],
      maxlength: [2000, "Content cannot exceed 2000 characters"],
      trim: true,
    },
    contentEnglish: {
      type: String,
      required: [true, "English content is required"],
      maxlength: [2000, "Content cannot exceed 2000 characters"],
      trim: true,
    },
    source: {
      type: String,
      maxlength: [200, "Source cannot exceed 200 characters"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["vedanta", "yoga", "dharma", "life", "prayer", "festival"],
      default: "vedanta",
    },
    imageUrl: { type: String },
    audioUrl: { type: String },
    isPublished: { type: Boolean, default: false },
    notificationSent: { type: Boolean, default: false },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

DailyVicharSchema.index({ date: 1, isDeleted: 1 });
DailyVicharSchema.index({ isPublished: 1, date: -1 });

export default mongoose.models.DailyVichar ||
  mongoose.model<IDailyVichar>("DailyVichar", DailyVicharSchema);
```

- [ ] **Step 2: Verify model compiles**

Run: `cd /Users/apple/Downloads/agm-india-dashboard-website-master/dashboard-next && npx tsc --noEmit src/models/DailyVichar.ts 2>&1 | head -20`

Expected: No errors, or only errors from missing module resolution (acceptable in isolation)

- [ ] **Step 3: Commit**

```bash
cd /Users/apple/Downloads/agm-india-dashboard-website-master
git add dashboard-next/src/models/DailyVichar.ts
git commit -m "feat: add DailyVichar MongoDB model for daily spiritual quotes"
```

---

## Task 2: LiveStream MongoDB Model

**Files:**
- Create: `dashboard-next/src/models/LiveStream.ts`

- [ ] **Step 1: Create the LiveStream model**

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface ILiveStream extends Document {
  title: string;
  description?: string;
  youtubeVideoId: string;
  youtubeChannelId?: string;
  thumbnailUrl?: string;
  streamType: "satsang" | "pravachan" | "kumbh" | "festival" | "special";
  scheduledStart: Date;
  scheduledEnd?: Date;
  isLive: boolean;
  isUpcoming: boolean;
  viewerCount?: number;
  recordingUrl?: string;
  notificationSent: boolean;
  createdBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const LiveStreamSchema = new Schema<ILiveStream>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [200, "Title cannot exceed 200 characters"],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      trim: true,
    },
    youtubeVideoId: {
      type: String,
      required: [true, "YouTube Video ID is required"],
      trim: true,
    },
    youtubeChannelId: { type: String, trim: true },
    thumbnailUrl: { type: String },
    streamType: {
      type: String,
      enum: ["satsang", "pravachan", "kumbh", "festival", "special"],
      default: "satsang",
    },
    scheduledStart: {
      type: Date,
      required: [true, "Scheduled start time is required"],
      index: true,
    },
    scheduledEnd: { type: Date },
    isLive: { type: Boolean, default: false, index: true },
    isUpcoming: { type: Boolean, default: true },
    viewerCount: { type: Number, default: 0 },
    recordingUrl: { type: String },
    notificationSent: { type: Boolean, default: false },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

LiveStreamSchema.index({ isLive: 1, isDeleted: 1 });
LiveStreamSchema.index({ scheduledStart: -1, isDeleted: 1 });

export default mongoose.models.LiveStream ||
  mongoose.model<ILiveStream>("LiveStream", LiveStreamSchema);
```

- [ ] **Step 2: Commit**

```bash
git add dashboard-next/src/models/LiveStream.ts
git commit -m "feat: add LiveStream MongoDB model for satsang streaming"
```

---

## Task 3: TVSchedule MongoDB Model

**Files:**
- Create: `dashboard-next/src/models/TVSchedule.ts`

- [ ] **Step 1: Create the TVSchedule model**

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface ITVSchedule extends Document {
  channel: "sanskar" | "aastha" | "other";
  channelName: string;
  programName: string;
  description?: string;
  dayOfWeek: number[];
  timeSlot: string;
  duration: number;
  timezone: string;
  isRecurring: boolean;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  isDeleted: boolean;
}

const TVScheduleSchema = new Schema<ITVSchedule>(
  {
    channel: {
      type: String,
      enum: ["sanskar", "aastha", "other"],
      required: [true, "Channel is required"],
    },
    channelName: {
      type: String,
      required: [true, "Channel name is required"],
      trim: true,
    },
    programName: {
      type: String,
      required: [true, "Program name is required"],
      maxlength: [200, "Program name cannot exceed 200 characters"],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      trim: true,
    },
    dayOfWeek: {
      type: [Number],
      required: true,
      validate: {
        validator: (v: number[]) => v.every((d) => d >= 0 && d <= 6),
        message: "Day of week must be 0 (Sun) to 6 (Sat)",
      },
    },
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      min: [1, "Duration must be at least 1 minute"],
    },
    timezone: { type: String, default: "Asia/Kolkata" },
    isRecurring: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TVScheduleSchema.index({ channel: 1, isActive: 1, isDeleted: 1 });

export default mongoose.models.TVSchedule ||
  mongoose.model<ITVSchedule>("TVSchedule", TVScheduleSchema);
```

- [ ] **Step 2: Commit**

```bash
git add dashboard-next/src/models/TVSchedule.ts
git commit -m "feat: add TVSchedule model for Sanskar/Aastha TV broadcast times"
```

---

## Task 4: Daily Vichar API Routes

**Files:**
- Create: `dashboard-next/src/app/api/daily-vichar/route.ts`
- Create: `dashboard-next/src/app/api/daily-vichar/today/route.ts`
- Modify: `dashboard-next/src/middleware.ts`

- [ ] **Step 1: Create the main CRUD route**

```typescript
// dashboard-next/src/app/api/daily-vichar/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import DailyVichar from "@/models/DailyVichar";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "30");
    const skip = (page - 1) * limit;

    const vichars = await DailyVichar.find({ isDeleted: false })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await DailyVichar.countDocuments({ isDeleted: false });

    return NextResponse.json({
      success: true,
      data: vichars,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const existing = await DailyVichar.findOne({
      date: new Date(body.date),
      isDeleted: false,
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A vichar already exists for this date" },
        { status: 400 }
      );
    }

    const vichar = await DailyVichar.create(body);
    return NextResponse.json(
      { success: true, data: vichar },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create the "today" public route**

```typescript
// dashboard-next/src/app/api/daily-vichar/today/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import DailyVichar from "@/models/DailyVichar";

export async function GET() {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let vichar = await DailyVichar.findOne({
      date: { $gte: today, $lt: tomorrow },
      isPublished: true,
      isDeleted: false,
    }).lean();

    if (!vichar) {
      vichar = await DailyVichar.findOne({
        isPublished: true,
        isDeleted: false,
        date: { $lt: today },
      })
        .sort({ date: -1 })
        .lean();
    }

    if (!vichar) {
      return NextResponse.json(
        { success: false, message: "No vichar available" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: vichar });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Add daily-vichar/today and livestream/active to public endpoints in middleware**

In `dashboard-next/src/middleware.ts`, find the array of public API paths and add:
```typescript
"/api/daily-vichar/today",
"/api/livestream/active",
"/api/tv-schedule",
```

- [ ] **Step 4: Commit**

```bash
git add dashboard-next/src/app/api/daily-vichar/ dashboard-next/src/middleware.ts
git commit -m "feat: add Daily Vichar API routes with today endpoint"
```

---

## Task 5: LiveStream API Routes

**Files:**
- Create: `dashboard-next/src/app/api/livestream/route.ts`
- Create: `dashboard-next/src/app/api/livestream/active/route.ts`

- [ ] **Step 1: Create the main CRUD route**

```typescript
// dashboard-next/src/app/api/livestream/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LiveStream from "@/models/LiveStream";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // "live", "upcoming", "past"
    const limit = parseInt(searchParams.get("limit") || "20");

    const query: any = { isDeleted: false };
    if (status === "live") query.isLive = true;
    if (status === "upcoming") {
      query.isUpcoming = true;
      query.isLive = false;
      query.scheduledStart = { $gte: new Date() };
    }
    if (status === "past") {
      query.isLive = false;
      query.isUpcoming = false;
    }

    const streams = await LiveStream.find(query)
      .sort({ scheduledStart: status === "past" ? -1 : 1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: streams });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const stream = await LiveStream.create(body);
    return NextResponse.json(
      { success: true, data: stream },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, ...updateData } = body;

    const stream = await LiveStream.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!stream) {
      return NextResponse.json(
        { success: false, message: "Stream not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: stream });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create the "active" public route**

```typescript
// dashboard-next/src/app/api/livestream/active/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LiveStream from "@/models/LiveStream";

export async function GET() {
  try {
    await connectDB();

    const activeStream = await LiveStream.findOne({
      isLive: true,
      isDeleted: false,
    }).lean();

    const upcomingStreams = await LiveStream.find({
      isUpcoming: true,
      isLive: false,
      isDeleted: false,
      scheduledStart: { $gte: new Date() },
    })
      .sort({ scheduledStart: 1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        active: activeStream || null,
        upcoming: upcomingStreams,
        isLiveNow: !!activeStream,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add dashboard-next/src/app/api/livestream/
git commit -m "feat: add LiveStream API routes with active stream endpoint"
```

---

## Task 6: TV Schedule API Route

**Files:**
- Create: `dashboard-next/src/app/api/tv-schedule/route.ts`

- [ ] **Step 1: Create the TV schedule CRUD route**

```typescript
// dashboard-next/src/app/api/tv-schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import TVSchedule from "@/models/TVSchedule";

export async function GET() {
  try {
    await connectDB();
    const schedules = await TVSchedule.find({
      isActive: true,
      isDeleted: false,
    })
      .sort({ channel: 1, dayOfWeek: 1 })
      .lean();

    return NextResponse.json({ success: true, data: schedules });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const schedule = await TVSchedule.create(body);
    return NextResponse.json(
      { success: true, data: schedule },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, ...updateData } = body;
    const schedule = await TVSchedule.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!schedule) {
      return NextResponse.json(
        { success: false, message: "Schedule not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: schedule });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await TVSchedule.findByIdAndUpdate(id, { isDeleted: true });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add dashboard-next/src/app/api/tv-schedule/
git commit -m "feat: add TV Schedule API for Sanskar/Aastha broadcast management"
```

---

## Task 7: Push Notification Send API

**Files:**
- Create: `dashboard-next/src/app/api/notifications/send/route.ts`

- [ ] **Step 1: Create the notification send endpoint**

This uses Firebase Admin SDK (already in package.json as `firebase-admin@13.4.0`).

```typescript
// dashboard-next/src/app/api/notifications/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_ADMIN_SDK_JSON || "{}"
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { title, body, topic, imageUrl, data } = await req.json();

    if (!title || !body) {
      return NextResponse.json(
        { success: false, message: "Title and body are required" },
        { status: 400 }
      );
    }

    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
        ...(imageUrl && { imageUrl }),
      },
      ...(data && { data }),
      topic: topic || "all",
    };

    const response = await admin.messaging().send(message);

    return NextResponse.json({
      success: true,
      data: { messageId: response },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add dashboard-next/src/app/api/notifications/
git commit -m "feat: add push notification send API using Firebase Cloud Messaging"
```

---

## Task 8: Admin Dashboard — Daily Vichar Management Page

**Files:**
- Create: `dashboard-next/src/app/dashboard/daily-vichar/page.tsx`
- Create: `dashboard-next/src/components/dailyvichar/VicharForm.tsx`
- Create: `dashboard-next/src/components/dailyvichar/VicharCalendar.tsx`

- [ ] **Step 1: Create the VicharForm component**

```tsx
// dashboard-next/src/components/dailyvichar/VicharForm.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import axios from "axios";

interface VicharFormData {
  date: string;
  titleHindi: string;
  titleEnglish: string;
  contentHindi: string;
  contentEnglish: string;
  source: string;
  category: string;
  isPublished: boolean;
}

interface VicharFormProps {
  initialData?: VicharFormData & { _id: string };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function VicharForm({
  initialData,
  onSuccess,
  onCancel,
}: VicharFormProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VicharFormData>({
    defaultValues: initialData || {
      category: "vedanta",
      isPublished: false,
    },
  });

  const onSubmit = async (data: VicharFormData) => {
    setLoading(true);
    try {
      if (initialData?._id) {
        await axios.put("/api/daily-vichar", {
          id: initialData._id,
          ...data,
        });
        toast.success("Vichar updated successfully");
      } else {
        await axios.post("/api/daily-vichar", data);
        toast.success("Vichar created successfully");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save vichar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            {...register("date", { required: "Date is required" })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            {...register("category")}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="vedanta">Vedanta</option>
            <option value="yoga">Yoga</option>
            <option value="dharma">Dharma</option>
            <option value="life">Life</option>
            <option value="prayer">Prayer</option>
            <option value="festival">Festival</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Title (Hindi)
          </label>
          <input
            {...register("titleHindi", {
              required: "Hindi title is required",
            })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
            placeholder="आज का विचार"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Title (English)
          </label>
          <input
            {...register("titleEnglish", {
              required: "English title is required",
            })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
            placeholder="Thought of the Day"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Content (Hindi)
          </label>
          <textarea
            {...register("contentHindi", {
              required: "Hindi content is required",
            })}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
            placeholder="हिंदी में विचार लिखें..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Content (English)
          </label>
          <textarea
            {...register("contentEnglish", {
              required: "English content is required",
            })}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
            placeholder="Write thought in English..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Source</label>
        <input
          {...register("source")}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
          placeholder="e.g., Bhagavad Gita 2.47, Swami Ji Pravachan"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register("isPublished")}
          className="rounded"
        />
        <label className="text-sm">Publish immediately</label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50"
        >
          {loading ? "Saving..." : initialData ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Create the VicharCalendar component**

```tsx
// dashboard-next/src/components/dailyvichar/VicharCalendar.tsx
"use client";

import React from "react";

interface Vichar {
  _id: string;
  date: string;
  titleEnglish: string;
  titleHindi: string;
  isPublished: boolean;
  notificationSent: boolean;
  category: string;
}

interface VicharCalendarProps {
  vichars: Vichar[];
  onEdit: (vichar: Vichar) => void;
  onSendNotification: (vichar: Vichar) => void;
}

const categoryColors: Record<string, string> = {
  vedanta: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  yoga: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  dharma: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  life: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  prayer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  festival: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function VicharCalendar({
  vichars,
  onEdit,
  onSendNotification,
}: VicharCalendarProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Title
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Notification
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {vichars.map((vichar) => (
            <tr key={vichar._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-3 text-sm">
                {new Date(vichar.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-4 py-3">
                <div className="text-sm font-medium">{vichar.titleEnglish}</div>
                <div className="text-xs text-gray-500">{vichar.titleHindi}</div>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${categoryColors[vichar.category] || ""}`}
                >
                  {vichar.category}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    vichar.isPublished
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {vichar.isPublished ? "Published" : "Draft"}
                </span>
              </td>
              <td className="px-4 py-3">
                {vichar.notificationSent ? (
                  <span className="text-green-600 text-sm">Sent ✓</span>
                ) : vichar.isPublished ? (
                  <button
                    onClick={() => onSendNotification(vichar)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Send Now
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onEdit(vichar)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Create the admin page**

```tsx
// dashboard-next/src/app/dashboard/daily-vichar/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import VicharForm from "@/components/dailyvichar/VicharForm";
import VicharCalendar from "@/components/dailyvichar/VicharCalendar";

export default function DailyVicharPage() {
  const [vichars, setVichars] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVichar, setEditingVichar] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchVichars = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/daily-vichar?limit=60");
      setVichars(res.data.data);
    } catch {
      toast.error("Failed to fetch vichars");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVichars();
  }, [fetchVichars]);

  const handleEdit = (vichar: any) => {
    setEditingVichar(vichar);
    setShowForm(true);
  };

  const handleSendNotification = async (vichar: any) => {
    try {
      await axios.post("/api/notifications/send", {
        title: `🙏 ${vichar.titleHindi}`,
        body: vichar.contentHindi.substring(0, 100) + "...",
        topic: "daily-vichar",
        data: { type: "daily-vichar", vicharId: vichar._id },
      });
      await axios.put("/api/daily-vichar", {
        id: vichar._id,
        notificationSent: true,
      });
      toast.success("Notification sent successfully");
      fetchVichars();
    } catch {
      toast.error("Failed to send notification");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingVichar(null);
    fetchVichars();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Daily Vichar</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage daily spiritual thoughts and quotes
          </p>
        </div>
        <button
          onClick={() => {
            setEditingVichar(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
        >
          + Add Vichar
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-medium mb-4">
            {editingVichar ? "Edit Vichar" : "Create New Vichar"}
          </h2>
          <VicharForm
            initialData={editingVichar}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingVichar(null);
            }}
          />
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <VicharCalendar
            vichars={vichars}
            onEdit={handleEdit}
            onSendNotification={handleSendNotification}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add dashboard-next/src/app/dashboard/daily-vichar/ dashboard-next/src/components/dailyvichar/
git commit -m "feat: add Daily Vichar admin dashboard with form and calendar view"
```

---

## Task 9: Admin Dashboard — Live Stream Management Page

**Files:**
- Create: `dashboard-next/src/app/dashboard/livestream/page.tsx`
- Create: `dashboard-next/src/components/livestream/StreamManager.tsx`

- [ ] **Step 1: Create the StreamManager component**

```tsx
// dashboard-next/src/components/livestream/StreamManager.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import axios from "axios";

interface StreamFormData {
  title: string;
  description: string;
  youtubeVideoId: string;
  streamType: string;
  scheduledStart: string;
  scheduledEnd: string;
}

interface StreamManagerProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export default function StreamManager({
  onSuccess,
  onCancel,
  initialData,
}: StreamManagerProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StreamFormData>({
    defaultValues: initialData || { streamType: "satsang" },
  });

  const onSubmit = async (data: StreamFormData) => {
    setLoading(true);
    try {
      if (initialData?._id) {
        await axios.put("/api/livestream", { id: initialData._id, ...data });
        toast.success("Stream updated");
      } else {
        await axios.post("/api/livestream", data);
        toast.success("Stream created");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save stream");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          {...register("title", { required: "Title is required" })}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
          placeholder="Evening Satsang with Swami Ji"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          YouTube Video/Live ID
        </label>
        <input
          {...register("youtubeVideoId", {
            required: "YouTube ID is required",
          })}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
          placeholder="e.g., dQw4w9WgXcQ"
        />
        <p className="text-xs text-gray-500 mt-1">
          The ID from the YouTube URL (after v= or youtu.be/)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            {...register("streamType")}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="satsang">Satsang</option>
            <option value="pravachan">Pravachan</option>
            <option value="kumbh">Kumbh Mela</option>
            <option value="festival">Festival</option>
            <option value="special">Special Event</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Scheduled Start
          </label>
          <input
            type="datetime-local"
            {...register("scheduledStart", {
              required: "Start time is required",
            })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Scheduled End
          </label>
          <input
            type="datetime-local"
            {...register("scheduledEnd")}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50"
        >
          {loading ? "Saving..." : initialData ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Create the admin livestream page**

```tsx
// dashboard-next/src/app/dashboard/livestream/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import StreamManager from "@/components/livestream/StreamManager";

export default function LiveStreamPage() {
  const [streams, setStreams] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStream, setEditingStream] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"live" | "upcoming" | "past">(
    "upcoming"
  );

  const fetchStreams = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/livestream?status=${activeTab}`);
      setStreams(res.data.data);
    } catch {
      toast.error("Failed to fetch streams");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  const toggleLive = async (stream: any) => {
    try {
      await axios.put("/api/livestream", {
        id: stream._id,
        isLive: !stream.isLive,
        isUpcoming: false,
      });
      toast.success(
        stream.isLive ? "Stream marked as ended" : "Stream marked as LIVE"
      );
      fetchStreams();
    } catch {
      toast.error("Failed to update stream status");
    }
  };

  const tabs = [
    { key: "live" as const, label: "Live Now" },
    { key: "upcoming" as const, label: "Upcoming" },
    { key: "past" as const, label: "Past" },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Live Streams</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage live satsang and pravachan streams
          </p>
        </div>
        <button
          onClick={() => {
            setEditingStream(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
        >
          + Schedule Stream
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white dark:bg-gray-900 rounded-xl border p-6">
          <StreamManager
            initialData={editingStream}
            onSuccess={() => {
              setShowForm(false);
              setEditingStream(null);
              fetchStreams();
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingStream(null);
            }}
          />
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {tab.label}
            {tab.key === "live" && streams.some((s) => s.isLive) && (
              <span className="ml-1.5 w-2 h-2 bg-red-500 rounded-full inline-block animate-pulse" />
            )}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : streams.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No {activeTab} streams
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {streams.map((stream) => (
              <div
                key={stream._id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {stream.isLive && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                      LIVE
                    </span>
                  )}
                  <div>
                    <h3 className="font-medium">{stream.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(stream.scheduledStart).toLocaleString("en-IN")}{" "}
                      · {stream.streamType} · YT: {stream.youtubeVideoId}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleLive(stream)}
                    className={`px-3 py-1.5 text-sm rounded-lg ${
                      stream.isLive
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {stream.isLive ? "End Stream" : "Go Live"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingStream(stream);
                      setShowForm(true);
                    }}
                    className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add dashboard-next/src/app/dashboard/livestream/ dashboard-next/src/components/livestream/
git commit -m "feat: add Live Stream admin dashboard with go-live toggle"
```

---

## Task 10: Website — Live Stream Page & Daily Vichar Section

**Files:**
- Create: `website/app/live/page.tsx`
- Create: `website/components/sections/DailyVichar.tsx`
- Create: `website/components/sections/LiveBanner.tsx`
- Modify: `website/app/page.tsx`
- Modify: `website/components/layout/Navbar.tsx`

- [ ] **Step 1: Create the DailyVichar homepage section**

```tsx
// website/components/sections/DailyVichar.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

interface Vichar {
  titleHindi: string;
  titleEnglish: string;
  contentHindi: string;
  contentEnglish: string;
  source?: string;
  category: string;
  date: string;
}

export default function DailyVichar() {
  const [vichar, setVichar] = useState<Vichar | null>(null);
  const [lang, setLang] = useState<"hindi" | "english">("hindi");

  useEffect(() => {
    const fetchVichar = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await axios.get(`${apiUrl}/api/daily-vichar/today`);
        if (res.data.success) setVichar(res.data.data);
      } catch {
        // Silently fail — section just won't show
      }
    };
    fetchVichar();
  }, []);

  if (!vichar) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-spiritual-cream to-spiritual-parchment relative overflow-hidden">
      {/* Decorative Om symbol */}
      <div className="absolute top-4 right-8 text-6xl text-spiritual-saffron/10 font-noto-serif select-none">
        ॐ
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-spiritual-saffron font-cormorant text-sm uppercase tracking-widest mb-2">
            आज का विचार · Thought of the Day
          </p>

          {/* Language toggle */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setLang("hindi")}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                lang === "hindi"
                  ? "bg-spiritual-saffron text-white"
                  : "bg-white/50 text-gray-600 hover:bg-white"
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLang("english")}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                lang === "english"
                  ? "bg-spiritual-saffron text-white"
                  : "bg-white/50 text-gray-600 hover:bg-white"
              }`}
            >
              English
            </button>
          </div>

          <h2 className="text-2xl md:text-3xl font-playfair text-spiritual-maroon mb-4">
            {lang === "hindi" ? vichar.titleHindi : vichar.titleEnglish}
          </h2>

          <blockquote className="text-lg md:text-xl text-gray-700 leading-relaxed font-cormorant italic max-w-2xl mx-auto">
            &ldquo;
            {lang === "hindi" ? vichar.contentHindi : vichar.contentEnglish}
            &rdquo;
          </blockquote>

          {vichar.source && (
            <p className="mt-4 text-sm text-spiritual-warmGray">
              — {vichar.source}
            </p>
          )}

          <p className="mt-6 text-xs text-gray-400">
            {new Date(vichar.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create the LiveBanner component**

```tsx
// website/components/sections/LiveBanner.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import axios from "axios";

export default function LiveBanner() {
  const [isLive, setIsLive] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");

  useEffect(() => {
    const checkLive = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await axios.get(`${apiUrl}/api/livestream/active`);
        if (res.data.success && res.data.data.isLiveNow) {
          setIsLive(true);
          setStreamTitle(res.data.data.active.title);
        }
      } catch {
        // Silently fail
      }
    };
    checkLive();
    const interval = setInterval(checkLive, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isLive && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden"
        >
          <Link href="/live" className="block">
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE NOW
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline font-medium">
                {streamTitle}
              </span>
              <span className="text-red-200 hover:text-white transition-colors">
                Watch →
              </span>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Create the Live stream watching page**

```tsx
// website/app/live/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface Stream {
  _id: string;
  title: string;
  description?: string;
  youtubeVideoId: string;
  streamType: string;
  scheduledStart: string;
  isLive: boolean;
}

export default function LivePage() {
  const [activeStream, setActiveStream] = useState<Stream | null>(null);
  const [upcomingStreams, setUpcomingStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await axios.get(`${apiUrl}/api/livestream/active`);
        if (res.data.success) {
          setActiveStream(res.data.data.active);
          setUpcomingStreams(res.data.data.upcoming);
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchStreams();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spiritual-cream">
        <div className="text-spiritual-warmGray">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-spiritual-cream pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeStream ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                LIVE
              </span>
              <h1 className="text-2xl font-playfair text-spiritual-maroon">
                {activeStream.title}
              </h1>
            </div>

            {/* YouTube Embed */}
            <div className="aspect-video rounded-xl overflow-hidden shadow-warm-lg bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeStream.youtubeVideoId}?autoplay=1&rel=0`}
                title={activeStream.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {activeStream.description && (
              <p className="mt-4 text-gray-600 max-w-3xl">
                {activeStream.description}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 text-spiritual-saffron/30">ॐ</div>
            <h1 className="text-2xl font-playfair text-spiritual-maroon mb-2">
              No Live Stream Right Now
            </h1>
            <p className="text-gray-500">
              Check back during scheduled satsang times
            </p>
          </div>
        )}

        {/* Upcoming Streams */}
        {upcomingStreams.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-playfair text-spiritual-maroon mb-4">
              Upcoming Streams
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingStreams.map((stream) => (
                <div
                  key={stream._id}
                  className="bg-white rounded-xl p-4 shadow-warm border border-spiritual-sandstone/30"
                >
                  <span className="text-xs px-2 py-0.5 bg-spiritual-saffron/10 text-spiritual-saffron rounded-full">
                    {stream.streamType}
                  </span>
                  <h3 className="mt-2 font-medium text-spiritual-maroon">
                    {stream.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(stream.scheduledStart).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Add LiveBanner and DailyVichar to the website homepage and navbar**

In `website/app/page.tsx`, add imports and render the DailyVichar section after the Hero and LiveBanner above the Navbar.

In `website/components/layout/Navbar.tsx`, add a "Live" nav link.

- [ ] **Step 5: Commit**

```bash
git add website/app/live/ website/components/sections/DailyVichar.tsx website/components/sections/LiveBanner.tsx
git commit -m "feat: add Live streaming page, Daily Vichar section, and Live banner to website"
```

---

## Task 11: Mobile App — Daily Vichar Card & Live Stream Screen

**Files:**
- Create: `mobile/user-app/src/screens/home/DailyVicharCard.tsx`
- Create: `mobile/user-app/src/screens/live/LiveStreamScreen.tsx`
- Modify: `mobile/user-app/src/screens/home/HomeScreen.tsx`
- Modify: `mobile/user-app/src/navigation/AppNavigator.tsx`

- [ ] **Step 1: Create DailyVicharCard component**

```tsx
// mobile/user-app/src/screens/home/DailyVicharCard.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../../theme/colors";
import api from "../../services/api";

interface Vichar {
  titleHindi: string;
  titleEnglish: string;
  contentHindi: string;
  contentEnglish: string;
  source?: string;
  date: string;
}

export default function DailyVicharCard() {
  const [vichar, setVichar] = useState<Vichar | null>(null);
  const [lang, setLang] = useState<"hindi" | "english">("hindi");

  useEffect(() => {
    const fetchVichar = async () => {
      try {
        const res = await api.get("/api/daily-vichar/today");
        if (res.data.success) setVichar(res.data.data);
      } catch {
        // Silently fail
      }
    };
    fetchVichar();
  }, []);

  if (!vichar) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>आज का विचार</Text>
        <View style={styles.langToggle}>
          <TouchableOpacity
            onPress={() => setLang("hindi")}
            style={[styles.langBtn, lang === "hindi" && styles.langBtnActive]}
          >
            <Text
              style={[
                styles.langText,
                lang === "hindi" && styles.langTextActive,
              ]}
            >
              हिं
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLang("english")}
            style={[styles.langBtn, lang === "english" && styles.langBtnActive]}
          >
            <Text
              style={[
                styles.langText,
                lang === "english" && styles.langTextActive,
              ]}
            >
              En
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>
        {lang === "hindi" ? vichar.titleHindi : vichar.titleEnglish}
      </Text>
      <Text style={styles.content}>
        &ldquo;{lang === "hindi" ? vichar.contentHindi : vichar.contentEnglish}
        &rdquo;
      </Text>
      {vichar.source && <Text style={styles.source}>— {vichar.source}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFDF5",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#F5E6CC",
    shadowColor: "#D4A017",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: colors.primary.saffron,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  langToggle: { flexDirection: "row", gap: 4 },
  langBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#F5E6CC",
  },
  langBtnActive: { backgroundColor: colors.primary.saffron },
  langText: { fontSize: 11, color: "#666" },
  langTextActive: { color: "#FFF" },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#800020",
    marginBottom: 8,
  },
  content: {
    fontSize: 15,
    color: "#444",
    lineHeight: 24,
    fontStyle: "italic",
  },
  source: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    textAlign: "right",
  },
});
```

- [ ] **Step 2: Create LiveStreamScreen**

```tsx
// mobile/user-app/src/screens/live/LiveStreamScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import { colors } from "../../theme/colors";
import api from "../../services/api";

const { width } = Dimensions.get("window");

interface Stream {
  _id: string;
  title: string;
  description?: string;
  youtubeVideoId: string;
  streamType: string;
  scheduledStart: string;
  isLive: boolean;
}

export default function LiveStreamScreen() {
  const [activeStream, setActiveStream] = useState<Stream | null>(null);
  const [upcomingStreams, setUpcomingStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const res = await api.get("/api/livestream/active");
        if (res.data.success) {
          setActiveStream(res.data.data.active);
          setUpcomingStreams(res.data.data.upcoming);
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchStreams();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {activeStream ? (
        <View>
          <View style={styles.liveHeader}>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
            <Text style={styles.streamTitle}>{activeStream.title}</Text>
          </View>

          <View style={styles.videoContainer}>
            <WebView
              source={{
                uri: `https://www.youtube.com/embed/${activeStream.youtubeVideoId}?autoplay=1&playsinline=1`,
              }}
              style={styles.video}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
            />
          </View>

          {activeStream.description && (
            <Text style={styles.description}>{activeStream.description}</Text>
          )}
        </View>
      ) : (
        <View style={styles.noStream}>
          <Text style={styles.omSymbol}>ॐ</Text>
          <Text style={styles.noStreamTitle}>No Live Stream Right Now</Text>
          <Text style={styles.noStreamSub}>
            Check back during scheduled satsang times
          </Text>
        </View>
      )}

      {upcomingStreams.length > 0 && (
        <View style={styles.upcomingSection}>
          <Text style={styles.sectionTitle}>Upcoming Streams</Text>
          {upcomingStreams.map((stream) => (
            <View key={stream._id} style={styles.upcomingCard}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{stream.streamType}</Text>
              </View>
              <Text style={styles.upcomingTitle}>{stream.title}</Text>
              <Text style={styles.upcomingDate}>
                {new Date(stream.scheduledStart).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFDF5" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#999" },
  liveHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  liveBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveBadgeText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  streamTitle: { fontSize: 18, fontWeight: "700", color: "#800020", flex: 1 },
  videoContainer: {
    width: width,
    height: (width * 9) / 16,
    backgroundColor: "#000",
  },
  video: { flex: 1 },
  description: {
    paddingHorizontal: 16,
    paddingTop: 12,
    color: "#666",
    fontSize: 14,
    lineHeight: 22,
  },
  noStream: { paddingVertical: 80, alignItems: "center" },
  omSymbol: { fontSize: 60, color: "rgba(255,107,0,0.2)" },
  noStreamTitle: { fontSize: 20, fontWeight: "700", color: "#800020", marginTop: 8 },
  noStreamSub: { fontSize: 14, color: "#999", marginTop: 4 },
  upcomingSection: { padding: 16, marginTop: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#800020",
    marginBottom: 12,
  },
  upcomingCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F5E6CC",
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,107,0,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeBadgeText: { fontSize: 11, color: colors.primary.saffron },
  upcomingTitle: { fontSize: 15, fontWeight: "600", color: "#800020", marginTop: 6 },
  upcomingDate: { fontSize: 12, color: "#999", marginTop: 4 },
});
```

- [ ] **Step 3: Add DailyVicharCard to HomeScreen and LiveStreamScreen to navigation**

In `mobile/user-app/src/screens/home/HomeScreen.tsx`, import and render `<DailyVicharCard />` after the hero banner section.

In `mobile/user-app/src/navigation/AppNavigator.tsx`, add:
```tsx
import LiveStreamScreen from "../screens/live/LiveStreamScreen";
// In the Stack.Navigator:
<Stack.Screen name="LiveStream" component={LiveStreamScreen} options={{ title: "Live Satsang" }} />
```

- [ ] **Step 4: Install react-native-webview dependency**

Run: `cd /Users/apple/Downloads/agm-india-dashboard-website-master/mobile/user-app && npx expo install react-native-webview`

- [ ] **Step 5: Commit**

```bash
git add mobile/user-app/src/screens/home/DailyVicharCard.tsx mobile/user-app/src/screens/live/
git commit -m "feat: add Daily Vichar card and Live Stream screen to mobile app"
```

---

## Task 12: Admin Dashboard — TV Schedule Management

**Files:**
- Create: `dashboard-next/src/app/dashboard/tv-schedule/page.tsx`

- [ ] **Step 1: Create the TV schedule admin page**

```tsx
// dashboard-next/src/app/dashboard/tv-schedule/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface TVScheduleFormData {
  channel: string;
  channelName: string;
  programName: string;
  description: string;
  dayOfWeek: number[];
  timeSlot: string;
  duration: number;
  isRecurring: boolean;
}

export default function TVSchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const { register, handleSubmit, reset } = useForm<TVScheduleFormData>();

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/tv-schedule");
      setSchedules(res.data.data);
    } catch {
      toast.error("Failed to fetch schedules");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const onSubmit = async (data: TVScheduleFormData) => {
    try {
      await axios.post("/api/tv-schedule", {
        ...data,
        dayOfWeek: selectedDays,
      });
      toast.success("TV schedule added");
      reset();
      setSelectedDays([]);
      setShowForm(false);
      fetchSchedules();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save");
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">TV Broadcast Schedule</h1>
          <p className="text-gray-500 text-sm mt-1">
            Sanskar TV & Aastha TV broadcast timings
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg"
        >
          + Add Schedule
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white dark:bg-gray-900 rounded-xl border p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Channel
                </label>
                <select
                  {...register("channel", { required: true })}
                  className="w-full rounded-lg border px-4 py-2.5 dark:bg-gray-800"
                >
                  <option value="sanskar">Sanskar TV</option>
                  <option value="aastha">Aastha TV</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Channel Name
                </label>
                <input
                  {...register("channelName", { required: true })}
                  className="w-full rounded-lg border px-4 py-2.5 dark:bg-gray-800"
                  placeholder="Sanskar TV"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Program Name
                </label>
                <input
                  {...register("programName", { required: true })}
                  className="w-full rounded-lg border px-4 py-2.5 dark:bg-gray-800"
                  placeholder="Swami Ji Pravachan"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Days</label>
              <div className="flex gap-2 flex-wrap">
                {DAY_NAMES.map((day, i) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      selectedDays.includes(i)
                        ? "bg-brand-500 text-white"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800"
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Time Slot
                </label>
                <input
                  {...register("timeSlot", { required: true })}
                  className="w-full rounded-lg border px-4 py-2.5 dark:bg-gray-800"
                  placeholder="7:00 AM - 8:00 AM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  {...register("duration", { required: true, valueAsNumber: true })}
                  className="w-full rounded-lg border px-4 py-2.5 dark:bg-gray-800"
                  placeholder="60"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-500 text-white rounded-lg"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 border rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {schedules.map((schedule: any) => (
              <div key={schedule._id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        schedule.channel === "sanskar"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {schedule.channelName}
                    </span>
                    <span className="font-medium">{schedule.programName}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {schedule.dayOfWeek.map((d: number) => DAY_NAMES[d].substring(0, 3)).join(", ")}{" "}
                    · {schedule.timeSlot} · {schedule.duration} min
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await axios.delete(`/api/tv-schedule?id=${schedule._id}`);
                    toast.success("Deleted");
                    fetchSchedules();
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add dashboard-next/src/app/dashboard/tv-schedule/
git commit -m "feat: add TV Schedule admin page for Sanskar/Aastha broadcast management"
```

---

## Task 13: Website — TV Schedule Section

**Files:**
- Create: `website/components/sections/TVSchedule.tsx`

- [ ] **Step 1: Create the TV schedule component for the website**

```tsx
// website/components/sections/TVSchedule.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Schedule {
  _id: string;
  channelName: string;
  channel: string;
  programName: string;
  dayOfWeek: number[];
  timeSlot: string;
  duration: number;
}

export default function TVSchedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await axios.get(`${apiUrl}/api/tv-schedule`);
        if (res.data.success) setSchedules(res.data.data);
      } catch {
        // Silently fail
      }
    };
    fetchSchedules();
  }, []);

  if (schedules.length === 0) return null;

  const channelIcon: Record<string, string> = {
    sanskar: "📺",
    aastha: "📡",
    other: "🖥️",
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-playfair text-spiritual-maroon text-center mb-2">
            Watch on Television
          </h2>
          <p className="text-center text-gray-500 text-sm mb-8">
            Swami Ji&apos;s pravachans on national TV channels
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {schedules.map((schedule) => (
              <div
                key={schedule._id}
                className="bg-spiritual-cream rounded-xl p-5 border border-spiritual-sandstone/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">
                    {channelIcon[schedule.channel] || "📺"}
                  </span>
                  <span className="font-medium text-spiritual-maroon">
                    {schedule.channelName}
                  </span>
                </div>
                <h3 className="text-lg font-playfair text-gray-800">
                  {schedule.programName}
                </h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {schedule.dayOfWeek.map((d) => (
                    <span
                      key={d}
                      className="text-xs px-2 py-0.5 bg-spiritual-saffron/10 text-spiritual-saffron rounded-full"
                    >
                      {DAY_NAMES[d]}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {schedule.timeSlot} ({schedule.duration} min)
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add TVSchedule to the website homepage**

In `website/app/page.tsx`, import and render `<TVSchedule />` in an appropriate position (after Events or before Contact section).

- [ ] **Step 3: Commit**

```bash
git add website/components/sections/TVSchedule.tsx
git commit -m "feat: add TV Schedule section to website homepage"
```

---

## Self-Review Checklist

1. **Spec coverage:** All 3 features (Live Streaming, Daily Vichar, TV Schedule) have complete backend models, API routes, admin dashboard pages, public website components, and mobile app screens.
2. **Placeholder scan:** No TBDs, TODOs, or "implement later" references. All code blocks are complete.
3. **Type consistency:** `DailyVichar`, `LiveStream`, `TVSchedule` types are consistent across all files. API response shapes (`{ success, data }`) match the existing codebase pattern.
4. **Pattern consistency:** All models follow existing soft-delete pattern (`isDeleted`), all API routes follow existing error response pattern, all admin pages follow existing dashboard layout pattern with shadcn-style components.
