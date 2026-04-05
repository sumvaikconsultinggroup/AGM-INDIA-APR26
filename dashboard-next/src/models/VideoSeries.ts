import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface for individual videos within a series
 export interface IVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  coverImage?: string;
  youtubeUrl: string;
  description?: string;
  duration?: string;
  publishedAt?: Date;
  views?: number;
  likes?: number;
}

// Base interface without Document extension
export interface IVideoSeriesBase {
  title: string;
  description?: string;
  thumbnail: string;
  coverImage?: string;
  category?: string;
  videoCount: number;
  videos: IVideo[];
  isDeleted?: boolean;
}

// Document interface extends the base interface
export interface IVideoSeries extends Document, IVideoSeriesBase {
  createdAt: Date;
  updatedAt: Date;
}

// Schema for individual videos
const VideoSchema = new Schema(
  {
    videoId: {
      type: String,
      required: [true, 'Video ID is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
    },
    thumbnail: {
      type: String,
      required: [true, 'Video thumbnail is required'],
      trim: true,
    },
    coverImage: {
      type: String,
      trim: true,
    },
    youtubeUrl: {
      type: String,
      required: [true, 'YouTube URL is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    }
  },
  { _id: false }
);

// Main schema for VideoSeries
const VideoSeriesSchema = new Schema<IVideoSeries>(
  {
    title: {
      type: String,
      required: [true, 'Video series title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    thumbnail: {
      type: String,
      default: 'assets/VideoSeries/video-placeholder.jpg',
      trim: true,
    },
    coverImage: {
      type: String,
      default: 'assets/VideoSeries/cover-placeholder.jpg',
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    videoCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    videos: {
      type: [VideoSchema],
      default: [],
      validate: {
        validator: function(videos: IVideo[]) {
          return this.videoCount === videos.length;
        },
        message: 'Video count must match the number of videos in the array'
      }
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

// Add text index for search functionality
VideoSeriesSchema.index({ 
  title: 'text', 
  description: 'text',
  'videos.title': 'text',
  'videos.description': 'text'
});

// Fix the "Cannot overwrite model" error by checking if it already exists
const VideoSeries: Model<IVideoSeries> =
  mongoose.models.VideoSeries || mongoose.model<IVideoSeries>('VideoSeries', VideoSeriesSchema);

export default VideoSeries;
