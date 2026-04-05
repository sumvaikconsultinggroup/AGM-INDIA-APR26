import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationPreference extends Document {
  userId?: string;
  pushToken: string;
  deviceId?: string;
  platform: 'ios' | 'android' | 'web';
  language: string;
  cityName: string;
  lat: number;
  lng: number;
  timezone: string;
  dailyPanchang: boolean;
  festivalAlerts: boolean;
  brahmaMuhurtaAlert: boolean;
  alertTimeMinutes: number; // minutes before Brahma Muhurta (default 0 = at 4:30 AM)
  isActive: boolean;
  lastNotifiedDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: { type: String, index: true },
    pushToken: { type: String, required: true, unique: true },
    deviceId: { type: String },
    platform: { type: String, enum: ['ios', 'android', 'web'], default: 'android' },
    language: { type: String, default: 'hi' },
    cityName: { type: String, default: 'Haridwar' },
    lat: { type: Number, default: 29.9457 },
    lng: { type: Number, default: 78.1642 },
    timezone: { type: String, default: 'Asia/Kolkata' },
    dailyPanchang: { type: Boolean, default: true },
    festivalAlerts: { type: Boolean, default: true },
    brahmaMuhurtaAlert: { type: Boolean, default: true },
    alertTimeMinutes: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    lastNotifiedDate: { type: String },
  },
  { timestamps: true }
);

NotificationPreferenceSchema.index({ isActive: 1, dailyPanchang: 1 });
NotificationPreferenceSchema.index({ isActive: 1, festivalAlerts: 1 });

export default mongoose.models.NotificationPreference ||
  mongoose.model<INotificationPreference>('NotificationPreference', NotificationPreferenceSchema);
