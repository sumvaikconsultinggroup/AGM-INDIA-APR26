import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface for the Talk model
export interface ITalk extends Document {
  institution: string;
  image?: string;
  date: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for the Talk model
const TalkSchema = new Schema<ITalk>(
  {
    institution: {
      type: String,
      required: [true, 'Institution/Event name is required'],
      trim: true,
      index: true,
    },
    image: {
      type: String,
      default: '/placeholder.svg?height=360&width=480',
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

const Talk: Model<ITalk> = mongoose.models.Talk || mongoose.model<ITalk>('Talk', TalkSchema);

export default Talk;
