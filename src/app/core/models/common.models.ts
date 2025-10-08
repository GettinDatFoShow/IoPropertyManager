export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  formatted?: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface WorkSchedule {
  dayOfWeek: number; // 0-6, Sunday = 0
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive: boolean;
}

export type UserRole = 'owner' | 'manager' | 'employee';
export type PropertyType = 'home' | 'apartment_complex' | 'housing_complex' | 'commercial' | 'other';
export type Season = 'all' | 'spring' | 'summer' | 'fall' | 'winter';
export type MessageType = 'notification' | 'direct_message' | 'assignment' | 'system';
export type WorkOrderStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';