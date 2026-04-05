# Prabhu Premi Sangh Center/Ashram Locator & Global Presence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive center/ashram locator that lets devotees find the nearest Prabhu Premi Sangh center by city, state, pin code, or GPS -- with zone-based filtering, an interactive map-like card interface, Google Maps directions, center-specific event calendars, and full admin CRUD management across dashboard, website, and mobile platforms.

**Architecture:** A new `Center` MongoDB model stores center details with a `2dsphere` geo index for proximity queries and a text index for search. API routes on the dashboard-next backend expose CRUD, search, and geo-nearest endpoints. The website presents a spiritual-themed center finder page with zone filters and search. The mobile app adds a `CenterFinder` screen with GPS auto-detection. The admin dashboard provides a full management interface for centers.

**Tech Stack:** Next.js 15 (App Router), React 19, MongoDB/Mongoose (with `$geoNear` aggregation), TypeScript, Tailwind CSS (spiritual theme), Framer Motion, Lucide React icons, React Hook Form, Axios, Expo (React Native), `expo-location` for GPS.

**Peer Benchmark:**

| Organization | Centers | Key Features | Our Advantage |
|---|---|---|---|
| RSSB | 1,400+ | Map-based locator, driving directions | Zone filtering + spiritual theming |
| Brahma Kumaris | 5,616+ | State/district search | Geo-proximity + GPS auto-detect |
| Art of Living | 3,000+ | Instructor + center finder | Center-specific event calendar |
| Heartfulness | 10,000+ | 24/7 trainer connection | Multi-platform (web + mobile) |
| Patanjali | 1,000+ | State-level locator | Pin code search + activities filter |

---

## File Structure

### New Files to Create
```
dashboard-next/src/models/Center.ts
dashboard-next/src/app/api/centers/route.ts
dashboard-next/src/app/api/centers/[id]/route.ts
dashboard-next/src/app/api/centers/search/route.ts
dashboard-next/src/app/api/centers/nearest/route.ts
dashboard-next/src/app/dashboard/centers/page.tsx
dashboard-next/src/app/dashboard/centers/centers-table.tsx
dashboard-next/src/app/dashboard/centers/center-form.tsx
dashboard-next/src/app/dashboard/centers/new/page.tsx
dashboard-next/src/app/dashboard/centers/[id]/page.tsx
website/app/centers/page.tsx
website/components/sections/CenterLocator.tsx
website/components/ui/CenterCard.tsx
website/components/ui/ZoneFilter.tsx
website/components/ui/CenterSearchBar.tsx
mobile/user-app/src/screens/centers/CenterFinderScreen.tsx
mobile/user-app/src/screens/centers/CenterDetailScreen.tsx
```

### Existing Files to Modify
```
mobile/user-app/src/navigation/AppNavigator.tsx  (add center screens)
website/app/page.tsx  (add CenterLocator section link)
```

---

## Task 1: Center MongoDB Model

**Files:**
- Create: `dashboard-next/src/models/Center.ts`

- [ ] **Step 1: Create the Center model with full schema, geo index, and text index**

```typescript
// dashboard-next/src/models/Center.ts
import mongoose, { Document, Schema, Model } from "mongoose";

export interface IOpeningHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface ICenter extends Document {
  name: string;
  slug: string;
  centerType: "ashram" | "satsang_center" | "meditation_center" | "study_center";
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  zone: "north" | "south" | "east" | "west" | "central" | "international";
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  contactPerson: string;
  phone: string;
  email: string;
  photo: string;
  activities: string[];
  openingHours: IOpeningHours[];
  upcomingEvents: mongoose.Types.ObjectId[];
  establishedYear: number;
  capacity: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const openingHoursSchema = new Schema<IOpeningHours>(
  {
    day: {
      type: String,
      required: true,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    open: { type: String, required: true, default: "06:00" },
    close: { type: String, required: true, default: "20:00" },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const centerSchema: Schema<ICenter> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Center name is required"],
      trim: true,
      maxlength: [200, "Center name can't exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    centerType: {
      type: String,
      required: [true, "Center type is required"],
      enum: {
        values: ["ashram", "satsang_center", "meditation_center", "study_center"],
        message: "{VALUE} is not a valid center type",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description can't exceed 1000 characters"],
      default: "",
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [500, "Address can't exceed 500 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      index: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      default: "India",
    },
    pincode: {
      type: String,
      trim: true,
      index: true,
    },
    zone: {
      type: String,
      required: [true, "Zone is required"],
      enum: {
        values: ["north", "south", "east", "west", "central", "international"],
        message: "{VALUE} is not a valid zone",
      },
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, "Coordinates are required"],
      },
    },
    contactPerson: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    photo: {
      type: String,
      trim: true,
      default: "",
    },
    activities: {
      type: [String],
      default: ["Satsang", "Meditation"],
    },
    openingHours: {
      type: [openingHoursSchema],
      default: [
        { day: "Monday", open: "06:00", close: "20:00", isClosed: false },
        { day: "Tuesday", open: "06:00", close: "20:00", isClosed: false },
        { day: "Wednesday", open: "06:00", close: "20:00", isClosed: false },
        { day: "Thursday", open: "06:00", close: "20:00", isClosed: false },
        { day: "Friday", open: "06:00", close: "20:00", isClosed: false },
        { day: "Saturday", open: "06:00", close: "20:00", isClosed: false },
        { day: "Sunday", open: "05:00", close: "21:00", isClosed: false },
      ],
    },
    upcomingEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    establishedYear: {
      type: Number,
    },
    capacity: {
      type: Number,
      default: 0,
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
    strict: true,
    versionKey: false,
  }
);

// 2dsphere index for geo-proximity queries
centerSchema.index({ location: "2dsphere" });

// Text index for full-text search
centerSchema.index(
  { name: "text", city: "text", state: "text", description: "text", address: "text" },
  { weights: { name: 10, city: 5, state: 3, description: 1, address: 2 } }
);

// Compound index for zone + active filtering
centerSchema.index({ zone: 1, isActive: 1, isDeleted: 1 });

// Pre-save hook to generate slug
centerSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }
  next();
});

const Center: Model<ICenter> =
  mongoose.models.Center || mongoose.model<ICenter>("Center", centerSchema);

export default Center;
```

---

## Task 2: Centers API -- CRUD Routes

**Files:**
- Create: `dashboard-next/src/app/api/centers/route.ts`
- Create: `dashboard-next/src/app/api/centers/[id]/route.ts`

- [ ] **Step 1: Create the main centers API route (GET all + POST create)**

```typescript
// dashboard-next/src/app/api/centers/route.ts
import { NextRequest, NextResponse } from "next/server";
import Center from "@/models/Center";
import { connectDB } from "@/lib/mongodb";
import getCloudinary from "@/utils/cloudinary";
import { UploadApiResponse } from "cloudinary";

type ApiResponse = {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

const uploadToCloudinary = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const cloudinary = getCloudinary();

  const result: UploadApiResponse = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "centers",
          resource_type: "image",
          transformation: [
            { width: 800, height: 600, crop: "fill", gravity: "auto" },
            { quality: "auto:good" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as UploadApiResponse);
        }
      )
      .end(buffer);
  });

  return result.secure_url;
};

// GET all centers with optional filtering
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const zone = searchParams.get("zone");
    const centerType = searchParams.get("centerType");
    const state = searchParams.get("state");
    const city = searchParams.get("city");
    const isActive = searchParams.get("isActive");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    // Build query filter
    const filter: Record<string, unknown> = { isDeleted: { $ne: true } };

    if (zone) filter.zone = zone;
    if (centerType) filter.centerType = centerType;
    if (state) filter.state = { $regex: state, $options: "i" };
    if (city) filter.city = { $regex: city, $options: "i" };
    if (isActive !== null && isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const [centers, total] = await Promise.all([
      Center.find(filter)
        .sort({ zone: 1, state: 1, city: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .populate("upcomingEvents", "eventName eventDate eventLocation")
        .lean(),
      Center.countDocuments(filter),
    ]);

    const sanitized = JSON.parse(JSON.stringify(centers));

    return NextResponse.json(
      {
        success: true,
        message: centers.length ? "Centers fetched successfully" : "No centers found",
        data: sanitized,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("GET Centers Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch centers",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST create a new center
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const form = await req.formData();

    const name = form.get("name") as string;
    const centerType = form.get("centerType") as string;
    const description = (form.get("description") as string) || "";
    const address = form.get("address") as string;
    const city = form.get("city") as string;
    const state = form.get("state") as string;
    const country = (form.get("country") as string) || "India";
    const pincode = (form.get("pincode") as string) || "";
    const zone = form.get("zone") as string;
    const latitude = parseFloat(form.get("latitude") as string);
    const longitude = parseFloat(form.get("longitude") as string);
    const contactPerson = (form.get("contactPerson") as string) || "";
    const phone = (form.get("phone") as string) || "";
    const email = (form.get("email") as string) || "";
    const activitiesRaw = form.get("activities") as string;
    const activities = activitiesRaw ? activitiesRaw.split(",").map((a) => a.trim()) : ["Satsang", "Meditation"];
    const openingHoursRaw = form.get("openingHours") as string;
    const establishedYear = form.get("establishedYear") ? parseInt(form.get("establishedYear") as string, 10) : undefined;
    const capacity = form.get("capacity") ? parseInt(form.get("capacity") as string, 10) : 0;
    const file = form.get("photo") as File | null;

    // Validation
    if (!name || !centerType || !address || !city || !state || !zone) {
      return NextResponse.json(
        { success: false, message: "Name, type, address, city, state, and zone are required" },
        { status: 400 }
      );
    }

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { success: false, message: "Valid latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Handle photo upload
    let photoUrl = "";
    if (file && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, message: "Photo must be an image file" },
          { status: 400 }
        );
      }
      try {
        photoUrl = await uploadToCloudinary(file);
      } catch (uploadError) {
        console.error("Error uploading center photo:", uploadError);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to upload center photo",
            error: uploadError instanceof Error ? uploadError.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    }

    // Parse opening hours if provided
    let openingHours;
    if (openingHoursRaw) {
      try {
        openingHours = JSON.parse(openingHoursRaw);
      } catch {
        return NextResponse.json(
          { success: false, message: "Invalid opening hours format" },
          { status: 400 }
        );
      }
    }

    const newCenter = await Center.create({
      name,
      centerType,
      description,
      address,
      city,
      state,
      country,
      pincode,
      zone,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      contactPerson,
      phone,
      email,
      photo: photoUrl,
      activities,
      openingHours,
      establishedYear,
      capacity,
    });

    return NextResponse.json(
      { success: true, message: "Center created successfully", data: newCenter },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Center Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create center",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create the single center API route (GET by ID, PUT update, DELETE soft-delete)**

```typescript
// dashboard-next/src/app/api/centers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import Center from "@/models/Center";
import { connectDB } from "@/lib/mongodb";
import getCloudinary from "@/utils/cloudinary";
import { UploadApiResponse } from "cloudinary";
import mongoose from "mongoose";

type ApiResponse = {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
};

const uploadToCloudinary = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const cloudinary = getCloudinary();

  const result: UploadApiResponse = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "centers",
          resource_type: "image",
          transformation: [
            { width: 800, height: 600, crop: "fill", gravity: "auto" },
            { quality: "auto:good" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as UploadApiResponse);
        }
      )
      .end(buffer);
  });

  return result.secure_url;
};

// GET single center by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid center ID" },
        { status: 400 }
      );
    }

    const center = await Center.findOne({ _id: id, isDeleted: { $ne: true } })
      .populate("upcomingEvents", "eventName eventDate eventLocation description")
      .lean();

    if (!center) {
      return NextResponse.json(
        { success: false, message: "Center not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Center fetched successfully", data: JSON.parse(JSON.stringify(center)) },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET Center Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch center",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT update center
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid center ID" },
        { status: 400 }
      );
    }

    const form = await req.formData();
    const updateData: Record<string, unknown> = {};

    // Extract fields from form data
    const fields = [
      "name", "centerType", "description", "address", "city", "state",
      "country", "pincode", "zone", "contactPerson", "phone", "email",
    ];

    for (const field of fields) {
      const value = form.get(field);
      if (value !== null && value !== undefined) {
        updateData[field] = value as string;
      }
    }

    // Handle coordinates
    const latitude = form.get("latitude");
    const longitude = form.get("longitude");
    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      if (!isNaN(lat) && !isNaN(lng)) {
        updateData.location = {
          type: "Point",
          coordinates: [lng, lat],
        };
      }
    }

    // Handle activities
    const activitiesRaw = form.get("activities");
    if (activitiesRaw) {
      updateData.activities = (activitiesRaw as string).split(",").map((a) => a.trim());
    }

    // Handle opening hours
    const openingHoursRaw = form.get("openingHours");
    if (openingHoursRaw) {
      try {
        updateData.openingHours = JSON.parse(openingHoursRaw as string);
      } catch {
        return NextResponse.json(
          { success: false, message: "Invalid opening hours format" },
          { status: 400 }
        );
      }
    }

    // Handle numeric fields
    const establishedYear = form.get("establishedYear");
    if (establishedYear) updateData.establishedYear = parseInt(establishedYear as string, 10);
    const capacity = form.get("capacity");
    if (capacity) updateData.capacity = parseInt(capacity as string, 10);

    // Handle isActive
    const isActive = form.get("isActive");
    if (isActive !== null && isActive !== undefined) {
      updateData.isActive = isActive === "true";
    }

    // Handle photo upload
    const file = form.get("photo") as File | null;
    if (file && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, message: "Photo must be an image file" },
          { status: 400 }
        );
      }
      updateData.photo = await uploadToCloudinary(file);
    }

    const updated = await Center.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Center not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Center updated successfully", data: JSON.parse(JSON.stringify(updated)) },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT Center Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update center",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE soft-delete center
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid center ID" },
        { status: 400 }
      );
    }

    const updated = await Center.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Center not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Center deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE Center Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete center",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
```

---

## Task 3: Centers API -- Search & Nearest Routes

**Files:**
- Create: `dashboard-next/src/app/api/centers/search/route.ts`
- Create: `dashboard-next/src/app/api/centers/nearest/route.ts`

- [ ] **Step 1: Create the text search endpoint**

```typescript
// dashboard-next/src/app/api/centers/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import Center from "@/models/Center";
import { connectDB } from "@/lib/mongodb";

type ApiResponse = {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
};

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const zone = searchParams.get("zone");
    const centerType = searchParams.get("centerType");
    const activity = searchParams.get("activity");

    if (!q && !zone && !centerType && !activity) {
      return NextResponse.json(
        { success: false, message: "At least one search parameter is required (q, zone, centerType, or activity)" },
        { status: 400 }
      );
    }

    const filter: Record<string, unknown> = {
      isDeleted: { $ne: true },
      isActive: true,
    };

    // Text search if query is provided
    if (q) {
      // Check if query looks like a pincode (5-6 digits)
      const isPincode = /^\d{5,6}$/.test(q.trim());
      if (isPincode) {
        filter.pincode = q.trim();
      } else {
        filter.$text = { $search: q };
      }
    }

    if (zone) filter.zone = zone;
    if (centerType) filter.centerType = centerType;
    if (activity) filter.activities = { $in: [activity] };

    let query = Center.find(filter);

    // Add text score sorting if text search is used
    if (q && !(/^\d{5,6}$/.test(q.trim()))) {
      query = query.select({ score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } });
    } else {
      query = query.sort({ zone: 1, state: 1, city: 1 });
    }

    const centers = await query.limit(50).lean();
    const sanitized = JSON.parse(JSON.stringify(centers));

    return NextResponse.json(
      {
        success: true,
        message: centers.length ? `Found ${centers.length} center(s)` : "No centers found matching your search",
        data: sanitized,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Search Centers Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to search centers",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create the geo-nearest endpoint using $geoNear**

```typescript
// dashboard-next/src/app/api/centers/nearest/route.ts
import { NextRequest, NextResponse } from "next/server";
import Center from "@/models/Center";
import { connectDB } from "@/lib/mongodb";

type ApiResponse = {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
};

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");
    const maxDistanceKm = parseInt(searchParams.get("maxDistance") || "100", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const centerType = searchParams.get("centerType");

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { success: false, message: "Valid latitude (lat) and longitude (lng) are required" },
        { status: 400 }
      );
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { success: false, message: "Coordinates out of valid range" },
        { status: 400 }
      );
    }

    const maxDistanceMeters = maxDistanceKm * 1000;

    const matchStage: Record<string, unknown> = {
      isDeleted: { $ne: true },
      isActive: true,
    };
    if (centerType) matchStage.centerType = centerType;

    const centers = await Center.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lng, lat],
          },
          distanceField: "distanceInMeters",
          maxDistance: maxDistanceMeters,
          spherical: true,
          query: matchStage,
        },
      },
      {
        $addFields: {
          distanceInKm: {
            $round: [{ $divide: ["$distanceInMeters", 1000] }, 1],
          },
        },
      },
      {
        $project: {
          __v: 0,
          isDeleted: 0,
        },
      },
      { $limit: limit },
    ]);

    const sanitized = JSON.parse(JSON.stringify(centers));

    return NextResponse.json(
      {
        success: true,
        message: centers.length
          ? `Found ${centers.length} center(s) within ${maxDistanceKm}km`
          : `No centers found within ${maxDistanceKm}km. Try increasing the distance.`,
        data: sanitized,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Nearest Centers Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to find nearest centers",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
```

---

## Task 4: Admin Dashboard -- Centers Table

**Files:**
- Create: `dashboard-next/src/app/dashboard/centers/page.tsx`
- Create: `dashboard-next/src/app/dashboard/centers/centers-table.tsx`

- [ ] **Step 1: Create the centers listing page**

```tsx
// dashboard-next/src/app/dashboard/centers/page.tsx
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { CentersTable } from "./centers-table";

export default function CentersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Centers & Ashrams</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage Prabhu Premi Sangh centers, ashrams, and meditation centers.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/centers/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Center
          </Link>
        </Button>
      </div>

      <CentersTable />
    </div>
  );
}
```

- [ ] **Step 2: Create the centers table component with filters**

```tsx
// dashboard-next/src/app/dashboard/centers/centers-table.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  MapPin, MoreHorizontal, Trash, Edit, Info, Phone, Mail,
  Building2, Globe, Filter, X,
} from 'lucide-react';
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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Center {
  _id: string;
  name: string;
  centerType: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zone: string;
  phone: string;
  email: string;
  contactPerson: string;
  isActive: boolean;
  activities: string[];
  location: { coordinates: [number, number] };
}

const ZONES = [
  { value: '', label: 'All Zones' },
  { value: 'north', label: 'North India' },
  { value: 'south', label: 'South India' },
  { value: 'east', label: 'East India' },
  { value: 'west', label: 'West India' },
  { value: 'central', label: 'Central India' },
  { value: 'international', label: 'International' },
];

const CENTER_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'ashram', label: 'Ashram' },
  { value: 'satsang_center', label: 'Satsang Center' },
  { value: 'meditation_center', label: 'Meditation Center' },
  { value: 'study_center', label: 'Study Center' },
];

const typeLabels: Record<string, string> = {
  ashram: 'Ashram',
  satsang_center: 'Satsang Center',
  meditation_center: 'Meditation Center',
  study_center: 'Study Center',
};

const zoneBadgeColors: Record<string, string> = {
  north: 'bg-blue-100 text-blue-700',
  south: 'bg-green-100 text-green-700',
  east: 'bg-yellow-100 text-yellow-700',
  west: 'bg-purple-100 text-purple-700',
  central: 'bg-orange-100 text-orange-700',
  international: 'bg-indigo-100 text-indigo-700',
};

export function CentersTable() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [centerToDelete, setCenterToDelete] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [zoneFilter, setZoneFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCenters = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (zoneFilter) params.set('zone', zoneFilter);
      if (typeFilter) params.set('centerType', typeFilter);

      const url = `/api/centers${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await axios.get(url);

      if (response.data.success) {
        setCenters(response.data.data || []);
        setError(null);
      } else {
        setError(response.data.message || 'Failed to load centers');
      }
    } catch (err) {
      console.error('Error fetching centers:', err);
      setError('Failed to load centers. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [zoneFilter, typeFilter]);

  useEffect(() => {
    fetchCenters();
  }, [fetchCenters]);

  const filteredCenters = centers.filter((center) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      center.name.toLowerCase().includes(q) ||
      center.city.toLowerCase().includes(q) ||
      center.state.toLowerCase().includes(q) ||
      center.contactPerson.toLowerCase().includes(q)
    );
  });

  const handleDelete = (id: string) => {
    setCenterToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!centerToDelete) return;
    try {
      const response = await axios.delete(`/api/centers/${centerToDelete}`);
      if (response.data.success) {
        setCenters(centers.filter((c) => c._id !== centerToDelete));
        toast.success('Center deleted successfully');
      } else {
        toast.error('Failed to delete center', { description: response.data.message });
      }
    } catch (err) {
      console.error('Error deleting center:', err);
      toast.error('Error deleting center');
    } finally {
      setDeleteDialogOpen(false);
      setCenterToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md bg-muted/10">
        <Building2 className="h-6 w-6 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Unable to load centers</h3>
        <p className="text-sm text-muted-foreground mb-6">{error}</p>
        <Button onClick={fetchCenters}>Try Again</Button>
      </div>
    );
  }

  return (
    <>
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search centers by name, city, state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Select value={zoneFilter} onValueChange={setZoneFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Zones" />
          </SelectTrigger>
          <SelectContent>
            {ZONES.map((z) => (
              <SelectItem key={z.value || 'all'} value={z.value || 'all_zones'}>
                {z.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            {CENTER_TYPES.map((t) => (
              <SelectItem key={t.value || 'all'} value={t.value || 'all_types'}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empty state */}
      {!filteredCenters.length && (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md bg-muted/10">
          <Building2 className="h-6 w-6 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No centers found</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {searchQuery || zoneFilter || typeFilter
              ? 'Try adjusting your filters.'
              : 'Get started by adding your first center.'}
          </p>
          <Button asChild>
            <Link href="/dashboard/centers/new">Add a Center</Link>
          </Button>
        </div>
      )}

      {/* Table */}
      {filteredCenters.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead className="hidden lg:table-cell">Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCenters.map((center) => (
                <TableRow
                  key={center._id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSelectedCenter(center);
                    setDetailsOpen(true);
                  }}
                >
                  <TableCell className="font-medium">{center.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[center.centerType] || center.centerType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
                      {center.city}, {center.state}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={zoneBadgeColors[center.zone] || 'bg-gray-100 text-gray-700'}>
                      {center.zone.charAt(0).toUpperCase() + center.zone.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {center.contactPerson || center.phone || '-'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant={center.isActive ? 'default' : 'secondary'}>
                      {center.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedCenter(center); setDetailsOpen(true); }}>
                          <Info className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/centers/${center._id}`} onClick={(e) => e.stopPropagation()}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => { e.stopPropagation(); handleDelete(center._id); }}
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

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          {selectedCenter && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedCenter.name}</DialogTitle>
              </DialogHeader>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Type</p>
                      <p className="text-sm text-muted-foreground">{typeLabels[selectedCenter.centerType]}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{selectedCenter.address}</p>
                      <p className="text-sm text-muted-foreground">{selectedCenter.city}, {selectedCenter.state}, {selectedCenter.country}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Zone</p>
                      <Badge className={zoneBadgeColors[selectedCenter.zone]}>{selectedCenter.zone}</Badge>
                    </div>
                  </div>
                  {selectedCenter.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{selectedCenter.phone}</p>
                      </div>
                    </div>
                  )}
                  {selectedCenter.email && (
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{selectedCenter.email}</p>
                      </div>
                    </div>
                  )}
                  {selectedCenter.activities.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Activities</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedCenter.activities.map((a) => (
                          <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedCenter.location?.coordinates && (
                    <div className="pt-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCenter.location.coordinates[1]},${selectedCenter.location.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <MapPin className="h-3 w-3" /> Get Directions on Google Maps
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
              <DialogFooter className="flex justify-between sm:justify-between">
                <Button
                  variant="destructive"
                  onClick={() => { setDetailsOpen(false); handleDelete(selectedCenter._id); }}
                >
                  <Trash className="mr-2 h-4 w-4" /> Delete
                </Button>
                <Button asChild>
                  <Link href={`/dashboard/centers/${selectedCenter._id}`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Center
                  </Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the center from the locator. This action can be undone by an administrator.
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

---

## Task 5: Admin Dashboard -- Center Form (Create & Edit)

**Files:**
- Create: `dashboard-next/src/app/dashboard/centers/center-form.tsx`
- Create: `dashboard-next/src/app/dashboard/centers/new/page.tsx`
- Create: `dashboard-next/src/app/dashboard/centers/[id]/page.tsx`

- [ ] **Step 1: Create the center form component**

```tsx
// dashboard-next/src/app/dashboard/centers/center-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import Image from 'next/image';

interface CenterFormProps {
  initialData?: {
    _id?: string;
    name?: string;
    centerType?: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    zone?: string;
    location?: { coordinates: [number, number] };
    contactPerson?: string;
    phone?: string;
    email?: string;
    photo?: string;
    activities?: string[];
    establishedYear?: number;
    capacity?: number;
    isActive?: boolean;
  };
}

interface CenterFormData {
  name: string;
  centerType: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  zone: string;
  latitude: string;
  longitude: string;
  contactPerson: string;
  phone: string;
  email: string;
  activities: string;
  establishedYear: string;
  capacity: string;
  photo?: FileList;
}

export function CenterForm({ initialData }: CenterFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.photo || null);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [selectedZone, setSelectedZone] = useState(initialData?.zone || '');
  const [selectedType, setSelectedType] = useState(initialData?.centerType || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CenterFormData>({
    defaultValues: {
      name: initialData?.name || '',
      centerType: initialData?.centerType || '',
      description: initialData?.description || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      country: initialData?.country || 'India',
      pincode: initialData?.pincode || '',
      zone: initialData?.zone || '',
      latitude: initialData?.location?.coordinates?.[1]?.toString() || '',
      longitude: initialData?.location?.coordinates?.[0]?.toString() || '',
      contactPerson: initialData?.contactPerson || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      activities: initialData?.activities?.join(', ') || 'Satsang, Meditation',
      establishedYear: initialData?.establishedYear?.toString() || '',
      capacity: initialData?.capacity?.toString() || '',
    },
  });

  const photoFile = watch('photo');
  if (photoFile && photoFile[0] && !imagePreview?.includes(photoFile[0].name)) {
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(photoFile[0]);
  }

  const onSubmit: SubmitHandler<CenterFormData> = async (data) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();

      formData.append('name', data.name);
      formData.append('centerType', selectedType);
      formData.append('description', data.description);
      formData.append('address', data.address);
      formData.append('city', data.city);
      formData.append('state', data.state);
      formData.append('country', data.country);
      formData.append('pincode', data.pincode);
      formData.append('zone', selectedZone);
      formData.append('latitude', data.latitude);
      formData.append('longitude', data.longitude);
      formData.append('contactPerson', data.contactPerson);
      formData.append('phone', data.phone);
      formData.append('email', data.email);
      formData.append('activities', data.activities);
      formData.append('isActive', String(isActive));
      if (data.establishedYear) formData.append('establishedYear', data.establishedYear);
      if (data.capacity) formData.append('capacity', data.capacity);

      if (data.photo && data.photo[0]) {
        formData.append('photo', data.photo[0]);
      }

      if (initialData?._id) {
        await axios.put(`/api/centers/${initialData._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Center updated successfully');
      } else {
        await axios.post('/api/centers', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Center created successfully');
      }

      router.push('/dashboard/centers');
    } catch (error) {
      console.error('Error saving center:', error);
      toast.error('Failed to save center. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="name">Center Name *</Label>
            <Input id="name" {...register('name', { required: 'Center name is required' })} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-3">
              <Label>Center Type *</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ashram">Ashram</SelectItem>
                  <SelectItem value="satsang_center">Satsang Center</SelectItem>
                  <SelectItem value="meditation_center">Meditation Center</SelectItem>
                  <SelectItem value="study_center">Study Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label>Zone *</Label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="north">North India</SelectItem>
                  <SelectItem value="south">South India</SelectItem>
                  <SelectItem value="east">East India</SelectItem>
                  <SelectItem value="west">West India</SelectItem>
                  <SelectItem value="central">Central India</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} rows={3} />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={isActive} onCheckedChange={setIsActive} id="isActive" />
            <Label htmlFor="isActive">Active (visible on website/app)</Label>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="address">Address *</Label>
            <Textarea id="address" {...register('address', { required: 'Address is required' })} rows={2} />
            {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-3">
              <Label htmlFor="city">City *</Label>
              <Input id="city" {...register('city', { required: 'City is required' })} />
              {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="state">State *</Label>
              <Input id="state" {...register('state', { required: 'State is required' })} />
              {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...register('country')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-3">
              <Label htmlFor="pincode">Pin Code</Label>
              <Input id="pincode" {...register('pincode')} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="latitude">Latitude *</Label>
              <Input id="latitude" type="number" step="any" {...register('latitude', { required: 'Latitude is required' })} />
              {errors.latitude && <p className="text-sm text-red-500">{errors.latitude.message}</p>}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input id="longitude" type="number" step="any" {...register('longitude', { required: 'Longitude is required' })} />
              {errors.longitude && <p className="text-sm text-red-500">{errors.longitude.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-3">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input id="contactPerson" {...register('contactPerson')} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" {...register('phone')} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities & Details */}
      <Card>
        <CardHeader>
          <CardTitle>Activities & Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="activities">Activities (comma-separated)</Label>
            <Input id="activities" {...register('activities')} placeholder="Satsang, Meditation, Yoga, Kirtan" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-3">
              <Label htmlFor="establishedYear">Established Year</Label>
              <Input id="establishedYear" type="number" {...register('establishedYear')} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="capacity">Capacity (people)</Label>
              <Input id="capacity" type="number" {...register('capacity')} />
            </div>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="photo">Center Photo</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              {...register('photo', {
                validate: {
                  fileSize: (v) => (!v?.[0] || v[0].size <= 5 * 1024 * 1024) || 'File must be under 5MB',
                  fileType: (v) => (!v?.[0] || v[0].type.startsWith('image/')) || 'Must be an image',
                },
              })}
            />
            {errors.photo && <p className="text-sm text-red-500">{errors.photo.message}</p>}
            {imagePreview && (
              <div className="mt-2 rounded border p-2">
                <div className="relative h-40 w-full">
                  <Image src={imagePreview} alt="Center preview" className="object-cover rounded" fill sizes="(max-width: 768px) 100vw, 400px" onError={() => setImagePreview(null)} />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push('/dashboard/centers')} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData?._id ? 'Update Center' : 'Create Center'}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Create the new center page**

```tsx
// dashboard-next/src/app/dashboard/centers/new/page.tsx
import { CenterForm } from '../center-form';

export default function NewCenterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">Add New Center</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Register a new Prabhu Premi Sangh center or ashram.
        </p>
      </div>
      <CenterForm />
    </div>
  );
}
```

- [ ] **Step 3: Create the edit center page**

```tsx
// dashboard-next/src/app/dashboard/centers/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { CenterForm } from '../center-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditCenterPage() {
  const { id } = useParams();
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCenter() {
      try {
        const response = await axios.get(`/api/centers/${id}`);
        if (response.data.success) {
          setCenter(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error('Error fetching center:', err);
        setError('Failed to load center details.');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchCenter();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !center) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2">Center not found</h2>
        <p className="text-muted-foreground">{error || 'The requested center could not be loaded.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">Edit Center</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Update center information and details.
        </p>
      </div>
      <CenterForm initialData={center} />
    </div>
  );
}
```

---

## Task 6: Website -- Center Locator Page & Components

**Files:**
- Create: `website/app/centers/page.tsx`
- Create: `website/components/sections/CenterLocator.tsx`
- Create: `website/components/ui/CenterCard.tsx`
- Create: `website/components/ui/ZoneFilter.tsx`
- Create: `website/components/ui/CenterSearchBar.tsx`

- [ ] **Step 1: Create the CenterSearchBar component**

```tsx
// website/components/ui/CenterSearchBar.tsx
'use client';

import { useState, useCallback } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface CenterSearchBarProps {
  onSearch: (query: string) => void;
  onLocateMe: () => void;
  isLocating: boolean;
}

export function CenterSearchBar({ onSearch, onLocateMe, isLocating }: CenterSearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch(query.trim());
    },
    [query, onSearch]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center bg-white rounded-xl shadow-temple border border-gold-400/30 overflow-hidden">
        <div className="pl-5 text-spiritual-warmGray">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by city, state, or pin code..."
          className="flex-1 px-4 py-4 text-base font-body text-spiritual-maroon bg-transparent outline-none placeholder:text-spiritual-warmGray/60"
        />
        <button
          type="button"
          onClick={onLocateMe}
          disabled={isLocating}
          className="flex items-center gap-2 px-4 py-2 mr-2 text-sm font-medium text-spiritual-saffron border border-spiritual-saffron/30 rounded-lg hover:bg-spiritual-saffron/10 transition-colors disabled:opacity-50"
          title="Find nearest center using your location"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Near Me</span>
        </button>
        <button
          type="submit"
          className="px-6 py-4 bg-gradient-to-r from-spiritual-saffron to-primary-600 text-white font-medium hover:from-primary-600 hover:to-spiritual-saffron transition-all duration-300"
        >
          Search
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Create the ZoneFilter component**

```tsx
// website/components/ui/ZoneFilter.tsx
'use client';

import { motion } from 'framer-motion';

interface Zone {
  id: string;
  label: string;
  icon: string;
}

const zones: Zone[] = [
  { id: '', label: 'All', icon: '🕉' },
  { id: 'north', label: 'North', icon: '🏔' },
  { id: 'south', label: 'South', icon: '🌴' },
  { id: 'east', label: 'East', icon: '🌅' },
  { id: 'west', label: 'West', icon: '🌊' },
  { id: 'central', label: 'Central', icon: '🏛' },
  { id: 'international', label: 'International', icon: '🌍' },
];

interface ZoneFilterProps {
  activeZone: string;
  onZoneChange: (zone: string) => void;
  centerCounts?: Record<string, number>;
}

export function ZoneFilter({ activeZone, onZoneChange, centerCounts }: ZoneFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {zones.map((zone) => (
        <motion.button
          key={zone.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onZoneChange(zone.id)}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border
            ${
              activeZone === zone.id
                ? 'bg-gradient-to-r from-spiritual-saffron to-primary-600 text-white border-transparent shadow-warm'
                : 'bg-white text-spiritual-maroon border-gold-400/30 hover:border-gold-400/60 hover:shadow-warm'
            }
          `}
        >
          <span className="text-base">{zone.icon}</span>
          <span>{zone.label}</span>
          {centerCounts && centerCounts[zone.id || 'all'] !== undefined && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeZone === zone.id
                  ? 'bg-white/20 text-white'
                  : 'bg-gold-100 text-gold-700'
              }`}
            >
              {centerCounts[zone.id || 'all']}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create the CenterCard component**

```tsx
// website/components/ui/CenterCard.tsx
'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, ArrowRight, Navigation } from 'lucide-react';

interface CenterCardProps {
  center: {
    _id: string;
    name: string;
    centerType: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zone: string;
    phone: string;
    activities: string[];
    location: { coordinates: [number, number] };
    distanceInKm?: number;
    openingHours?: Array<{
      day: string;
      open: string;
      close: string;
      isClosed: boolean;
    }>;
    photo?: string;
  };
  index: number;
}

const typeLabels: Record<string, string> = {
  ashram: 'Ashram',
  satsang_center: 'Satsang Center',
  meditation_center: 'Meditation Center',
  study_center: 'Study Center',
};

const typeColors: Record<string, string> = {
  ashram: 'from-spiritual-saffron to-primary-600',
  satsang_center: 'from-gold-400 to-gold-600',
  meditation_center: 'from-accent-peacock to-teal-700',
  study_center: 'from-spiritual-maroon to-primary-900',
};

function getTodayHours(openingHours?: CenterCardProps['center']['openingHours']) {
  if (!openingHours || openingHours.length === 0) return null;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  return openingHours.find((h) => h.day === today);
}

export function CenterCard({ center, index }: CenterCardProps) {
  const todayHours = getTodayHours(center.openingHours);
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${center.location.coordinates[1]},${center.location.coordinates[0]}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="group card-temple bg-spiritual-cream hover:shadow-glow transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Type Badge Header */}
      <div className={`h-2 bg-gradient-to-r ${typeColors[center.centerType] || 'from-gold-400 to-gold-600'}`} />

      <div className="p-6 flex flex-col flex-grow">
        {/* Type & Distance */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-spiritual-saffron">
            {typeLabels[center.centerType] || center.centerType}
          </span>
          {center.distanceInKm !== undefined && (
            <span className="flex items-center gap-1 text-xs text-spiritual-warmGray bg-gold-50 px-2 py-1 rounded-full">
              <Navigation className="w-3 h-3" />
              {center.distanceInKm} km
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="font-display text-xl text-spiritual-maroon mb-3 group-hover:text-spiritual-saffron transition-colors">
          {center.name}
        </h3>

        {/* Address */}
        <div className="flex items-start gap-2 mb-3 text-sm text-spiritual-warmGray">
          <MapPin className="w-4 h-4 mt-0.5 text-spiritual-saffron flex-shrink-0" />
          <span>{center.address}, {center.city}, {center.state}{center.country !== 'India' ? `, ${center.country}` : ''}</span>
        </div>

        {/* Phone */}
        {center.phone && (
          <div className="flex items-center gap-2 mb-3 text-sm text-spiritual-warmGray">
            <Phone className="w-4 h-4 text-spiritual-saffron flex-shrink-0" />
            <a href={`tel:${center.phone}`} className="hover:text-spiritual-saffron transition-colors">
              {center.phone}
            </a>
          </div>
        )}

        {/* Today's Hours */}
        {todayHours && (
          <div className="flex items-center gap-2 mb-4 text-sm">
            <Clock className="w-4 h-4 text-gold-500 flex-shrink-0" />
            {todayHours.isClosed ? (
              <span className="text-red-500 font-medium">Closed Today</span>
            ) : (
              <span className="text-spiritual-warmGray">
                Today: <span className="font-medium text-spiritual-maroon">{todayHours.open} - {todayHours.close}</span>
              </span>
            )}
          </div>
        )}

        {/* Activities */}
        {center.activities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {center.activities.slice(0, 4).map((activity) => (
              <span
                key={activity}
                className="text-xs px-2.5 py-1 rounded-full bg-gold-50 text-gold-700 border border-gold-200"
              >
                {activity}
              </span>
            ))}
            {center.activities.length > 4 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-50 text-gray-500">
                +{center.activities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Directions CTA */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold w-full justify-center group/btn mt-auto"
        >
          <Navigation className="w-4 h-4 mr-2" />
          Get Directions
          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </a>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 4: Create the CenterLocator section component**

```tsx
// website/components/sections/CenterLocator.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from '../ui/SectionHeading';
import { CenterSearchBar } from '../ui/CenterSearchBar';
import { ZoneFilter } from '../ui/ZoneFilter';
import { CenterCard } from '../ui/CenterCard';
import { Loader2, Building2 } from 'lucide-react';
import api from '../../lib/api';

interface Center {
  _id: string;
  name: string;
  centerType: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zone: string;
  phone: string;
  email: string;
  activities: string[];
  location: { coordinates: [number, number] };
  distanceInKm?: number;
  openingHours?: Array<{ day: string; open: string; close: string; isClosed: boolean }>;
  photo?: string;
}

export function CenterLocator() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [activeZone, setActiveZone] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [centerCounts, setCenterCounts] = useState<Record<string, number>>({});

  // Initial load: fetch all centers
  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async (zone?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (zone) params.set('zone', zone);
      params.set('limit', '100');

      const response = await api.get(`/centers?${params.toString()}`);
      const data = response.data?.data || response.data || [];
      setCenters(data);
      setResultMessage('');
      setSearchPerformed(false);

      // Calculate zone counts from full dataset
      if (!zone) {
        const counts: Record<string, number> = { all: data.length };
        data.forEach((c: Center) => {
          counts[c.zone] = (counts[c.zone] || 0) + 1;
        });
        setCenterCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching centers:', error);
      setCenters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleZoneChange = useCallback((zone: string) => {
    setActiveZone(zone);
    fetchCenters(zone || undefined);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query) {
      fetchCenters(activeZone || undefined);
      return;
    }

    try {
      setLoading(true);
      setSearchPerformed(true);
      const params = new URLSearchParams({ q: query });
      if (activeZone) params.set('zone', activeZone);

      const response = await api.get(`/centers/search?${params.toString()}`);
      const data = response.data?.data || response.data || [];
      setCenters(data);
      setResultMessage(
        data.length
          ? `Found ${data.length} center(s) for "${query}"`
          : `No centers found for "${query}". Try a different search.`
      );
    } catch (error) {
      console.error('Error searching centers:', error);
      setCenters([]);
      setResultMessage('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeZone]);

  const handleLocateMe = useCallback(async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setSearchPerformed(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          setLoading(true);
          const { latitude, longitude } = position.coords;
          const response = await api.get(
            `/centers/nearest?lat=${latitude}&lng=${longitude}&maxDistance=200&limit=12`
          );
          const data = response.data?.data || response.data || [];
          setCenters(data);
          setResultMessage(
            data.length
              ? `Found ${data.length} center(s) near your location`
              : 'No centers found nearby. Try increasing the search area.'
          );
        } catch (error) {
          console.error('Error finding nearest centers:', error);
          setResultMessage('Failed to find nearby centers.');
        } finally {
          setLoading(false);
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLocating(false);
        alert('Unable to access your location. Please allow location access and try again.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return (
    <section className="section-padding bg-spiritual-warmWhite min-h-screen">
      <div className="container-custom">
        <SectionHeading
          title="Find a Center Near You"
          subtitle="Locate Prabhu Premi Sangh ashrams, satsang centers, and meditation centers across India and around the world"
        />

        {/* Search Bar */}
        <div className="mb-8">
          <CenterSearchBar
            onSearch={handleSearch}
            onLocateMe={handleLocateMe}
            isLocating={isLocating}
          />
        </div>

        {/* Zone Filters */}
        <div className="mb-10">
          <ZoneFilter
            activeZone={activeZone}
            onZoneChange={handleZoneChange}
            centerCounts={centerCounts}
          />
        </div>

        {/* Result message */}
        {searchPerformed && resultMessage && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-spiritual-warmGray font-body mb-8"
          >
            {resultMessage}
          </motion.p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-spiritual-saffron animate-spin mb-4" />
            <p className="text-spiritual-warmGray font-body">Finding centers...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && centers.length === 0 && (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-gold-400 mx-auto mb-4" />
            <h3 className="font-display text-2xl text-spiritual-maroon mb-2">No Centers Found</h3>
            <p className="text-spiritual-warmGray font-body">
              Try searching with a different term or selecting another zone.
            </p>
          </div>
        )}

        {/* Centers Grid */}
        {!loading && centers.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {centers.map((center, index) => (
              <CenterCard key={center._id} center={center} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create the centers page**

```tsx
// website/app/centers/page.tsx
import { Metadata } from 'next';
import { CenterLocator } from '@/components/sections/CenterLocator';

export const metadata: Metadata = {
  title: 'Find a Center | Prabhu Premi Sangh - Swami Avdheshanand Giri Ji Maharaj',
  description:
    'Locate the nearest Prabhu Premi Sangh center, ashram, or meditation center. Find satsang, meditation, and spiritual study centers across India and internationally.',
  keywords:
    'Prabhu Premi Sangh centers, ashram locator, satsang center, meditation center near me, Swami Avdheshanand Giri, spiritual center India',
};

export default function CentersPage() {
  return (
    <main>
      <CenterLocator />
    </main>
  );
}
```

---

## Task 7: Website -- Add Center Locator link to home page

**Files:**
- Modify: `website/app/page.tsx`

- [ ] **Step 1: Add CenterLocator navigation link in the home page sections**

In `website/app/page.tsx`, add a new divider and a brief "Find a Center" call-to-action after the `GlobalPresence` section. Insert between the `<GlobalPresence />` closing tag and the subsequent divider.

```tsx
// In website/app/page.tsx, add this import at the top:
import Link from 'next/link';

// Then replace the block after <GlobalPresence /> section:
// BEFORE:
//   <GlobalPresence />
//   <div className="section-divider-lotus">
//     <span className="text-gold-500 text-2xl font-sanskrit">॥</span>
//   </div>
//   <Gallery />

// AFTER:
//   <GlobalPresence />
//   {/* Center Locator CTA */}
//   <section className="py-12 bg-gradient-to-r from-spiritual-cream via-gold-50 to-spiritual-cream">
//     <div className="container-custom text-center">
//       <h3 className="font-display text-2xl text-spiritual-maroon mb-3">Find a Center Near You</h3>
//       <p className="font-body text-spiritual-warmGray mb-6 max-w-xl mx-auto">
//         Discover Prabhu Premi Sangh ashrams and satsang centers across India and around the world.
//       </p>
//       <Link
//         href="/centers"
//         className="btn-primary inline-flex items-center gap-2"
//       >
//         Explore Centers
//       </Link>
//     </div>
//   </section>
//   <div className="section-divider-lotus">
//     <span className="text-gold-500 text-2xl font-sanskrit">॥</span>
//   </div>
//   <Gallery />
```

---

## Task 8: Mobile App -- Center Finder Screen

**Files:**
- Create: `mobile/user-app/src/screens/centers/CenterFinderScreen.tsx`
- Create: `mobile/user-app/src/screens/centers/CenterDetailScreen.tsx`
- Modify: `mobile/user-app/src/navigation/AppNavigator.tsx`

- [ ] **Step 1: Create the CenterFinderScreen**

```tsx
// mobile/user-app/src/screens/centers/CenterFinderScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Linking, Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as Location from 'expo-location';
import api from '../../services/api';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface Center {
  _id: string;
  name: string;
  centerType: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zone: string;
  phone: string;
  activities: string[];
  location: { coordinates: [number, number] };
  distanceInKm?: number;
}

type ZoneKey = '' | 'north' | 'south' | 'east' | 'west' | 'central' | 'international';

const ZONES: { key: ZoneKey; label: string }[] = [
  { key: '', label: 'All' },
  { key: 'north', label: 'North' },
  { key: 'south', label: 'South' },
  { key: 'east', label: 'East' },
  { key: 'west', label: 'West' },
  { key: 'central', label: 'Central' },
  { key: 'international', label: 'Intl' },
];

const typeLabels: Record<string, string> = {
  ashram: 'Ashram',
  satsang_center: 'Satsang',
  meditation_center: 'Meditation',
  study_center: 'Study',
};

const typeIcons: Record<string, React.ComponentProps<typeof Icon>['name']> = {
  ashram: 'home-city',
  satsang_center: 'account-group',
  meditation_center: 'meditation',
  study_center: 'book-open-variant',
};

export function CenterFinderScreen() {
  const navigation = useNavigation<any>();
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeZone, setActiveZone] = useState<ZoneKey>('');

  const fetchCenters = useCallback(async (zone?: string) => {
    try {
      const params = new URLSearchParams();
      if (zone) params.set('zone', zone);
      params.set('limit', '100');
      const response = await api.get(`/centers?${params.toString()}`);
      setCenters(response.data || []);
    } catch (error) {
      console.error('Error fetching centers:', error);
      setCenters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchCenters(activeZone || undefined);
  }, [activeZone, fetchCenters]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      fetchCenters(activeZone || undefined);
      return;
    }
    try {
      setLoading(true);
      const params = new URLSearchParams({ q: searchQuery.trim() });
      if (activeZone) params.set('zone', activeZone);
      const response = await api.get(`/centers/search?${params.toString()}`);
      setCenters(response.data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeZone, fetchCenters]);

  const handleNearMe = useCallback(async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location services to find nearby centers.');
        setLocating(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLoading(true);
      const response = await api.get(
        `/centers/nearest?lat=${loc.coords.latitude}&lng=${loc.coords.longitude}&maxDistance=200&limit=15`
      );
      setCenters(response.data || []);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Unable to find your location. Please try again.');
    } finally {
      setLocating(false);
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCenters(activeZone || undefined);
    setRefreshing(false);
  }, [activeZone, fetchCenters]);

  const openDirections = (center: Center) => {
    const lat = center.location.coordinates[1];
    const lng = center.location.coordinates[0];
    const url = Platform.select({
      ios: `maps:0,0?daddr=${lat},${lng}`,
      android: `google.navigation:q=${lat},${lng}`,
    }) || `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  const renderCenter = ({ item }: { item: Center }) => (
    <TouchableOpacity
      style={styles.centerCard}
      onPress={() => navigation.navigate('CenterDetail', { centerId: item._id })}
      activeOpacity={0.8}
    >
      {/* Type badge */}
      <View style={styles.typeRow}>
        <View style={styles.typeBadge}>
          <Icon
            name={typeIcons[item.centerType] || 'map-marker'}
            size={14}
            color={colors.primary.saffron}
          />
          <Text style={styles.typeText}>{typeLabels[item.centerType] || item.centerType}</Text>
        </View>
        {item.distanceInKm !== undefined && (
          <Text style={styles.distanceText}>{item.distanceInKm} km</Text>
        )}
      </View>

      {/* Name */}
      <Text style={styles.centerName} numberOfLines={2}>{item.name}</Text>

      {/* Address */}
      <View style={styles.infoRow}>
        <Icon name="map-marker" size={16} color={colors.primary.saffron} />
        <Text style={styles.infoText} numberOfLines={2}>
          {item.city}, {item.state}{item.country !== 'India' ? `, ${item.country}` : ''}
        </Text>
      </View>

      {/* Phone */}
      {item.phone ? (
        <View style={styles.infoRow}>
          <Icon name="phone" size={16} color={colors.primary.saffron} />
          <Text style={styles.infoText}>{item.phone}</Text>
        </View>
      ) : null}

      {/* Activities */}
      {item.activities.length > 0 && (
        <View style={styles.activitiesRow}>
          {item.activities.slice(0, 3).map((a) => (
            <View key={a} style={styles.activityBadge}>
              <Text style={styles.activityText}>{a}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Directions button */}
      <TouchableOpacity style={styles.directionsBtn} onPress={() => openDirections(item)}>
        <Icon name="directions" size={18} color={colors.text.white} />
        <Text style={styles.directionsBtnText}>Get Directions</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search city, state, pin code..."
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); fetchCenters(activeZone || undefined); }}>
              <Icon name="close" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.nearMeBtn} onPress={handleNearMe} disabled={locating}>
          {locating ? (
            <ActivityIndicator size="small" color={colors.text.white} />
          ) : (
            <Icon name="crosshairs-gps" size={20} color={colors.text.white} />
          )}
        </TouchableOpacity>
      </View>

      {/* Zone Filters */}
      <View style={styles.zoneContainer}>
        <FlatList
          horizontal
          data={ZONES}
          keyExtractor={(item) => item.key || 'all'}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.zoneList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.zoneTab, activeZone === item.key && styles.zoneTabActive]}
              onPress={() => setActiveZone(item.key)}
            >
              <Text style={[styles.zoneText, activeZone === item.key && styles.zoneTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.saffron} />
          <Text style={styles.loadingText}>Finding centers...</Text>
        </View>
      ) : (
        <FlatList
          data={centers}
          keyExtractor={(item) => item._id}
          renderItem={renderCenter}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary.saffron]}
              tintColor={colors.primary.saffron}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="map-marker-off" size={48} color={colors.text.secondary} />
              <Text style={styles.emptyTitle}>No Centers Found</Text>
              <Text style={styles.emptySubtitle}>Try a different search or zone filter</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.parchment,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.background.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.gold as string,
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.parchment,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  nearMeBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.saffron,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneContainer: {
    backgroundColor: colors.background.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.gold as string,
  },
  zoneList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  zoneTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.sandstone,
  },
  zoneTabActive: {
    backgroundColor: colors.primary.saffron,
  },
  zoneText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  zoneTextActive: {
    color: colors.text.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.text.secondary,
  },
  listContainer: {
    padding: spacing.md,
  },
  centerCard: {
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    ...shadows.warm,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary.saffron,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  distanceText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  centerName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  activitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  activityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.cream,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
  },
  activityText: {
    fontSize: 11,
    color: colors.gold.dark,
    fontWeight: '500',
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.saffron,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  directionsBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});
```

- [ ] **Step 2: Create the CenterDetailScreen**

```tsx
// mobile/user-app/src/screens/centers/CenterDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Linking, Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../services/api';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface OpeningHour {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

interface CenterDetail {
  _id: string;
  name: string;
  centerType: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  zone: string;
  contactPerson: string;
  phone: string;
  email: string;
  activities: string[];
  openingHours: OpeningHour[];
  location: { coordinates: [number, number] };
  establishedYear?: number;
  capacity?: number;
}

const typeLabels: Record<string, string> = {
  ashram: 'Ashram',
  satsang_center: 'Satsang Center',
  meditation_center: 'Meditation Center',
  study_center: 'Study Center',
};

export function CenterDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { centerId } = route.params;
  const [center, setCenter] = useState<CenterDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get(`/centers/${centerId}`);
        setCenter(response.data || null);
      } catch (error) {
        console.error('Error fetching center:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [centerId]);

  const openDirections = () => {
    if (!center) return;
    const lat = center.location.coordinates[1];
    const lng = center.location.coordinates[0];
    const url = Platform.select({
      ios: `maps:0,0?daddr=${lat},${lng}`,
      android: `google.navigation:q=${lat},${lng}`,
    }) || `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary.saffron} />
      </View>
    );
  }

  if (!center) {
    return (
      <View style={[styles.container, styles.center]}>
        <Icon name="alert-circle-outline" size={48} color={colors.text.secondary} />
        <Text style={styles.errorText}>Center not found</Text>
      </View>
    );
  }

  const todayIndex = new Date().getDay();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[todayIndex];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color={colors.text.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Center Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Name & Type */}
        <Text style={styles.centerName}>{center.name}</Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{typeLabels[center.centerType] || center.centerType}</Text>
        </View>

        {center.description ? (
          <Text style={styles.description}>{center.description}</Text>
        ) : null}

        {/* Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="map-marker" size={20} color={colors.primary.saffron} />
            <Text style={styles.cardTitle}>Address</Text>
          </View>
          <Text style={styles.cardText}>{center.address}</Text>
          <Text style={styles.cardText}>
            {center.city}, {center.state} {center.pincode}
          </Text>
          <Text style={styles.cardText}>{center.country}</Text>
          <TouchableOpacity style={styles.directionsBtn} onPress={openDirections}>
            <Icon name="directions" size={18} color={colors.text.white} />
            <Text style={styles.directionsBtnText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Card */}
        {(center.contactPerson || center.phone || center.email) && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="account" size={20} color={colors.primary.saffron} />
              <Text style={styles.cardTitle}>Contact</Text>
            </View>
            {center.contactPerson ? <Text style={styles.cardText}>{center.contactPerson}</Text> : null}
            {center.phone ? (
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${center.phone}`)}>
                <View style={styles.contactRow}>
                  <Icon name="phone" size={16} color={colors.gold.main} />
                  <Text style={styles.contactLink}>{center.phone}</Text>
                </View>
              </TouchableOpacity>
            ) : null}
            {center.email ? (
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${center.email}`)}>
                <View style={styles.contactRow}>
                  <Icon name="email" size={16} color={colors.gold.main} />
                  <Text style={styles.contactLink}>{center.email}</Text>
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {/* Opening Hours */}
        {center.openingHours && center.openingHours.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="clock-outline" size={20} color={colors.primary.saffron} />
              <Text style={styles.cardTitle}>Opening Hours</Text>
            </View>
            {center.openingHours.map((h) => (
              <View
                key={h.day}
                style={[styles.hoursRow, h.day === todayName && styles.hoursRowToday]}
              >
                <Text style={[styles.dayText, h.day === todayName && styles.dayTextToday]}>
                  {h.day}
                </Text>
                <Text style={[styles.timeText, h.isClosed && styles.closedText]}>
                  {h.isClosed ? 'Closed' : `${h.open} - ${h.close}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Activities */}
        {center.activities.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="yoga" size={20} color={colors.primary.saffron} />
              <Text style={styles.cardTitle}>Activities</Text>
            </View>
            <View style={styles.activitiesWrap}>
              {center.activities.map((a) => (
                <View key={a} style={styles.activityChip}>
                  <Text style={styles.activityChipText}>{a}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.parchment,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.primary.maroon,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.white,
  },
  content: {
    padding: spacing.md,
  },
  centerName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.saffron,
    marginBottom: spacing.md,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    ...shadows.warm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  cardText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 2,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.saffron,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  directionsBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.white,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  contactLink: {
    fontSize: 14,
    color: colors.gold.dark,
    fontWeight: '500',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 160, 23, 0.1)',
  },
  hoursRowToday: {
    backgroundColor: 'rgba(255, 107, 0, 0.05)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    marginHorizontal: -spacing.sm,
  },
  dayText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  dayTextToday: {
    fontWeight: '700',
    color: colors.primary.saffron,
  },
  timeText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  closedText: {
    color: colors.primary.deepRed,
  },
  activitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  activityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.cream,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
  },
  activityChipText: {
    fontSize: 13,
    color: colors.gold.dark,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});
```

- [ ] **Step 3: Update the mobile navigation to include center screens**

In `mobile/user-app/src/navigation/AppNavigator.tsx`:

Add to imports:
```tsx
import { CenterFinderScreen } from '../screens/centers/CenterFinderScreen';
import { CenterDetailScreen } from '../screens/centers/CenterDetailScreen';
```

Add to `RootStackParamList`:
```tsx
CenterFinder: undefined;
CenterDetail: { centerId: string };
```

Add these screens inside the `<Stack.Navigator>` after the existing detail screens (before the closing `</Stack.Navigator>`):
```tsx
<Stack.Screen
  name="CenterFinder"
  component={CenterFinderScreen}
  options={{
    headerShown: true,
    headerTitle: 'Find a Center',
    headerStyle: { backgroundColor: colors.background.warmWhite },
    headerTintColor: colors.primary.maroon,
    animation: 'slide_from_right',
  }}
/>
<Stack.Screen
  name="CenterDetail"
  component={CenterDetailScreen}
  options={{
    headerShown: false,
    animation: 'slide_from_right',
  }}
/>
```

- [ ] **Step 4: Create the barrel export for center screens**

```tsx
// mobile/user-app/src/screens/centers/index.ts
export { CenterFinderScreen } from './CenterFinderScreen';
export { CenterDetailScreen } from './CenterDetailScreen';
```

---

## Task 9: Install expo-location dependency in mobile app

**Files:** (no new files)

- [ ] **Step 1: Install expo-location in the mobile user app**

```bash
cd mobile/user-app && npx expo install expo-location
```

---

## Task 10: Seed data script for testing

**Files:**
- Create: `dashboard-next/scripts/seed-centers.ts`

- [ ] **Step 1: Create a seed script with sample center data**

```typescript
// dashboard-next/scripts/seed-centers.ts
// Run with: npx ts-node --esm scripts/seed-centers.ts
// Or: npx tsx scripts/seed-centers.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || '';

const centerSchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    centerType: String,
    description: String,
    address: String,
    city: String,
    state: String,
    country: { type: String, default: 'India' },
    pincode: String,
    zone: String,
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number],
    },
    contactPerson: String,
    phone: String,
    email: String,
    photo: String,
    activities: [String],
    openingHours: [
      {
        day: String,
        open: String,
        close: String,
        isClosed: Boolean,
      },
    ],
    upcomingEvents: [mongoose.Schema.Types.ObjectId],
    establishedYear: Number,
    capacity: Number,
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

centerSchema.index({ location: '2dsphere' });

const Center = mongoose.model('Center', centerSchema);

const defaultHours = [
  { day: 'Monday', open: '06:00', close: '20:00', isClosed: false },
  { day: 'Tuesday', open: '06:00', close: '20:00', isClosed: false },
  { day: 'Wednesday', open: '06:00', close: '20:00', isClosed: false },
  { day: 'Thursday', open: '06:00', close: '20:00', isClosed: false },
  { day: 'Friday', open: '06:00', close: '20:00', isClosed: false },
  { day: 'Saturday', open: '06:00', close: '20:00', isClosed: false },
  { day: 'Sunday', open: '05:00', close: '21:00', isClosed: false },
];

const sampleCenters = [
  {
    name: 'Prabhu Premi Sangh Ashram, Kankhal',
    slug: 'prabhu-premi-sangh-ashram-kankhal',
    centerType: 'ashram',
    description: 'The main ashram of Prabhu Premi Sangh in the sacred city of Haridwar. A center for spiritual learning and sadhana under the guidance of Swami Avdheshanand Giri Ji Maharaj.',
    address: 'Kankhal Road, Near Daksha Mandir',
    city: 'Haridwar',
    state: 'Uttarakhand',
    country: 'India',
    pincode: '249408',
    zone: 'north',
    location: { type: 'Point', coordinates: [78.1460, 29.9291] },
    contactPerson: 'Ashram Office',
    phone: '+91-1334-244567',
    email: 'kankhal@prabhupremisangh.org',
    activities: ['Satsang', 'Meditation', 'Yoga', 'Kirtan', 'Vedanta Study', 'Annadaan'],
    openingHours: defaultHours,
    establishedYear: 1985,
    capacity: 500,
  },
  {
    name: 'Delhi Satsang Center',
    slug: 'delhi-satsang-center',
    centerType: 'satsang_center',
    description: 'A vibrant satsang center in the national capital serving the spiritual needs of devotees in Delhi-NCR.',
    address: 'C-45, Sector 12, Dwarka',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    pincode: '110075',
    zone: 'north',
    location: { type: 'Point', coordinates: [77.0369, 28.5901] },
    contactPerson: 'Shri Ramesh Kumar',
    phone: '+91-11-25083456',
    email: 'delhi@prabhupremisangh.org',
    activities: ['Satsang', 'Meditation', 'Kirtan', 'Youth Programs'],
    openingHours: defaultHours,
    establishedYear: 2005,
    capacity: 200,
  },
  {
    name: 'Mumbai Meditation Center',
    slug: 'mumbai-meditation-center',
    centerType: 'meditation_center',
    description: 'A peaceful meditation center in the heart of Mumbai offering daily meditation sessions and weekly satsang.',
    address: '12-B, Juhu Tara Road, Juhu',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400049',
    zone: 'west',
    location: { type: 'Point', coordinates: [72.8296, 19.1075] },
    contactPerson: 'Smt. Priya Desai',
    phone: '+91-22-26105678',
    email: 'mumbai@prabhupremisangh.org',
    activities: ['Meditation', 'Satsang', 'Pranayama', 'Stress Management'],
    openingHours: defaultHours,
    establishedYear: 2010,
    capacity: 150,
  },
  {
    name: 'Jaipur Satsang Center',
    slug: 'jaipur-satsang-center',
    centerType: 'satsang_center',
    description: 'Weekly satsang and spiritual discussions in the Pink City.',
    address: '34, Malviya Nagar, Near Central Park',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    pincode: '302017',
    zone: 'north',
    location: { type: 'Point', coordinates: [75.7873, 26.8550] },
    contactPerson: 'Shri Suresh Sharma',
    phone: '+91-141-2721234',
    email: 'jaipur@prabhupremisangh.org',
    activities: ['Satsang', 'Meditation', 'Kirtan'],
    openingHours: defaultHours,
    establishedYear: 2008,
    capacity: 100,
  },
  {
    name: 'Bengaluru Study Center',
    slug: 'bengaluru-study-center',
    centerType: 'study_center',
    description: 'Dedicated to the study of Vedanta, Sanskrit, and sacred texts under scholarly guidance.',
    address: '78, Jayanagar 4th Block',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    pincode: '560041',
    zone: 'south',
    location: { type: 'Point', coordinates: [77.5946, 12.9352] },
    contactPerson: 'Dr. Venkatesh Murthy',
    phone: '+91-80-26643210',
    email: 'bengaluru@prabhupremisangh.org',
    activities: ['Vedanta Study', 'Sanskrit Classes', 'Meditation', 'Discourse Series'],
    openingHours: defaultHours,
    establishedYear: 2012,
    capacity: 80,
  },
  {
    name: 'Kolkata Satsang Center',
    slug: 'kolkata-satsang-center',
    centerType: 'satsang_center',
    description: 'A spiritual haven in the City of Joy, offering regular satsang and devotional gatherings.',
    address: '22, Southern Avenue, Kalighat',
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    pincode: '700026',
    zone: 'east',
    location: { type: 'Point', coordinates: [88.3432, 22.5228] },
    contactPerson: 'Shri Anil Chatterjee',
    phone: '+91-33-24615432',
    email: 'kolkata@prabhupremisangh.org',
    activities: ['Satsang', 'Kirtan', 'Meditation', 'Charitable Activities'],
    openingHours: defaultHours,
    establishedYear: 2007,
    capacity: 120,
  },
  {
    name: 'Bhopal Meditation Center',
    slug: 'bhopal-meditation-center',
    centerType: 'meditation_center',
    description: 'A serene meditation space in the heart of India, serving devotees across Madhya Pradesh.',
    address: '45, Shivaji Nagar, Near Upper Lake',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    country: 'India',
    pincode: '462016',
    zone: 'central',
    location: { type: 'Point', coordinates: [77.4126, 23.2599] },
    contactPerson: 'Shri Rajendra Tiwari',
    phone: '+91-755-2550123',
    email: 'bhopal@prabhupremisangh.org',
    activities: ['Meditation', 'Satsang', 'Yoga', 'Pranayama'],
    openingHours: defaultHours,
    establishedYear: 2015,
    capacity: 75,
  },
  {
    name: 'London Satsang Center',
    slug: 'london-satsang-center',
    centerType: 'satsang_center',
    description: 'The UK hub of Prabhu Premi Sangh, connecting the Indian diaspora with their spiritual roots.',
    address: '15 Ealing Broadway, Ealing',
    city: 'London',
    state: 'England',
    country: 'United Kingdom',
    pincode: 'W5 5JY',
    zone: 'international',
    location: { type: 'Point', coordinates: [-0.3013, 51.5130] },
    contactPerson: 'Dr. Arvind Patel',
    phone: '+44-20-89971234',
    email: 'london@prabhupremisangh.org',
    activities: ['Satsang', 'Meditation', 'Cultural Programs', 'Youth Sessions'],
    openingHours: [
      { day: 'Monday', open: '18:00', close: '21:00', isClosed: false },
      { day: 'Tuesday', open: '00:00', close: '00:00', isClosed: true },
      { day: 'Wednesday', open: '18:00', close: '21:00', isClosed: false },
      { day: 'Thursday', open: '00:00', close: '00:00', isClosed: true },
      { day: 'Friday', open: '18:00', close: '21:00', isClosed: false },
      { day: 'Saturday', open: '10:00', close: '17:00', isClosed: false },
      { day: 'Sunday', open: '09:00', close: '18:00', isClosed: false },
    ],
    establishedYear: 2018,
    capacity: 60,
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    // Clear existing centers
    await Center.deleteMany({});
    console.log('Cleared existing centers.');

    // Insert sample centers
    const result = await Center.insertMany(sampleCenters);
    console.log(`Inserted ${result.length} sample centers.`);

    // Verify 2dsphere index
    await Center.collection.createIndex({ location: '2dsphere' });
    console.log('2dsphere index ensured.');

    console.log('Seeding complete!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
```

---

## Self-Review Checklist

- [ ] **Model Integrity:** The `Center` model includes all required fields (name, address, city, state, country, pincode, zone, contact, coordinates, center type, timings, photo, activities), `isDeleted: boolean` for soft deletes, `timestamps: true`, `2dsphere` index for geo queries, text index for search, and a pre-save hook for slug generation.

- [ ] **API Completeness:** All four API routes are functional -- `GET /api/centers` (list with filters + pagination), `POST /api/centers` (create with Cloudinary upload), `GET/PUT/DELETE /api/centers/[id]` (single center CRUD with soft delete), `GET /api/centers/search` (text + pincode search with zone/type/activity filters), `GET /api/centers/nearest` (MongoDB `$geoNear` aggregation with distance in km). All routes return `{ success, data, message }` format.

- [ ] **Cross-Platform Consistency:** The admin dashboard provides full CRUD with filtering (zone, type, search). The website presents a spiritual-themed center locator with animated zone filters, search bar with GPS "Near Me", and direction-linked cards. The mobile app mirrors the same functionality with `expo-location` for GPS and native maps integration for directions.

- [ ] **Code Pattern Compliance:** All components follow existing project patterns -- dashboard uses shadcn/ui components (Table, Button, Dialog, Select), `react-hook-form`, `axios`, `sonner` toasts; website uses Framer Motion animations, `SectionHeading`, spiritual color classes (`text-spiritual-maroon`, `bg-spiritual-cream`), `font-display`/`font-body` typography; mobile uses the existing `colors`, `spacing`, `borderRadius`, `shadows` theme tokens, `MaterialCommunityIcons`, `FlatList`, and the `api` service with response unwrapping.
