import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  location?: string;
  organiserName?: string;
  organiserEmail?: string;
  organiserPhone?: string;
  participants?: {
    name: string;
    email?: string;
    phone?: string;
  }[];
  category?: string; // e.g., "Workshop", "Seminar", "Meeting"
  isPublic?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
   date: {
  type: String,
  required: [true, "Event date is required"],
  
},
time: {
  type: String,
  default: '',
 
},
    location: {
      type: String,
      trim: true,
         required: [true, "Event location is required"],
    },
    organiserName: {
      type: String,
      trim: true,
         required: [true, "Event Organiser is required"],
    },
    organiserEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    organiserPhone: {
      type: String,
      trim: true,
       required: [true, "Event Orgainzer Phone is required"],
    },
    participants: [
      {
        name: { type: String, required: true },
        email: { type: String, trim: true, lowercase: true },
        phone: { type: String, trim: true },
      },
    ],
    category: {
      type: String,
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
   
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const EventDaily = mongoose.models.EventDaily || mongoose.model<IEvent>("EventDaily", EventSchema);
export default EventDaily;

