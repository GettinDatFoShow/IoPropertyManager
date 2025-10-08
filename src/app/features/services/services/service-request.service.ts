import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { 
  ServiceRequest, 
  CreateServiceRequestDto, 
  ServiceRequestSearchCriteria, 
  ServiceRequestListResponse, 
  ServiceRequestStatistics,
  ServiceCategory,
  Priority,
  ServiceStatus,
  TimeEntry,
  Material,
  Task,
  TaskStatus
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestService {
  
  // Service requests state management
  private serviceRequestsSubject = new BehaviorSubject<ServiceRequest[]>([]);
  public serviceRequests$ = this.serviceRequestsSubject.asObservable();
  
  // Tasks state management  
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  // Initialize with mock service request data
  private initializeMockData() {
    const mockRequests = this.generateMockServiceRequests();
    const mockTasks = this.generateMockTasks();
    
    this.serviceRequestsSubject.next(mockRequests);
    this.tasksSubject.next(mockTasks);
  }

  // CRUD Operations for Service Requests

  /**
   * Get all service requests with optional search criteria
   */
  getServiceRequests(criteria?: ServiceRequestSearchCriteria): Observable<ServiceRequestListResponse> {
    return this.serviceRequests$.pipe(
      map(requests => {
        let filteredRequests = [...requests];
        
        if (criteria) {
          // Apply search filters
          if (criteria.searchTerm) {
            const term = criteria.searchTerm.toLowerCase();
            filteredRequests = filteredRequests.filter(req => 
              req.title.toLowerCase().includes(term) ||
              req.description.toLowerCase().includes(term) ||
              req.propertyName.toLowerCase().includes(term) ||
              req.requesterName.toLowerCase().includes(term)
            );
          }
          
          if (criteria.propertyId) {
            filteredRequests = filteredRequests.filter(req => req.propertyId === criteria.propertyId);
          }
          
          if (criteria.category) {
            filteredRequests = filteredRequests.filter(req => req.category === criteria.category);
          }
          
          if (criteria.priority) {
            filteredRequests = filteredRequests.filter(req => req.priority === criteria.priority);
          }
          
          if (criteria.status) {
            filteredRequests = filteredRequests.filter(req => req.status === criteria.status);
          }
          
          if (criteria.assignedTo) {
            filteredRequests = filteredRequests.filter(req => req.assignedTo === criteria.assignedTo);
          }
          
          if (criteria.dateRange) {
            filteredRequests = filteredRequests.filter(req => 
              req.createdAt >= criteria.dateRange!.from && 
              req.createdAt <= criteria.dateRange!.to
            );
          }
          
          if (criteria.costRange) {
            filteredRequests = filteredRequests.filter(req => 
              req.actualCost && 
              req.actualCost >= criteria.costRange!.min && 
              req.actualCost <= criteria.costRange!.max
            );
          }
        }
        
        // Sort by creation date (newest first)
        filteredRequests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        return {
          requests: filteredRequests,
          totalCount: filteredRequests.length,
          pageSize: filteredRequests.length,
          currentPage: 1,
          totalPages: 1
        };
      }),
      delay(300) // Simulate API delay
    );
  }

  /**
   * Get a specific service request by ID
   */
  getServiceRequestById(id: string): Observable<ServiceRequest | null> {
    return this.serviceRequests$.pipe(
      map(requests => requests.find(request => request.id === id) || null),
      delay(200)
    );
  }

  /**
   * Create a new service request
   */
  createServiceRequest(requestData: CreateServiceRequestDto): Observable<ServiceRequest> {
    return new Observable(observer => {
      // Simulate API processing time
      setTimeout(() => {
        const newRequest: ServiceRequest = {
          id: `sr-${Date.now()}`,
          propertyId: requestData.propertyId,
          propertyName: 'Sample Property', // Mock data
          requesterId: 'current-user-id',
          requesterName: 'Current User', // Mock data
          title: requestData.title,
          description: requestData.description,
          category: requestData.category,
          priority: requestData.priority,
          status: 'submitted',
          attachments: [], // File uploads will be handled separately
          estimatedCost: requestData.estimatedCost,
          createdAt: new Date(),
          updatedAt: new Date(),
          scheduledDate: requestData.scheduledDate,
          internalNotes: [],
          timeTracking: [],
          materials: []
        };
        
        // Add to mock data
        const currentRequests = this.serviceRequestsSubject.value;
        this.serviceRequestsSubject.next([newRequest, ...currentRequests]);
        
        observer.next(newRequest);
        observer.complete();
      }, 800);
    });
  }

  /**
   * Update an existing service request
   */
  updateServiceRequest(id: string, updateData: Partial<ServiceRequest>): Observable<ServiceRequest> {
    return new Observable(observer => {
      setTimeout(() => {
        const currentRequests = this.serviceRequestsSubject.value;
        const requestIndex = currentRequests.findIndex(req => req.id === id);
        
        if (requestIndex === -1) {
          observer.error(new Error('Service request not found'));
          return;
        }
        
        const updatedRequest: ServiceRequest = {
          ...currentRequests[requestIndex],
          ...updateData,
          updatedAt: new Date()
        };
        
        const updatedRequests = [...currentRequests];
        updatedRequests[requestIndex] = updatedRequest;
        
        this.serviceRequestsSubject.next(updatedRequests);
        
        observer.next(updatedRequest);
        observer.complete();
      }, 600);
    });
  }

  /**
   * Delete a service request
   */
  deleteServiceRequest(id: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        const currentRequests = this.serviceRequestsSubject.value;
        const filteredRequests = currentRequests.filter(req => req.id !== id);
        
        this.serviceRequestsSubject.next(filteredRequests);
        
        observer.next(true);
        observer.complete();
      }, 400);
    });
  }

  /**
   * Assign service request to an employee
   */
  assignServiceRequest(requestId: string, employeeId: string, employeeName: string): Observable<ServiceRequest> {
    return this.updateServiceRequest(requestId, {
      assignedTo: employeeId,
      assignedToName: employeeName,
      status: 'assigned'
    });
  }

  /**
   * Add time entry to service request
   */
  addTimeEntry(requestId: string, timeEntry: Omit<TimeEntry, 'id'>): Observable<ServiceRequest> {
    return new Observable(observer => {
      setTimeout(() => {
        const currentRequests = this.serviceRequestsSubject.value;
        const requestIndex = currentRequests.findIndex(req => req.id === requestId);
        
        if (requestIndex === -1) {
          observer.error(new Error('Service request not found'));
          return;
        }
        
        const newTimeEntry: TimeEntry = {
          ...timeEntry,
          id: `te-${Date.now()}`
        };
        
        const updatedRequest = {
          ...currentRequests[requestIndex],
          timeTracking: [...currentRequests[requestIndex].timeTracking, newTimeEntry],
          updatedAt: new Date()
        };
        
        const updatedRequests = [...currentRequests];
        updatedRequests[requestIndex] = updatedRequest;
        
        this.serviceRequestsSubject.next(updatedRequests);
        
        observer.next(updatedRequest);
        observer.complete();
      }, 400);
    });
  }

  /**
   * Add material to service request
   */
  addMaterial(requestId: string, material: Omit<Material, 'id'>): Observable<ServiceRequest> {
    return new Observable(observer => {
      setTimeout(() => {
        const currentRequests = this.serviceRequestsSubject.value;
        const requestIndex = currentRequests.findIndex(req => req.id === requestId);
        
        if (requestIndex === -1) {
          observer.error(new Error('Service request not found'));
          return;
        }
        
        const newMaterial: Material = {
          ...material,
          id: `mat-${Date.now()}`
        };
        
        const updatedRequest = {
          ...currentRequests[requestIndex],
          materials: [...currentRequests[requestIndex].materials, newMaterial],
          updatedAt: new Date()
        };
        
        const updatedRequests = [...currentRequests];
        updatedRequests[requestIndex] = updatedRequest;
        
        this.serviceRequestsSubject.next(updatedRequests);
        
        observer.next(updatedRequest);
        observer.complete();
      }, 400);
    });
  }

  /**
   * Get service request statistics
   */
  getServiceRequestStatistics(): Observable<ServiceRequestStatistics> {
    return this.serviceRequests$.pipe(
      map(requests => {
        const totalRequests = requests.length;
        const openRequests = requests.filter(r => !['completed', 'verified', 'closed'].includes(r.status)).length;
        const completedRequests = requests.filter(r => ['completed', 'verified', 'closed'].includes(r.status)).length;
        
        // Calculate average completion time
        const completedWithTimes = requests.filter(r => r.completedAt && r.createdAt);
        const avgCompletionTime = completedWithTimes.length > 0 
          ? completedWithTimes.reduce((sum, r) => 
              sum + (r.completedAt!.getTime() - r.createdAt.getTime()), 0
            ) / completedWithTimes.length / (1000 * 60 * 60) // Convert to hours
          : 0;
        
        // Calculate average cost
        const requestsWithCost = requests.filter(r => r.actualCost);
        const avgCost = requestsWithCost.length > 0
          ? requestsWithCost.reduce((sum, r) => sum + r.actualCost!, 0) / requestsWithCost.length
          : 0;
        
        // Calculate customer satisfaction
        const requestsWithFeedback = requests.filter(r => r.customerFeedback);
        const avgRating = requestsWithFeedback.length > 0
          ? requestsWithFeedback.reduce((sum, r) => sum + r.customerFeedback!.rating, 0) / requestsWithFeedback.length
          : 0;
        
        // Group by category
        const requestsByCategory = requests.reduce((acc, r) => {
          acc[r.category] = (acc[r.category] || 0) + 1;
          return acc;
        }, {} as Record<ServiceCategory, number>);
        
        // Group by priority
        const requestsByPriority = requests.reduce((acc, r) => {
          acc[r.priority] = (acc[r.priority] || 0) + 1;
          return acc;
        }, {} as Record<Priority, number>);
        
        // Group by status
        const requestsByStatus = requests.reduce((acc, r) => {
          acc[r.status] = (acc[r.status] || 0) + 1;
          return acc;
        }, {} as Record<ServiceStatus, number>);
        
        return {
          totalRequests,
          openRequests,
          completedRequests,
          averageCompletionTime: Math.round(avgCompletionTime * 100) / 100,
          averageCost: Math.round(avgCost * 100) / 100,
          customerSatisfactionScore: Math.round(avgRating * 100) / 100,
          requestsByCategory,
          requestsByPriority,
          requestsByStatus,
          monthlyRequestVolume: [], // Will be implemented with more complex logic
          topPerformingEmployees: [] // Will be implemented with more complex logic
        };
      }),
      delay(500)
    );
  }

  // Task Management Methods

  /**
   * Get tasks for a specific service request
   */
  getTasksForServiceRequest(serviceRequestId: string): Observable<Task[]> {
    return this.tasks$.pipe(
      map(tasks => tasks.filter(task => task.serviceRequestId === serviceRequestId)),
      delay(200)
    );
  }

  /**
   * Get tasks assigned to a specific employee
   */
  getTasksForEmployee(employeeId: string): Observable<Task[]> {
    return this.tasks$.pipe(
      map(tasks => tasks.filter(task => task.assignedTo === employeeId)),
      delay(200)
    );
  }

  /**
   * Update task status
   */
  updateTaskStatus(taskId: string, status: TaskStatus): Observable<Task> {
    return new Observable(observer => {
      setTimeout(() => {
        const currentTasks = this.tasksSubject.value;
        const taskIndex = currentTasks.findIndex(task => task.id === taskId);
        
        if (taskIndex === -1) {
          observer.error(new Error('Task not found'));
          return;
        }
        
        const updatedTask = {
          ...currentTasks[taskIndex],
          status,
          updatedAt: new Date(),
          completedAt: status === 'completed' ? new Date() : currentTasks[taskIndex].completedAt
        };
        
        const updatedTasks = [...currentTasks];
        updatedTasks[taskIndex] = updatedTask;
        
        this.tasksSubject.next(updatedTasks);
        
        observer.next(updatedTask);
        observer.complete();
      }, 400);
    });
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
   * Get service status options for dropdowns
   */
  getServiceStatusOptions(): ServiceStatus[] {
    return [
      'submitted', 'reviewed', 'approved', 'rejected', 'assigned',
      'scheduled', 'in-progress', 'completed', 'verified', 'closed', 'cancelled'
    ];
  }

  // Mock Data Generation

  private generateMockServiceRequests(): ServiceRequest[] {
    return [
      {
        id: 'sr-001',
        propertyId: 'prop-1',
        propertyName: 'Sunset Apartments - Unit 4B',
        requesterId: 'mock-owner-456',
        requesterName: 'John Smith',
        title: 'Kitchen Sink Leaking',
        description: 'The kitchen sink has been leaking underneath for the past week. Water is pooling in the cabinet.',
        category: 'plumbing',
        priority: 'high',
        status: 'assigned',
        attachments: [],
        estimatedCost: 150,
        actualCost: 125,
        assignedTo: 'mock-employee-321',
        assignedToName: 'Mike Davis',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        internalNotes: ['Tenant available after 2 PM', 'Need to check water valve'],
        timeTracking: [
          {
            id: 'te-001',
            employeeId: 'mock-employee-321',
            employeeName: 'Mike Davis',
            startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            duration: 60,
            description: 'Initial assessment and diagnosis',
            billableHours: 1,
            hourlyRate: 75,
            totalCost: 75
          }
        ],
        materials: [
          {
            id: 'mat-001',
            name: 'Sink Trap Assembly',
            description: '1.5" Chrome P-Trap',
            quantity: 1,
            unitPrice: 25,
            totalCost: 25,
            supplier: 'Home Depot',
            category: 'plumbing-supplies',
            usedAt: new Date()
          }
        ]
      },
      {
        id: 'sr-002',
        propertyId: 'prop-2',
        propertyName: 'Oak Street Office Complex',
        requesterId: 'mock-manager-789',
        requesterName: 'Sarah Johnson',
        title: 'HVAC System Maintenance',
        description: 'Quarterly maintenance check for the main HVAC system. Filter replacement and system inspection needed.',
        category: 'hvac',
        priority: 'medium',
        status: 'scheduled',
        attachments: [],
        estimatedCost: 300,
        assignedTo: 'mock-employee-321',
        assignedToName: 'Mike Davis',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        internalNotes: ['Annual service contract covers this work'],
        timeTracking: [],
        materials: []
      },
      {
        id: 'sr-003',
        propertyId: 'prop-1',
        propertyName: 'Sunset Apartments - Unit 2A',
        requesterId: 'mock-owner-456',
        requesterName: 'John Smith',
        title: 'Emergency Electrical Issue',
        description: 'Power outlet in bedroom is sparking. Tenant reports burning smell. URGENT - Tenant evacuated.',
        category: 'electrical',
        priority: 'emergency',
        status: 'completed',
        attachments: [],
        estimatedCost: 200,
        actualCost: 275,
        assignedTo: 'mock-employee-321',
        assignedToName: 'Mike Davis',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        customerFeedback: {
          rating: 5,
          comment: 'Excellent emergency response! Fixed quickly and safely.',
          submittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          wouldRecommend: true
        },
        internalNotes: ['Faulty GFCI outlet', 'Full electrical inspection recommended'],
        timeTracking: [
          {
            id: 'te-002',
            employeeId: 'mock-employee-321',
            employeeName: 'Mike Davis',
            startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
            duration: 180,
            description: 'Emergency electrical repair',
            billableHours: 3,
            hourlyRate: 85,
            totalCost: 255
          }
        ],
        materials: [
          {
            id: 'mat-002',
            name: 'GFCI Outlet',
            description: '20A GFCI Outlet with LED indicator',
            quantity: 1,
            unitPrice: 15,
            totalCost: 15,
            category: 'electrical-supplies',
            usedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
          }
        ]
      }
    ];
  }

  private generateMockTasks(): Task[] {
    return [
      {
        id: 'task-001',
        serviceRequestId: 'sr-001',
        title: 'Replace Kitchen Sink P-Trap',
        description: 'Remove old leaking P-trap and install new chrome assembly',
        assignedTo: 'mock-employee-321',
        assignedToName: 'Mike Davis',
        status: 'in-progress',
        priority: 'high',
        estimatedDuration: 120, // 2 hours
        actualDuration: 90, // 1.5 hours
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        subtasks: [
          {
            id: 'st-001',
            title: 'Turn off water supply',
            isCompleted: true,
            completedAt: new Date(),
            completedBy: 'mock-employee-321'
          },
          {
            id: 'st-002',
            title: 'Remove old P-trap',
            isCompleted: true,
            completedAt: new Date(),
            completedBy: 'mock-employee-321'
          },
          {
            id: 'st-003',
            title: 'Install new P-trap',
            isCompleted: false
          }
        ],
        checklist: [
          {
            id: 'cl-001',
            text: 'Check water pressure after installation',
            isRequired: true,
            isCompleted: false
          },
          {
            id: 'cl-002',
            text: 'Test for leaks',
            isRequired: true,
            isCompleted: false
          },
          {
            id: 'cl-003',
            text: 'Clean work area',
            isRequired: false,
            isCompleted: false
          }
        ],
        notes: [
          {
            id: 'tn-001',
            text: 'Old P-trap was completely corroded. Recommended checking other plumbing in unit.',
            createdAt: new Date(),
            createdBy: 'mock-employee-321',
            createdByName: 'Mike Davis',
            isInternal: true
          }
        ]
      }
    ];
  }
}