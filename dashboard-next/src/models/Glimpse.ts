import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGlimpse {
  image: string;
  isdeleted?: boolean;
}

export interface IGlimpseDocument extends IGlimpse, Document {}

const GlimpseSchema = new Schema<IGlimpseDocument>(
  {
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    isdeleted: {
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

// Index for sorting by creation date

const Glimpse: Model<IGlimpseDocument> =
  mongoose.models.Glimpse || mongoose.model<IGlimpseDocument>('Glimpse', GlimpseSchema);

export default Glimpse;
