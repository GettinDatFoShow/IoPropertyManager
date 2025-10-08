import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { PropertyCardComponent } from '../property-card/property-card.component';

@Component({
  selector: 'app-property-list',
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, PropertyCardComponent]
})
export class PropertyListComponent implements OnInit {
  private mockDataService = inject(MockDataService);

  properties: any[] = [];
  filteredProperties: any[] = [];
  searchTerm = '';
  selectedFilter = 'all';
  isLoading = true;

  // Filter options
  filterOptions = [
    { value: 'all', label: 'All Properties' },
    { value: 'apartment_complex', label: 'Apartment Complex' },
    { value: 'housing_complex', label: 'Housing Complex' },
    { value: 'home', label: 'Single Home' },
    { value: 'service_due', label: 'Service Due Soon' },
    { value: 'overdue', label: 'Service Overdue' }
  ];

  ngOnInit() {
    this.loadProperties();
  }

  loadProperties() {
    this.isLoading = true;
    
    // Simulate loading time
    setTimeout(() => {
      this.properties = this.mockDataService.getMockProperties();
      this.filteredProperties = [...this.properties];
      this.isLoading = false;
    }, 800);
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.properties];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(property => 
        property.name.toLowerCase().includes(searchLower) ||
        property.description.toLowerCase().includes(searchLower) ||
        property.address.formatted.toLowerCase().includes(searchLower) ||
        property.owner.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(property => {
        switch (this.selectedFilter) {
          case 'service_due':
            return this.isServiceDueSoon(property);
          case 'overdue':
            return this.isServiceOverdue(property);
          default:
            return property.type === this.selectedFilter;
        }
      });
    }

    this.filteredProperties = filtered;
  }

  private isServiceDueSoon(property: any): boolean {
    if (!property.nextServiceDate) return false;
    
    const nextService = new Date(property.nextServiceDate);
    const today = new Date();
    const daysUntilService = Math.ceil((nextService.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilService >= 0 && daysUntilService <= 7;
  }

  private isServiceOverdue(property: any): boolean {
    if (!property.nextServiceDate) return false;
    
    const nextService = new Date(property.nextServiceDate);
    const today = new Date();
    
    return nextService < today;
  }

  refreshProperties(event: any) {
    this.loadProperties();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  getPropertyCount(): string {
    const total = this.properties.length;
    const filtered = this.filteredProperties.length;
    
    if (filtered === total) {
      return `${total} ${total === 1 ? 'property' : 'properties'}`;
    } else {
      return `${filtered} of ${total} ${total === 1 ? 'property' : 'properties'}`;
    }
  }

  // Get current user permissions
  get canAddProperties(): boolean {
    return this.mockDataService.canManageProperties();
  }

  // Track function for ngFor performance
  trackByPropertyId(index: number, property: any): string {
    return property.id;
  }
}