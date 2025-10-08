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
  ServiceScheduleSearchCriteria,
  ScheduleStatistics
} from '../../models';
import { Priority, ServiceCategory } from '../../../services/models';

@Component({
  selector: 'app-schedule-list',
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Service Schedules</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="openCreateScheduleModal()" fill="solid" color="primary">
            <ion-icon name="add" slot="start"></ion-icon>
            New Schedule
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Service Schedules</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Search and Filter Controls -->
      <ion-card>
        <ion-card-content>
          <ion-grid>
            <ion-row>
              <ion-col size="12" size-md="6">
                <ion-item>
                  <ion-label position="stacked">Search Schedules</ion-label>
                  <ion-input 
                    [(ngModel)]="searchCriteria.searchTerm" 
                    (ionInput)="onSearchChange()"
                    placeholder="Search by title, property, or employee"
                    clearInput="true">
                  </ion-input>
                </ion-item>
              </ion-col>
              <ion-col size="12" size-md="3">
                <ion-item>
                  <ion-label position="stacked">Category</ion-label>
                  <ion-select 
                    [(ngModel)]="searchCriteria.category" 
                    (ionChange)="onFilterChange()"
                    placeholder="All Categories">
                    <ion-select-option value="">All Categories</ion-select-option>
                    <ion-select-option *ngFor="let category of categoryOptions" [value]="category">
                      {{ category | titlecase }}
                    </ion-select-option>
                  </ion-select>
                </ion-item>
              </ion-col>
              <ion-col size="12" size-md="3">
                <ion-item>
                  <ion-label position="stacked">Priority</ion-label>
                  <ion-select 
                    [(ngModel)]="searchCriteria.priority" 
                    (ionChange)="onFilterChange()"
                    placeholder="All Priorities">
                    <ion-select-option value="">All Priorities</ion-select-option>
                    <ion-select-option *ngFor="let priority of priorityOptions" [value]="priority">
                      {{ priority | titlecase }}
                    </ion-select-option>
                  </ion-select>
                </ion-item>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>

      <!-- Schedule List -->
      <div *ngIf="loading" class="loading-container">
        <ion-spinner name="circular"></ion-spinner>
        <p>Loading schedules...</p>
      </div>

      <div *ngIf="error" class="error-container">
        <ion-icon name="alert-circle" color="danger"></ion-icon>
        <p>{{ error }}</p>
        <ion-button (click)="loadScheduleData()" fill="outline" color="primary">
          <ion-icon name="refresh" slot="start"></ion-icon>
          Retry
        </ion-button>
      </div>

      <div *ngIf="!loading && !error">
        <!-- Schedule Cards -->
        <ion-card *ngFor="let schedule of filteredSchedules" (click)="openEditScheduleModal(schedule)">
          <ion-card-header>
            <ion-card-title>
              <div class="schedule-title">
                {{ schedule.title }}
                <ion-badge [color]="getPriorityColor(schedule.priority)">
                  {{ schedule.priority | titlecase }}
                </ion-badge>
              </div>
            </ion-card-title>
            <ion-card-subtitle>
              <ion-icon name="business" color="medium"></ion-icon>
              {{ schedule.propertyName }}
            </ion-card-subtitle>
          </ion-card-header>
          
          <ion-card-content>
            <div class="schedule-details">
              <div class="detail-row">
                <ion-icon name="calendar" color="primary"></ion-icon>
                <span>Next Service: {{ formatDate(schedule.nextServiceDate) }}</span>
              </div>
              
              <div class="detail-row" *ngIf="schedule.assignedEmployeeName">
                <ion-icon name="person" color="secondary"></ion-icon>
                <span>Assigned to: {{ schedule.assignedEmployeeName }}</span>
              </div>
              
              <div class="detail-row">
                <ion-icon name="time" color="tertiary"></ion-icon>
                <span>Duration: {{ formatDuration(schedule.estimatedDuration) }}</span>
              </div>
              
              <div class="detail-row" *ngIf="schedule.estimatedCost">
                <ion-icon name="cash" color="success"></ion-icon>
                <span>Cost: {{ formatCurrency(schedule.estimatedCost) }}</span>
              </div>
              
              <div class="detail-row">
                <ion-icon name="refresh" color="warning"></ion-icon>
                <span>{{ getRecurrenceText(schedule.recurrencePattern.type) }}</span>
              </div>

              <div class="status-row">
                <ion-chip [color]="schedule.isActive ? 'success' : 'medium'">
                  <ion-icon name="checkmark-circle" *ngIf="schedule.isActive"></ion-icon>
                  <ion-icon name="pause-circle" *ngIf="!schedule.isActive"></ion-icon>
                  {{ schedule.isActive ? 'Active' : 'Inactive' }}
                </ion-chip>
                
                <ion-chip color="primary">
                  <ion-icon name="construct"></ion-icon>
                  {{ schedule.category | titlecase }}
                </ion-chip>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Empty State -->
        <div *ngIf="filteredSchedules.length === 0" class="empty-state">
          <ion-icon name="calendar-outline" color="medium"></ion-icon>
          <h3>No schedules found</h3>
          <p>{{ searchCriteria.searchTerm || hasActiveFilters() ? 'Try adjusting your search criteria' : 'Create your first service schedule to get started' }}</p>
          <ion-button (click)="openCreateScheduleModal()" fill="solid" color="primary">
            <ion-icon name="add" slot="start"></ion-icon>
            Create Schedule
          </ion-button>
        </div>
      </div>

      <!-- Floating Action Button -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="openCreateScheduleModal()" color="primary">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    .loading-container, .error-container, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
      min-height: 200px;
    }

    .loading-container ion-spinner {
      margin-bottom: 1rem;
    }

    .error-container ion-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state ion-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .schedule-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }

    .schedule-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .detail-row ion-icon {
      font-size: 1rem;
      min-width: 1rem;
    }

    .status-row {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }

    ion-card {
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    ion-card:hover {
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .schedule-title {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }
    }
  `],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ScheduleListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private schedulingService = inject(SchedulingService);
  private router = inject(Router);
  private modalController = inject(ModalController);

  // Component state
  schedules: ServiceSchedule[] = [];
  filteredSchedules: ServiceSchedule[] = [];
  statistics: ScheduleStatistics | null = null;
  loading = false;
  error: string | null = null;

  // Search and filter
  searchCriteria: ServiceScheduleSearchCriteria = {};

  // Enum options
  priorityOptions: Priority[] = ['low', 'medium', 'high', 'emergency'];
  categoryOptions: ServiceCategory[] = [
    'plumbing', 'electrical', 'hvac', 'cleaning', 'landscaping', 'painting',
    'carpentry', 'appliance-repair', 'pest-control', 'security', 'general-maintenance', 'emergency', 'other'
  ];

  ngOnInit() {
    this.loadScheduleData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load schedule data and statistics
   */
  loadScheduleData() {
    this.loading = true;
    this.error = null;

    // Load statistics
    this.schedulingService.getScheduleStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => this.statistics = stats,
        error: (error) => console.error('Error loading statistics:', error)
      });

    // Load schedules
    this.schedulingService.schedules$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (schedules: ServiceSchedule[]) => {
          this.schedules = schedules;
          this.filteredSchedules = [...this.schedules];
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading schedules:', error);
          this.error = 'Failed to load service schedules. Please try again.';
          this.loading = false;
        }
      });
  }

  onSearchChange(): void {
    this.filterSchedules();
  }

  onFilterChange(): void {
    this.filterSchedules();
  }

  private filterSchedules(): void {
    let filtered = [...this.schedules];

    // Text search
    if (this.searchCriteria.searchTerm) {
      const term = this.searchCriteria.searchTerm.toLowerCase();
      filtered = filtered.filter(schedule => 
        schedule.title.toLowerCase().includes(term) ||
        schedule.propertyName.toLowerCase().includes(term) ||
        schedule.assignedEmployeeName?.toLowerCase().includes(term) ||
        schedule.description.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (this.searchCriteria.category) {
      filtered = filtered.filter(schedule => schedule.category === this.searchCriteria.category);
    }

    // Priority filter
    if (this.searchCriteria.priority) {
      filtered = filtered.filter(schedule => schedule.priority === this.searchCriteria.priority);
    }

    this.filteredSchedules = filtered;
  }

  hasActiveFilters(): boolean {
    return !!(this.searchCriteria.category || this.searchCriteria.priority);
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
      // Refresh the schedule data
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
      // Refresh the schedule data
      this.loadScheduleData();
    }
  }

  // Helper methods
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  getPriorityColor(priority: Priority): string {
    switch (priority) {
      case 'emergency': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      case 'low': return 'medium';
      default: return 'medium';
    }
  }

  getRecurrenceText(type: string): string {
    switch (type) {
      case 'once': return 'One time';
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'annually': return 'Annually';
      case 'custom': return 'Custom';
      default: return 'Unknown';
    }
  }
}