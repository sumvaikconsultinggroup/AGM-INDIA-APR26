import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminNotificationDevice extends Document {
  adminId: string;
  username: string;
  pushToken: string;
  platform?: string;
  deviceId?: string;
  deviceName?: string;
  isActive: boolean;
  lastSeenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminNotificationDeviceSchema = new Schema<IAdminNotificationDevice>(
  {
    adminId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    pushToken: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    platform: {
      type: String,
      trim: true,
      default: '',
    },
    deviceId: {
      type: String,
      trim: true,
      default: '',
    },
    deviceName: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

AdminNotificationDeviceSchema.index({ adminId: 1, isActive: 1 });
AdminNotificationDeviceSchema.index({ username: 1, isActive: 1 });

export default mongoose.models.AdminNotificationDevice ||
  mongoose.model<IAdminNotificationDevice>('AdminNotificationDevice', AdminNotificationDeviceSchema);
