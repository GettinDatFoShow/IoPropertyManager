import { Timestamp } from 'firebase/firestore';
import { Address, UserRole, WorkSchedule, GeoPoint } from './common.models';

export interface User {
  id: string; // Firebase Auth UID
  businessId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  profile: UserProfile;
  assignedProperties: string[]; // propertyIds
  workSchedule: WorkSchedule[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  lastKnownLocation?: GeoPoint;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  homeAddress?: Address;
  dateHired: Timestamp;
  emergencyContact?: EmergencyContact;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  homeAddress?: Address;
  businessId: string;
}

export interface UpdateUserData {
  displayName?: string;
  photoURL?: string;
  profile?: Partial<UserProfile>;
  assignedProperties?: string[];
  workSchedule?: WorkSchedule[];
  isActive?: boolean;
}

export interface UserActivity {
  id: string;
  userId: string;
  businessId: string;
  action: string;
  entityType: 'property' | 'item' | 'workorder' | 'user' | 'business';
  entityId?: string;
  description: string;
  location?: GeoPoint;
  timestamp: Timestamp;
  metadata?: any;
}