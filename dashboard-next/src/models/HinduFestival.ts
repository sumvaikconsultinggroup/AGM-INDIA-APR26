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
