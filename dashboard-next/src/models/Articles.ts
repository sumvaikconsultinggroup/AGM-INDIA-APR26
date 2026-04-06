import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ILocalizedText {
  en?: string;
  hi?: string;
  bn?: string;
  ta?: string;
  te?: string;
  mr?: string;
  gu?: string;
  kn?: string;
  ml?: string;
  pa?: string;
  or?: string;
  as?: string;
}

export interface IArticle extends Document {
  title: string;
  description: string;
  titleTranslations?: ILocalizedText;
  descriptionTranslations?: ILocalizedText;
  categoryTranslations?: ILocalizedText;
  coverImage?: string;
  link?: string;
  category?: string;
  publishedDate?: Date;
  readTime?: number;
  isDeleted?: boolean;
}

const localizedTextSchema = new Schema<ILocalizedText>(
  {
    en: { type: String, trim: true },
    hi: { type: String, trim: true },
    bn: { type: String, trim: true },
    ta: { type: String, trim: true },
    te: { type: String, trim: true },
    mr: { type: String, trim: true },
    gu: { type: String, trim: true },
    kn: { type: String, trim: true },
    ml: { type: String, trim: true },
    pa: { type: String, trim: true },
    or: { type: String, trim: true },
    as: { type: String, trim: true },
  },
  { _id: false }
);

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
    titleTranslations: {
      type: localizedTextSchema,
      default: {},
    },
    descriptionTranslations: {
      type: localizedTextSchema,
      default: {},
    },
    categoryTranslations: {
      type: localizedTextSchema,
      default: {},
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
ArticleSchema.index({
  'titleTranslations.en': 'text',
  'titleTranslations.hi': 'text',
  'descriptionTranslations.en': 'text',
  'descriptionTranslations.hi': 'text',
  'categoryTranslations.en': 'text',
  'categoryTranslations.hi': 'text',
});

// Fix the "Cannot overwrite model" error by checking if it already exists
const Article: Model<IArticle> =
  mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);

export default Article;
