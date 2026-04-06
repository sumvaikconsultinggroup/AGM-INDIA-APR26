import mongoose, { Document, Schema } from 'mongoose';

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

export interface IDonate extends Document {
  title: string;
  description: string;
  additionalText?: string;
  titleTranslations?: ILocalizedText;
  descriptionTranslations?: ILocalizedText;
  additionalTextTranslations?: ILocalizedText;
  achieved: number;
  goal: number;
  donors: number;
  totalDays: number;
  backgroundImage?: string; // Add backgroundImage field
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date; // Automatically added by timestamps
  updatedAt: Date;
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

const DonateSchema = new Schema<IDonate>(
  {
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
      maxlength: [50, 'Campaign title cannot be more than 50 characters'],
    },
    description: {
      type: String,
      required: [true, 'Campaign description is required'],
      trim: true,
      maxlength: [200, 'Campaign description cannot be more than 200 characters'],
    },
    titleTranslations: {
      type: localizedTextSchema,
      default: {},
    },
    descriptionTranslations: {
      type: localizedTextSchema,
      default: {},
    },
    additionalText: {
      type: String,
      trim: true,
      maxlength: [200, 'Additional text cannot be more than 200 characters'],
    },
    additionalTextTranslations: {
      type: localizedTextSchema,
      default: {},
    },
    achieved: {
      type: Number,
      default: 0,
      min: [0, 'Achieved amount cannot be negative'],
    },
    goal: {
      type: Number,
      required: [true, 'Campaign goal amount is required'],
      min: [0, 'Goal amount cannot be negative'],
    },
    donors: {
      type: Number,
      default: 0,
      min: [0, 'Number of donors cannot be negative'],
    },
    totalDays: {
      type: Number,
      default: 30,
      min: [1, 'Campaign duration must be at least 1 day'],
    },
    backgroundImage: {
      type: String,
      default: '/placeholder.svg',
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Virtual for campaign progress percentage
DonateSchema.virtual('progress').get(function (this: IDonate) {
  if (!this.goal) return 0;
  const percentage = (this.achieved / this.goal) * 100;
  return Math.min(Math.round(percentage), 100);
});

DonateSchema.virtual('daysLeft').get(function (this: IDonate) {
  if (!this.isActive) return 0;

  // Calculate end date based on creation date + total days
  const creationDate = this.createdAt;
  const endDate = new Date(creationDate);
  endDate.setDate(endDate.getDate() + this.totalDays);

  // Calculate days left
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
});

// Check if mongoose is already connected to prevent model overwrite error in development
const Donate = mongoose.models.Donate || mongoose.model<IDonate>('Donate', DonateSchema);

export default Donate;
