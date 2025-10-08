// Property Management Interfaces and Types

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  status: PropertyStatus;
  address: PropertyAddress;
  owner: PropertyOwner;
  description?: string;
  photos: string[];
  subscription: PropertySubscription;
  serviceConfig: ServiceConfiguration;
  createdAt: Date;
  updatedAt: Date;
  assignedEmployees: string[];
}

export interface PropertyAddress {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface PropertyOwner {
  name: string;
  email: string;
  phone: string;
  contactPreference: 'email' | 'phone' | 'both';
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface PropertySubscription {
  type: SubscriptionType;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date;
  monthlyRate: number;
  billingCycle: 'monthly' | 'quarterly' | 'annually';
  paymentMethod?: string;
  autoRenewal: boolean;
}

export interface ServiceConfiguration {
  serviceFrequency: ServiceFrequency;
  preferredDays: string[];
  timePreference: 'morning' | 'afternoon' | 'evening' | 'flexible';
  specialInstructions?: string;
  accessInstructions?: string;
  keyLocation?: string;
  petInformation?: string;
  emergencyAccess: boolean;
}

// Property Types
export type PropertyType = 
  | 'residential-house' 
  | 'residential-apartment' 
  | 'residential-condo' 
  | 'commercial-office' 
  | 'commercial-retail' 
  | 'commercial-warehouse' 
  | 'mixed-use' 
  | 'other';

// Property Status
export type PropertyStatus = 
  | 'active' 
  | 'inactive' 
  | 'pending' 
  | 'maintenance' 
  | 'archived';

// Subscription Types
export type SubscriptionType = 
  | 'basic' 
  | 'standard' 
  | 'premium' 
  | 'enterprise' 
  | 'custom';

// Subscription Status
export type SubscriptionStatus = 
  | 'active' 
  | 'pending' 
  | 'suspended' 
  | 'cancelled' 
  | 'expired';

// Service Frequency
export type ServiceFrequency = 
  | 'weekly' 
  | 'bi-weekly' 
  | 'monthly' 
  | 'quarterly' 
  | 'as-needed';

// Property Creation/Update DTOs
export interface CreatePropertyDto {
  name: string;
  type: PropertyType;
  address: PropertyAddress;
  owner: PropertyOwner;
  description?: string;
  photos?: string[];
  subscription: Omit<PropertySubscription, 'status'>;
  serviceConfig: ServiceConfiguration;
}

export interface UpdatePropertyDto extends Partial<CreatePropertyDto> {
  id: string;
  status?: PropertyStatus;
  updatedAt: Date;
}

// Property Search and Filter Interfaces
export interface PropertySearchCriteria {
  searchTerm?: string;
  type?: PropertyType;
  status?: PropertyStatus;
  city?: string;
  state?: string;
  subscriptionType?: SubscriptionType;
  subscriptionStatus?: SubscriptionStatus;
  serviceFrequency?: ServiceFrequency;
  assignedEmployee?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface PropertyListResponse {
  properties: Property[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

// Property Statistics
export interface PropertyStatistics {
  totalProperties: number;
  activeProperties: number;
  inactiveProperties: number;
  pendingProperties: number;
  maintenanceProperties: number;
  archivedProperties: number;
  propertiesByType: Record<PropertyType, number>;
  propertiesBySubscription: Record<SubscriptionType, number>;
  monthlyRevenue: number;
  annualRevenue: number;
  averagePropertyValue: number;
}

// Form Models
export interface PropertyFormData {
  basicInfo: {
    name: string;
    type: PropertyType;
    status: PropertyStatus;
    description: string;
  };
  address: PropertyAddress;
  owner: PropertyOwner;
  subscription: PropertySubscription;
  serviceConfig: ServiceConfiguration;
  photos: string[];
  assignedEmployees: string[];
}

// Validation Errors
export interface PropertyValidationErrors {
  [key: string]: string | PropertyValidationErrors;
}