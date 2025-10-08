import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { MockDataService } from '../../../core/services/mock-data.service';
import { 
  Property, 
  CreatePropertyDto, 
  UpdatePropertyDto, 
  PropertySearchCriteria, 
  PropertyListResponse, 
  PropertyStatistics,
  PropertyFormData
} from '../models';

// Export PropertyFormData for backwards compatibility
export { PropertyFormData } from '../models';

// Legacy interface - will be replaced by models
export interface LegacyPropertyFormData {
  name: string;
  description?: string;
  type: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  owner: {
    name: string;
    email: string;
    phone: string;
  };
  subscription: {
    cost: number;
    billing: string;
  };
  serviceableItemsCount: number;
  nextServiceDate?: string;
  photos?: string[];
  assignedEmployees?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private mockDataService = inject(MockDataService);
  
  private propertiesSubject = new BehaviorSubject<any[]>([]);
  public properties$ = this.propertiesSubject.asObservable();

  constructor() {
    // Initialize with mock data
    this.loadProperties();
  }

  private loadProperties() {
    const properties = this.mockDataService.getMockProperties();
    this.propertiesSubject.next(properties);
  }

  // Get all properties
  getProperties(): Observable<any[]> {
    return of(this.mockDataService.getMockProperties()).pipe(delay(500));
  }

  // Get property by ID
  getPropertyById(id: string): Observable<any | null> {
    const properties = this.mockDataService.getMockProperties();
    const property = properties.find(p => p.id === id);
    return of(property || null).pipe(delay(300));
  }

  // Create new property
  createProperty(propertyData: PropertyFormData): Observable<any> {
    return new Observable(observer => {
      // Simulate API call delay
      setTimeout(() => {
        const newProperty = {
          id: `prop-${Date.now()}`,
          ...propertyData,
          address: {
            ...propertyData.address,
            formatted: this.formatAddress(propertyData.address)
          },
          location: {
            latitude: 34.0522 + (Math.random() - 0.5) * 0.1,
            longitude: -118.2437 + (Math.random() - 0.5) * 0.1
          },
          subscription: {
            ...propertyData.subscription,
            nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          totalCost: propertyData.subscription.monthlyRate * 1.5, // Simulate total cost calculation
          photos: propertyData.photos || [],
          assignedEmployees: propertyData.assignedEmployees || [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Add to mock data (in real app, this would be API call)
        const currentProperties = this.propertiesSubject.value;
        this.propertiesSubject.next([...currentProperties, newProperty]);

        observer.next(newProperty);
        observer.complete();
      }, 1000);
    });
  }

  // Update existing property
  updateProperty(id: string, propertyData: PropertyFormData): Observable<any> {
    return new Observable(observer => {
      // Simulate API call delay
      setTimeout(() => {
        const currentProperties = this.propertiesSubject.value;
        const index = currentProperties.findIndex(p => p.id === id);
        
        if (index !== -1) {
          const updatedProperty = {
            ...currentProperties[index],
            ...propertyData,
            address: {
              ...propertyData.address,
              formatted: this.formatAddress(propertyData.address)
            },
            subscription: {
              ...propertyData.subscription,
              nextBilling: currentProperties[index].subscription.nextBilling // Keep existing billing date
            },
            totalCost: propertyData.subscription.monthlyRate * 1.5, // Recalculate total cost
            updatedAt: new Date()
          };

          const updatedProperties = [...currentProperties];
          updatedProperties[index] = updatedProperty;
          this.propertiesSubject.next(updatedProperties);

          observer.next(updatedProperty);
        } else {
          observer.error(new Error('Property not found'));
        }
        observer.complete();
      }, 1000);
    });
  }

  // Delete property
  deleteProperty(id: string): Observable<boolean> {
    return new Observable(observer => {
      // Simulate API call delay
      setTimeout(() => {
        const currentProperties = this.propertiesSubject.value;
        const filteredProperties = currentProperties.filter(p => p.id !== id);
        this.propertiesSubject.next(filteredProperties);

        observer.next(true);
        observer.complete();
      }, 800);
    });
  }

  // Archive property (soft delete)
  archiveProperty(id: string): Observable<any> {
    return new Observable(observer => {
      // Simulate API call delay
      setTimeout(() => {
        const currentProperties = this.propertiesSubject.value;
        const index = currentProperties.findIndex(p => p.id === id);
        
        if (index !== -1) {
          const archivedProperty = {
            ...currentProperties[index],
            isArchived: true,
            archivedAt: new Date(),
            updatedAt: new Date()
          };

          const updatedProperties = [...currentProperties];
          updatedProperties[index] = archivedProperty;
          this.propertiesSubject.next(updatedProperties);

          observer.next(archivedProperty);
        } else {
          observer.error(new Error('Property not found'));
        }
        observer.complete();
      }, 800);
    });
  }

  // Upload property photos
  uploadPhotos(files: File[]): Observable<string[]> {
    return new Observable(observer => {
      // Simulate photo upload delay
      setTimeout(() => {
        const uploadedUrls = files.map(file => {
          const color = this.getRandomColor();
          const fileName = file.name.split('.')[0];
          return `https://via.placeholder.com/400x300/${color}/FFFFFF?text=${encodeURIComponent(fileName)}`;
        });

        observer.next(uploadedUrls);
        observer.complete();
      }, 2000);
    });
  }

  // Search properties
  searchProperties(query: string): Observable<any[]> {
    return this.getProperties().pipe(
      map(properties => {
        if (!query.trim()) return properties;
        
        const searchLower = query.toLowerCase().trim();
        return properties.filter(property => 
          property.name.toLowerCase().includes(searchLower) ||
          property.description?.toLowerCase().includes(searchLower) ||
          property.address.formatted.toLowerCase().includes(searchLower) ||
          property.owner.name.toLowerCase().includes(searchLower) ||
          property.type.toLowerCase().includes(searchLower)
        );
      })
    );
  }

  // Filter properties by type or status
  filterProperties(filterType: string): Observable<any[]> {
    return this.getProperties().pipe(
      map(properties => {
        switch (filterType) {
          case 'all':
            return properties;
          case 'service_due':
            return properties.filter(p => this.isServiceDueSoon(p));
          case 'overdue':
            return properties.filter(p => this.isServiceOverdue(p));
          default:
            return properties.filter(p => p.type === filterType);
        }
      })
    );
  }

  // Utility methods
  private formatAddress(address: any): string {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  }

  private getRandomColor(): string {
    const colors = ['4A90E2', '10DC60', 'F04141', 'FFCE00', 'B620E0', '1BC98E'];
    return colors[Math.floor(Math.random() * colors.length)];
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

  // Get properties assigned to current user
  getAssignedProperties(): Observable<any[]> {
    const currentUser = this.mockDataService.getCurrentUser();
    return this.getProperties().pipe(
      map(properties => properties.filter(p => 
        p.assignedEmployees?.includes(currentUser.id) || 
        this.mockDataService.hasRole(['owner', 'manager'])
      ))
    );
  }

  // Get property statistics
  getPropertyStats(): Observable<any> {
    return this.getProperties().pipe(
      map(properties => ({
        total: properties.length,
        byType: this.groupPropertiesByType(properties),
        serviceDue: properties.filter(p => this.isServiceDueSoon(p)).length,
        overdue: properties.filter(p => this.isServiceOverdue(p)).length,
        totalValue: properties.reduce((sum, p) => sum + (p.totalCost || 0), 0),
        monthlyRevenue: properties.reduce((sum, p) => sum + (p.subscription?.cost || 0), 0)
      }))
    );
  }

  private groupPropertiesByType(properties: any[]): any {
    return properties.reduce((acc, property) => {
      acc[property.type] = (acc[property.type] || 0) + 1;
      return acc;
    }, {});
  }
}