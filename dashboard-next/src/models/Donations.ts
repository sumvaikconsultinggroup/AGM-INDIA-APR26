import { Schema, model, models, Document } from 'mongoose';

export interface DonationDocument extends Document {
  sessionId?: string;
  orderId?: string;
  paymentId?: string;
  subscriptionId?: string;
  name: string;
  email: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  paymentMethod?: string;
  nationality: string;
  donatedAt: Date;
  address?: string;
  phone?: string;
  campaignId?: string;
  donationType?: 'one_time' | 'subscription';
  panNumber?: string;
  taxBenefitOptIn?: boolean;
  isAnonymous?: boolean;
  dedicationType?: 'memory' | 'honor' | 'occasion' | 'general';
  dedicatedTo?: string;
  dedicationMessage?: string;
  receiptNumber?: string;
  receiptAccessToken?: string;
  receiptIssuedAt?: Date;
  receiptEmailSentAt?: Date;
  receiptWhatsappSentAt?: Date;
  source?: 'website' | 'mobile' | 'admin' | 'unknown';
}

const DonationSchema = new Schema<DonationDocument>({
  sessionId: { type: String, sparse: true, unique: true },
  orderId: { type: String, sparse: true, index: true },
  paymentId: { type: String, sparse: true, unique: true, index: true },
  subscriptionId: { type: String, sparse: true, index: true },
  name: { type: String },
  email: { type: String },
  address: { type: String },
  phone: { type: String },
  campaignId: { type: String},
  nationality: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentStatus: { type: String, required: true },
  paymentMethod: { type: String },
  donatedAt: { type: Date, default: Date.now },
  donationType: { type: String, enum: ['one_time', 'subscription'], default: 'one_time' },
  panNumber: { type: String, trim: true, uppercase: true },
  taxBenefitOptIn: { type: Boolean, default: false },
  isAnonymous: { type: Boolean, default: false },
  dedicationType: {
    type: String,
    enum: ['memory', 'honor', 'occasion', 'general'],
    default: 'general',
  },
  dedicatedTo: { type: String, trim: true },
  dedicationMessage: { type: String, trim: true },
  receiptNumber: { type: String, index: true },
  receiptAccessToken: { type: String, index: true },
  receiptIssuedAt: { type: Date },
  receiptEmailSentAt: { type: Date },
  receiptWhatsappSentAt: { type: Date },
  source: {
    type: String,
    enum: ['website', 'mobile', 'admin', 'unknown'],
    default: 'unknown',
  },
});

export default models.Donation || model<DonationDocument>('Donation', DonationSchema);
