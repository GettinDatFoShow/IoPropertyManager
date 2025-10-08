// Service Request Management Interfaces and Types

export interface ServiceRequest {
  id: string;
  propertyId: string;
  propertyName: string; // Denormalized for easy display
  requesterId: string;
  requesterName: string; // Denormalized for easy display
  title: string;
  description: string;
  category: ServiceCategory;
  priority: Priority;
  status: ServiceStatus;
  attachments: ServiceAttachment[];
  estimatedCost?: number;
  actualCost?: number;
  assignedTo?: string;
  assignedToName?: string; // Denormalized for easy display
  createdAt: Date;
  updatedAt: Date;
  scheduledDate?: Date;
  completedAt?: Date;
  customerFeedback?: CustomerFeedback;
  internalNotes: string[];
  timeTracking: TimeEntry[];
  materials: Material[];
}

export interface ServiceAttachment {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
  description?: string;
}

export interface CustomerFeedback {
  rating: number; // 1-5 stars
  comment?: string;
  submittedAt: Date;
  wouldRecommend: boolean;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  description: string;
  billableHours: number;
  hourlyRate: number;
  totalCost: number;
}

export interface Material {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  supplier?: string;
  category: MaterialCategory;
  usedAt: Date;
}

// Service Categories
export type ServiceCategory = 
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'cleaning'
  | 'landscaping'
  | 'painting'
  | 'carpentry'
  | 'appliance-repair'
  | 'pest-control'
  | 'security'
  | 'general-maintenance'
  | 'emergency'
  | 'other';

// Priority Levels
export type Priority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'emergency';

// Service Request Status
export type ServiceStatus = 
  | 'submitted'
  | 'reviewed'
  | 'approved'
  | 'rejected'
  | 'assigned'
  | 'scheduled'
  | 'in-progress'
  | 'completed'
  | 'verified'
  | 'closed'
  | 'cancelled';

// Material Categories
export type MaterialCategory =
  | 'plumbing-supplies'
  | 'electrical-supplies'
  | 'hvac-parts'
  | 'cleaning-supplies'
  | 'paint-supplies'
  | 'hardware'
  | 'tools'
  | 'safety-equipment'
  | 'other';

// Service Request Creation/Update DTOs
export interface CreateServiceRequestDto {
  propertyId: string;
  title: string;
  description: string;
  category: ServiceCategory;
  priority: Priority;
  attachments?: File[];
  scheduledDate?: Date;
  estimatedCost?: number;
}

export interface UpdateServiceRequestDto extends Partial<CreateServiceRequestDto> {
  id: string;
  status?: ServiceStatus;
  assignedTo?: string;
  actualCost?: number;
  internalNotes?: string[];
  completedAt?: Date;
}

// Service Request Search and Filter
export interface ServiceRequestSearchCriteria {
  searchTerm?: string;
  propertyId?: string;
  category?: ServiceCategory;
  priority?: Priority;
  status?: ServiceStatus;
  assignedTo?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  costRange?: {
    min: number;
    max: number;
  };
}

export interface ServiceRequestListResponse {
  requests: ServiceRequest[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

// Service Analytics
export interface ServiceRequestStatistics {
  totalRequests: number;
  openRequests: number;
  completedRequests: number;
  averageCompletionTime: number; // in hours
  averageCost: number;
  customerSatisfactionScore: number;
  requestsByCategory: Record<ServiceCategory, number>;
  requestsByPriority: Record<Priority, number>;
  requestsByStatus: Record<ServiceStatus, number>;
  monthlyRequestVolume: MonthlyVolume[];
  topPerformingEmployees: EmployeePerformance[];
}

export interface MonthlyVolume {
  month: string;
  year: number;
  requestCount: number;
  completedCount: number;
  totalCost: number;
  averageRating: number;
}

export interface EmployeePerformance {
  employeeId: string;
  employeeName: string;
  completedRequests: number;
  averageCompletionTime: number;
  averageRating: number;
  totalRevenue: number;
}

// Task-specific interfaces (related to service requests)
export interface Task {
  id: string;
  serviceRequestId: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  status: TaskStatus;
  priority: Priority;
  estimatedDuration: number; // in minutes
  actualDuration?: number; // in minutes
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  subtasks: Subtask[];
  checklist: ChecklistItem[];
  notes: TaskNote[];
}

export interface Subtask {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  isRequired: boolean;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
}

export interface TaskNote {
  id: string;
  text: string;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  isInternal: boolean; // true for internal notes, false for client-visible
}

// Task Status
export type TaskStatus = 
  | 'pending'
  | 'assigned'
  | 'in-progress'
  | 'completed'
  | 'verified'
  | 'on-hold'
  | 'cancelled';

// Form Models
export interface ServiceRequestFormData {
  basicInfo: {
    title: string;
    description: string;
    category: ServiceCategory;
    priority: Priority;
  };
  scheduling: {
    scheduledDate?: Date;
    estimatedDuration?: number;
    urgentRequest: boolean;
  };
  attachments: File[];
  cost: {
    estimatedCost?: number;
    budgetApproved: boolean;
  };
}

// Validation Errors
export interface ServiceRequestValidationErrors {
  [key: string]: string | ServiceRequestValidationErrors;
}