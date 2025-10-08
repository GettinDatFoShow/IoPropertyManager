import { Timestamp } from 'firebase/firestore';
import { MessageType, GeoPoint } from './common.models';

export interface Message {
  id: string;
  businessId: string;
  type: MessageType;
  from: string; // userId or 'system'
  to: string[]; // userIds
  subject?: string;
  content: string;
  data?: any; // Additional context data
  readBy: string[]; // userIds who have read the message
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

export interface ActivityLog {
  id: string;
  businessId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: Timestamp;
  location?: GeoPoint;
  metadata?: any;
}

export interface CreateMessageData {
  businessId: string;
  type: MessageType;
  from: string;
  to: string[];
  subject?: string;
  content: string;
  data?: any;
  expiresAt?: Timestamp;
}

export interface CreateActivityLogData {
  businessId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  location?: GeoPoint;
  metadata?: any;
}