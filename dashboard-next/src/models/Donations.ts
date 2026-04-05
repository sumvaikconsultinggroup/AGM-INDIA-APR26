import { Schema, model, models, Document } from 'mongoose';

export interface DonationDocument extends Document {
  sessionId?: string;
  paymentId?: string;
  name: string;
  email: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  nationality: string;
  donatedAt: Date;
  address?: string;
  phone?: string;
  campaignId?: string;
}

const DonationSchema = new Schema<DonationDocument>({
  sessionId: { type: String, sparse: true, unique: true },
  paymentId: { type: String, sparse: true, unique: true, index: true },
  name: { type: String },
  email: { type: String },
  address: { type: String },
  phone: { type: String },
  campaignId: { type: String},
  nationality: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentStatus: { type: String, required: true },
  donatedAt: { type: Date, default: Date.now },
});

export default models.Donation || model<DonationDocument>('Donation', DonationSchema);
