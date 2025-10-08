import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ServiceRequestService } from '../../services/service-request.service';
import { 
  ServiceRequest, 
  ServiceRequestSearchCriteria, 
  ServiceCategory, 
  Priority, 
  ServiceStatus 
} from '../../models';

@Component({
  selector: 'app-service-request-list',
  templateUrl: './service-request-list.component.html',
  styleUrls: ['./service-request-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ServiceRequestListComponent implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();
  
  // Data
  serviceRequests: ServiceRequest[] = [];
  filteredRequests: ServiceRequest[] = [];
  loading = false;
  error: string | null = null;
  
  // Search and filters
  searchTerm = '';
  selectedCategory: ServiceCategory | 'all' = 'all';
  selectedPriority: Priority | 'all' = 'all';
  selectedStatus: ServiceStatus | 'all' = 'all';
  selectedProperty = '';
  
  // Options for dropdowns
  categories: ServiceCategory[] = [];
  priorities: Priority[] = [];
  statuses: ServiceStatus[] = [];
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  // Sorting
  sortBy: keyof ServiceRequest = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  private serviceRequestService = inject(ServiceRequestService);
  private router = inject(Router);

  constructor() {}

  ngOnInit() {
    this.initializeDropdownOptions();
    this.loadServiceRequests();
    
    // Set up reactive search
    // Note: This would require FormControl for real-time search
    // For now, we'll implement manual search
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize dropdown options
   */
  private initializeDropdownOptions() {
    this.categories = this.serviceRequestService.getServiceCategories();
    this.priorities = this.serviceRequestService.getPriorityLevels();
    this.statuses = this.serviceRequestService.getServiceStatusOptions();
  }

  /**
   * Load service requests with current filters
   */
  loadServiceRequests() {
    this.loading = true;
    this.error = null;
    
    const criteria: ServiceRequestSearchCriteria = {
      searchTerm: this.searchTerm || undefined,
      category: this.selectedCategory !== 'all' ? this.selectedCategory : undefined,
      priority: this.selectedPriority !== 'all' ? this.selectedPriority : undefined,
      status: this.selectedStatus !== 'all' ? this.selectedStatus : undefined,
      propertyId: this.selectedProperty || undefined
    };
    
    this.serviceRequestService.getServiceRequests(criteria)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.serviceRequests = response.requests;
          this.filteredRequests = [...this.serviceRequests];
          this.totalItems = response.totalCount;
          this.totalPages = response.totalPages;
          this.loading = false;
          
          // Apply client-side sorting
          this.applySorting();
        },
        error: (error) => {
          console.error('Error loading service requests:', error);
          this.error = 'Failed to load service requests. Please try again.';
          this.loading = false;
        }
      });
  }

  /**
   * Handle search input
   */
  onSearch() {
    this.currentPage = 1;
    this.loadServiceRequests();
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.selectedPriority = 'all';
    this.selectedStatus = 'all';
    this.selectedProperty = '';
    this.currentPage = 1;
    this.loadServiceRequests();
  }

  /**
   * Handle filter changes
   */
  onFilterChange() {
    this.currentPage = 1;
    this.loadServiceRequests();
  }

  /**
   * Apply sorting to the current results
   */
  applySorting() {
    this.filteredRequests.sort((a, b) => {
      const aValue = a[this.sortBy];
      const bValue = b[this.sortBy];
      
      let comparison = 0;
      
      if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }
      
      return this.sortDirection === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Handle column sorting
   */
  onSort(column: keyof ServiceRequest) {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    
    this.applySorting();
  }

  /**
   * Get sort icon for column
   */
  getSortIcon(column: keyof ServiceRequest): string {
    if (this.sortBy !== column) {
      return 'swap-vertical';
    }
    return this.sortDirection === 'asc' ? 'arrow-up' : 'arrow-down';
  }

  /**
   * Navigate to create new service request
   */
  createServiceRequest() {
    this.router.navigate(['/services/requests/create']);
  }

  /**
   * Navigate to service request details
   */
  viewServiceRequest(request: ServiceRequest) {
    this.router.navigate(['/services/requests', request.id]);
  }

  /**
   * Navigate to edit service request
   */
  editServiceRequest(request: ServiceRequest) {
    this.router.navigate(['/services/requests', request.id, 'edit']);
  }

  /**
   * Delete service request with confirmation
   */
  async deleteServiceRequest(request: ServiceRequest) {
    // In a real app, this would show an ionic alert for confirmation
    const confirmed = confirm(`Are you sure you want to delete service request "${request.title}"?`);
    
    if (confirmed) {
      this.loading = true;
      
      this.serviceRequestService.deleteServiceRequest(request.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Remove from local array
            this.serviceRequests = this.serviceRequests.filter(sr => sr.id !== request.id);
            this.filteredRequests = this.filteredRequests.filter(sr => sr.id !== request.id);
            this.totalItems = Math.max(0, this.totalItems - 1);
            this.loading = false;
          },
          error: (error) => {
            console.error('Error deleting service request:', error);
            this.error = 'Failed to delete service request. Please try again.';
            this.loading = false;
          }
        });
    }
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
  getStatusColor(status: ServiceStatus): string {
    const colorMap = {
      'submitted': 'medium',
      'reviewed': 'secondary',
      'approved': 'primary',
      'rejected': 'danger',
      'assigned': 'tertiary',
      'scheduled': 'warning',
      'in-progress': 'warning',
      'completed': 'success',
      'verified': 'success',
      'closed': 'medium',
      'cancelled': 'dark'
    };
    return colorMap[status] || 'medium';
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number | undefined): string {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Format date for display
   */
  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
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
   * Get priority display name
   */
  getPriorityDisplayName(priority: Priority): string {
    const displayNames = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'emergency': 'Emergency'
    };
    return displayNames[priority] || priority;
  }

  /**
   * Get status display name
   */
  getStatusDisplayName(status: ServiceStatus): string {
    const displayNames = {
      'submitted': 'Submitted',
      'reviewed': 'Under Review',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'assigned': 'Assigned',
      'scheduled': 'Scheduled',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'verified': 'Verified',
      'closed': 'Closed',
      'cancelled': 'Cancelled'
    };
    return displayNames[status] || status;
  }

  /**
   * Track by function for ngFor performance
   */
  trackByServiceRequest(index: number, item: ServiceRequest): string {
    return item.id;
  }

  /**
   * Handle refresh
   */
  onRefresh(event?: any) {
    this.loadServiceRequests();
    
    if (event) {
      setTimeout(() => {
        event.target.complete();
      }, 1000);
    }
  }
}