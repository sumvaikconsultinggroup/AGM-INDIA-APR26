import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPrintMedia extends Document {
  title: string;
  image: string;
  link: string;
  description?: string;
  isDeleted?: boolean;
}

const PrintMediaSchema = new Schema<IPrintMedia>(
  {
    title: {
      type: String,
      required: [true, 'Print media title is required'],
      trim: true,
      index: true,
    },
    image: {
      type: String,
      default: 'assets/PrintMedia/print-media-placeholder.jpg',
      trim: true,
    },
    link: {
      type: String,
      required: [true, 'Link is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
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
PrintMediaSchema.index({ title: 'text', description: 'text' });

// Fix the "Cannot overwrite model" error by checking if it already exists
const PrintMedia: Model<IPrintMedia> =
  mongoose.models.PrintMedia || mongoose.model<IPrintMedia>('PrintMedia', PrintMediaSchema);

export default PrintMedia;