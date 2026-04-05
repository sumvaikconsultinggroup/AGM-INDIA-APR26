import mongoose, { Document, Schema } from 'mongoose';

// Define meeting purpose enum
export enum MeetingPurpose {
  PERSONAL_GUIDANCE = 'Personal Guidance',
  SPIRITUAL_DISCUSSION = 'Spiritual Discussion',
  COMMUNITY_EVENT = 'Community Event',
  ORGANIZATION_COLLABORATION = 'Organization Collaboration',
  MEDIA_INTERVIEW = 'Media Interview',
  EDUCATIONAL_INSTITUTION_VISIT = 'Educational Institution Visit',
  CULTURAL_PROGRAM = 'Cultural Program',
  CHARITABLE_WORK_DISCUSSION = 'Charitable Work Discussion',
  OTHER = 'Other',
}

// Define registration status enum
export enum RegistrationStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export enum PreferredTime {
  MORNING = 'Morning',
  AFTERNOON = 'Afternoon',
  EVENING = 'Evening',
  WHOLE_DAY = 'Whole Day',
}

// Sub-document interface for requestedSchedule
export interface IRequestSchedule {
  scheduleId?: string;
  eventDate?: Date;
  eventLocation?: string;
  eventTime?: string; // Added field
  eventDetails?: string; // Added field
  baseLocation?: string;
}

// Main document interface
export interface IScheduleRegistration extends Document {
  userId?: string;
  name: string;
  email: string;
  phone: string;
  purpose: MeetingPurpose;
  additionalInfo?: string;
  preferedTime: PreferredTime;
  language?: string;
  assignedTo?: string;
  internalNotes?: string;
  status?: RegistrationStatus;
  isDeleted?: boolean;
  reschedule?: boolean; // Flag to indicate if this was rescheduled
  rescheduleDate?: Date; // Original reschedule date (for tracking)
  approvedAt?: Date;
  rejectedAt?: Date;
  emailNotificationSentAt?: Date;
  whatsappNotificationSentAt?: Date;
  nextDayReminderSentAt?: Date;
  morningReminderSentAt?: Date;
  requestedSchedule?: IRequestSchedule;
  createdAt: Date;
  updatedAt: Date;
}

// Sub-schema for requestedSchedule
const RequestedScheduleSchema = new Schema<IRequestSchedule>(
  {
    scheduleId: {
      type: String,
      required: false,
      trim: true,
    },
    eventDate: {
      type: Date,
      required: false,
    },
    eventLocation: {
      type: String,
      required: false,
      trim: true,
    },
    eventTime: {
      // Added field
      type: String,
      required: false,
      trim: true,
    },
    eventDetails: {
      // Added field
      type: String,
      required: false,
      trim: true,
      maxlength: [1000, 'Event details cannot exceed 1000 characters'],
    },
    baseLocation: {
      type: String,
      required: false,
      trim: true,
    },
  },
  { _id: false }
);

// Main schema
const ScheduleRegistrationSchema = new Schema<IScheduleRegistration>(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    userId: {
      type: String,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    purpose: {
      type: String,
      required: [true, 'Purpose of meeting is required'],
      enum: Object.values(MeetingPurpose),
    },
    additionalInfo: {
      type: String,
      maxlength: [500, 'Additional information cannot exceed 500 characters'],
    },
    language: {
      type: String,
      trim: true,
      default: 'en',
    },
    assignedTo: {
      type: String,
      trim: true,
    },
    internalNotes: {
      type: String,
      trim: true,
    },
    preferedTime: {
      type: String,
      enum: Object.values(PreferredTime),
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(RegistrationStatus),
      default: RegistrationStatus.PENDING,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    reschedule: {
      type: Boolean,
      default: false,
    },
    rescheduleDate: {
      type: Date,
      required: false,
    },
    approvedAt: {
      type: Date,
      required: false,
    },
    rejectedAt: {
      type: Date,
      required: false,
    },
    emailNotificationSentAt: {
      type: Date,
      required: false,
    },
    whatsappNotificationSentAt: {
      type: Date,
      required: false,
    },
    nextDayReminderSentAt: {
      type: Date,
      required: false,
    },
    morningReminderSentAt: {
      type: Date,
      required: false,
    },
    requestedSchedule: {
      type: RequestedScheduleSchema,
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

// Create and export the model
const ScheduleRegistration =
  mongoose.models.ScheduleRegistration ||
  mongoose.model<IScheduleRegistration>('ScheduleRegistration', ScheduleRegistrationSchema);

export default ScheduleRegistration;
