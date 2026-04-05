import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  description: string;
  coverImage?: string;
  link?: string;
  category?: string;
  publishedDate?: Date;
  readTime?: number;
  isDeleted?: boolean;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Article description is required'],
    },
    link: {
      type: String,
      trim: true,
    },
    readTime: {
      type: Number,
    },
    coverImage: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    publishedDate: {
      type: Date,
      default: Date.now,
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
ArticleSchema.index({ title: 'text', description: 'text' , category: 'text' });

// Fix the "Cannot overwrite model" error by checking if it already exists
const Article: Model<IArticle> =
  mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);

export default Article;