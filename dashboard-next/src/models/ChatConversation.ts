// dashboard-next/src/models/ChatConversation.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  language?: 'en' | 'hi' | 'auto';
  timestamp: Date;
}

export interface IChatConversation extends Document {
  userId?: mongoose.Types.ObjectId;
  sessionId: string;
  title: string;
  messages: IChatMessage[];
  messageCount: number;
  lastMessageAt: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: [true, 'Message role is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    suggestions: {
      type: [String],
      default: [],
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'auto'],
      default: 'auto',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ChatConversationSchema = new Schema<IChatConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      sparse: true,
    },
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
      index: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    messages: {
      type: [ChatMessageSchema],
      default: [],
      validate: {
        validator: function (msgs: IChatMessage[]) {
          return msgs.length <= 200;
        },
        message: 'Conversation cannot exceed 200 messages',
      },
    },
    messageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

ChatConversationSchema.index({ userId: 1, lastMessageAt: -1 });
ChatConversationSchema.index({ sessionId: 1, isDeleted: 1 });

const ChatConversation: Model<IChatConversation> =
  mongoose.models.ChatConversation ||
  mongoose.model<IChatConversation>('ChatConversation', ChatConversationSchema);

export default ChatConversation;
