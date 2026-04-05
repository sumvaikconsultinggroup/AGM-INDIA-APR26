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
