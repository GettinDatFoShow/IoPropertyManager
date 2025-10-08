import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonButton,
  IonIcon,
  IonText,
  IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  homeOutline, 
  logOutOutline, 
  checkmarkOutline, 
  timeOutline,
  peopleOutline,
  listOutline,
  calendarOutline,
  constructOutline,
  barChartOutline
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { BusinessService } from '../../core/services/business.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { DevModeToggleComponent } from '../../shared/components/dev-mode-toggle/dev-mode-toggle.component';
import { SchedulingDashboardWidgetComponent } from './components/scheduling-dashboard-widget.component';
import { QuickScheduleWidgetComponent } from './components/quick-schedule-widget.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonBadge,
    DevModeToggleComponent,
    SchedulingDashboardWidgetComponent,
    QuickScheduleWidgetComponent
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
        <ion-button slot="end" fill="clear" (click)="logout()">
          <ion-icon name="log-out-outline"></ion-icon>
        </ion-button>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <!-- Development Mode Toggle -->
      <app-dev-mode-toggle></app-dev-mode-toggle>
      
      <div class="dashboard-container">
        <!-- Welcome Section -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              Welcome, {{ currentUser?.profile?.firstName || 'User' }}!
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>Welcome to IoPropertyManager</p>
            @if (currentBusiness) {
              <p><strong>Business:</strong> {{ currentBusiness.name }}</p>
            }
            <p><strong>Role:</strong> <ion-badge [color]="getRoleBadgeColor()">{{ currentUser?.role | titlecase }}</ion-badge></p>
          </ion-card-content>
        </ion-card>

        <!-- Scheduling Dashboard Widget -->
        <app-scheduling-dashboard-widget></app-scheduling-dashboard-widget>

        <!-- Quick Schedule Widget -->
        <app-quick-schedule-widget></app-quick-schedule-widget>

        <!-- Quick Stats -->
        <div class="stats-grid">
          <ion-card class="stat-card clickable" (click)="navigateToProperties()">
            <ion-card-content>
              <div class="stat">
                <ion-icon name="home-outline" class="stat-icon"></ion-icon>
                <div class="stat-info">
                  <h2>{{ properties.length }}</h2>
                  <p>Properties</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card clickable" (click)="navigateToWorkOrders()">
            <ion-card-content>
              <div class="stat">
                <ion-icon name="checkmark-outline" class="stat-icon"></ion-icon>
                <div class="stat-info">
                  <h2>{{ todaysTasks.length }}</h2>
                  <p>Tasks Today</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
          
          <ion-card class="stat-card clickable" (click)="navigateToSchedule()">
            <ion-card-content>
              <div class="stat">
                <ion-icon name="time-outline" class="stat-icon"></ion-icon>
                <div class="stat-info">
                  <h2>{{ upcomingTasks.length }}</h2>
                  <p>Upcoming</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Today's Tasks -->
        @if (todaysTasks.length > 0) {
          <ion-card>
            <ion-card-header>
              <ion-card-title>
                Today's Tasks
                <ion-button fill="clear" size="small" (click)="navigateToWorkOrders()" slot="end">
                  View All
                </ion-button>
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              @for (task of todaysTasks; track task.id) {
                <div class="task-item clickable" (click)="navigateToTask(task)">
                  <div class="task-info">
                    <h4>{{ task.itemName }}</h4>
                    <p>{{ task.propertyName }}</p>
                  </div>
                  <ion-badge [color]="getPriorityColor(task.priority)">
                    {{ task.priority }}
                  </ion-badge>
                </div>
              }
            </ion-card-content>
          </ion-card>
        }

        <!-- Properties Overview -->
        @if (properties.length > 0) {
          <ion-card>
            <ion-card-header>
              <ion-card-title>
                Properties Overview
                <ion-button fill="clear" size="small" (click)="navigateToProperties()" slot="end">
                  View All
                </ion-button>
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              @for (property of properties; track property.id) {
                <div class="property-item clickable" (click)="navigateToProperty(property)">
                  <div class="property-info">
                    <h4>{{ property.name }}</h4>
                    <p>{{ property.address.formatted }}</p>
                    <p><strong>Next Service:</strong> {{ property.nextServiceDate | date:'shortDate' }}</p>
                  </div>
                  <div class="property-stats">
                    <ion-badge color="medium">{{ property.serviceableItemsCount }} items</ion-badge>
                  </div>
                </div>
              }
            </ion-card-content>
          </ion-card>
        }

        <!-- Action Buttons -->
        <div class="action-buttons">
          <ion-button expand="block" (click)="navigateToProperties()" class="action-button">
            <ion-icon name="home-outline" slot="start"></ion-icon>
            Manage Properties
          </ion-button>

          <ion-button expand="block" (click)="navigateToSchedule()" fill="outline" class="action-button">
            <ion-icon name="calendar-outline" slot="start"></ion-icon>
            Service Calendar
          </ion-button>

          <ion-button expand="block" (click)="navigateToWorkOrders()" fill="outline" class="action-button">
            <ion-icon name="construct-outline" slot="start"></ion-icon>
            Work Orders
          </ion-button>
          
          @if (canManageEmployees) {
            <ion-button expand="block" (click)="navigateToTeamManagement()" fill="outline" class="action-button">
              <ion-icon name="people-outline" slot="start"></ion-icon>
              Manage Team
            </ion-button>
          }
          
          <ion-button expand="block" (click)="navigateToReports()" fill="outline" class="action-button">
            <ion-icon name="bar-chart-outline" slot="start"></ion-icon>
            Reports & Analytics
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .dashboard-container {
      max-width: 900px;
      margin: 0 auto;
      padding-top: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }

    .stat-card {
      margin: 0;
    }

    .clickable {
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .clickable:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      font-size: 2rem;
      color: var(--ion-color-primary);
    }

    .stat-info h2 {
      margin: 0;
      font-size: 1.5rem;
      color: var(--ion-color-primary);
    }

    .stat-info p {
      margin: 0;
      color: var(--ion-color-medium);
      font-size: 0.9rem;
    }

    .task-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      margin: 0 -0.75rem;
      border-radius: 8px;
      border-bottom: 1px solid var(--ion-color-light);
    }

    .task-item:last-child {
      border-bottom: none;
    }

    .task-item.clickable:hover {
      background-color: var(--ion-color-light);
    }

    .task-info h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      color: var(--ion-color-dark);
    }

    .task-info p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--ion-color-medium);
    }

    .property-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      margin: 0 -1rem;
      border-radius: 8px;
      border-bottom: 1px solid var(--ion-color-light);
    }

    .property-item:last-child {
      border-bottom: none;
    }

    .property-item.clickable:hover {
      background-color: var(--ion-color-light);
    }

    .property-info h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
      color: var(--ion-color-dark);
    }

    .property-info p {
      margin: 0.25rem 0;
      font-size: 0.875rem;
      color: var(--ion-color-medium);
    }

    .property-stats {
      text-align: right;
    }

    .action-buttons {
      margin: 2rem 0;
    }

    .action-button {
      margin-bottom: 1rem;
    }

    .dev-notice {
      background: var(--ion-color-warning-tint);
      border-left: 4px solid var(--ion-color-warning);
    }

    .dev-notice h3 {
      margin: 0 0 0.5rem 0;
      color: var(--ion-color-warning-shade);
    }

    .dev-notice p {
      margin: 0;
      color: var(--ion-color-warning-shade);
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding-top: 0;
      }
      
      .property-item,
      .task-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private businessService = inject(BusinessService);
  private mockDataService = inject(MockDataService);
  private router = inject(Router);

  // Development mode flag
  isDevelopmentMode = true;

  // Mock data properties
  properties: any[] = [];
  todaysTasks: any[] = [];
  upcomingTasks: any[] = [];
  
  // User and business info
  currentUser: any;
  currentBusiness: any;

  constructor() {
    addIcons({ 
      homeOutline, 
      logOutOutline, 
      checkmarkOutline, 
      timeOutline,
      peopleOutline,
      listOutline,
      calendarOutline,
      constructOutline,
      barChartOutline
    });
  }

  ngOnInit() {
    if (this.isDevelopmentMode) {
      // Use mock data
      this.currentUser = this.mockDataService.getCurrentUser();
      this.currentBusiness = this.mockDataService.getCurrentBusiness();
      this.properties = this.mockDataService.getMockProperties();
      this.todaysTasks = this.mockDataService.getTodaysTasks();
      this.upcomingTasks = this.mockDataService.getUpcomingTasks();
      
      // Subscribe to user changes in development mode
      this.mockDataService.currentUserType$.subscribe(() => {
        this.currentUser = this.mockDataService.getCurrentUser();
      });
    } else {
      // Use real auth/business services
      this.currentUser = this.authService.getCurrentUser();
      this.currentBusiness = this.businessService.getCurrentBusiness();
    }
  }

  get canManageEmployees(): boolean {
    if (this.isDevelopmentMode) {
      return this.mockDataService.canManageEmployees();
    }
    return this.businessService.canManageEmployees();
  }

  getRoleBadgeColor(): string {
    const role = this.currentUser?.role;
    switch (role) {
      case 'owner': return 'primary';
      case 'manager': return 'secondary';
      case 'employee': return 'tertiary';
      default: return 'medium';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority?.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'medium';
    }
  }

  async logout() {
    try {
      if (!this.isDevelopmentMode) {
        await this.authService.logout();
      }
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Navigation methods
  navigateToProperties() {
    this.router.navigate(['/tabs/properties']);
  }

  navigateToWorkOrders() {
    this.router.navigate(['/tabs/work-orders']);
  }

  navigateToSchedule() {
    this.router.navigate(['/tabs/schedule']);
  }

  navigateToProperty(property: any) {
    this.router.navigate(['/tabs/property-detail', property.id]);
  }

  navigateToTask(task: any) {
    // Navigate to work order detail or task detail
    // For now, navigate to work orders list with filter
    this.router.navigate(['/work-orders'], { 
      queryParams: { propertyId: task.propertyId, taskId: task.id } 
    });
  }

  navigateToTeamManagement() {
    // TODO: Implement team management navigation when feature is available
    this.router.navigate(['/team-management']);
  }

  navigateToReports() {
    // TODO: Implement reports navigation when feature is available
    this.router.navigate(['/reports']);
  }
}