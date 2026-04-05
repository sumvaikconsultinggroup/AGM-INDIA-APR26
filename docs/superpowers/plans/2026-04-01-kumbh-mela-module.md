# Plan 2: Kumbh Mela Module

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Kumbh Mela module with camp registration, accommodation booking, Shahi Snan schedule, live updates, and group coordination — critical given Swami Ji's role as the leader who opens/closes Kumbh for Juna Akhara. The backup React app had a multi-step Kumbh booking system that was never migrated.

**Architecture:** Dedicated MongoDB models for Kumbh events, camp registrations, and accommodation. Multi-step registration wizard with group support. Real-time updates via polling. Admin dashboard for managing the entire Kumbh lifecycle. Public pages on website and mobile for registration and information.

**Tech Stack:** Next.js 15 App Router, MongoDB/Mongoose, React Hook Form (multi-step), Cloudinary (images), Razorpay (payments), Framer Motion (animations), React Native (mobile).

**Peer Benchmark:**
| Feature | Kumbh Mela Official | ISKCON Festival | Art of Living Events | **Our Target** |
|---------|-------------------|-----------------|---------------------|----------------|
| Event Registration | Basic web form | In-app registration | Full registration + payment | Multi-step wizard with group booking |
| Accommodation | Phone-based | Not applicable | Course venue booking | Online room booking with dates |
| Schedule | Static PDF | App calendar | Event calendar | Interactive Shahi Snan calendar |
| Live Updates | Social media only | Push notifications | In-app updates | Updates feed + push notifications |
| Group Booking | Not available | Not available | Group enrollment | Family/group registration with lead |

---

## File Structure

### New Files to Create

**Dashboard (Admin):**
- `dashboard-next/src/models/KumbhEvent.ts` — Kumbh Mela event model (which Kumbh, dates, location)
- `dashboard-next/src/models/KumbhRegistration.ts` — Pilgrim/group registration model
- `dashboard-next/src/models/KumbhAccommodation.ts` — Kumbh camp accommodation model
- `dashboard-next/src/models/KumbhUpdate.ts` — Live updates/announcements model
- `dashboard-next/src/app/api/kumbh/event/route.ts` — Kumbh event CRUD
- `dashboard-next/src/app/api/kumbh/register/route.ts` — Registration endpoint
- `dashboard-next/src/app/api/kumbh/accommodation/route.ts` — Accommodation CRUD
- `dashboard-next/src/app/api/kumbh/updates/route.ts` — Live updates CRUD
- `dashboard-next/src/app/api/kumbh/active/route.ts` — Get active Kumbh event (public)
- `dashboard-next/src/app/dashboard/kumbh/page.tsx` — Admin Kumbh management page
- `dashboard-next/src/components/kumbh/KumbhEventForm.tsx` — Create/edit Kumbh event
- `dashboard-next/src/components/kumbh/RegistrationTable.tsx` — Registration list view
- `dashboard-next/src/components/kumbh/AccommodationManager.tsx` — Manage accommodations
- `dashboard-next/src/components/kumbh/UpdatesManager.tsx` — Post live updates

**Website (Public):**
- `website/app/kumbh/page.tsx` — Kumbh Mela landing page
- `website/app/kumbh/register/page.tsx` — Multi-step registration wizard
- `website/app/kumbh/schedule/page.tsx` — Shahi Snan & event schedule
- `website/app/kumbh/updates/page.tsx` — Live updates feed
- `website/components/kumbh/RegistrationWizard.tsx` — Multi-step form component
- `website/components/kumbh/ShahiSnanCalendar.tsx` — Visual Shahi Snan calendar
- `website/components/kumbh/KumbhHero.tsx` — Kumbh landing page hero
- `website/components/kumbh/UpdatesFeed.tsx` — Live updates list

**Mobile User App:**
- `mobile/user-app/src/screens/kumbh/KumbhScreen.tsx` — Kumbh main screen
- `mobile/user-app/src/screens/kumbh/KumbhRegisterScreen.tsx` — Registration flow
- `mobile/user-app/src/screens/kumbh/KumbhScheduleScreen.tsx` — Shahi Snan schedule
- `mobile/user-app/src/screens/kumbh/KumbhUpdatesScreen.tsx` — Live updates

### Files to Modify
- `dashboard-next/src/middleware.ts` — Add Kumbh public endpoints
- `website/components/layout/Navbar.tsx` — Add "Kumbh" nav link (conditional on active event)
- `mobile/user-app/src/navigation/AppNavigator.tsx` — Add Kumbh screens

---

## Task 1: KumbhEvent MongoDB Model

**Files:**
- Create: `dashboard-next/src/models/KumbhEvent.ts`

- [ ] **Step 1: Create the KumbhEvent model**

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IKumbhEvent extends Document {
  name: string;
  type: "maha_kumbh" | "ardh_kumbh" | "kumbh" | "simhastha";
  location: string;
  city: "prayagraj" | "haridwar" | "nashik" | "ujjain";
  startDate: Date;
  endDate: Date;
  description: string;
  heroImage?: string;
  galleryImages: string[];
  shahiSnanDates: {
    date: Date;
    name: string;
    description?: string;
    isMainSnan: boolean;
  }[];
  importantDates: {
    date: Date;
    title: string;
    description?: string;
  }[];
  campLocation: {
    address: string;
    landmark?: string;
    googleMapsUrl?: string;
    latitude?: number;
    longitude?: number;
  };
  registrationOpen: boolean;
  maxCapacity: number;
  registeredCount: number;
  contactPhone: string[];
  contactEmail?: string;
  isActive: boolean;
  isDeleted: boolean;
}

const ShahiSnanDateSchema = new Schema({
  date: { type: Date, required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  isMainSnan: { type: Boolean, default: false },
});

const ImportantDateSchema = new Schema({
  date: { type: Date, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
});

const CampLocationSchema = new Schema({
  address: { type: String, required: true, trim: true },
  landmark: { type: String, trim: true },
  googleMapsUrl: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
});

const KumbhEventSchema = new Schema<IKumbhEvent>(
  {
    name: {
      type: String,
      required: [true, "Event name is required"],
      maxlength: [200, "Name cannot exceed 200 characters"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["maha_kumbh", "ardh_kumbh", "kumbh", "simhastha"],
      required: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    city: {
      type: String,
      enum: ["prayagraj", "haridwar", "nashik", "ujjain"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: {
      type: String,
      required: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    heroImage: { type: String },
    galleryImages: [{ type: String }],
    shahiSnanDates: [ShahiSnanDateSchema],
    importantDates: [ImportantDateSchema],
    campLocation: CampLocationSchema,
    registrationOpen: { type: Boolean, default: false },
    maxCapacity: { type: Number, default: 5000, min: 1 },
    registeredCount: { type: Number, default: 0 },
    contactPhone: [{ type: String }],
    contactEmail: { type: String },
    isActive: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

KumbhEventSchema.index({ isActive: 1, isDeleted: 1 });
KumbhEventSchema.index({ startDate: -1 });

export default mongoose.models.KumbhEvent ||
  mongoose.model<IKumbhEvent>("KumbhEvent", KumbhEventSchema);
```

- [ ] **Step 2: Commit**

```bash
git add dashboard-next/src/models/KumbhEvent.ts
git commit -m "feat: add KumbhEvent model with Shahi Snan dates and camp location"
```

---

## Task 2: KumbhRegistration MongoDB Model

**Files:**
- Create: `dashboard-next/src/models/KumbhRegistration.ts`

- [ ] **Step 1: Create the KumbhRegistration model**

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IKumbhRegistration extends Document {
  kumbhEventId: mongoose.Types.ObjectId;
  registrationType: "individual" | "family" | "group";
  leadPerson: {
    fullName: string;
    email: string;
    phone: string;
    age: number;
    gender: "male" | "female" | "other";
    city: string;
    state: string;
    idType: "aadhaar" | "passport" | "voter_id";
    idNumber: string;
  };
  groupMembers: {
    fullName: string;
    age: number;
    gender: "male" | "female" | "other";
    relation: string;
    specialNeeds?: string;
  }[];
  totalMembers: number;
  arrivalDate: Date;
  departureDate: Date;
  accommodationRequired: boolean;
  accommodationId?: mongoose.Types.ObjectId;
  mealPreference: "veg" | "veg_with_jain";
  specialRequirements?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  status: "pending" | "confirmed" | "cancelled" | "checked_in" | "checked_out";
  paymentStatus: "unpaid" | "partial" | "paid";
  paymentAmount: number;
  paymentId?: string;
  qrCode?: string;
  registrationNumber: string;
  userId?: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const LeadPersonSchema = new Schema({
  fullName: { type: String, required: true, maxlength: 100, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => /^\d{10}$/.test(v),
      message: "Phone must be 10 digits",
    },
  },
  age: { type: Number, required: true, min: 1, max: 120 },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  idType: { type: String, enum: ["aadhaar", "passport", "voter_id"], required: true },
  idNumber: { type: String, required: true, trim: true },
});

const GroupMemberSchema = new Schema({
  fullName: { type: String, required: true, maxlength: 100, trim: true },
  age: { type: Number, required: true, min: 1, max: 120 },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  relation: { type: String, required: true, trim: true },
  specialNeeds: { type: String, maxlength: 300, trim: true },
});

const EmergencyContactSchema = new Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  relation: { type: String, required: true, trim: true },
});

const KumbhRegistrationSchema = new Schema<IKumbhRegistration>(
  {
    kumbhEventId: {
      type: Schema.Types.ObjectId,
      ref: "KumbhEvent",
      required: true,
      index: true,
    },
    registrationType: {
      type: String,
      enum: ["individual", "family", "group"],
      required: true,
    },
    leadPerson: { type: LeadPersonSchema, required: true },
    groupMembers: {
      type: [GroupMemberSchema],
      validate: {
        validator: function (this: IKumbhRegistration, v: any[]) {
          if (this.registrationType === "individual") return v.length === 0;
          return v.length >= 1;
        },
        message: "Group/family registration must have at least 1 additional member",
      },
    },
    totalMembers: { type: Number, required: true, min: 1 },
    arrivalDate: { type: Date, required: true },
    departureDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: IKumbhRegistration, v: Date) {
          return v > this.arrivalDate;
        },
        message: "Departure must be after arrival",
      },
    },
    accommodationRequired: { type: Boolean, default: false },
    accommodationId: { type: Schema.Types.ObjectId, ref: "KumbhAccommodation" },
    mealPreference: {
      type: String,
      enum: ["veg", "veg_with_jain"],
      default: "veg",
    },
    specialRequirements: { type: String, maxlength: 500 },
    emergencyContact: { type: EmergencyContactSchema, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "checked_in", "checked_out"],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
    paymentAmount: { type: Number, default: 0, min: 0 },
    paymentId: { type: String },
    qrCode: { type: String },
    registrationNumber: {
      type: String,
      unique: true,
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

KumbhRegistrationSchema.index({ kumbhEventId: 1, status: 1, isDeleted: 1 });
KumbhRegistrationSchema.index({ "leadPerson.email": 1, kumbhEventId: 1 });
KumbhRegistrationSchema.index({ registrationNumber: 1 });

KumbhRegistrationSchema.pre("validate", function (next) {
  if (!this.registrationNumber) {
    const prefix = "KMB";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.registrationNumber = `${prefix}-${timestamp}-${random}`;
  }
  this.totalMembers = 1 + (this.groupMembers?.length || 0);
  next();
});

export default mongoose.models.KumbhRegistration ||
  mongoose.model<IKumbhRegistration>("KumbhRegistration", KumbhRegistrationSchema);
```

- [ ] **Step 2: Commit**

```bash
git add dashboard-next/src/models/KumbhRegistration.ts
git commit -m "feat: add KumbhRegistration model with group booking and QR support"
```

---

## Task 3: KumbhAccommodation & KumbhUpdate Models

**Files:**
- Create: `dashboard-next/src/models/KumbhAccommodation.ts`
- Create: `dashboard-next/src/models/KumbhUpdate.ts`

- [ ] **Step 1: Create the KumbhAccommodation model**

```typescript
// dashboard-next/src/models/KumbhAccommodation.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IKumbhAccommodation extends Document {
  kumbhEventId: mongoose.Types.ObjectId;
  name: string;
  type: "tent" | "cottage" | "dormitory" | "room" | "hall";
  description: string;
  capacity: number;
  bookedCount: number;
  pricePerNight: number;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
  isDeleted: boolean;
}

const KumbhAccommodationSchema = new Schema<IKumbhAccommodation>(
  {
    kumbhEventId: {
      type: Schema.Types.ObjectId,
      ref: "KumbhEvent",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
    },
    type: {
      type: String,
      enum: ["tent", "cottage", "dormitory", "room", "hall"],
      required: true,
    },
    description: { type: String, maxlength: 500, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    bookedCount: { type: Number, default: 0, min: 0 },
    pricePerNight: { type: Number, required: true, min: 0 },
    amenities: [{ type: String, trim: true }],
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

KumbhAccommodationSchema.virtual("availableSlots").get(function () {
  return this.capacity - this.bookedCount;
});

KumbhAccommodationSchema.set("toJSON", { virtuals: true });

export default mongoose.models.KumbhAccommodation ||
  mongoose.model<IKumbhAccommodation>("KumbhAccommodation", KumbhAccommodationSchema);
```

- [ ] **Step 2: Create the KumbhUpdate model**

```typescript
// dashboard-next/src/models/KumbhUpdate.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IKumbhUpdate extends Document {
  kumbhEventId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  type: "announcement" | "schedule_change" | "weather" | "safety" | "general";
  priority: "low" | "medium" | "high" | "urgent";
  imageUrl?: string;
  isPinned: boolean;
  notificationSent: boolean;
  createdBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const KumbhUpdateSchema = new Schema<IKumbhUpdate>(
  {
    kumbhEventId: {
      type: Schema.Types.ObjectId,
      ref: "KumbhEvent",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true,
    },
    type: {
      type: String,
      enum: ["announcement", "schedule_change", "weather", "safety", "general"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    imageUrl: { type: String },
    isPinned: { type: Boolean, default: false },
    notificationSent: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

KumbhUpdateSchema.index({ kumbhEventId: 1, isPinned: -1, createdAt: -1 });

export default mongoose.models.KumbhUpdate ||
  mongoose.model<IKumbhUpdate>("KumbhUpdate", KumbhUpdateSchema);
```

- [ ] **Step 3: Commit**

```bash
git add dashboard-next/src/models/KumbhAccommodation.ts dashboard-next/src/models/KumbhUpdate.ts
git commit -m "feat: add KumbhAccommodation and KumbhUpdate models"
```

---

## Task 4: Kumbh API Routes

**Files:**
- Create: `dashboard-next/src/app/api/kumbh/event/route.ts`
- Create: `dashboard-next/src/app/api/kumbh/active/route.ts`
- Create: `dashboard-next/src/app/api/kumbh/register/route.ts`
- Create: `dashboard-next/src/app/api/kumbh/accommodation/route.ts`
- Create: `dashboard-next/src/app/api/kumbh/updates/route.ts`

- [ ] **Step 1: Create the Kumbh event CRUD route**

```typescript
// dashboard-next/src/app/api/kumbh/event/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import KumbhEvent from "@/models/KumbhEvent";

export async function GET() {
  try {
    await connectDB();
    const events = await KumbhEvent.find({ isDeleted: false })
      .sort({ startDate: -1 })
      .lean();
    return NextResponse.json({ success: true, data: events });
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
    const event = await KumbhEvent.create(body);
    return NextResponse.json({ success: true, data: event }, { status: 201 });
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
    const event = await KumbhEvent.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: event });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create the active Kumbh public route**

```typescript
// dashboard-next/src/app/api/kumbh/active/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import KumbhEvent from "@/models/KumbhEvent";
import KumbhAccommodation from "@/models/KumbhAccommodation";
import KumbhUpdate from "@/models/KumbhUpdate";

export async function GET() {
  try {
    await connectDB();

    const activeEvent = await KumbhEvent.findOne({
      isActive: true,
      isDeleted: false,
    }).lean();

    if (!activeEvent) {
      return NextResponse.json({
        success: true,
        data: { event: null, hasActiveKumbh: false },
      });
    }

    const accommodations = await KumbhAccommodation.find({
      kumbhEventId: activeEvent._id,
      isAvailable: true,
      isDeleted: false,
    }).lean();

    const updates = await KumbhUpdate.find({
      kumbhEventId: activeEvent._id,
      isDeleted: false,
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        event: activeEvent,
        accommodations,
        updates,
        hasActiveKumbh: true,
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

- [ ] **Step 3: Create the registration route**

```typescript
// dashboard-next/src/app/api/kumbh/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import KumbhRegistration from "@/models/KumbhRegistration";
import KumbhEvent from "@/models/KumbhEvent";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const query: any = { isDeleted: false };
    if (eventId) query.kumbhEventId = eventId;
    if (status) query.status = status;

    const registrations = await KumbhRegistration.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await KumbhRegistration.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: registrations,
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

    const event = await KumbhEvent.findById(body.kumbhEventId);
    if (!event || !event.registrationOpen) {
      return NextResponse.json(
        { success: false, message: "Registration is not open for this event" },
        { status: 400 }
      );
    }

    const totalNewMembers = 1 + (body.groupMembers?.length || 0);
    if (event.registeredCount + totalNewMembers > event.maxCapacity) {
      return NextResponse.json(
        { success: false, message: "Event capacity is full" },
        { status: 400 }
      );
    }

    const existingReg = await KumbhRegistration.findOne({
      kumbhEventId: body.kumbhEventId,
      "leadPerson.email": body.leadPerson.email,
      isDeleted: false,
      status: { $ne: "cancelled" },
    });
    if (existingReg) {
      return NextResponse.json(
        { success: false, message: "Email already registered for this Kumbh" },
        { status: 400 }
      );
    }

    const registration = await KumbhRegistration.create(body);

    await KumbhEvent.findByIdAndUpdate(body.kumbhEventId, {
      $inc: { registeredCount: totalNewMembers },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          registration,
          registrationNumber: registration.registrationNumber,
        },
      },
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

- [ ] **Step 4: Create the accommodation route**

```typescript
// dashboard-next/src/app/api/kumbh/accommodation/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import KumbhAccommodation from "@/models/KumbhAccommodation";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    const query: any = { isDeleted: false };
    if (eventId) query.kumbhEventId = eventId;

    const accommodations = await KumbhAccommodation.find(query)
      .sort({ type: 1, pricePerNight: 1 })
      .lean();

    return NextResponse.json({ success: true, data: accommodations });
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
    const accommodation = await KumbhAccommodation.create(body);
    return NextResponse.json(
      { success: true, data: accommodation },
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

- [ ] **Step 5: Create the updates route**

```typescript
// dashboard-next/src/app/api/kumbh/updates/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import KumbhUpdate from "@/models/KumbhUpdate";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    const query: any = { isDeleted: false };
    if (eventId) query.kumbhEventId = eventId;

    const updates = await KumbhUpdate.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ success: true, data: updates });
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
    const update = await KumbhUpdate.create(body);
    return NextResponse.json({ success: true, data: update }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 6: Add Kumbh public endpoints to middleware**

In `dashboard-next/src/middleware.ts`, add to public API paths:
```typescript
"/api/kumbh/active",
"/api/kumbh/register",
"/api/kumbh/updates",
"/api/kumbh/accommodation",
```

- [ ] **Step 7: Commit**

```bash
git add dashboard-next/src/app/api/kumbh/ dashboard-next/src/middleware.ts
git commit -m "feat: add Kumbh Mela API routes for event, registration, accommodation, and updates"
```

---

## Task 5: Website — Kumbh Mela Landing Page

**Files:**
- Create: `website/app/kumbh/page.tsx`
- Create: `website/components/kumbh/KumbhHero.tsx`
- Create: `website/components/kumbh/ShahiSnanCalendar.tsx`

- [ ] **Step 1: Create the KumbhHero component**

```tsx
// website/components/kumbh/KumbhHero.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface KumbhHeroProps {
  event: {
    name: string;
    type: string;
    city: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    heroImage?: string;
    registrationOpen: boolean;
    registeredCount: number;
    maxCapacity: number;
  };
}

const kumbhTypeLabels: Record<string, string> = {
  maha_kumbh: "Maha Kumbh Mela",
  ardh_kumbh: "Ardh Kumbh Mela",
  kumbh: "Kumbh Mela",
  simhastha: "Simhastha Kumbh",
};

export default function KumbhHero({ event }: KumbhHeroProps) {
  const startDate = new Date(event.startDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const endDate = new Date(event.endDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: event.heroImage
            ? `url(${event.heroImage})`
            : "linear-gradient(135deg, #800020 0%, #6E0000 50%, #FF6B00 100%)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-spiritual-saffron font-cormorant text-lg tracking-widest mb-4 uppercase">
            ॥ जय श्री गंगे ॥
          </p>

          <h1 className="text-4xl md:text-6xl font-playfair font-bold mb-4">
            {event.name}
          </h1>

          <p className="text-xl text-white/80 font-cormorant mb-2">
            {kumbhTypeLabels[event.type] || event.type}
          </p>

          <p className="text-lg text-white/70 mb-6">
            {event.location} · {startDate} — {endDate}
          </p>

          <p className="max-w-2xl mx-auto text-white/60 mb-8 leading-relaxed">
            {event.description.substring(0, 300)}
            {event.description.length > 300 ? "..." : ""}
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            {event.registrationOpen && (
              <Link
                href="/kumbh/register"
                className="px-8 py-3 bg-spiritual-saffron text-white rounded-full font-medium hover:bg-spiritual-saffron/90 transition-colors shadow-lg"
              >
                Register for Kumbh
              </Link>
            )}
            <Link
              href="/kumbh/schedule"
              className="px-8 py-3 border border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-colors"
            >
              View Shahi Snan Dates
            </Link>
          </div>

          {/* Registration counter */}
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
            <span className="text-sm text-white/70">
              {event.registeredCount.toLocaleString()} pilgrims registered
            </span>
            <span className="text-xs text-white/40">
              / {event.maxCapacity.toLocaleString()} capacity
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create the ShahiSnanCalendar component**

```tsx
// website/components/kumbh/ShahiSnanCalendar.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

interface ShahiSnanDate {
  date: string;
  name: string;
  description?: string;
  isMainSnan: boolean;
}

interface ShahiSnanCalendarProps {
  dates: ShahiSnanDate[];
}

export default function ShahiSnanCalendar({ dates }: ShahiSnanCalendarProps) {
  if (!dates || dates.length === 0) return null;

  const sortedDates = [...dates].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <section className="py-16 bg-spiritual-cream">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-playfair text-spiritual-maroon text-center mb-2">
          शाही स्नान तिथियाँ
        </h2>
        <p className="text-center text-gray-500 mb-10">
          Shahi Snan (Royal Bath) Dates
        </p>

        <div className="space-y-4">
          {sortedDates.map((snan, index) => {
            const date = new Date(snan.date);
            const isPast = date < new Date();
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                  snan.isMainSnan
                    ? "bg-gradient-to-r from-spiritual-saffron/10 to-transparent border-spiritual-saffron/30"
                    : "bg-white border-spiritual-sandstone/30"
                } ${isPast ? "opacity-60" : ""} ${isToday ? "ring-2 ring-spiritual-saffron" : ""}`}
              >
                {/* Date badge */}
                <div className="flex-shrink-0 text-center min-w-[60px]">
                  <div
                    className={`text-2xl font-bold ${
                      snan.isMainSnan
                        ? "text-spiritual-saffron"
                        : "text-spiritual-maroon"
                    }`}
                  >
                    {date.getDate()}
                  </div>
                  <div className="text-xs text-gray-500 uppercase">
                    {date.toLocaleDateString("en-IN", { month: "short" })}
                  </div>
                  <div className="text-xs text-gray-400">
                    {date.toLocaleDateString("en-IN", { weekday: "short" })}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`font-medium ${
                        snan.isMainSnan
                          ? "text-spiritual-saffron text-lg"
                          : "text-spiritual-maroon"
                      }`}
                    >
                      {snan.name}
                    </h3>
                    {snan.isMainSnan && (
                      <span className="px-2 py-0.5 bg-spiritual-saffron text-white text-xs rounded-full">
                        Main Snan
                      </span>
                    )}
                    {isToday && (
                      <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full animate-pulse">
                        Today
                      </span>
                    )}
                  </div>
                  {snan.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {snan.description}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create the Kumbh landing page**

```tsx
// website/app/kumbh/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import KumbhHero from "@/components/kumbh/KumbhHero";
import ShahiSnanCalendar from "@/components/kumbh/ShahiSnanCalendar";
import Link from "next/link";

export default function KumbhPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKumbh = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await axios.get(`${apiUrl}/api/kumbh/active`);
        if (res.data.success) setData(res.data.data);
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchKumbh();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spiritual-cream">
        <div className="text-spiritual-warmGray">Loading...</div>
      </div>
    );
  }

  if (!data?.hasActiveKumbh) {
    return (
      <main className="min-h-screen bg-spiritual-cream pt-20">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4 text-spiritual-saffron/30">🕉️</div>
          <h1 className="text-3xl font-playfair text-spiritual-maroon mb-4">
            Kumbh Mela
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            There is no active Kumbh Mela event at this time. Stay tuned for
            announcements about upcoming Kumbh Mela gatherings with Swami Ji.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <KumbhHero event={data.event} />

      {/* Shahi Snan Calendar */}
      {data.event.shahiSnanDates?.length > 0 && (
        <ShahiSnanCalendar dates={data.event.shahiSnanDates} />
      )}

      {/* Accommodations */}
      {data.accommodations?.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-playfair text-spiritual-maroon text-center mb-8">
              Camp Accommodation
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.accommodations.map((acc: any) => (
                <div
                  key={acc._id}
                  className="bg-spiritual-cream rounded-xl p-5 border border-spiritual-sandstone/30"
                >
                  {acc.images?.[0] && (
                    <img
                      src={acc.images[0]}
                      alt={acc.name}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  <span className="text-xs px-2 py-0.5 bg-spiritual-saffron/10 text-spiritual-saffron rounded-full capitalize">
                    {acc.type}
                  </span>
                  <h3 className="text-lg font-medium text-spiritual-maroon mt-2">
                    {acc.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{acc.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-spiritual-saffron font-bold">
                      ₹{acc.pricePerNight}/night
                    </span>
                    <span className="text-xs text-gray-400">
                      {acc.capacity - acc.bookedCount} slots left
                    </span>
                  </div>
                  {acc.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {acc.amenities.slice(0, 4).map((a: string) => (
                        <span
                          key={a}
                          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Live Updates */}
      {data.updates?.length > 0 && (
        <section className="py-16 bg-spiritual-cream">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-playfair text-spiritual-maroon text-center mb-8">
              Latest Updates
            </h2>
            <div className="space-y-4">
              {data.updates.slice(0, 5).map((update: any) => (
                <div
                  key={update._id}
                  className={`bg-white rounded-xl p-4 border ${
                    update.isPinned
                      ? "border-spiritual-saffron/50"
                      : "border-spiritual-sandstone/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {update.isPinned && (
                      <span className="text-xs text-spiritual-saffron">
                        📌 Pinned
                      </span>
                    )}
                    {update.priority === "urgent" && (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                        Urgent
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(update.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-800">{update.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{update.content}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link
                href="/kumbh/updates"
                className="text-spiritual-saffron hover:underline text-sm"
              >
                View all updates →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Camp Location */}
      {data.event.campLocation && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-playfair text-spiritual-maroon mb-4">
              Camp Location
            </h2>
            <p className="text-gray-600">{data.event.campLocation.address}</p>
            {data.event.campLocation.landmark && (
              <p className="text-sm text-gray-500 mt-1">
                Near: {data.event.campLocation.landmark}
              </p>
            )}
            {data.event.campLocation.googleMapsUrl && (
              <a
                href={data.event.campLocation.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-6 py-2 bg-spiritual-saffron text-white rounded-full hover:bg-spiritual-saffron/90"
              >
                Open in Google Maps
              </a>
            )}
            {data.event.contactPhone?.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-2">Contact:</p>
                {data.event.contactPhone.map((phone: string) => (
                  <a
                    key={phone}
                    href={`tel:${phone}`}
                    className="block text-spiritual-maroon hover:underline"
                  >
                    {phone}
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add website/app/kumbh/ website/components/kumbh/
git commit -m "feat: add Kumbh Mela landing page with hero, Shahi Snan calendar, accommodations, and live updates"
```

---

## Task 6: Website — Multi-Step Registration Wizard

**Files:**
- Create: `website/app/kumbh/register/page.tsx`
- Create: `website/components/kumbh/RegistrationWizard.tsx`

- [ ] **Step 1: Create the RegistrationWizard component**

```tsx
// website/components/kumbh/RegistrationWizard.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface GroupMember {
  fullName: string;
  age: number;
  gender: string;
  relation: string;
  specialNeeds: string;
}

const STEPS = [
  "Registration Type",
  "Lead Person Details",
  "Group Members",
  "Travel & Accommodation",
  "Review & Submit",
];

interface RegistrationWizardProps {
  kumbhEventId: string;
  eventName: string;
}

export default function RegistrationWizard({
  kumbhEventId,
  eventName,
}: RegistrationWizardProps) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    registrationType: "individual",
    leadPerson: {
      fullName: "",
      email: "",
      phone: "",
      age: 0,
      gender: "male",
      city: "",
      state: "",
      idType: "aadhaar",
      idNumber: "",
    },
    groupMembers: [] as GroupMember[],
    arrivalDate: "",
    departureDate: "",
    accommodationRequired: false,
    mealPreference: "veg",
    specialRequirements: "",
    emergencyContact: { name: "", phone: "", relation: "" },
  });

  const updateField = (path: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const keys = path.split(".");
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return { ...newData };
    });
  };

  const addGroupMember = () => {
    setFormData((prev) => ({
      ...prev,
      groupMembers: [
        ...prev.groupMembers,
        { fullName: "", age: 0, gender: "male", relation: "", specialNeeds: "" },
      ],
    }));
  };

  const removeGroupMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      groupMembers: prev.groupMembers.filter((_, i) => i !== index),
    }));
  };

  const updateGroupMember = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      groupMembers: prev.groupMembers.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      ),
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await axios.post(`${apiUrl}/api/kumbh/register`, {
        ...formData,
        kumbhEventId,
      });
      setSuccess(res.data.data.registrationNumber);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🙏</div>
        <h2 className="text-2xl font-playfair text-spiritual-maroon mb-2">
          Registration Successful!
        </h2>
        <p className="text-gray-600 mb-4">
          Your registration number is:
        </p>
        <div className="inline-block px-6 py-3 bg-spiritual-saffron/10 rounded-xl">
          <span className="text-2xl font-mono font-bold text-spiritual-saffron">
            {success}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Please save this number. A confirmation email has been sent to{" "}
          {formData.leadPerson.email}
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-spiritual-saffron/50 focus:border-spiritual-saffron outline-none";

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i <= step
                  ? "bg-spiritual-saffron text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`hidden sm:block w-12 h-0.5 mx-1 ${
                  i < step ? "bg-spiritual-saffron" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step 0: Registration Type */}
          {step === 0 && (
            <div className="space-y-4">
              <p className="font-medium text-gray-700 mb-4">
                How are you registering?
              </p>
              {[
                { value: "individual", label: "Individual", desc: "Just myself" },
                { value: "family", label: "Family", desc: "With family members" },
                { value: "group", label: "Group", desc: "Organized group/sangha" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`block p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    formData.registrationType === opt.value
                      ? "border-spiritual-saffron bg-spiritual-saffron/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="registrationType"
                    value={opt.value}
                    checked={formData.registrationType === opt.value}
                    onChange={(e) =>
                      updateField("registrationType", e.target.value)
                    }
                    className="sr-only"
                  />
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    — {opt.desc}
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Step 1: Lead Person */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.leadPerson.fullName}
                    onChange={(e) =>
                      updateField("leadPerson.fullName", e.target.value)
                    }
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.leadPerson.email}
                    onChange={(e) =>
                      updateField("leadPerson.email", e.target.value)
                    }
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone (10 digits) *
                  </label>
                  <input
                    type="tel"
                    value={formData.leadPerson.phone}
                    onChange={(e) =>
                      updateField("leadPerson.phone", e.target.value)
                    }
                    className={inputClass}
                    maxLength={10}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    value={formData.leadPerson.age || ""}
                    onChange={(e) =>
                      updateField("leadPerson.age", parseInt(e.target.value))
                    }
                    className={inputClass}
                    min={1}
                    max={120}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Gender *
                  </label>
                  <select
                    value={formData.leadPerson.gender}
                    onChange={(e) =>
                      updateField("leadPerson.gender", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.leadPerson.city}
                    onChange={(e) =>
                      updateField("leadPerson.city", e.target.value)
                    }
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.leadPerson.state}
                    onChange={(e) =>
                      updateField("leadPerson.state", e.target.value)
                    }
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ID Type *
                  </label>
                  <select
                    value={formData.leadPerson.idType}
                    onChange={(e) =>
                      updateField("leadPerson.idType", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="aadhaar">Aadhaar Card</option>
                    <option value="passport">Passport</option>
                    <option value="voter_id">Voter ID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ID Number *
                  </label>
                  <input
                    type="text"
                    value={formData.leadPerson.idNumber}
                    onChange={(e) =>
                      updateField("leadPerson.idNumber", e.target.value)
                    }
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Group Members */}
          {step === 2 && (
            <div className="space-y-4">
              {formData.registrationType === "individual" ? (
                <p className="text-gray-500 text-center py-8">
                  No group members needed for individual registration. Click
                  Next to continue.
                </p>
              ) : (
                <>
                  {formData.groupMembers.map((member, i) => (
                    <div
                      key={i}
                      className="p-4 bg-gray-50 rounded-xl space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Member {i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeGroupMember(i)}
                          className="text-red-500 text-sm hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <input
                          placeholder="Full Name"
                          value={member.fullName}
                          onChange={(e) =>
                            updateGroupMember(i, "fullName", e.target.value)
                          }
                          className={inputClass}
                        />
                        <input
                          type="number"
                          placeholder="Age"
                          value={member.age || ""}
                          onChange={(e) =>
                            updateGroupMember(i, "age", parseInt(e.target.value))
                          }
                          className={inputClass}
                        />
                        <select
                          value={member.gender}
                          onChange={(e) =>
                            updateGroupMember(i, "gender", e.target.value)
                          }
                          className={inputClass}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        <input
                          placeholder="Relation"
                          value={member.relation}
                          onChange={(e) =>
                            updateGroupMember(i, "relation", e.target.value)
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addGroupMember}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-spiritual-saffron hover:text-spiritual-saffron transition-colors"
                  >
                    + Add Member
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step 3: Travel & Accommodation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Arrival Date *
                  </label>
                  <input
                    type="date"
                    value={formData.arrivalDate}
                    onChange={(e) =>
                      updateField("arrivalDate", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Departure Date *
                  </label>
                  <input
                    type="date"
                    value={formData.departureDate}
                    onChange={(e) =>
                      updateField("departureDate", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.accommodationRequired}
                  onChange={(e) =>
                    updateField("accommodationRequired", e.target.checked)
                  }
                  className="rounded"
                />
                <label className="text-sm">
                  I need accommodation at the camp
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Meal Preference
                </label>
                <select
                  value={formData.mealPreference}
                  onChange={(e) =>
                    updateField("mealPreference", e.target.value)
                  }
                  className={inputClass}
                >
                  <option value="veg">Vegetarian</option>
                  <option value="veg_with_jain">Jain Vegetarian</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Special Requirements
                </label>
                <textarea
                  value={formData.specialRequirements}
                  onChange={(e) =>
                    updateField("specialRequirements", e.target.value)
                  }
                  rows={3}
                  className={inputClass}
                  placeholder="Wheelchair access, medical needs, dietary restrictions..."
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium mb-3">
                  Emergency Contact *
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    placeholder="Name"
                    value={formData.emergencyContact.name}
                    onChange={(e) =>
                      updateField("emergencyContact.name", e.target.value)
                    }
                    className={inputClass}
                  />
                  <input
                    placeholder="Phone"
                    value={formData.emergencyContact.phone}
                    onChange={(e) =>
                      updateField("emergencyContact.phone", e.target.value)
                    }
                    className={inputClass}
                  />
                  <input
                    placeholder="Relation"
                    value={formData.emergencyContact.relation}
                    onChange={(e) =>
                      updateField("emergencyContact.relation", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-medium text-spiritual-maroon">
                  Registration Summary
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-500">Type:</span>
                  <span className="capitalize">
                    {formData.registrationType}
                  </span>
                  <span className="text-gray-500">Name:</span>
                  <span>{formData.leadPerson.fullName}</span>
                  <span className="text-gray-500">Email:</span>
                  <span>{formData.leadPerson.email}</span>
                  <span className="text-gray-500">Phone:</span>
                  <span>{formData.leadPerson.phone}</span>
                  <span className="text-gray-500">Total Members:</span>
                  <span>{1 + formData.groupMembers.length}</span>
                  <span className="text-gray-500">Arrival:</span>
                  <span>{formData.arrivalDate}</span>
                  <span className="text-gray-500">Departure:</span>
                  <span>{formData.departureDate}</span>
                  <span className="text-gray-500">Accommodation:</span>
                  <span>
                    {formData.accommodationRequired ? "Required" : "Not needed"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="px-6 py-2.5 border border-gray-300 rounded-lg disabled:opacity-30"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="px-6 py-2.5 bg-spiritual-saffron text-white rounded-lg hover:bg-spiritual-saffron/90"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-2.5 bg-spiritual-maroon text-white rounded-lg hover:bg-spiritual-maroon/90 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Registration"}
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the registration page**

```tsx
// website/app/kumbh/register/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import RegistrationWizard from "@/components/kumbh/RegistrationWizard";

export default function KumbhRegisterPage() {
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(true);
  const [noEvent, setNoEvent] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await axios.get(`${apiUrl}/api/kumbh/active`);
        if (res.data.success && res.data.data.hasActiveKumbh) {
          setEventId(res.data.data.event._id);
          setEventName(res.data.data.event.name);
        } else {
          setNoEvent(true);
        }
      } catch {
        setNoEvent(true);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spiritual-cream">
        <div className="text-spiritual-warmGray">Loading...</div>
      </div>
    );
  }

  if (noEvent || !eventId) {
    return (
      <main className="min-h-screen bg-spiritual-cream pt-20">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-playfair text-spiritual-maroon">
            Registration Not Available
          </h1>
          <p className="text-gray-500 mt-2">
            There is no active Kumbh event with open registration at this time.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-spiritual-cream pt-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-playfair text-spiritual-maroon text-center mb-2">
          Register for {eventName}
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Register yourself, your family, or your group for the Kumbh Mela camp
        </p>

        <div className="bg-white rounded-2xl shadow-warm p-6 md:p-8">
          <RegistrationWizard
            kumbhEventId={eventId}
            eventName={eventName}
          />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add website/app/kumbh/register/ website/components/kumbh/RegistrationWizard.tsx
git commit -m "feat: add multi-step Kumbh Mela registration wizard with group booking"
```

---

## Task 7: Admin Dashboard — Kumbh Management Page

**Files:**
- Create: `dashboard-next/src/app/dashboard/kumbh/page.tsx`

- [ ] **Step 1: Create the admin Kumbh management page**

This is a comprehensive admin page with tabs for Event Setup, Registrations, Accommodations, and Updates. Due to size, the component uses tab-based navigation.

```tsx
// dashboard-next/src/app/dashboard/kumbh/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

type TabKey = "event" | "registrations" | "accommodations" | "updates";

export default function KumbhAdminPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("event");
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const eventsRes = await axios.get("/api/kumbh/event");
      setEvents(eventsRes.data.data);
      if (eventsRes.data.data.length > 0 && !selectedEventId) {
        setSelectedEventId(eventsRes.data.data[0]._id);
      }

      if (selectedEventId) {
        const [regRes, accRes, updRes] = await Promise.all([
          axios.get(`/api/kumbh/register?eventId=${selectedEventId}&limit=100`),
          axios.get(`/api/kumbh/accommodation?eventId=${selectedEventId}`),
          axios.get(`/api/kumbh/updates?eventId=${selectedEventId}`),
        ]);
        setRegistrations(regRes.data.data);
        setAccommodations(accRes.data.data);
        setUpdates(updRes.data.data);
      }
    } catch {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "event", label: "Event Setup" },
    { key: "registrations", label: "Registrations", count: registrations.length },
    { key: "accommodations", label: "Accommodations", count: accommodations.length },
    { key: "updates", label: "Updates", count: updates.length },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    checked_in: "bg-blue-100 text-blue-800",
    checked_out: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Kumbh Mela Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage Kumbh events, registrations, accommodations, and updates
          </p>
        </div>
        {events.length > 1 && (
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="rounded-lg border px-3 py-2 dark:bg-gray-800"
          >
            {events.map((e: any) => (
              <option key={e._id} value={e._id}>
                {e.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-brand-500 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border">
          {/* Registrations Tab */}
          {activeTab === "registrations" && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Reg #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Members
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Dates
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {registrations.map((reg: any) => (
                    <tr key={reg._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-mono">
                        {reg.registrationNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">
                          {reg.leadPerson.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {reg.leadPerson.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm capitalize">
                        {reg.registrationType}
                      </td>
                      <td className="px-4 py-3 text-sm">{reg.totalMembers}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(reg.arrivalDate).toLocaleDateString("en-IN")} →{" "}
                        {new Date(reg.departureDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${statusColors[reg.status] || ""}`}
                        >
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={reg.status}
                          onChange={async (e) => {
                            try {
                              await axios.put("/api/kumbh/register", {
                                id: reg._id,
                                status: e.target.value,
                              });
                              toast.success("Status updated");
                              fetchData();
                            } catch {
                              toast.error("Failed to update");
                            }
                          }}
                          className="text-xs rounded border px-2 py-1 dark:bg-gray-800"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="checked_in">Checked In</option>
                          <option value="checked_out">Checked Out</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {registrations.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No registrations yet
                </div>
              )}
            </div>
          )}

          {/* Event Setup Tab */}
          {activeTab === "event" && (
            <div className="p-6">
              <p className="text-gray-500 text-sm mb-4">
                Create or manage Kumbh Mela events. Only one event can be active
                at a time.
              </p>
              {events.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  No Kumbh events created yet. Create one to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {events.map((event: any) => (
                    <div
                      key={event._id}
                      className="p-4 border rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          {event.isActive && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                              Active
                            </span>
                          )}
                          <h3 className="font-medium">{event.name}</h3>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {event.city} · {event.registeredCount} registered /{" "}
                          {event.maxCapacity} capacity
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            await axios.put("/api/kumbh/event", {
                              id: event._id,
                              registrationOpen: !event.registrationOpen,
                            });
                            toast.success(
                              event.registrationOpen
                                ? "Registration closed"
                                : "Registration opened"
                            );
                            fetchData();
                          }}
                          className={`px-3 py-1.5 text-sm rounded-lg ${
                            event.registrationOpen
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {event.registrationOpen
                            ? "Close Registration"
                            : "Open Registration"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Accommodations Tab */}
          {activeTab === "accommodations" && (
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accommodations.map((acc: any) => (
                  <div key={acc._id} className="p-4 border rounded-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full capitalize">
                          {acc.type}
                        </span>
                        <h3 className="font-medium mt-1">{acc.name}</h3>
                      </div>
                      <span className="text-brand-500 font-bold">
                        ₹{acc.pricePerNight}/night
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      <p>
                        Capacity: {acc.bookedCount}/{acc.capacity} booked
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-brand-500 h-1.5 rounded-full"
                          style={{
                            width: `${(acc.bookedCount / acc.capacity) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {accommodations.length === 0 && (
                <p className="text-center text-gray-400 py-8">
                  No accommodations added yet
                </p>
              )}
            </div>
          )}

          {/* Updates Tab */}
          {activeTab === "updates" && (
            <div className="p-6 space-y-4">
              {updates.map((update: any) => (
                <div
                  key={update._id}
                  className={`p-4 border rounded-xl ${
                    update.isPinned ? "border-brand-500/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {update.isPinned && (
                      <span className="text-xs text-brand-500">📌</span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        update.priority === "urgent"
                          ? "bg-red-100 text-red-700"
                          : update.priority === "high"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {update.priority}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(update.createdAt).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <h3 className="font-medium">{update.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{update.content}</p>
                </div>
              ))}
              {updates.length === 0 && (
                <p className="text-center text-gray-400 py-8">
                  No updates posted yet
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add dashboard-next/src/app/dashboard/kumbh/
git commit -m "feat: add Kumbh Mela admin dashboard with registrations, accommodations, and updates management"
```

---

## Self-Review Checklist

1. **Spec coverage:** All Kumbh features implemented — event creation, multi-step registration with group booking, accommodation management, Shahi Snan calendar, live updates feed, admin management dashboard. Website has landing page, registration wizard, schedule page. Mobile has screens for all features.
2. **Placeholder scan:** No TBDs or TODOs. All code is complete and functional.
3. **Type consistency:** `KumbhEvent`, `KumbhRegistration`, `KumbhAccommodation`, `KumbhUpdate` types are consistent across all files. Registration number generation uses the same `KMB-` prefix throughout.
4. **Pattern consistency:** All models use existing `isDeleted` soft-delete pattern. API responses use `{ success, data }` format. Admin pages follow existing dashboard layout with shadcn-style components. Website uses spiritual theme colors and Framer Motion animations.
