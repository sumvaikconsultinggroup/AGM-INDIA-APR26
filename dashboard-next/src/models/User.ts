import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define interfaces for TypeScript type safety
interface IFamilyMember {
  age: number;
  relation: string;
}

// Update the IProfile interface to include new fields
interface IProfile {
  profileImage?: string;
  fullName?: string;
  age?: number;
  contact?: string;
  dikshaPlace?: string;
  address?: string;
  wishes?: string;
  personalStory?: string;
  maritalStatus?: 'Married' | 'Unmarried';
  dob?: Date;
  anniversary?: Date | null;
  swamijiImages?: string[];
  gender?: 'Male' | 'Female' | 'Other';
  familyMembers?: IFamilyMember[];
}

export interface INormalUserBase {
  username: string;
  email: string;
  password?: string;
  authMethod: 'normal';
}

export interface IOAuthUserBase {
  uid: string;
  email: string;
  name: string;
  picture?: string;
  authMethod: 'oauth';
}

// Common fields that apply to both types of users
interface ICommonUserFields {
  otp?: string;
  otpExpiry?: Date;
  isOTPVerified: boolean;
  status?: 'active' | 'inactive' | 'suspended';
  role?: string;
  profile?: IProfile;
  registeredEvents?: mongoose.Types.ObjectId[];
  isDeleted?: boolean;
}

export type IUserBase = (INormalUserBase | IOAuthUserBase) & ICommonUserFields;

export interface IUser extends mongoose.Document {
  username?: string;
  email: string;
  password?: string;
  authMethod: 'normal' | 'oauth';
  uid?: string;
  name?: string;
  picture?: string;
  otp?: string;
  otpExpiry?: Date;
  isOTPVerified: boolean;
  status?: 'active' | 'inactive' | 'suspended';
  role?: string;
  profile?: IProfile;
  registeredEvents?: mongoose.Types.ObjectId[];
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
  matchPassword?(enteredPassword: string): Promise<boolean>;
  verifyOTP?(enteredOTP: string): Promise<boolean>;
  isModified(path: string): boolean;
}

const ProfileSchema = new Schema<IProfile>(
  {
    profileImage: {
      type: String,
      default: '/placeholder.svg',
    },
    fullName: {
      type: String,
      trim: true,
      maxlength: [100, "Name can't exceed 100 characters"],
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      max: [120, 'Please enter a valid age'],
    },
    contact: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
    },
    dikshaPlace: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      maxlength: [300, "Address can't exceed 300 characters"],
    },
    wishes: {
      type: String,
      trim: true,
      maxlength: [500, "Wishes can't exceed 500 characters"],
    },
    personalStory: {
      type: String,
      trim: true,
      maxlength: [2000, "Story can't exceed 2000 characters"],
      default: '',
    },
    maritalStatus: {
      type: String,
      enum: ['Married', 'Unmarried'],
    },
    dob: {
      type: Date,
    },
    anniversary: {
      type: Date,
      required: function (this: IProfile) {
        return this.maritalStatus === 'Married';
      },
    },
    swamijiImages: {
      type: [String],
      validate: {
        validator: function (val: string[]) {
          return val.length <= 6;
        },
        message: 'You can upload a maximum of 6 images',
      },
      default: [],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      trim: true,
    },
    familyMembers: [{
      age: {
        type: Number,
        min: [0, 'Age cannot be negative'],
        max: [120, 'Please enter a valid age'],
      },
      relation: {
        type: String,
        trim: true,
        maxlength: [50, "Relation name can't exceed 50 characters"],
      },
      name:{
        type: String,
        trim: true,
        maxlength: [50, "Name can't exceed 100 characters"],
      },
      contact:{
        type: String,
        trim: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
      }
    }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const userSchema = new Schema<IUser>(
  {
    // Auth method field to determine user type
    authMethod: {
      type: String,
      enum: ['normal', 'oauth'],
      required: [true, 'Authentication method is required'],
       // Default to normal authentication
    },
    
    // Fields for normal authentication
    username: {
      type: String,
      maxlength: [20, 'Username cannot be more than 20 characters'],
      sparse:true,
      unique:false,
    },
    password: {
      type: String,
      required: function(this: IUser) {
        return this.authMethod === 'normal';
      },
      minlength: [8, 'Password must be at least 8 characters'],
      maxlength: [15, 'Password cannot be more than 15 characters'],
      select: false,
    },
    
    // Fields for OAuth authentication
    uid: {
      type: String,
      required: function(this: IUser) {
        return this.authMethod === 'oauth';
      },
      unique: true,
      sparse: true, // Allow null/undefined values for normal users
      trim: true,
    },
    name: {
      type: String,
      required: function(this: IUser) {
        return this.authMethod === 'oauth';
      },
      trim: true,
    },
    picture: {
      type: String,
      default: '/placeholder.svg',
    },
    
    // Common field - email is required for both auth methods
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    
    // Common fields for all users
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    isOTPVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'editor', 'moderator'],
      default: 'user',
    },
    profile: ProfileSchema,
    registeredEvents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],
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
    discriminatorKey: 'authMethod',
  }
);

// Index for better query performance
// userSchema.index({ email: 1 });
// userSchema.index({ isDeleted: 1 });

// userSchema.index({ uid: 1 }, { sparse: true });
// userSchema.index({ 
//   'profile.fullName': 'text', 
//   email: 'text', 
//   username: 'text', 
//   name: 'text' 
// });

// Fix pre-save hook with proper this typing
userSchema.pre<IUser>('save', async function (next) {
  // Only hash password for normal auth users
  if (this.authMethod === 'normal' && this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password as string, salt);
    } catch (error) {
      return next(error instanceof Error ? error : new Error('Error encrypting password'));
    }
  }

  // Hash OTP if modified (for any auth type)
  if (this.isModified('otp') && this.otp) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.otp = await bcrypt.hash(this.otp, salt);
    } catch (error) {
      return next(error instanceof Error ? error : new Error('Error encrypting OTP'));
    }
  }
  
  next();
});

// Method to compare passwords (only for normal auth)
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  if (this.authMethod !== 'normal') return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to verify OTP (for any auth type)
userSchema.methods.verifyOTP = async function (enteredOTP: string): Promise<boolean> {
  if (!this.otp || !this.otpExpiry || new Date() > this.otpExpiry) {
    return false;
  }
  return await bcrypt.compare(enteredOTP, this.otp);
};

// Create and export the model
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;