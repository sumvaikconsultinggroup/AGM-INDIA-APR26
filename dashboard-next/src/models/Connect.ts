import mongoose, { Document, Schema } from 'mongoose';

export interface IConnect extends Document {
  fullName: string;
  email: string;
  subject: string;
  message: string;
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

// Check if the model is already defined to prevent overwriting during hot reload
 const Connect = mongoose.models.Connect || mongoose.model<IConnect>('Connect', connectSchema);
export default Connect;

