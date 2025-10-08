import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import {
  ServiceSchedule,
  CreateServiceScheduleDto,
  UpdateServiceScheduleDto,
  ServiceScheduleSearchCriteria,
  ServiceScheduleListResponse,
  ServiceCalendarEvent,
  ScheduleStatistics,
  RecurrencePattern,
  RecurrenceType,
  SeasonalAdjustment,
  CalendarViewSettings,
  ServiceEventStatus,
  EmployeeWorkload,
  PropertyServiceCount
} from '../models';

import { Priority, ServiceCategory } from '../../services/models';

@Injectable({
  providedIn: 'root'
})
export class SchedulingService {

  // State management
  private schedulesSubject = new BehaviorSubject<ServiceSchedule[]>([]);
  public schedules$ = this.schedulesSubject.asObservable();

  private calendarEventsSubject = new BehaviorSubject<ServiceCalendarEvent[]>([]);
  public calendarEvents$ = this.calendarEventsSubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  // Initialize with mock scheduling data
  private initializeMockData() {
    const mockSchedules = this.generateMockSchedules();
    this.schedulesSubject.next(mockSchedules);
    
    // Generate calendar events from schedules
    const calendarEvents = this.generateCalendarEventsFromSchedules(mockSchedules);
    this.calendarEventsSubject.next(calendarEvents);
  }

  // CRUD Operations for Service Schedules

  /**
   * Get all service schedules with optional search criteria
   */
  getServiceSchedules(criteria?: ServiceScheduleSearchCriteria): Observable<ServiceScheduleListResponse> {
    return this.schedules$.pipe(
      map(schedules => {
        let filteredSchedules = [...schedules];

        if (criteria) {
          // Apply search filters
          if (criteria.searchTerm) {
            const term = criteria.searchTerm.toLowerCase();
            filteredSchedules = filteredSchedules.filter(schedule =>
              schedule.title.toLowerCase().includes(term) ||
              schedule.description.toLowerCase().includes(term) ||
              schedule.propertyName.toLowerCase().includes(term) ||
              (schedule.assignedEmployeeName && schedule.assignedEmployeeName.toLowerCase().includes(term))
            );
          }

          if (criteria.propertyId) {
            filteredSchedules = filteredSchedules.filter(s => s.propertyId === criteria.propertyId);
          }

          if (criteria.category) {
            filteredSchedules = filteredSchedules.filter(s => s.category === criteria.category);
          }

          if (criteria.priority) {
            filteredSchedules = filteredSchedules.filter(s => s.priority === criteria.priority);
          }

          if (criteria.assignedEmployeeId) {
            filteredSchedules = filteredSchedules.filter(s => s.assignedEmployeeId === criteria.assignedEmployeeId);
          }

          if (criteria.isActive !== undefined) {
            filteredSchedules = filteredSchedules.filter(s => s.isActive === criteria.isActive);
          }

          if (criteria.dateRange) {
            filteredSchedules = filteredSchedules.filter(s =>
              s.nextServiceDate >= criteria.dateRange!.from &&
              s.nextServiceDate <= criteria.dateRange!.to
            );
          }

          if (criteria.tags && criteria.tags.length > 0) {
            filteredSchedules = filteredSchedules.filter(s =>
              s.tags && s.tags.some(tag => criteria.tags!.includes(tag))
            );
          }

          if (criteria.recurrenceType) {
            filteredSchedules = filteredSchedules.filter(s => s.recurrencePattern.type === criteria.recurrenceType);
          }
        }

        // Sort by next service date (soonest first)
        filteredSchedules.sort((a, b) => a.nextServiceDate.getTime() - b.nextServiceDate.getTime());

        return {
          schedules: filteredSchedules,
          totalCount: filteredSchedules.length,
          pageSize: filteredSchedules.length,
          currentPage: 1,
          totalPages: 1
        };
      }),
      delay(300) // Simulate API delay
    );
  }

  /**
   * Get a specific service schedule by ID
   */
  getServiceScheduleById(id: string): Observable<ServiceSchedule | null> {
    return this.schedules$.pipe(
      map(schedules => schedules.find(schedule => schedule.id === id) || null),
      delay(200)
    );
  }

  /**
   * Create a new service schedule
   */
  createServiceSchedule(scheduleData: CreateServiceScheduleDto): Observable<ServiceSchedule> {
    return new Observable(observer => {
      setTimeout(() => {
        const newSchedule: ServiceSchedule = {
          id: `schedule-${Date.now()}`,
          propertyId: scheduleData.propertyId,
          propertyName: 'Sample Property', // Mock data
          serviceItemId: scheduleData.serviceItemId,
          serviceItemName: scheduleData.serviceItemId ? 'Sample Service Item' : undefined,
          title: scheduleData.title,
          description: scheduleData.description,
          category: scheduleData.category,
          priority: scheduleData.priority,
          recurrencePattern: scheduleData.recurrencePattern,
          nextServiceDate: scheduleData.nextServiceDate,
          assignedEmployeeId: scheduleData.assignedEmployeeId,
          assignedEmployeeName: scheduleData.assignedEmployeeId ? 'Sample Employee' : undefined,
          estimatedDuration: scheduleData.estimatedDuration,
          estimatedCost: scheduleData.estimatedCost,
          isActive: true,
          seasonalAdjustments: scheduleData.seasonalAdjustments || [],
          specialInstructions: scheduleData.specialInstructions,
          requiredMaterials: scheduleData.requiredMaterials || [],
          tags: scheduleData.tags || [],
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'current-user-id',
          lastModifiedBy: 'current-user-id'
        };

        // Add to mock data
        const currentSchedules = this.schedulesSubject.value;
        this.schedulesSubject.next([...currentSchedules, newSchedule]);

        // Update calendar events
        this.updateCalendarEvents();

        observer.next(newSchedule);
        observer.complete();
      }, 800);
    });
  }

  /**
   * Update an existing service schedule
   */
  updateServiceSchedule(id: string, updateData: UpdateServiceScheduleDto): Observable<ServiceSchedule> {
    return new Observable(observer => {
      setTimeout(() => {
        const currentSchedules = this.schedulesSubject.value;
        const scheduleIndex = currentSchedules.findIndex(s => s.id === id);

        if (scheduleIndex === -1) {
          observer.error(new Error('Service schedule not found'));
          return;
        }

        const updatedSchedule: ServiceSchedule = {
          ...currentSchedules[scheduleIndex],
          ...updateData,
          updatedAt: new Date(),
          lastModifiedBy: 'current-user-id'
        };

        const updatedSchedules = [...currentSchedules];
        updatedSchedules[scheduleIndex] = updatedSchedule;

        this.schedulesSubject.next(updatedSchedules);
        this.updateCalendarEvents();

        observer.next(updatedSchedule);
        observer.complete();
      }, 600);
    });
  }

  /**
   * Delete a service schedule
   */
  deleteServiceSchedule(id: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        const currentSchedules = this.schedulesSubject.value;
        const filteredSchedules = currentSchedules.filter(s => s.id !== id);

        this.schedulesSubject.next(filteredSchedules);
        this.updateCalendarEvents();

        observer.next(true);
        observer.complete();
      }, 400);
    });
  }

  /**
   * Calculate next service date based on recurrence pattern
   */
  calculateNextServiceDate(schedule: ServiceSchedule, fromDate?: Date): Date {
    const baseDate = fromDate || schedule.nextServiceDate;
    const pattern = schedule.recurrencePattern;

    let nextDate = new Date(baseDate);

    switch (pattern.type) {
      case 'once':
        // One-time service, return same date
        return nextDate;

      case 'daily':
        nextDate.setDate(nextDate.getDate() + pattern.interval);
        break;

      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (pattern.interval * 7));
        break;

      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + pattern.interval);
        break;

      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + (pattern.interval * 3));
        break;

      case 'annually':
        nextDate.setFullYear(nextDate.getFullYear() + pattern.interval);
        break;

      case 'custom':
        // Custom logic based on pattern configuration
        nextDate.setDate(nextDate.getDate() + pattern.interval);
        break;
    }

    // Apply seasonal adjustments if applicable
    if (schedule.seasonalAdjustments && schedule.seasonalAdjustments.length > 0) {
      nextDate = this.applySeasonalAdjustments(nextDate, schedule.seasonalAdjustments);
    }

    // Skip weekends if configured
    if (pattern.skipWeekends) {
      nextDate = this.skipWeekends(nextDate);
    }

    // Skip holidays if configured
    if (pattern.skipHolidays) {
      nextDate = this.skipHolidays(nextDate);
    }

    return nextDate;
  }

  /**
   * Get calendar events for a specific date range
   */
  getCalendarEvents(startDate: Date, endDate: Date, settings?: CalendarViewSettings): Observable<ServiceCalendarEvent[]> {
    return this.calendarEvents$.pipe(
      map(events => {
        let filteredEvents = events.filter(event =>
          event.start >= startDate && event.start <= endDate
        );

        if (settings) {
          if (settings.filterByEmployee) {
            filteredEvents = filteredEvents.filter(e => e.assignedEmployeeName === settings.filterByEmployee);
          }

          if (settings.filterByProperty) {
            filteredEvents = filteredEvents.filter(e => e.propertyName === settings.filterByProperty);
          }

          if (settings.filterByCategory) {
            filteredEvents = filteredEvents.filter(e => e.category === settings.filterByCategory);
          }

          if (!settings.showCompleted) {
            filteredEvents = filteredEvents.filter(e => e.status !== 'completed');
          }
        }

        return filteredEvents;
      }),
      delay(200)
    );
  }

  /**
   * Get schedule statistics
   */
  getScheduleStatistics(): Observable<ScheduleStatistics> {
    return this.schedules$.pipe(
      map(schedules => {
        const totalSchedules = schedules.length;
        const activeSchedules = schedules.filter(s => s.isActive).length;
        const inactiveSchedules = totalSchedules - activeSchedules;

        const now = new Date();
        const overdueServices = schedules.filter(s =>
          s.isActive && s.nextServiceDate < now
        ).length;

        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        const upcomingServices = schedules.filter(s =>
          s.isActive && s.nextServiceDate >= now && s.nextServiceDate <= weekFromNow
        ).length;

        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const schedulesThisMonth = schedules.filter(s =>
          s.nextServiceDate >= monthStart && s.nextServiceDate <= monthEnd
        ).length;

        // Calculate average cost
        const schedulesWithCost = schedules.filter(s => s.estimatedCost);
        const averageServiceCost = schedulesWithCost.length > 0
          ? schedulesWithCost.reduce((sum, s) => sum + s.estimatedCost!, 0) / schedulesWithCost.length
          : 0;

        // Group by category
        const schedulesByCategory: Record<ServiceCategory, number> = {
          'plumbing': 0, 'electrical': 0, 'hvac': 0, 'cleaning': 0, 'landscaping': 0,
          'painting': 0, 'carpentry': 0, 'appliance-repair': 0, 'pest-control': 0,
          'security': 0, 'general-maintenance': 0, 'emergency': 0, 'other': 0
        };
        schedules.forEach(s => {
          schedulesByCategory[s.category] = (schedulesByCategory[s.category] || 0) + 1;
        });

        // Find most common category
        const mostCommonCategory = Object.entries(schedulesByCategory)
          .reduce((a, b) => a[1] > b[1] ? a : b)[0] as ServiceCategory;

        // Group by priority
        const schedulesByPriority: Record<Priority, number> = {
          'low': 0, 'medium': 0, 'high': 0, 'emergency': 0
        };
        schedules.forEach(s => {
          schedulesByPriority[s.priority] = (schedulesByPriority[s.priority] || 0) + 1;
        });

        // Group by recurrence type
        const schedulesByRecurrence: Record<RecurrenceType, number> = {
          'once': 0, 'daily': 0, 'weekly': 0, 'monthly': 0, 'quarterly': 0, 'annually': 0, 'custom': 0
        };
        schedules.forEach(s => {
          schedulesByRecurrence[s.recurrencePattern.type] = (schedulesByRecurrence[s.recurrencePattern.type] || 0) + 1;
        });

        // Calculate employee workload (mock data)
        const employeeWorkload: EmployeeWorkload[] = [
          {
            employeeId: 'emp-001',
            employeeName: 'Mike Davis',
            totalSchedules: schedules.filter(s => s.assignedEmployeeId === 'emp-001').length,
            upcomingServices: 5,
            overdueServices: 2,
            averageServiceDuration: 120,
            totalEstimatedCost: 1500
          }
        ];

        // Calculate property service counts (mock data)
        const propertyServiceCounts: PropertyServiceCount[] = [
          {
            propertyId: 'prop-001',
            propertyName: 'Sunset Apartments',
            totalSchedules: schedules.filter(s => s.propertyId === 'prop-001').length,
            activeSchedules: 3,
            nextServiceDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            totalEstimatedCost: 800,
            mostCommonCategory: 'plumbing'
          }
        ];

        return {
          totalSchedules,
          activeSchedules,
          inactiveSchedules,
          overdueServices,
          upcomingServices,
          schedulesThisMonth,
          averageServiceCost: Math.round(averageServiceCost * 100) / 100,
          mostCommonCategory,
          schedulesByCategory,
          schedulesByPriority,
          schedulesByRecurrence,
          employeeWorkload,
          propertyServiceCounts
        };
      }),
      delay(500)
    );
  }

  // Helper Methods

  /**
   * Get service categories for dropdowns
   */
  getServiceCategories(): ServiceCategory[] {
    return [
      'plumbing', 'electrical', 'hvac', 'cleaning', 'landscaping',
      'painting', 'carpentry', 'appliance-repair', 'pest-control',
      'security', 'general-maintenance', 'emergency', 'other'
    ];
  }

  /**
   * Get priority levels for dropdowns
   */
  getPriorityLevels(): Priority[] {
    return ['low', 'medium', 'high', 'emergency'];
  }

  /**
   * Get recurrence types for dropdowns
   */
  getRecurrenceTypes(): { value: RecurrenceType; label: string }[] {
    return [
      { value: 'once', label: 'One Time' },
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'quarterly', label: 'Quarterly' },
      { value: 'annually', label: 'Annually' },
      { value: 'custom', label: 'Custom' }
    ];
  }

  // Private utility methods

  private applySeasonalAdjustments(date: Date, adjustments: SeasonalAdjustment[]): Date {
    // Simple seasonal adjustment logic
    const month = date.getMonth() + 1;
    const currentSeason = this.getSeason(month);
    
    const adjustment = adjustments.find(adj => adj.season === currentSeason);
    if (adjustment && adjustment.frequencyMultiplier !== 1) {
      // Adjust date based on frequency multiplier
      const days = Math.round(30 * (1 / adjustment.frequencyMultiplier - 1));
      date.setDate(date.getDate() + days);
    }
    
    return date;
  }

  private getSeason(month: number): 'spring' | 'summer' | 'fall' | 'winter' {
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'fall';
    return 'winter';
  }

  private skipWeekends(date: Date): Date {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) { // Sunday
      date.setDate(date.getDate() + 1); // Move to Monday
    } else if (dayOfWeek === 6) { // Saturday
      date.setDate(date.getDate() + 2); // Move to Monday
    }
    return date;
  }

  private skipHolidays(date: Date): Date {
    // Simple holiday checking (would be expanded with real holiday data)
    const holidays = [
      new Date(date.getFullYear(), 0, 1), // New Year's Day
      new Date(date.getFullYear(), 6, 4), // Independence Day
      new Date(date.getFullYear(), 11, 25) // Christmas
    ];

    const isHoliday = holidays.some(holiday => 
      holiday.toDateString() === date.toDateString()
    );

    if (isHoliday) {
      date.setDate(date.getDate() + 1);
      return this.skipHolidays(date); // Recursive check
    }

    return date;
  }

  private updateCalendarEvents() {
    const schedules = this.schedulesSubject.value;
    const events = this.generateCalendarEventsFromSchedules(schedules);
    this.calendarEventsSubject.next(events);
  }

  private generateCalendarEventsFromSchedules(schedules: ServiceSchedule[]): ServiceCalendarEvent[] {
    const events: ServiceCalendarEvent[] = [];

    schedules.forEach(schedule => {
      if (schedule.isActive) {
        const event: ServiceCalendarEvent = {
          id: `event-${schedule.id}`,
          title: schedule.title,
          description: schedule.description,
          start: new Date(schedule.nextServiceDate),
          end: new Date(schedule.nextServiceDate.getTime() + schedule.estimatedDuration * 60000),
          allDay: false,
          backgroundColor: this.getPriorityColor(schedule.priority),
          textColor: '#ffffff',
          category: schedule.category,
          priority: schedule.priority,
          propertyName: schedule.propertyName,
          assignedEmployeeName: schedule.assignedEmployeeName,
          estimatedDuration: schedule.estimatedDuration,
          status: this.getEventStatus(schedule),
          scheduleId: schedule.id
        };

        events.push(event);
      }
    });

    return events;
  }

  private getPriorityColor(priority: Priority): string {
    const colorMap = {
      'low': '#10dc60',
      'medium': '#ffce00',
      'high': '#f04141',
      'emergency': '#8b0000'
    };
    return colorMap[priority] || '#3880ff';
  }

  private getEventStatus(schedule: ServiceSchedule): ServiceEventStatus {
    const now = new Date();
    if (schedule.nextServiceDate < now) {
      return 'overdue';
    }
    if (schedule.assignedEmployeeId) {
      return 'assigned';
    }
    return 'scheduled';
  }

  // Mock Data Generation

  private generateMockSchedules(): ServiceSchedule[] {
    return [
      {
        id: 'schedule-001',
        propertyId: 'prop-001',
        propertyName: 'Sunset Apartments - Building A',
        serviceItemId: 'item-001',
        serviceItemName: 'HVAC System - Unit 101',
        title: 'HVAC Filter Replacement',
        description: 'Monthly replacement of air filters in all units',
        category: 'hvac',
        priority: 'medium',
        recurrencePattern: {
          type: 'monthly',
          interval: 1,
          dayOfMonth: 15,
          skipWeekends: true,
          skipHolidays: false
        },
        nextServiceDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        lastServiceDate: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000), // 27 days ago
        assignedEmployeeId: 'emp-001',
        assignedEmployeeName: 'Mike Davis',
        estimatedDuration: 90, // 1.5 hours
        estimatedCost: 150,
        actualCost: 145,
        isActive: true,
        specialInstructions: 'Check all vents for blockages during filter replacement',
        requiredMaterials: ['HVAC filters (16x20x1)', 'Screwdriver', 'Vacuum cleaner'],
        tags: ['routine', 'hvac', 'monthly'],
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        createdBy: 'admin-001',
        lastModifiedBy: 'admin-001'
      },
      {
        id: 'schedule-002',
        propertyId: 'prop-002',
        propertyName: 'Oak Street Commercial Complex',
        title: 'Landscaping Maintenance',
        description: 'Weekly lawn maintenance, trimming, and leaf removal',
        category: 'landscaping',
        priority: 'low',
        recurrencePattern: {
          type: 'weekly',
          interval: 1,
          daysOfWeek: [2], // Tuesday
          skipWeekends: false,
          skipHolidays: true
        },
        nextServiceDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        lastServiceDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        assignedEmployeeId: 'emp-002',
        assignedEmployeeName: 'Sarah Wilson',
        estimatedDuration: 180, // 3 hours
        estimatedCost: 200,
        isActive: true,
        seasonalAdjustments: [
          {
            season: 'winter',
            frequencyMultiplier: 0.5, // Half as often in winter
            costMultiplier: 0.8, // 20% less expensive
            description: 'Reduced frequency during winter months',
            startDate: '12-01',
            endDate: '02-28'
          }
        ],
        requiredMaterials: ['Lawn mower fuel', 'Trimmer line', 'Leaf bags'],
        tags: ['landscaping', 'weekly', 'seasonal'],
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        createdBy: 'manager-001',
        lastModifiedBy: 'manager-001'
      },
      {
        id: 'schedule-003',
        propertyId: 'prop-001',
        propertyName: 'Sunset Apartments - Parking Lot',
        title: 'Parking Lot Cleaning',
        description: 'Power washing and debris removal from parking areas',
        category: 'cleaning',
        priority: 'medium',
        recurrencePattern: {
          type: 'quarterly',
          interval: 1,
          skipWeekends: true,
          skipHolidays: true
        },
        nextServiceDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        estimatedDuration: 240, // 4 hours
        estimatedCost: 300,
        isActive: true,
        specialInstructions: 'Coordinate with property manager to ensure parking lot is clear',
        requiredMaterials: ['Power washer', 'Cleaning solution', 'Brooms'],
        tags: ['cleaning', 'quarterly', 'parking'],
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        createdBy: 'admin-001',
        lastModifiedBy: 'admin-001'
      }
    ];
  }
}