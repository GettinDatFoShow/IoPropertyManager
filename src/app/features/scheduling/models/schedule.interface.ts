// Service Scheduling Models and Interfaces

import { Priority, ServiceCategory } from '../../services/models';

export interface ServiceSchedule {
  id: string;
  propertyId: string;
  propertyName: string; // Denormalized for display
  serviceItemId?: string; // Optional link to specific service item
  serviceItemName?: string; // Denormalized for display
  title: string;
  description: string;
  category: ServiceCategory;
  priority: Priority;
  recurrencePattern: RecurrencePattern;
  nextServiceDate: Date;
  lastServiceDate?: Date;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string; // Denormalized for display
  estimatedDuration: number; // minutes
  estimatedCost?: number;
  actualCost?: number;
  isActive: boolean;
  seasonalAdjustments?: SeasonalAdjustment[];
  specialInstructions?: string;
  requiredMaterials?: string[];
  photos?: string[]; // Photo URLs for reference
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export interface RecurrencePattern {
  type: RecurrenceType;
  interval: number; // every X days/weeks/months/years
  daysOfWeek?: DayOfWeek[]; // for weekly patterns [0=Sunday, 1=Monday, ...]
  dayOfMonth?: number; // for monthly patterns (1-31)
  monthsOfYear?: MonthOfYear[]; // for annual patterns [1=Jan, 2=Feb, ...]
  weekOfMonth?: WeekOfMonth; // for monthly patterns (first, second, etc.)
  endDate?: Date; // when recurrence should stop
  maxOccurrences?: number; // maximum number of occurrences
  skipWeekends?: boolean; // automatically skip weekends
  skipHolidays?: boolean; // automatically skip holidays
}

export type RecurrenceType = 
  | 'once' // one-time service
  | 'daily' 
  | 'weekly' 
  | 'monthly' 
  | 'quarterly' 
  | 'annually' 
  | 'custom'; // custom interval

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0, Monday = 1, etc.

export type MonthOfYear = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type WeekOfMonth = 'first' | 'second' | 'third' | 'fourth' | 'last';

export interface SeasonalAdjustment {
  season: Season;
  frequencyMultiplier: number; // 0.5 = half as often, 2 = twice as often
  costMultiplier: number; // 1.0 = same cost, 1.5 = 50% more expensive
  description?: string; // explanation of the adjustment
  startDate: string; // MM-DD format (e.g., "03-20" for March 20)
  endDate: string; // MM-DD format (e.g., "06-20" for June 20)
}

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export interface ServiceScheduleSearchCriteria {
  searchTerm?: string;
  propertyId?: string;
  category?: ServiceCategory;
  priority?: Priority;
  assignedEmployeeId?: string;
  isActive?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  tags?: string[];
  recurrenceType?: RecurrenceType;
}

export interface ServiceScheduleListResponse {
  schedules: ServiceSchedule[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

export interface ServiceCalendarEvent {
  id: string; // schedule ID
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  backgroundColor: string;
  textColor: string;
  category: ServiceCategory;
  priority: Priority;
  propertyName: string;
  assignedEmployeeName?: string;
  estimatedDuration: number;
  status: ServiceEventStatus;
  scheduleId: string;
  workOrderId?: string; // if work order has been created
}

export type ServiceEventStatus = 
  | 'scheduled' // upcoming service
  | 'assigned' // assigned to employee
  | 'in-progress' // work in progress
  | 'completed' // service completed
  | 'overdue' // past due date
  | 'cancelled' // cancelled service
  | 'rescheduled'; // moved to different date

export interface ScheduleStatistics {
  totalSchedules: number;
  activeSchedules: number;
  inactiveSchedules: number;
  overdueServices: number;
  upcomingServices: number; // next 7 days
  schedulesThisMonth: number;
  averageServiceCost: number;
  mostCommonCategory: ServiceCategory;
  schedulesByCategory: Record<ServiceCategory, number>;
  schedulesByPriority: Record<Priority, number>;
  schedulesByRecurrence: Record<RecurrenceType, number>;
  employeeWorkload: EmployeeWorkload[];
  propertyServiceCounts: PropertyServiceCount[];
}

export interface EmployeeWorkload {
  employeeId: string;
  employeeName: string;
  totalSchedules: number;
  upcomingServices: number;
  overdueServices: number;
  averageServiceDuration: number;
  totalEstimatedCost: number;
}

export interface PropertyServiceCount {
  propertyId: string;
  propertyName: string;
  totalSchedules: number;
  activeSchedules: number;
  nextServiceDate?: Date;
  totalEstimatedCost: number;
  mostCommonCategory: ServiceCategory;
}

// Form DTOs for creating and updating schedules
export interface CreateServiceScheduleDto {
  propertyId: string;
  serviceItemId?: string;
  title: string;
  description: string;
  category: ServiceCategory;
  priority: Priority;
  recurrencePattern: RecurrencePattern;
  nextServiceDate: Date;
  assignedEmployeeId?: string;
  estimatedDuration: number;
  estimatedCost?: number;
  seasonalAdjustments?: SeasonalAdjustment[];
  specialInstructions?: string;
  requiredMaterials?: string[];
  tags?: string[];
}

export interface UpdateServiceScheduleDto extends Partial<CreateServiceScheduleDto> {
  isActive?: boolean;
  lastServiceDate?: Date;
  actualCost?: number;
}

// Utility interfaces for form components
export interface RecurrenceFormData {
  type: RecurrenceType;
  interval: number;
  daysOfWeek: boolean[]; // array of 7 booleans for each day
  dayOfMonth: number;
  monthsOfYear: boolean[]; // array of 12 booleans for each month
  weekOfMonth: WeekOfMonth;
  endDate?: string; // ISO date string
  maxOccurrences?: number;
  skipWeekends: boolean;
  skipHolidays: boolean;
}

export interface SeasonalAdjustmentFormData {
  season: Season;
  frequencyMultiplier: number;
  costMultiplier: number;
  description: string;
  enabled: boolean;
}

// Calendar view interfaces
export interface CalendarViewSettings {
  view: 'month' | 'week' | 'day' | 'agenda';
  startDate: Date;
  showWeekends: boolean;
  showCompleted: boolean;
  filterByEmployee?: string;
  filterByProperty?: string;
  filterByCategory?: ServiceCategory;
}

export interface CalendarEventAction {
  type: 'view' | 'edit' | 'complete' | 'reschedule' | 'cancel' | 'create-work-order';
  scheduleId: string;
  eventDate: Date;
}

// Holiday management for scheduling
export interface Holiday {
  id: string;
  name: string;
  date: Date; // specific date for the year
  isRecurring: boolean; // if it repeats annually
  affectsScheduling: boolean; // if services should be skipped
}

// Time slot management for scheduling
export interface TimeSlot {
  start: string; // HH:MM format (e.g., "09:00")
  end: string; // HH:MM format (e.g., "17:00")
  isAvailable: boolean;
  employeeId?: string; // if assigned to specific employee
  bufferMinutes: number; // time buffer between services
}

export interface WorkingHours {
  dayOfWeek: DayOfWeek;
  timeSlots: TimeSlot[];
  isWorkingDay: boolean;
}

// Export utility types
export type ScheduleSortField = 
  | 'title' | 'propertyName' | 'category' | 'priority' 
  | 'nextServiceDate' | 'assignedEmployeeName' | 'estimatedCost' 
  | 'createdAt' | 'lastServiceDate';

export type SortDirection = 'asc' | 'desc';