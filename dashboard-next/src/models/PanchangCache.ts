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
