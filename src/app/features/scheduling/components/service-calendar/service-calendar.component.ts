import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SchedulingService } from '../../services/scheduling.service';
import {
  ServiceSchedule,
  ServiceCalendarEvent,
  CalendarViewSettings,
  ServiceScheduleSearchCriteria,
  ScheduleStatistics
} from '../../models';
import { Priority, ServiceCategory } from '../../../services/models';
import { ScheduleListComponent } from '../schedule-list/schedule-list.component';

@Component({
  selector: 'app-service-calendar',
  templateUrl: './service-calendar.component.html',
  styleUrls: ['./service-calendar.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ScheduleListComponent]
})
export class ServiceCalendarComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private schedulingService = inject(SchedulingService);
  private router = inject(Router);
  private modalController = inject(ModalController);

  // Data
  schedules: ServiceSchedule[] = [];
  calendarEvents: ServiceCalendarEvent[] = [];
  statistics: ScheduleStatistics | null = null;
  loading = false;
  error: string | null = null;

  // Calendar view settings
  currentView: 'month' | 'week' | 'agenda' = 'month';
  displayMode: 'calendar' | 'list' = 'calendar';
  currentDate = new Date();
  selectedDate: Date | null = null;

  // Calendar display
  calendarDays: CalendarDay[] = [];
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Search and filters
  searchTerm = '';
  selectedCategory: ServiceCategory | 'all' = 'all';
  selectedPriority: Priority | 'all' = 'all';
  selectedEmployee = '';
  selectedProperty = '';
  showCompleted = false;

  // Options for dropdowns
  categories: ServiceCategory[] = [];
  priorities: Priority[] = [];

  constructor() {}

  ngOnInit() {
    this.initializeDropdownOptions();
    this.loadScheduleData();
    this.generateCalendarDays();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize dropdown options
   */
  private initializeDropdownOptions() {
    this.categories = this.schedulingService.getServiceCategories();
    this.priorities = this.schedulingService.getPriorityLevels();
  }

  /**
   * Load schedule data and statistics
   */
  loadScheduleData() {
    this.loading = true;
    this.error = null;

    const criteria: ServiceScheduleSearchCriteria = {
      searchTerm: this.searchTerm || undefined,
      category: this.selectedCategory !== 'all' ? this.selectedCategory : undefined,
      priority: this.selectedPriority !== 'all' ? this.selectedPriority : undefined,
      isActive: true // Only show active schedules
    };

    // Load schedules
    this.schedulingService.getServiceSchedules(criteria)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.schedules = response.schedules;
          this.loading = false;
          this.loadCalendarEvents();
        },
        error: (error) => {
          console.error('Error loading schedules:', error);
          this.error = 'Failed to load service schedules. Please try again.';
          this.loading = false;
        }
      });

    // Load statistics
    this.schedulingService.getScheduleStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.statistics = stats;
        },
        error: (error) => {
          console.error('Error loading statistics:', error);
        }
      });
  }

  /**
   * Load calendar events for current view
   */
  loadCalendarEvents() {
    const startDate = this.getViewStartDate();
    const endDate = this.getViewEndDate();

    const settings: CalendarViewSettings = {
      view: this.currentView,
      startDate: this.currentDate,
      showWeekends: true,
      showCompleted: this.showCompleted,
      filterByEmployee: this.selectedEmployee || undefined,
      filterByProperty: this.selectedProperty || undefined,
      filterByCategory: this.selectedCategory !== 'all' ? this.selectedCategory : undefined
    };

    this.schedulingService.getCalendarEvents(startDate, endDate, settings)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          this.calendarEvents = events;
          this.updateCalendarDays();
        },
        error: (error) => {
          console.error('Error loading calendar events:', error);
        }
      });
  }

  /**
   * Generate calendar days for month view
   */
  generateCalendarDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the beginning of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // End at the end of the week containing the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    this.calendarDays = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      this.calendarDays.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: this.isToday(currentDate),
        isSelected: this.selectedDate ? this.isSameDay(currentDate, this.selectedDate) : false,
        events: [],
        dayNumber: currentDate.getDate()
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  /**
   * Update calendar days with events
   */
  updateCalendarDays() {
    this.calendarDays.forEach(day => {
      day.events = this.calendarEvents.filter(event =>
        this.isSameDay(event.start, day.date)
      );
    });
  }

  /**
   * Navigate calendar view
   */
  navigateCalendar(direction: 'prev' | 'next') {
    switch (this.currentView) {
      case 'month':
        this.currentDate.setMonth(this.currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        this.currentDate.setDate(this.currentDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
    }
    
    this.generateCalendarDays();
    this.loadCalendarEvents();
  }

  /**
   * Change calendar view
   */
  changeView(view: 'month' | 'week' | 'agenda') {
    this.currentView = view;
    this.generateCalendarDays();
    this.loadCalendarEvents();
  }

  /**
   * Toggle display mode between calendar and list
   */
  toggleDisplayMode(mode: 'calendar' | 'list') {
    this.displayMode = mode;
  }

  /**
   * Go to today
   */
  goToToday() {
    this.currentDate = new Date();
    this.generateCalendarDays();
    this.loadCalendarEvents();
  }

  /**
   * Select a calendar day
   */
  selectDay(day: CalendarDay) {
    this.selectedDate = day.date;
    this.updateCalendarDays();
  }

  /**
   * Handle filter changes
   */
  onFilterChange() {
    this.loadScheduleData();
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.selectedPriority = 'all';
    this.selectedEmployee = '';
    this.selectedProperty = '';
    this.showCompleted = false;
    this.loadScheduleData();
  }

  /**
   * Handle event click
   */
  onEventClick(event: ServiceCalendarEvent) {
    // Navigate to schedule details or show popup
    this.router.navigate(['/scheduling/schedules', event.scheduleId]);
  }

  /**
   * Create new schedule
   */
  createSchedule() {
    this.router.navigate(['/scheduling/schedules/create']);
  }

  /**
   * View schedule details
   */
  viewSchedule(schedule: ServiceSchedule) {
    this.router.navigate(['/scheduling/schedules', schedule.id]);
  }

  /**
   * Get formatted month/year for header
   */
  getCalendarHeader(): string {
    return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  /**
   * Get events for selected date
   */
  getSelectedDateEvents(): ServiceCalendarEvent[] {
    if (!this.selectedDate) return [];
    
    return this.calendarEvents.filter(event =>
      this.isSameDay(event.start, this.selectedDate!)
    );
  }

  /**
   * Get priority color class
   */
  getPriorityColor(priority: Priority): string {
    const colorMap = {
      'low': 'success',
      'medium': 'warning',
      'high': 'danger',
      'emergency': 'danger'
    };
    return colorMap[priority] || 'medium';
  }

  /**
   * Get status color class
   */
  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'scheduled': 'primary',
      'assigned': 'secondary',
      'in-progress': 'warning',
      'completed': 'success',
      'overdue': 'danger',
      'cancelled': 'dark'
    };
    return colorMap[status] || 'medium';
  }

  /**
   * Format time for display
   */
  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  /**
   * Get category display name
   */
  getCategoryDisplayName(category: ServiceCategory): string {
    const displayNames = {
      'plumbing': 'Plumbing',
      'electrical': 'Electrical',
      'hvac': 'HVAC',
      'cleaning': 'Cleaning',
      'landscaping': 'Landscaping',
      'painting': 'Painting',
      'carpentry': 'Carpentry',
      'appliance-repair': 'Appliance Repair',
      'pest-control': 'Pest Control',
      'security': 'Security',
      'general-maintenance': 'General Maintenance',
      'emergency': 'Emergency',
      'other': 'Other'
    };
    return displayNames[category] || category;
  }

  /**
   * Track by function for ngFor performance
   */
  trackByCalendarDay(index: number, item: CalendarDay): string {
    return item.date.toDateString();
  }

  trackByEvent(index: number, item: ServiceCalendarEvent): string {
    return item.id;
  }

  // Private utility methods

  private getViewStartDate(): Date {
    const date = new Date(this.currentDate);
    
    switch (this.currentView) {
      case 'month':
        date.setDate(1);
        date.setDate(date.getDate() - date.getDay()); // Start of week containing first day
        break;
      case 'week':
        date.setDate(date.getDate() - date.getDay()); // Start of current week
        break;
      case 'agenda':
        // Show next 30 days
        break;
    }
    
    return date;
  }

  private getViewEndDate(): Date {
    const date = new Date(this.currentDate);
    
    switch (this.currentView) {
      case 'month':
        date.setMonth(date.getMonth() + 1, 0); // Last day of month
        date.setDate(date.getDate() + (6 - date.getDay())); // End of week containing last day
        break;
      case 'week':
        date.setDate(date.getDate() - date.getDay() + 6); // End of current week
        break;
      case 'agenda':
        date.setDate(date.getDate() + 30); // Next 30 days
        break;
    }
    
    return date;
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return this.isSameDay(date, today);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  async openCreateScheduleModal(): Promise<void> {
    const { ScheduleModalComponent } = await import('../schedule-modal/schedule-modal.component');
    
    const modal = await this.modalController.create({
      component: ScheduleModalComponent,
      breakpoints: [0, 0.8, 1],
      initialBreakpoint: 0.8
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    
    if (role === 'created' && data) {
      // Refresh the calendar data
      this.loadScheduleData();
    }
  }

  async openEditScheduleModal(schedule: ServiceSchedule): Promise<void> {
    const { ScheduleModalComponent } = await import('../schedule-modal/schedule-modal.component');
    
    const modal = await this.modalController.create({
      component: ScheduleModalComponent,
      componentProps: {
        schedule: schedule
      },
      breakpoints: [0, 0.8, 1],
      initialBreakpoint: 0.8
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    
    if (role === 'updated' && data) {
      // Refresh the calendar data
      this.loadScheduleData();
    }
  }
}

// Interface for calendar day representation
interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: ServiceCalendarEvent[];
  dayNumber: number;
}