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
