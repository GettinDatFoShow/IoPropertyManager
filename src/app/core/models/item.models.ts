import { Timestamp } from 'firebase/firestore';
import { Season, Priority, WorkOrderStatus, MessageType, GeoPoint } from './common.models';

export interface Item {
  id: string;
  propertyId: string;
  businessId: string;
  name: string;
  description: string;
  webLink?: string;
  photos: string[]; // Storage URLs
  costs: ItemCosts;
  serviceSchedule: ServiceSchedule;
  assignedEmployee?: string; // userId
  status: 'active' | 'needs_attention' | 'work_order_created' | 'completed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ItemCosts {
  item: number;
  service: number;
}

export interface ServiceSchedule {
  seasons: Season[];
  recurringDays?: number; // days between services
  nextService: Timestamp;
  lastService?: Timestamp;
}

export interface ServiceHistory {
  id: string;
  itemId: string;
  propertyId: string;
  businessId: string;
  servicedBy: string; // userId
  servicedAt: Timestamp;
  cost: number;
  comments: string;
  photos: string[]; // Storage URLs
  location?: GeoPoint;
  status: 'completed' | 'requires_followup' | 'work_order_created';
}

export interface WorkOrder {
  id: string;
  itemId: string;
  propertyId: string;
  businessId: string;
  createdBy: string; // userId
  assignedTo?: string; // userId
  title: string;
  description: string;
  priority: Priority;
  status: WorkOrderStatus;
  estimatedCost?: number;
  actualCost?: number;
  photos: string[]; // Storage URLs
  dueDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

export interface CreateItemData {
  propertyId: string;
  businessId: string;
  name: string;
  description: string;
  webLink?: string;
  costs: ItemCosts;
  serviceSchedule: Omit<ServiceSchedule, 'nextService'>;
  photos?: string[];
}

export interface CreateServiceHistoryData {
  itemId: string;
  propertyId: string;
  businessId: string;
  servicedBy: string;
  cost: number;
  comments: string;
  photos?: string[];
  location?: GeoPoint;
  status?: 'completed' | 'requires_followup' | 'work_order_created';
}

export interface CreateWorkOrderData {
  itemId: string;
  propertyId: string;
  businessId: string;
  createdBy: string;
  title: string;
  description: string;
  priority: Priority;
  assignedTo?: string;
  estimatedCost?: number;
  dueDate?: Timestamp;
}