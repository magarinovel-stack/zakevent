import { z } from 'zod';

// Type aliases
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
export type PaymentStatus = 'NONE' | 'HELD' | 'RELEASED' | 'REFUNDED' | 'FAILED';
export type ServiceCategory = 'PHOTOGRAPHE' | 'SALLE' | 'TRAITEUR' | 'DECORATION' | 'MUSIQUE' | 'BEAUTE' | 'TRANSPORT' | 'WEDDING_PLANNER';
export type EventType = 'MARIAGE' | 'FIANCAILLES' | 'ANNIVERSAIRE' | 'CORPORATE' | 'CONFERENCE' | 'AUTRE';
export type UserRole = 'CLIENT' | 'PRESTATAIRE' | 'ADMIN';
export type DisputeStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'ENDED';
export type AvailabilityStatus = 'AVAILABLE' | 'BLOCKED' | 'BOOKED';

// Interfaces
export interface User {
  id: string;
  auth_id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  is_verified: boolean;
  created_at: string;
}

export interface ProviderProfile {
  id: string;
  user_id: string;
  business_name: string;
  category: ServiceCategory;
  description?: string;
  cities: string[];
  min_price: number;
  max_capacity?: number;
  rating_average: number;
  review_count: number;
  is_premium: boolean;
  status: string;
  response_time_hours: number;
  portfolio_urls: string[];
  created_at: string;
}

export interface ServicePackage {
  id: string;
  provider_id: string;
  name: string;
  description?: string;
  price: number;
  max_guests?: number;
  includes: string[];
  is_active: boolean;
}

export interface Booking {
  id: string;
  client_id: string;
  provider_id: string;
  package_id?: string;
  event_date: string;
  event_time?: string;
  guest_count?: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  commission_amount: number;
  chargily_transaction_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  client_id: string;
  provider_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  booking_id?: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body?: string;
  type: string;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Dispute {
  id: string;
  booking_id: string;
  filed_by: string;
  reason: string;
  evidence_urls: string[];
  status: DisputeStatus;
  resolution?: string;
  created_at: string;
  resolved_at?: string;
}

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  description?: string;
  banner_url?: string;
  discount_percent: number;
  start_date: string;
  end_date: string;
  status: CampaignStatus;
  featured_package_ids: string[];
}

// Zod Schemas
export const bookingSchema = z.object({
  provider_id: z.string().uuid(),
  package_id: z.string().uuid().optional(),
  event_date: z.string().date(),
  event_time: z.string().optional(),
  guest_count: z.number().int().positive().optional(),
  notes: z.string().max(500).optional(),
});

export const reviewSchema = z.object({
  booking_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const profileSchema = z.object({
  full_name: z.string().min(2).max(100),
  phone: z.string().regex(/^\+213[5-7]\d{8}$/).optional(),
  avatar_url: z.string().url().optional(),
});

export const disputeSchema = z.object({
  booking_id: z.string().uuid(),
  reason: z.string().min(10).max(2000),
  evidence_urls: z.array(z.string().url()).max(5).optional(),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2).max(100),
  role: z.enum(['CLIENT', 'PRESTATAIRE']),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
