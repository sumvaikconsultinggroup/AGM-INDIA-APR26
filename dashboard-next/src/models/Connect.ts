import mongoose, { Document, Schema } from 'mongoose';

export interface IConnect extends Document {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status?: 'new' | 'in_review' | 'responded' | 'archived';
  assignedTo?: string;
  assignedToName?: string;
  internalNotes?: string;
  responseText?: string;
  respondedAt?: Date;
  lastActionAt?: Date;
  isDeleted?: boolean;
}

const connectSchema = new Schema<IConnect>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'in_review', 'responded', 'archived'],
      default: 'new',
      index: true,
    },
    assignedTo: {
      type: String,
      trim: true,
    },
    assignedToName: {
      type: String,
      trim: true,
    },
    internalNotes: {
      type: String,
      trim: true,
      default: '',
    },
    responseText: {
      type: String,
      trim: true,
      default: '',
    },
    respondedAt: {
      type: Date,
    },
    lastActionAt: {
      type: Date,
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

// Create indexes for better query performance
connectSchema.index({ email: 1 });
connectSchema.index({ createdAt: -1 });
connectSchema.index({ status: 1, createdAt: -1 });

// Check if the model is already defined to prevent overwriting during hot reload
 const Connect = mongoose.models.Connect || mongoose.model<IConnect>('Connect', connectSchema);
export default Connect;
