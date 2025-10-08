// Work Order Management Models and Interfaces

import { Priority, ServiceCategory } from '../../services/models/service-request.interface';

export interface WorkOrder {
  id: string;
  workOrderNumber: string; // Human-readable identifier (e.g., WO-2025-001)
  
  // Source Information
  scheduleId?: string; // If generated from a schedule
  serviceRequestId?: string; // If generated from a service request
  propertyId: string;
  propertyName: string;
  
  // Work Order Details
  title: string;
  description: string;
  category: ServiceCategory;
  priority: Priority;
  
  // Assignment and Scheduling
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  scheduledDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  estimatedDuration: number; // minutes
  actualDuration?: number; // minutes
  
  // Status and Progress
  status: WorkOrderStatus;
  progressPercentage: number; // 0-100
  
  // Cost Management
  estimatedCost?: number;
  actualCost?: number;
  laborCost?: number;
  materialsCost?: number;
  
  // Work Details
  workInstructions?: string;
  completionNotes?: string;
  customerFeedback?: CustomerFeedback;
  
  // Materials and Tools
  requiredMaterials: MaterialRequirement[];
  usedMaterials: UsedMaterial[];
  requiredTools: string[];
  
  // Documentation
  beforePhotos: string[]; // Photo URLs
  afterPhotos: string[]; // Photo URLs
  attachments: WorkOrderAttachment[];
  
  // Quality Control
  qualityChecklist: QualityCheckItem[];
  inspectionRequired: boolean;
  inspectionCompleted: boolean;
  inspectedBy?: string;
  inspectionDate?: Date;
  inspectionNotes?: string;
  
  // Time Tracking
  timeEntries: TimeEntry[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  
  // Customer Information
  tenantId?: string;
  tenantName?: string;
  tenantContactInfo?: ContactInfo;
  customerNotificationSent: boolean;
  customerApprovalRequired: boolean;
  customerApproved?: boolean;
  
  // Emergency and Safety
  isEmergency: boolean;
  safetyNotes?: string;
  permitsRequired: string[];
  
  // Follow-up
  followUpRequired: boolean;
  followUpDate?: Date;
  followUpNotes?: string;
  warrantyPeriod?: number; // days
  warrantyExpirationDate?: Date;
}

export type WorkOrderStatus = 
  | 'draft' // Created but not yet assigned
  | 'assigned' // Assigned to employee
  | 'scheduled' // Scheduled for specific date/time
  | 'in-progress' // Work has started
  | 'paused' // Work temporarily stopped
  | 'waiting-parts' // Waiting for materials/parts
  | 'waiting-approval' // Waiting for customer/manager approval
  | 'completed' // Work finished
  | 'inspected' // Quality inspection completed
  | 'closed' // Work order closed and finalized
  | 'cancelled'; // Work order cancelled

export interface MaterialRequirement {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string; // e.g., 'pieces', 'feet', 'gallons'
  estimatedCost?: number;
  supplier?: string;
  partNumber?: string;
  isOrdered: boolean;
  orderDate?: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
}

export interface UsedMaterial {
  id: string;
  materialRequirementId?: string; // Link to requirement if applicable
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  actualCost: number;
  supplier?: string;
  partNumber?: string;
  usedDate: Date;
  notes?: string;
}

export interface WorkOrderAttachment {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
  description?: string;
  category: AttachmentCategory;
}

export type AttachmentCategory = 
  | 'photo-before'
  | 'photo-after'
  | 'photo-progress' 
  | 'document'
  | 'invoice'
  | 'receipt'
  | 'permit'
  | 'manual'
  | 'other';

export interface QualityCheckItem {
  id: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
  notes?: string;
  passedInspection?: boolean;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // minutes
  description: string;
  breakTime?: number; // minutes
  billableTime: number; // minutes
  hourlyRate?: number;
  totalCost?: number;
}

export interface ContactInfo {
  name: string;
  phone?: string;
  email?: string;
  preferredContact: 'phone' | 'email' | 'text';
  emergencyContact: boolean;
}

export interface CustomerFeedback {
  rating: number; // 1-5 stars
  comment?: string;
  submittedAt: Date;
  wouldRecommend: boolean;
  followUpRequested: boolean;
  issues?: string[];
}

// Search and Filter Interfaces
export interface WorkOrderSearchCriteria {
  searchTerm?: string;
  propertyId?: string;
  assignedEmployeeId?: string;
  status?: WorkOrderStatus[];
  priority?: Priority[];
  category?: ServiceCategory[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  isEmergency?: boolean;
  inspectionRequired?: boolean;
  followUpRequired?: boolean;
}

export interface WorkOrderListResponse {
  workOrders: WorkOrder[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

// Statistics and Analytics
export interface WorkOrderStatistics {
  totalWorkOrders: number;
  openWorkOrders: number;
  completedWorkOrders: number;
  overdueWorkOrders: number;
  inProgressWorkOrders: number;
  avgCompletionTime: number; // hours
  avgCompletionCost: number;
  customerSatisfactionScore: number;
  
  // Status Distribution
  workOrdersByStatus: Record<WorkOrderStatus, number>;
  workOrdersByPriority: Record<Priority, number>;
  workOrdersByCategory: Record<ServiceCategory, number>;
  
  // Time-based Analytics
  completionTrend: MonthlyWorkOrderData[];
  avgTimeByCategory: CategoryTimeData[];
  employeePerformance: EmployeeWorkOrderPerformance[];
  
  // Cost Analytics
  totalCosts: number;
  avgCostByCategory: CategoryCostData[];
  budgetVariance: BudgetVarianceData[];
}

export interface MonthlyWorkOrderData {
  month: string;
  year: number;
  created: number;
  completed: number;
  avgCompletionTime: number;
  totalCost: number;
  customerSatisfaction: number;
}

export interface CategoryTimeData {
  category: ServiceCategory;
  avgEstimatedTime: number;
  avgActualTime: number;
  variance: number; // percentage
}

export interface EmployeeWorkOrderPerformance {
  employeeId: string;
  employeeName: string;
  totalWorkOrders: number;
  completedWorkOrders: number;
  avgCompletionTime: number;
  avgCustomerRating: number;
  onTimePercentage: number;
  totalRevenue: number;
}

export interface CategoryCostData {
  category: ServiceCategory;
  avgEstimatedCost: number;
  avgActualCost: number;
  variance: number; // percentage
}

export interface BudgetVarianceData {
  period: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercentage: number;
}

// Form DTOs
export interface CreateWorkOrderDto {
  // Source
  scheduleId?: string;
  serviceRequestId?: string;
  propertyId: string;
  
  // Basic Information
  title: string;
  description: string;
  category: ServiceCategory;
  priority: Priority;
  
  // Assignment
  assignedEmployeeId?: string;
  scheduledDate?: Date;
  estimatedDuration: number;
  estimatedCost?: number;
  
  // Work Details
  workInstructions?: string;
  requiredMaterials?: Omit<MaterialRequirement, 'id' | 'isOrdered'>[];
  requiredTools?: string[];
  
  // Customer
  tenantId?: string;
  customerApprovalRequired?: boolean;
  
  // Emergency/Safety
  isEmergency?: boolean;
  safetyNotes?: string;
  permitsRequired?: string[];
  
  // Quality
  inspectionRequired?: boolean;
  qualityChecklist?: Omit<QualityCheckItem, 'id' | 'isCompleted'>[];
  
  // Follow-up
  followUpRequired?: boolean;
  warrantyPeriod?: number;
}

export interface UpdateWorkOrderDto extends Partial<CreateWorkOrderDto> {
  status?: WorkOrderStatus;
  progressPercentage?: number;
  actualStartDate?: Date;
  actualEndDate?: Date;
  actualDuration?: number;
  actualCost?: number;
  laborCost?: number;
  materialsCost?: number;
  completionNotes?: string;
  inspectionCompleted?: boolean;
  inspectedBy?: string;
  inspectionNotes?: string;
  customerApproved?: boolean;
  customerNotificationSent?: boolean;
  timeEntries?: TimeEntry[];
  usedMaterials?: UsedMaterial[];
}

// Utility Types
export type WorkOrderSortField = 
  | 'workOrderNumber' | 'title' | 'priority' | 'status' | 'assignedEmployeeName'
  | 'scheduledDate' | 'createdAt' | 'estimatedCost' | 'propertyName';

export type SortDirection = 'asc' | 'desc';

// Work Order Templates (for common work types)
export interface WorkOrderTemplate {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  estimatedDuration: number;
  estimatedCost?: number;
  workInstructions: string;
  requiredMaterials: Omit<MaterialRequirement, 'id' | 'isOrdered'>[];
  requiredTools: string[];
  qualityChecklist: Omit<QualityCheckItem, 'id' | 'isCompleted'>[];
  inspectionRequired: boolean;
  safetyNotes?: string;
  followUpRequired: boolean;
  warrantyPeriod?: number;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

// Integration with Scheduling System
export interface ScheduleToWorkOrderConversion {
  scheduleId: string;
  generateWorkOrder: boolean;
  workOrderTemplate?: string;
  customInstructions?: string;
  assignToScheduledEmployee: boolean;
  notifyCustomer: boolean;
  autoSchedule: boolean;
}

// Mobile/Field Worker Interfaces
export interface WorkOrderMobileData {
  workOrder: WorkOrder;
  propertyDetails: PropertyBasicInfo;
  customerContact?: ContactInfo;
  emergencyContacts: ContactInfo[];
  nearbyStores: NearbyStore[];
  weatherInfo?: WeatherInfo;
}

export interface PropertyBasicInfo {
  id: string;
  name: string;
  address: string;
  accessInstructions?: string;
  keyLocation?: string;
  specialNotes?: string;
  emergencyShutoffs: EmergencyShutoff[];
}

export interface EmergencyShutoff {
  type: 'water' | 'gas' | 'electricity' | 'hvac';
  location: string;
  instructions?: string;
}

export interface NearbyStore {
  name: string;
  address: string;
  phone: string;
  distance: number; // miles
  specialties: string[];
}

export interface WeatherInfo {
  temperature: number;
  conditions: string;
  precipitation: number;
  windSpeed: number;
  alerts?: string[];
}