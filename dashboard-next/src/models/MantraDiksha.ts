import mongoose, { Document, Schema } from 'mongoose';

export interface IMantraDiksha extends Document {
  fullName: string;
  dateOfBirth: Date;
  gender: 'Male' | 'Female' | 'Other';
  nationality: string;
  mobileNumber: string;
  email: string; 
  whatsappNumber?: string;  // Optional for all nationalities
  aadhaarNumber?: string; // Only for Indian nationality
  passportNumber?: string; // Only for non-Indian nationality
  passportDocument?: string; // Only for non-Indian nationality
  spiritualIntent?: string; // Optional
  spiritualPath?: string; // Optional
  previousDiksha?: string; // Optional
  aadhaarDocument?: string; // Only for Indian nationality
  recentPhoto?: string;
  registrationDate: Date;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  assignedTo?: string;
  assignedToName?: string;
  internalNotes?: string;
  ceremonyDate?: Date;
  reviewedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MantraDikshaSchema = new Schema<IMantraDiksha>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },

    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },

    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: 'Gender must be Male, Female, or Other',
      },
    },

    nationality: {
      type: String,
      required: [true, 'Nationality is required'],
      trim: true,
      maxlength: [50, 'Nationality cannot exceed 50 characters'],
      default: 'Indian',
    },

    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^[+]?[\d\s\-()]+$/, 'Please enter a valid mobile number'],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, 'Email address is required'],
      unique: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please enter a valid email address'
      ],
      default: null,
    },

    // Optional for all nationalities
    whatsappNumber: {
      type: String,
      trim: true,
      match: [/^[+]?[\d\s\-()]+$/, 'Please enter a valid WhatsApp number'],
      default: null,
    },

    // Only for Indian nationality
    aadhaarNumber: {
      type: String,
      trim: true,
      match: [
        /^\d{12}$|^\d{4}\s?\d{4}\s?\d{4}$|^\d{4}-\d{4}-\d{4}$/,
        'Please enter a valid Aadhaar number',
      ],
      validate: {
        validator: function(this: IMantraDiksha, value: string) {
          // Aadhaar number is required only for Indian nationality
          if (this.nationality === 'Indian') {
            return !!value && value.trim() !== '';
          }
          return true;
        },
        message: 'Aadhaar number is required for Indian nationality'
      }
    },

    // Only for non-Indian nationality
    passportNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function(this: IMantraDiksha, value: string) {
          // Passport number is required only for non-Indian nationality
          if (this.nationality !== 'Indian') {
            return !!value && value.trim() !== '';
          }
          return true;
        },
        message: 'Passport number is required for non-Indian nationality'
      }
    },

    // Only for non-Indian nationality
    passportDocument: {
      type: String,
      default: null,
      validate: {
        validator: function(this: IMantraDiksha, value: string) {
          // Passport document is required only for non-Indian nationality
          if (this.nationality !== 'Indian') {
            return !!value && value.trim() !== '';
          }
          return true;
        },
        message: 'Passport document is required for non-Indian nationality'
      }
    },

    // Optional spiritual fields
    spiritualIntent: {
      type: String,
      trim: true,
      minlength: [20, 'Spiritual intent must be at least 20 characters'],
      maxlength: [2000, 'Spiritual intent cannot exceed 2000 characters'],
      default: null,
    },

    spiritualPath: {
      type: String,
      trim: true,
      maxlength: [2000, 'Spiritual path information cannot exceed 2000 characters'],
      default: null,
    },

    previousDiksha: {
      type: String,
      trim: true,
      maxlength: [2000, 'Previous diksha information cannot exceed 2000 characters'],
      default: null,
    },

    // Only for Indian nationality
    aadhaarDocument: {
      type: String,
      default: null,
      validate: {
        validator: function(this: IMantraDiksha, value: string) {
          // Aadhaar document is required only for Indian nationality
          if (this.nationality === 'Indian') {
            return !!value && value.trim() !== '';
          }
          return true;
        },
        message: 'Aadhaar document is required for Indian nationality'
      }
    },

    recentPhoto: {
      type: String,
      default: null,
    },

    registrationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    assignedTo: {
      type: String,
      trim: true,
      default: null,
    },
    assignedToName: {
      type: String,
      trim: true,
      default: null,
    },
    internalNotes: {
      type: String,
      trim: true,
      default: null,
    },
    ceremonyDate: {
      type: Date,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    
    // Soft delete flag
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

// Clear any existing model to avoid caching issues
if (mongoose.models.MantraDiksha) {
  delete mongoose.models.MantraDiksha;
}

// Indexes for better query performance
MantraDikshaSchema.index({ mobileNumber: 1 });
MantraDikshaSchema.index({ email: 1 });
MantraDikshaSchema.index({ aadhaarNumber: 1 });
MantraDikshaSchema.index({ passportNumber: 1 });
MantraDikshaSchema.index({ fullName: 'text' });
MantraDikshaSchema.index({ isDeleted: 1, createdAt: -1 });
MantraDikshaSchema.index({ status: 1, createdAt: -1 });

const MantraDiksha = mongoose.model<IMantraDiksha>('MantraDiksha', MantraDikshaSchema);

export default MantraDiksha;
