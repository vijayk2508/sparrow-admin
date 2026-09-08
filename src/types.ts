export type ServiceType = 'Boxing' | 'Hyrox' | 'Strength' | 'Cardio' | 'Free Trial' | 'Private Coaching';

export interface ClassSession {
  id: string;
  title: string;
  serviceType: ServiceType;
  coachName: string;
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  time: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels' | 'Youth 8-16';
  colorTag: string;
  description: string;
  capacity: number;
  spotsLeft: number;
  price: number; // in INR
}

export interface Coach {
  id: string;
  name: string;
  role: string;
  recordBadge?: string;
  bio: string;
  image: string;
  specialties: string[];
  socials: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

export interface TrainingProgram {
  id: string;
  title: string;
  category: ServiceType;
  level: string;
  badge?: string;
  duration: string;
  price: number;
  period: string;
  description: string;
  image: string;
  features: string[];
  popular?: boolean;
}

export interface MembershipPlan {
  id: string;
  name: 'Monthly' | 'Two Months' | 'Three Months';
  tagline: string;
  price: number;
  currency: string;
  period: string;
  badge?: string;
  popular?: boolean;
  features: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  age: number;
  memberDuration: string;
  quote: string;
  resultBadge: string;
  resultText: string;
  avatar: string;
  rating: number;
}

export interface GymEvent {
  id: string;
  type: string;
  title: string;
  dateMonth: string;
  dateDay: string;
  time: string;
  price: number;
  priceLabel: string;
  location: string;
  description: string;
  capacityText: string;
  image: string;
}

export interface GalleryItem {
  id: string;
  category: string;
  image: string;
  title: string;
  order?: number;
}

export interface HeroStat {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
}

export interface WhyChooseUsItem {
  id: string;
  num: string;
  icon: string;
  title: string;
  desc: string;
}

export interface SiteSettings {
  name: string;
  tagline: string;
  subtext: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  establishedYear: string;
  heroImage: string;
  sessionFee: number;
  currency: string;
  heroSubtext: string;
  socials: {
    instagram?: string;
    facebook?: string;
  };
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  heroStats: HeroStat[];
  whyChooseUs: WhyChooseUsItem[];
}

export interface BookingData {
  id?: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  serviceType: ServiceType;
  classTitle: string;
  coachName?: string;
  date: string;
  timeSlot: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus: 'paid' | 'free_trial' | 'pay_at_gym';
  amount: number;
  paymentId?: string;
  notes?: string;
  createdAt?: string;
}

export interface PaymentData {
  id?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  userEmail: string;
  userName: string;
  planOrSession: string;
  status: 'captured' | 'pending' | 'failed';
  createdAt?: string;
}

export interface MembershipSubscription {
  id?: string;
  userName: string;
  userEmail: string;
  planName: 'Starter' | 'Warrior' | 'Champion';
  amount: number;
  billingCycle: string;
  startDate: string;
  status: 'active' | 'cancelled' | 'expired';
  paymentId?: string;
  createdAt?: string;
}

export interface ContactQueryData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt?: string;
}
