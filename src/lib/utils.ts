import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type { ProviderProfile, Booking, Review, Message, Notification, ServicePackage, User, Dispute, Campaign } from './types';
export type { BookingStatus, PaymentStatus, ServiceCategory, EventType, UserRole, DisputeStatus } from './types';
