import mongoose, { Schema, Document, Model } from 'mongoose';

// First, define an interface for the TimeSlot
export interface ITimeSlot extends Document {
  period?: 'morning' | 'afternoon' | 'evening' | 'night' | 'whole day'; // Made optional
  startDate: Date;
  endDate?: Date; // Made optional
  slotCapacity?: number;
}

export interface ILocalizedText {
  en?: string;
  hi?: string;
}

// Define TimeSlot schema
const timeSlotSchema = new Schema<ITimeSlot>({
  period: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night','whole day'],
    required: false, // Made optional
  },
  startDate: {
    type: Date,
    required: true, // This is the only required field
  },
  endDate: {
    type: Date,
    required: false, // Made optional
  },
  slotCapacity: {
    type: Number,
    required: false,
    min: [1, 'Slot capacity must be at least 1'],
  },
});

const localizedTextSchema = new Schema<ILocalizedText>(
  {
    en: { type: String, trim: true },
    hi: { type: String, trim: true },
  },
  { _id: false }
);

// Now, define an interface for the Schedule
export interface ISchedule extends Document {
  month:
    | 'January'
    | 'February'
    | 'March'
    | 'April'
    | 'May'
    | 'June'
    | 'July'
    | 'August'
    | 'September'
    | 'October'
    | 'November'
    | 'December';
  locations: string;
  timeSlots?: ITimeSlot[]; // Made optional with ?
  isDeleted?: boolean;
  createdAt?: Date;
  appointment?: boolean;
  maxPeople?: number;
  request?: boolean;
  updatedAt?: Date;
  baseLocation?: 'Haridwar Ashram' | 'Delhi Ashram' | 'Other';
  publicTitle?: ILocalizedText;
  publicLocation?: ILocalizedText;
  publicNotes?: ILocalizedText;
  internalNotes?: string;
  changeNote?: string;
  isLastMinuteUpdate?: boolean;
}

// Define Schedule schema
const scheduleSchema = new Schema<ISchedule>(
  {
    month: {
      type: String,
      enum: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
      required: true,
    },
    locations: {
      type: String,
      required: true,
    },
    timeSlots: {
      type: [timeSlotSchema],
      required: false, // Explicitly mark as not required
      default: [], // Default to empty array
    },
    request: {
      type: Boolean,
      required: false,
    },
    baseLocation: {
      type: String,
      enum: ['Haridwar Ashram', 'Delhi Ashram', 'Other'],
      default: 'Other',
    },
    appointment: {
      type: Boolean,
      required: false,
    },
    maxPeople: {
      type: Number,
      required: false, // Optional
      min: [1, 'Max people must be at least 1'],
      default: 100,
    },
    publicTitle: {
      type: localizedTextSchema,
      default: {},
    },
    publicLocation: {
      type: localizedTextSchema,
      default: {},
    },
    publicNotes: {
      type: localizedTextSchema,
      default: {},
    },
    internalNotes: {
      type: String,
      trim: true,
    },
    changeNote: {
      type: String,
      trim: true,
    },
    isLastMinuteUpdate: {
      type: Boolean,
      default: false,
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

// Create indexes for better query performance
scheduleSchema.index({ month: 1 });
scheduleSchema.index({ isDeleted: 1 });
scheduleSchema.index({ 'timeSlots.startDate': 1 });

// Custom validation to ensure startDate comes before endDate if both exist
timeSlotSchema.path('endDate').validate(function (value) {
  // Only validate if both startDate and endDate exist
  if (this.startDate && value) {
    return new Date(value) > new Date(this.startDate);
  }
  // Skip validation if no endDate
  return true;
}, 'End date must be after start date');

// Export the Schedule model
export const Schedule: Model<ISchedule> =
  mongoose.models.Schedule || mongoose.model<ISchedule>('Schedule', scheduleSchema);

export default Schedule;
