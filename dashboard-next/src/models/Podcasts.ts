import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPodcast extends Document {
  title: string;
  description?: string;
  thumbnail: string;
  videoUrl: string;
  videoId?: string;
  coverImage?: string;
  category?: string;
  featured?: boolean;
  date?: Date; // Added date field
  duration?: string; // Added duration field
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PodcastSchema = new Schema<IPodcast>(
  {
    title: {
      type: String,
      required: [true, 'Podcast title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    thumbnail: {
      type: String,
      default: 'assets/Podcast/podcast-placeholder.jpg',
      trim: true,
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
      trim: true,
    },
    videoId: {
      type: String,
      required: [true, 'Video ID is required'],
      unique: true,
      trim: true,
    },
    coverImage: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: String,
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
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

// Add text index for search functionality - include description for better search
PodcastSchema.index({ title: 'text', description: 'text' });

// Fix the "Cannot overwrite model" error by checking if it already exists
const Podcast: Model<IPodcast> =
  mongoose.models.Podcast || mongoose.model<IPodcast>('Podcast', PodcastSchema);

export default Podcast;
