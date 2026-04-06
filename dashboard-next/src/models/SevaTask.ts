import mongoose, { Document, Schema } from 'mongoose';

export interface ISevaTask extends Document {
  title: string;
  description?: string;
  sevaType: 'kitchen' | 'cleaning' | 'reception' | 'social_media' | 'event_support' | 'travel' | 'other';
  city?: string;
  dueDate?: Date;
  shift?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'blocked';
  assignedToType?: 'team' | 'volunteer';
  assignedToId?: string;
  assignedToName?: string;
  linkedNoteId?: string;
  createdById?: string;
  createdByName?: string;
  completionNotes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SevaTaskSchema = new Schema<ISevaTask>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    sevaType: {
      type: String,
      enum: ['kitchen', 'cleaning', 'reception', 'social_media', 'event_support', 'travel', 'other'],
      default: 'other',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    dueDate: {
      type: Date,
    },
    shift: {
      type: String,
      trim: true,
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'assigned', 'in_progress', 'completed', 'blocked'],
      default: 'open',
      index: true,
    },
    assignedToType: {
      type: String,
      enum: ['team', 'volunteer'],
    },
    assignedToId: {
      type: String,
      trim: true,
    },
    assignedToName: {
      type: String,
      trim: true,
    },
    linkedNoteId: {
      type: String,
      trim: true,
    },
    createdById: {
      type: String,
      trim: true,
    },
    createdByName: {
      type: String,
      trim: true,
    },
    completionNotes: {
      type: String,
      trim: true,
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

SevaTaskSchema.index({ status: 1, dueDate: 1 });
SevaTaskSchema.index({ city: 1, dueDate: 1 });
SevaTaskSchema.index({ assignedToId: 1, status: 1 });

export default mongoose.models.SevaTask ||
  mongoose.model<ISevaTask>('SevaTask', SevaTaskSchema);
