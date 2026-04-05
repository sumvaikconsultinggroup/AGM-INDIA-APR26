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
