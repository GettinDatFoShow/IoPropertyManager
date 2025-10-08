import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WorkOrderService } from '../services/work-order.service';
import { 
  WorkOrder, 
  WorkOrderStatus, 
  WorkOrderSearchCriteria, 
  WorkOrderListResponse,
  WorkOrderStatistics 
} from '../models/work-order.interface';

@Component({
  selector: 'app-work-order-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonicModule
  ],
  templateUrl: './work-order-list.component.html',
  styleUrls: ['./work-order-list.component.scss']
})
export class WorkOrderListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  workOrders$: Observable<WorkOrder[]>;
  statistics$: Observable<WorkOrderStatistics>;
  
  // Filters and search
  searchCriteria: WorkOrderSearchCriteria = {};
  selectedStatus: WorkOrderStatus | 'all' = 'all';
  searchTerm = '';
  
  // UI state
  isLoading = false;
  refreshing = false;
  
  // Status options for filter
  statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'paused', label: 'Paused' },
    { value: 'waiting-parts', label: 'Waiting Parts' },
    { value: 'waiting-approval', label: 'Waiting Approval' },
    { value: 'completed', label: 'Completed' },
    { value: 'inspected', label: 'Inspected' },
    { value: 'closed', label: 'Closed' }
  ];

  constructor(
    private workOrderService: WorkOrderService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.workOrders$ = this.workOrderService.workOrders$;
    this.statistics$ = this.workOrderService.getWorkOrderStatistics();
  }

  ngOnInit() {
    this.loadWorkOrders();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadWorkOrders() {
    this.isLoading = true;
    // Since we're using observables, the data will automatically update
    // when the service state changes
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  async refreshWorkOrders(event?: any) {
    this.refreshing = true;
    await this.loadWorkOrders();
    this.refreshing = false;
    
    if (event) {
      event.target.complete();
    }
  }

  onSearchChange() {
    this.updateSearchCriteria();
  }

  onStatusFilterChange() {
    this.updateSearchCriteria();
  }

  private updateSearchCriteria() {
    this.searchCriteria = {
      searchTerm: this.searchTerm || undefined,
      status: this.selectedStatus !== 'all' ? [this.selectedStatus as WorkOrderStatus] : undefined
    };
    
    // Apply filters - for now just use the main observable
    // TODO: Implement filtering in the service
    this.workOrders$ = this.workOrderService.workOrders$;
  }

  async deleteWorkOrder(workOrder: WorkOrder) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete work order "${workOrder.title}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.performDelete(workOrder.id);
          }
        }
      ]
    });

    await alert.present();
  }

  private async performDelete(workOrderId: string) {
    const loading = await this.loadingController.create({
      message: 'Deleting work order...'
    });
    await loading.present();

    this.workOrderService.deleteWorkOrder(workOrderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success) => {
          loading.dismiss();
          if (success) {
            // Success feedback could be shown here
          }
        },
        error: (error) => {
          loading.dismiss();
          this.showErrorAlert('Failed to delete work order', error.message);
        }
      });
  }

  async duplicateWorkOrder(workOrder: WorkOrder) {
    const loading = await this.loadingController.create({
      message: 'Creating duplicate work order...'
    });
    await loading.present();

    // TODO: Implement duplicate functionality in service
    // For now, just close the loading
    loading.dismiss();
    this.showErrorAlert('Not Implemented', 'Duplicate functionality will be added in the next phase.');
  }

  getStatusColor(status: WorkOrderStatus): string {
    switch (status) {
      case 'draft': return 'medium';
      case 'assigned': return 'tertiary';
      case 'scheduled': return 'primary';
      case 'in-progress': return 'warning';
      case 'paused': return 'dark';
      case 'waiting-parts': return 'secondary';
      case 'waiting-approval': return 'secondary';
      case 'completed': return 'success';
      case 'inspected': return 'success';
      case 'closed': return 'dark';
      default: return 'medium';
    }
  }

  getStatusIcon(status: WorkOrderStatus): string {
    switch (status) {
      case 'draft': return 'document-outline';
      case 'assigned': return 'person-outline';
      case 'scheduled': return 'calendar-outline';
      case 'in-progress': return 'hammer-outline';
      case 'paused': return 'pause-circle-outline';
      case 'waiting-parts': return 'cube-outline';
      case 'waiting-approval': return 'hourglass-outline';
      case 'completed': return 'checkmark-circle-outline';
      case 'inspected': return 'eye-outline';
      case 'closed': return 'lock-closed-outline';
      default: return 'document-outline';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'urgent': return 'danger';
      default: return 'medium';
    }
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  formatCurrency(amount: number | undefined): string {
    return amount ? `$${amount.toFixed(2)}` : 'N/A';
  }

  trackByWorkOrderId(index: number, workOrder: WorkOrder): string {
    return workOrder.id;
  }

  private async showErrorAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}