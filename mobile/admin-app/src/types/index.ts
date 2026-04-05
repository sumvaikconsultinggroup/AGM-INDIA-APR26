export interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalDonations: number;
  totalVolunteers: number;
  totalBooks: number;
  totalArticles: number;
}

export interface AdminUser {
  _id: string;
  username: string;
  role: string;
  permissions?: Record<string, boolean>;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  authMethod?: string;
  isVerified?: boolean;
  createdAt: string;
}

export interface Event {
  _id: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  description: string;
  eventImage?: string;
  registeredUsers?: string[];
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DonationCampaign {
  _id: string;
  title: string;
  description: string;
  additionalText?: string;
  goal: number;
  achieved: number;
  donors: number;
  totalDays: number;
  backgroundImage?: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface DonationRecord {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  email?: string | null;
  contact?: string | null;
  created: number;
  description?: string;
}

export interface DonationAnalytics {
  range: string;
  startDate: string;
  endDate: string;
  totals: {
    totalAmount: number;
    donationsCount: number;
    uniqueDonors: number;
    repeatDonors: number;
    averageDonation: number;
    maxDonation: number;
    oneTimeAmount: number;
    subscriptionAmount: number;
  };
  topDonor: {
    name: string;
    email?: string;
    phone?: string;
    totalAmount: number;
    donationCount: number;
    lastDonationAt?: string;
  } | null;
  campaigns: Array<{
    campaignId?: string | null;
    campaignTitle: string;
    totalAmount: number;
    donationsCount: number;
  }>;
}

export interface Schedule {
  _id: string;
  month: string;
  locations: string;
  baseLocation?: 'Haridwar Ashram' | 'Delhi Ashram' | 'Other';
  publicTitle?: {
    en?: string;
    hi?: string;
  };
  publicLocation?: {
    en?: string;
    hi?: string;
  };
  publicNotes?: {
    en?: string;
    hi?: string;
  };
  internalNotes?: string;
  changeNote?: string;
  isLastMinuteUpdate?: boolean;
  timeSlots: {
    period?: string;
    startDate: string;
    endDate: string;
    _id: string;
    slotCapacity?: number;
  }[];
  appointment?: boolean;
  maxPeople?: number;
  isDeleted?: boolean;
  dateRange?: string;
  earliestStartDate?: string;
  latestEndDate?: string;
  currentAppointments?: number;
  totalCapacity?: number;
  remainingCapacity?: number;
  isBlocked?: boolean;
  slotStats?: {
    startDate: string;
    endDate?: string;
    period?: string;
    slotCapacity?: number;
    bookedCount?: number;
    remainingCapacity?: number;
    isBlocked?: boolean;
  }[];
}

export interface ScheduleRegistration {
  _id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  purpose: string;
  additionalInfo?: string;
  preferedTime?: string;
  language?: string;
  assignedTo?: string;
  internalNotes?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reschedule?: boolean;
  rescheduleDate?: string;
  approvedAt?: string;
  rejectedAt?: string;
  requestedSchedule?: {
    scheduleId?: string;
    eventDate?: string;
    eventLocation?: string;
    eventTime?: string;
    eventDetails?: string;
    baseLocation?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  _id: string;
  title: string;
  description: string;
  coverImage?: string;
  category?: string;
  link?: string;
  readTime?: number;
  publishedDate: string;
  isDeleted?: boolean;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  description?: string;
  price: number;
  coverImage?: string;
  pages?: number;
  language?: string;
  genre?: string;
  ISBN?: string;
  publishedDate?: string;
  stock?: {
    soldOut: number;
    stockIn: number;
    available: number;
    lastUpdated?: string;
  };
  isDeleted?: boolean;
}

export interface Podcast {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  videoId?: string;
  coverImage?: string;
  thumbnail?: string;
  category?: string;
  date?: string;
  duration?: string;
  featured?: boolean;
  isDeleted?: boolean;
}

export interface VideoSeries {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  coverImage?: string;
  category?: string;
  videoCount?: number;
  videos?: {
    videoId: string;
    title: string;
    thumbnail?: string;
    coverImage?: string;
    youtubeUrl: string;
    description?: string;
    duration?: string;
    publishedAt?: string;
    views?: number;
    likes?: number;
  }[];
}

export interface RoomBooking {
  _id: string;
  name: string;
  place?: string;
  price: number;
  occupancy?: number;
  available: boolean;
  isBooked?: boolean;
  email?: string;
  description?: string;
  amenities?: string[];
  images?: string[];
  date?: string[];
  isDeleted?: boolean;
}

export interface Volunteer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  location?: string;
  age?: number;
  occupationType?: string;
  occupation?: string;
  availability?: string[];
  availableFrom?: string;
  availableUntil?: string;
  skills?: string[];
  motivation?: string;
  experience?: string;
  consent?: boolean;
  isApproved?: boolean;
  isDeleted?: boolean;
  createdAt: string;
}

export interface ContactMessage {
  _id: string;
  fullName: string;
  email: string;
  subject?: string;
  message: string;
  isDeleted?: boolean;
  createdAt: string;
}
