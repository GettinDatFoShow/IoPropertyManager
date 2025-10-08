import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, 
  IonIcon, IonBadge, IonSpinner, IonChip, IonList, 
  IonItem, IonLabel, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, timeOutline, alertCircleOutline, checkmarkCircleOutline,
  addOutline, chevronForwardOutline, constructOutline, businessOutline,
  personOutline, cashOutline
} from 'ionicons/icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SchedulingService } from '../../scheduling/services/scheduling.service';
import { ServiceSchedule, ScheduleStatistics, ServiceCalendarEvent } from '../../scheduling/models';
import { Priority } from '../../services/models/service-request.interface';

@Component({
  selector: 'app-scheduling-dashboard-widget',
  template: `
    <!-- Scheduling Overview Stats -->
    <ion-card class="scheduling-overview">
      <ion-card-header>
        <ion-card-title>
          <ion-icon name="calendar-outline"></ion-icon>
          Service Scheduling
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <div *ngIf="loading" class="loading-state">
          <ion-spinner name="circular"></ion-spinner>
          <p>Loading scheduling data...</p>
        </div>

        <div *ngIf="!loading && statistics" class="stats-grid">
          <div class="stat-item clickable" 
               [class.warning]="statistics.overdueServices > 0"
               (click)="navigateToUpcomingServices()">
            <div class="stat-number">{{ statistics.upcomingServices }}</div>
            <div class="stat-label">Upcoming (7 days)</div>
            <ion-icon name="time-outline" class="stat-icon"></ion-icon>
          </div>

          <div class="stat-item clickable" 
               [class.danger]="statistics.overdueServices > 0"
               (click)="navigateToOverdueServices()">
            <div class="stat-number">{{ statistics.overdueServices }}</div>
            <div class="stat-label">Overdue</div>
            <ion-icon name="alert-circle-outline" class="stat-icon" 
                     [class.pulse]="statistics.overdueServices > 0"></ion-icon>
          </div>

          <div class="stat-item clickable" (click)="navigateToActiveSchedules()">
            <div class="stat-number">{{ statistics.activeSchedules }}</div>
            <div class="stat-label">Active Schedules</div>
            <ion-icon name="checkmark-circle-outline" class="stat-icon"></ion-icon>
          </div>

          <div class="stat-item clickable" (click)="navigateToScheduling()">
            <div class="stat-number">\${{ statistics.averageServiceCost.toFixed(0) }}</div>
            <div class="stat-label">Avg Cost</div>
            <ion-icon name="cash-outline" class="stat-icon"></ion-icon>
          </div>
        </div>

        <div class="quick-actions">
          <ion-button (click)="navigateToScheduling()" fill="clear" size="small">
            <ion-icon name="calendar-outline" slot="start"></ion-icon>
            View Calendar
          </ion-button>
          <ion-button (click)="createNewSchedule()" fill="outline" size="small" color="primary">
            <ion-icon name="add-outline" slot="start"></ion-icon>
            New Schedule
          </ion-button>
        </div>
      </ion-card-content>
    </ion-card>

    <!-- Today's Scheduled Services -->
    <ion-card *ngIf="todaysServices.length > 0" class="todays-services">
      <ion-card-header>
        <ion-card-title>
          <ion-icon name="time-outline"></ion-icon>
          Today's Services
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-list lines="none">
          <ion-item *ngFor="let service of todaysServices | slice:0:3; trackBy: trackByService" 
                   (click)="viewServiceDetails(service)" 
                   button>
            <div slot="start" class="service-time">
              {{ formatTime(service.start) }}
            </div>
            <ion-label>
              <h3>{{ service.title }}</h3>
              <p>
                <ion-icon name="business-outline"></ion-icon>
                {{ service.propertyName }}
              </p>
              <p *ngIf="service.assignedEmployeeName">
                <ion-icon name="person-outline"></ion-icon>
                {{ service.assignedEmployeeName }}
              </p>
            </ion-label>
            <div slot="end" class="service-info">
              <ion-badge [color]="getPriorityColor(service.priority)" size="small">
                {{ service.priority | titlecase }}
              </ion-badge>
              <ion-chip [color]="getCategoryColor(service.category)" size="small">
                <ion-icon name="construct-outline"></ion-icon>
                <ion-label>{{ formatCategory(service.category) }}</ion-label>
              </ion-chip>
            </div>
          </ion-item>
        </ion-list>

        <div *ngIf="todaysServices.length > 3" class="view-more">
          <ion-button (click)="navigateToScheduling()" fill="clear" size="small">
            View All ({{ todaysServices.length }})
            <ion-icon name="chevron-forward-outline" slot="end"></ion-icon>
          </ion-button>
        </div>
      </ion-card-content>
    </ion-card>

    <!-- Upcoming High Priority Services -->
    <ion-card *ngIf="upcomingHighPriorityServices.length > 0" class="upcoming-services">
      <ion-card-header>
        <ion-card-title>
          <ion-icon name="alert-circle-outline"></ion-icon>
          High Priority Services
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-list lines="none">
          <ion-item *ngFor="let service of upcomingHighPriorityServices | slice:0:3; trackBy: trackByService" 
                   (click)="viewServiceDetails(service)" 
                   button>
            <ion-label>
              <h3>{{ service.title }}</h3>
              <p>
                <ion-icon name="business-outline"></ion-icon>
                {{ service.propertyName }}
              </p>
              <p>
                <ion-icon name="calendar-outline"></ion-icon>
                {{ formatDate(service.start) }}
              </p>
            </ion-label>
            <div slot="end">
              <ion-badge [color]="getPriorityColor(service.priority)">
                {{ service.priority | titlecase }}
              </ion-badge>
            </div>
          </ion-item>
        </ion-list>

        <div *ngIf="upcomingHighPriorityServices.length > 3" class="view-more">
          <ion-button (click)="navigateToScheduling()" fill="clear" size="small">
            View All ({{ upcomingHighPriorityServices.length }})
            <ion-icon name="chevron-forward-outline" slot="end"></ion-icon>
          </ion-button>
        </div>
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    .scheduling-overview {
      margin: 1rem 0;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      text-align: center;
    }

    .loading-state ion-spinner {
      margin-bottom: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      background: var(--ion-color-light);
      border-radius: 8px;
      position: relative;
      transition: all 0.3s ease;
    }

    .stat-item.clickable {
      cursor: pointer;
    }

    .stat-item.clickable:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .stat-item.warning {
      background: var(--ion-color-warning-tint);
      border-left: 4px solid var(--ion-color-warning);
    }

    .stat-item.danger {
      background: var(--ion-color-danger-tint);
      border-left: 4px solid var(--ion-color-danger);
    }

    .stat-number {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--ion-color-primary);
      margin-bottom: 0.25rem;
    }

    .stat-item.warning .stat-number {
      color: var(--ion-color-warning-shade);
    }

    .stat-item.danger .stat-number {
      color: var(--ion-color-danger-shade);
    }

    .stat-label {
      font-size: 0.8rem;
      color: var(--ion-color-medium);
      text-align: center;
      margin-bottom: 0.5rem;
    }

    .stat-icon {
      font-size: 1.2rem;
      color: var(--ion-color-medium);
    }

    .stat-icon.pulse {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .quick-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: space-between;
    }

    .todays-services,
    .upcoming-services {
      margin: 1rem 0;
    }

    .service-time {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.5rem;
      background: var(--ion-color-primary-tint);
      border-radius: 4px;
      margin-right: 1rem;
      font-weight: bold;
      color: var(--ion-color-primary-shade);
      font-size: 0.9rem;
      min-width: 60px;
    }

    .service-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }

    .view-more {
      text-align: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--ion-color-light);
    }

    ion-item {
      --padding-start: 0;
      --inner-padding-end: 0;
    }

    ion-item h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      color: var(--ion-color-dark);
    }

    ion-item p {
      margin: 0.25rem 0;
      font-size: 0.875rem;
      color: var(--ion-color-medium);
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    ion-item p ion-icon {
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .quick-actions {
        flex-direction: column;
      }

      .service-info {
        align-items: center;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton,
    IonIcon, IonBadge, IonSpinner, IonChip, IonList,
    IonItem, IonLabel
  ]
})
export class SchedulingDashboardWidgetComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private schedulingService = inject(SchedulingService);
  private router = inject(Router);
  private modalController = inject(ModalController);

  // Component state
  statistics: ScheduleStatistics | null = null;
  todaysServices: ServiceCalendarEvent[] = [];
  upcomingHighPriorityServices: ServiceCalendarEvent[] = [];
  loading = false;

  constructor() {
    addIcons({
      calendarOutline, timeOutline, alertCircleOutline, checkmarkCircleOutline,
      addOutline, chevronForwardOutline, constructOutline, businessOutline,
      personOutline, cashOutline
    });
  }

  ngOnInit() {
    this.loadSchedulingData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSchedulingData(): void {
    this.loading = true;

    // Load statistics
    this.schedulingService.getScheduleStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.statistics = stats;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading scheduling statistics:', error);
          this.loading = false;
        }
      });

    // Load calendar events for today and upcoming
    this.schedulingService.calendarEvents$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          const today = new Date();
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
          const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

          // Filter today's services
          this.todaysServices = events.filter(event => 
            event.start >= todayStart && event.start < todayEnd
          ).sort((a, b) => a.start.getTime() - b.start.getTime());

          // Filter upcoming high priority services
          this.upcomingHighPriorityServices = events.filter(event => 
            event.start > todayEnd && 
            event.start <= nextWeek &&
            (event.priority === 'high' || event.priority === 'emergency')
          ).sort((a, b) => a.start.getTime() - b.start.getTime());
        },
        error: (error) => {
          console.error('Error loading calendar events:', error);
        }
      });
  }

  navigateToScheduling(): void {
    this.router.navigate(['/tabs/schedule']);
  }

  async createNewSchedule(): Promise<void> {
    const { ScheduleModalComponent } = await import('../../scheduling/components/schedule-modal/schedule-modal.component');
    
    const modal = await this.modalController.create({
      component: ScheduleModalComponent,
      breakpoints: [0, 0.8, 1],
      initialBreakpoint: 0.8
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    
    if (role === 'created' && data) {
      // Refresh the scheduling data
      this.loadSchedulingData();
    }
  }

  viewServiceDetails(service: ServiceCalendarEvent): void {
    // Navigate to service details or show details modal
    // For now, navigate to the schedule with the specific service date
    this.router.navigate(['/tabs/schedule'], { 
      queryParams: { 
        date: service.start.toISOString().split('T')[0],
        serviceId: service.id 
      } 
    });
  }

  navigateToUpcomingServices(): void {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    this.router.navigate(['/tabs/schedule'], { 
      queryParams: { 
        view: 'upcoming',
        endDate: nextWeek.toISOString().split('T')[0]
      } 
    });
  }

  navigateToOverdueServices(): void {
    this.router.navigate(['/tabs/schedule'], { 
      queryParams: { 
        view: 'overdue',
        filter: 'overdue'
      } 
    });
  }

  navigateToActiveSchedules(): void {
    this.router.navigate(['/tabs/schedule'], { 
      queryParams: { 
        view: 'schedules',
        filter: 'active'
      } 
    });
  }

  // Helper methods
  trackByService(index: number, service: ServiceCalendarEvent): string {
    return service.id;
  }

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    }).format(date);
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

  getCategoryColor(category: string): string {
    switch (category) {
      case 'emergency': return 'danger';
      case 'hvac': return 'primary';
      case 'plumbing': return 'secondary';
      case 'electrical': return 'warning';
      case 'cleaning': return 'success';
      default: return 'medium';
    }
  }

  formatCategory(category: string): string {
    return category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}