// Common Interfaces and Types Used Across the Application

// API Response Wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  timestamp: Date;
  requestId: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Search and Filter
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  dateRange?: DateRange;
  location?: LocationFilter;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface LocationFilter {
  city?: string;
  state?: string;
  zipCode?: string;
  radius?: number; // in miles
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Validation
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface FormValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  dirty: boolean;
}

// File Upload
export interface FileUpload {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface FileUploadProgress {
  fileName: string;
  progress: number;
  isComplete: boolean;
  error?: string;
}

// Notifications
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export type NotificationType = 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'reminder';

// Address Validation
export interface AddressValidationResponse {
  isValid: boolean;
  standardizedAddress?: {
    street: string;
    unit?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  suggestions?: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
}

export interface EntityState<T> {
  entities: Record<string, T>;
  ids: string[];
  loading: boolean;
  error: string | null;
  lastUpdated?: Date;
}

// Toast/Alert Messages
export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top' | 'middle' | 'bottom';
}

export interface AlertMessage {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'confirm';
  buttons?: AlertButton[];
}

export interface AlertButton {
  text: string;
  role?: 'cancel' | 'destructive' | 'confirm';
  handler?: () => void | Promise<void>;
}

// Audit Trail
export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  userId: string;
  userName: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export type AuditAction = 
  | 'created' 
  | 'updated' 
  | 'deleted' 
  | 'viewed' 
  | 'archived' 
  | 'restored';

// Export/Import
export interface ExportRequest {
  entityType: string;
  format: 'csv' | 'excel' | 'pdf' | 'json';
  filters?: Record<string, any>;
  dateRange?: DateRange;
  fields?: string[];
}

export interface ImportResult {
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: ValidationError[];
  warnings: string[];
}

// Charts and Analytics
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: any;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

// System Health
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  services: ServiceHealth[];
  lastChecked: Date;
}

export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastChecked: Date;
  error?: string;
}

// Environment Configuration
export interface AppConfig {
  production: boolean;
  apiUrl: string;
  version: string;
  buildTimestamp: Date;
  features: FeatureFlag[];
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  environments?: string[];
}