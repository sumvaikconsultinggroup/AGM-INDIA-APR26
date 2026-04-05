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
