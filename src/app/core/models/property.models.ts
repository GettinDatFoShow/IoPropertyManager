import { Timestamp } from 'firebase/firestore';
import { Address, GeoPoint, PropertyType } from './common.models';

export interface Property {
  id: string;
  businessId: string;
  name: string;
  description: string;
  type: PropertyType;
  owner: PropertyOwner;
  address: Address;
  location: GeoPoint;
  photos: string[]; // Storage URLs
  subscription: PropertySubscription;
  assignedEmployees: string[]; // userIds
  serviceableItemsCount: number;
  nextServiceDate: Timestamp;
  totalCost: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PropertyOwner {
  name: string;
  email?: string;
  phone?: string;
}

export interface PropertySubscription {
  cost: number;
  billing: 'monthly' | 'quarterly' | 'annually';
  nextBilling: Timestamp;
}

export interface CreatePropertyData {
  businessId: string;
  name: string;
  description: string;
  type: PropertyType;
  owner: PropertyOwner;
  address: Address;
  subscription: PropertySubscription;
  photos?: string[];
}

export interface UpdatePropertyData {
  name?: string;
  description?: string;
  type?: PropertyType;
  owner?: PropertyOwner;
  address?: Address;
  subscription?: PropertySubscription;
  assignedEmployees?: string[];
}