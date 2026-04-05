import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IRoomsBooking extends Document {
  name: string;
  place: string;
  price: number;
  date: Date[];
  available: boolean;
  occupancy: number;
  email: string;
  isDeleted?: boolean;
  userId?: string;
  isBooked: boolean;
  images?: string[];  // Added images field to store multiple image URLs
  description?: string; // Added description for detailed room information
  amenities?: string[]; // Added amenities list
}

/**
 * Schema for Room Booking
 */
const RoomsBookingSchema = new Schema<IRoomsBooking>(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
    },
    place: {
      type: String,
      required: [true, 'Place is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    date: [
      {
        type: Date,
        required: [true, 'At least one date is required'],
      },
    ],
    available: {
      type: Boolean,
      default: true,
    },
    occupancy: {
      type: Number,
      required: [true, 'Occupancy is required'],
      min: [1, 'Occupancy must be at least 1'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: String,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    images: {
      type: [String], // Changed to String to store image URLs
      required: [true, 'At least one image is required'],
      default: [],
      validate: {
        validator: function(v: string[]) {
          // Limit to a maximum of 5 images per room
          return v.length <= 5;
        },
        message:  'A room can have a maximum of 5 images'
      }
    },
    description: {
      type: String,
      trim: true,
    },
    amenities: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

// Fix the "Cannot overwrite model" error by checking if it already exists
const RoomsBooking: Model<IRoomsBooking> =
  mongoose.models.RoomsBooking || mongoose.model<IRoomsBooking>('RoomsBooking', RoomsBookingSchema);

export default RoomsBooking;
