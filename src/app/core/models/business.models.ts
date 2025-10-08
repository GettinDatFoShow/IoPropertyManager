import { Timestamp } from 'firebase/firestore';
import { Address } from './common.models';

export interface Business {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  ownerId: string;
  address: Address;
  contactInfo: BusinessContact;
  settings: BusinessSettings;
  subscription: BusinessSubscription;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BusinessContact {
  email: string;
  phoneNumber: string;
  website?: string;
}

export interface BusinessSettings {
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  currency: string;
  defaultServiceReminder: number; // days before service
  requireGeotagging: boolean;
}

export interface BusinessSubscription {
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'trial';
  expiresAt: Timestamp;
  maxProperties: number;
  maxEmployees: number;
}

export interface CreateBusinessData {
  name: string;
  description?: string;
  ownerId: string;
  address: Address;
  contactInfo: BusinessContact;
  settings?: Partial<BusinessSettings>;
}

export interface UpdateBusinessData {
  name?: string;
  description?: string;
  logo?: string;
  address?: Address;
  contactInfo?: BusinessContact;
  settings?: Partial<BusinessSettings>;
}