import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User, Business } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  
  // Mock Business Data
  private mockBusiness: Business = {
    id: 'mock-business-123',
    name: 'PropertyCare Solutions',
    type: 'property-management',
    description: 'Professional property management services',
    ownerId: 'mock-owner-456',
    address: {
      street: '123 Business Ave',
      city: 'Property City',
      state: 'CA',
      zipCode: '90210',
      country: 'USA',
      formatted: '123 Business Ave, Property City, CA 90210, USA'
    },
    contact: {
      email: 'contact@propertycare.com',
      phone: '(555) 123-4567',
      website: 'https://propertycare.com'
    },
    settings: {
      theme: 'system',
      timeZone: 'America/Los_Angeles',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      defaultServiceReminder: 3,
      requireGeotagging: true,
      workingHours: {
        start: '08:00',
        end: '17:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      notifications: {
        email: true,
        sms: true,
        push: true
      }
    },
    subscription: {
      plan: 'pro',
      status: 'active',
      startDate: new Date('2024-01-01') as any,
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) as any, // 1 year from now
      maxUsers: 10,
      maxProperties: 50,
      maxEmployees: 20,
      features: ['property-management', 'task-tracking', 'reporting', 'team-management']
    },
    createdAt: new Date('2024-01-01') as any,
    updatedAt: new Date() as any
  };

  // Mock Owner User
  private mockOwner: User = {
    id: 'mock-owner-456',
    businessId: 'mock-business-123',
    email: 'owner@propertycare.com',
    firstName: 'John',
    lastName: 'Smith',
    displayName: 'John Smith',
    photoURL: 'https://i.pravatar.cc/150?img=12',
    role: 'owner',
    profile: {
      firstName: 'John',
      lastName: 'Smith',
      phoneNumber: '(555) 123-4567',
      homeAddress: {
        street: '456 Owner St',
        city: 'Property City', 
        state: 'CA',
        zipCode: '90210',
        country: 'USA',
        formatted: '456 Owner St, Property City, CA 90210, USA'
      },
      dateHired: new Date('2024-01-01') as any
    },
    assignedProperties: ['prop-1', 'prop-2', 'prop-3'],
    workSchedule: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isActive: true },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isActive: true },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isActive: true },
      { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isActive: true }
    ],
    isActive: true,
    createdAt: new Date('2024-01-01') as any,
    updatedAt: new Date() as any,
    lastLogin: new Date() as any
  };

  // Mock Manager User
  private mockManager: User = {
    id: 'mock-manager-789',
    businessId: 'mock-business-123',
    email: 'manager@propertycare.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    displayName: 'Sarah Johnson',
    photoURL: 'https://i.pravatar.cc/150?img=47',
    role: 'manager',
    profile: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      phoneNumber: '(555) 234-5678',
      dateHired: new Date('2024-02-15') as any
    },
    assignedProperties: ['prop-1', 'prop-2'],
    workSchedule: [
      { dayOfWeek: 1, startTime: '08:00', endTime: '16:00', isActive: true },
      { dayOfWeek: 2, startTime: '08:00', endTime: '16:00', isActive: true },
      { dayOfWeek: 3, startTime: '08:00', endTime: '16:00', isActive: true },
      { dayOfWeek: 4, startTime: '08:00', endTime: '16:00', isActive: true },
      { dayOfWeek: 5, startTime: '08:00', endTime: '16:00', isActive: true }
    ],
    isActive: true,
    createdAt: new Date('2024-02-15') as any,
    updatedAt: new Date() as any,
    lastLogin: new Date() as any
  };

  // Mock Employee User
  private mockEmployee: User = {
    id: 'mock-employee-321',
    businessId: 'mock-business-123',
    email: 'employee@propertycare.com',
    firstName: 'Mike',
    lastName: 'Davis',
    displayName: 'Mike Davis',
    photoURL: 'https://i.pravatar.cc/150?img=33',
    role: 'employee',
    profile: {
      firstName: 'Mike',
      lastName: 'Davis',
      phoneNumber: '(555) 345-6789',
      dateHired: new Date('2024-03-01') as any
    },
    assignedProperties: ['prop-2', 'prop-3'],
    workSchedule: [
      { dayOfWeek: 1, startTime: '07:00', endTime: '15:00', isActive: true },
      { dayOfWeek: 2, startTime: '07:00', endTime: '15:00', isActive: true },
      { dayOfWeek: 3, startTime: '07:00', endTime: '15:00', isActive: true },
      { dayOfWeek: 4, startTime: '07:00', endTime: '15:00', isActive: true },
      { dayOfWeek: 5, startTime: '07:00', endTime: '15:00', isActive: true }
    ],
    isActive: true,
    createdAt: new Date('2024-03-01') as any,
    updatedAt: new Date() as any,
    lastLogin: new Date() as any
  };

  // Subject to control which user is currently "logged in"
  private currentUserTypeSubject = new BehaviorSubject<'owner' | 'manager' | 'employee'>('owner');
  public currentUserType$ = this.currentUserTypeSubject.asObservable();

  getCurrentUser(): User {
    const userType = this.currentUserTypeSubject.value;
    switch (userType) {
      case 'owner': return this.mockOwner;
      case 'manager': return this.mockManager;  
      case 'employee': return this.mockEmployee;
      default: return this.mockOwner;
    }
  }

  getCurrentBusiness(): Business {
    return this.mockBusiness;
  }

  switchUser(userType: 'owner' | 'manager' | 'employee'): void {
    this.currentUserTypeSubject.next(userType);
  }

  isAuthenticated(): boolean {
    return true; // Always authenticated in mock mode
  }

  hasRole(roles: string | string[]): boolean {
    const currentRole = this.getCurrentUser().role;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(currentRole);
  }

  canManageEmployees(): boolean {
    return this.hasRole(['owner', 'manager']);
  }

  canManageProperties(): boolean {
    return this.hasRole(['owner', 'manager']);
  }

  // Mock Properties Data
  getMockProperties() {
    return [
      {
        id: 'prop-1',
        businessId: 'mock-business-123',
        name: 'Sunset Apartments',
        description: '24-unit apartment complex with pool and fitness center',
        type: 'apartment_complex',
        owner: {
          name: 'Sunset Property Group',
          email: 'contact@sunsetgroup.com',
          phone: '(555) 111-2222'
        },
        address: {
          street: '789 Sunset Blvd',
          city: 'Property City',
          state: 'CA', 
          zipCode: '90210',
          country: 'USA',
          formatted: '789 Sunset Blvd, Property City, CA 90210, USA'
        },
        location: { latitude: 34.0522, longitude: -118.2437 },
        photos: [
          'https://picsum.photos/id/1018/400/300'
        ],
        subscription: { cost: 2500, billing: 'monthly', nextBilling: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
        assignedEmployees: ['mock-manager-789', 'mock-employee-321'],
        serviceableItemsCount: 12,
        nextServiceDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        totalCost: 4200,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      },
      {
        id: 'prop-2', 
        businessId: 'mock-business-123',
        name: 'Oak Street Homes',
        description: 'Townhome community with 8 units',
        type: 'housing_complex',
        owner: {
          name: 'Oak Development LLC',
          email: 'info@oakdev.com',
          phone: '(555) 333-4444'
        },
        address: {
          street: '456 Oak Street',
          city: 'Property City',
          state: 'CA',
          zipCode: '90210', 
          country: 'USA',
          formatted: '456 Oak Street, Property City, CA 90210, USA'
        },
        location: { latitude: 34.0622, longitude: -118.2537 },
        photos: [
          'https://picsum.photos/id/1015/400/300'
        ],
        subscription: { cost: 1800, billing: 'monthly', nextBilling: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) },
        assignedEmployees: ['mock-employee-321'],
        serviceableItemsCount: 8,
        nextServiceDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalCost: 2800,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date()
      },
      {
        id: 'prop-3',
        businessId: 'mock-business-123', 
        name: 'Maple Manor',
        description: 'Single family home with large yard',
        type: 'home',
        owner: {
          name: 'Jennifer Wilson',
          email: 'j.wilson@email.com',
          phone: '(555) 555-6666'
        },
        address: {
          street: '123 Maple Drive',
          city: 'Property City',
          state: 'CA',
          zipCode: '90210',
          country: 'USA', 
          formatted: '123 Maple Drive, Property City, CA 90210, USA'
        },
        location: { latitude: 34.0422, longitude: -118.2337 },
        photos: [
          'https://picsum.photos/id/1024/400/300'
        ],
        subscription: { cost: 800, billing: 'monthly', nextBilling: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
        assignedEmployees: ['mock-owner-456'],
        serviceableItemsCount: 6,
        nextServiceDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        totalCost: 1200,
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date()
      }
    ];
  }

  // Mock Tasks for Today
  getTodaysTasks() {
    return [
      {
        id: 'task-1',
        propertyId: 'prop-1',
        propertyName: 'Sunset Apartments',
        itemName: 'Pool Filter Maintenance',
        dueDate: new Date(),
        priority: 'high',
        status: 'pending',
        assignedTo: this.getCurrentUser().id
      },
      {
        id: 'task-2', 
        propertyId: 'prop-2',
        propertyName: 'Oak Street Homes',
        itemName: 'HVAC System Check',
        dueDate: new Date(),
        priority: 'medium',
        status: 'pending',
        assignedTo: this.getCurrentUser().id
      },
      {
        id: 'task-3',
        propertyId: 'prop-3', 
        propertyName: 'Maple Manor',
        itemName: 'Sprinkler System Inspection',
        dueDate: new Date(),
        priority: 'low',
        status: 'pending',
        assignedTo: this.getCurrentUser().id
      }
    ];
  }

  // Mock Upcoming Tasks (next 10 days)
  getUpcomingTasks() {
    return [
      {
        id: 'task-4',
        propertyId: 'prop-1',
        propertyName: 'Sunset Apartments',
        itemName: 'Elevator Inspection',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        priority: 'high',
        status: 'scheduled'
      },
      {
        id: 'task-5',
        propertyId: 'prop-2', 
        propertyName: 'Oak Street Homes',
        itemName: 'Gutter Cleaning',
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        status: 'scheduled'
      },
      {
        id: 'task-6',
        propertyId: 'prop-1',
        propertyName: 'Sunset Apartments', 
        itemName: 'Fire Alarm Testing',
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        priority: 'high',
        status: 'scheduled'
      },
      {
        id: 'task-7',
        propertyId: 'prop-3',
        propertyName: 'Maple Manor',
        itemName: 'Landscaping Service',
        dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        priority: 'low',
        status: 'scheduled'
      }
    ];
  }
}