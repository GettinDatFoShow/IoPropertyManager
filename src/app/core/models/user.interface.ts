// Core User and Authentication Interfaces

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string; // Computed or custom display name
  role: UserRole;
  businessId: string;
  profilePicture?: string;
  photoURL?: string; // Legacy alias for profilePicture
  phone?: string;
  profile?: any; // Legacy profile object
  assignedProperties?: string[]; // Legacy property assignments
  workSchedule?: any[]; // Legacy work schedule
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Business {
  id: string;
  name: string;
  description?: string; // Business description
  ownerId?: string; // Owner user ID
  type: BusinessType;
  address: BusinessAddress;
  contact: BusinessContact;
  settings: BusinessSettings;
  subscription: BusinessSubscription;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessAddress {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  formatted?: string; // Full formatted address string
}

export interface BusinessContact {
  email: string;
  phone: string;
  website?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    email?: string;
  };
}

export interface BusinessSettings {
  timeZone: string;
  timezone?: string; // Legacy alias for timeZone
  currency: string;
  dateFormat: string;
  theme?: 'light' | 'dark' | 'system'; // UI theme preference
  requireGeotagging?: boolean; // Require GPS coordinates for work orders
  defaultServiceReminder?: number; // Legacy service reminder setting
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface BusinessSubscription {
  plan: SubscriptionPlan;
  status: 'active' | 'inactive' | 'suspended' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  expiresAt?: Date; // Legacy alias for endDate
  maxUsers: number;
  maxProperties: number;
  maxEmployees?: number; // Legacy employee limit
  features: string[];
}

// User Roles
export type UserRole = 
  | 'owner' 
  | 'manager' 
  | 'employee' 
  | 'admin';

// Business Types
export type BusinessType = 
  | 'property-management' 
  | 'maintenance-services' 
  | 'cleaning-services' 
  | 'landscaping' 
  | 'other';

// Subscription Plans
export type SubscriptionPlan = 
  | 'starter' 
  | 'professional' 
  | 'pro' // Legacy alias for professional
  | 'enterprise' 
  | 'custom';

// Authentication DTOs
export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  businessName: string;
  businessType: BusinessType;
  phone?: string;
  agreeToTerms: boolean;
}

export interface AuthResponse {
  user: User;
  business: Business;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface PasswordResetDto {
  email: string;
}

export interface PasswordChangeDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Permission System
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: PermissionAction;
}

export type PermissionAction = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'manage';

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

// User Profile Update
export interface UpdateUserProfileDto {
  firstName?: string;  
  lastName?: string;
  phone?: string;
  profilePicture?: string;
}

// Legacy interface name for compatibility - extended for auth service
export interface CreateUserData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  businessType?: BusinessType;
  phone?: string;
  phoneNumber?: string; // Legacy alias
  agreeToTerms?: boolean;
  role?: UserRole;
  businessId?: string;
  homeAddress?: BusinessAddress;
}

// Add displayName to User interface
export interface UserWithDisplayName extends User {
  displayName: string;
}

export interface UpdateBusinessDto {
  name?: string;
  type?: BusinessType;
  address?: Partial<BusinessAddress>;
  contact?: Partial<BusinessContact>;
  settings?: Partial<BusinessSettings>;
}