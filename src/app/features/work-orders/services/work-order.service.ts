import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay, switchMap } from 'rxjs/operators';

import {
  WorkOrder,
  WorkOrderStatus,
  WorkOrderSearchCriteria,
  WorkOrderListResponse,
  WorkOrderStatistics,
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  WorkOrderTemplate,
  TimeEntry,
  MaterialRequirement,
  UsedMaterial
} from '../models';
import { Priority, ServiceCategory } from '../../services/models/service-request.interface';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderService {
  private workOrdersSubject = new BehaviorSubject<WorkOrder[]>([]);
  private templatesSubject = new BehaviorSubject<WorkOrderTemplate[]>([]);

  public workOrders$ = this.workOrdersSubject.asObservable();
  public templates$ = this.templatesSubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    const mockWorkOrders = this.generateMockWorkOrders();
    const mockTemplates = this.generateMockTemplates();
    
    this.workOrdersSubject.next(mockWorkOrders);
    this.templatesSubject.next(mockTemplates);
  }

  // Work Order CRUD Operations
  getWorkOrders(criteria?: WorkOrderSearchCriteria): Observable<WorkOrderListResponse> {
    return this.workOrders$.pipe(
      map(workOrders => {
        let filtered = [...workOrders];

        if (criteria?.searchTerm) {
          const term = criteria.searchTerm.toLowerCase();
          filtered = filtered.filter(wo =>
            wo.title.toLowerCase().includes(term) ||
            wo.workOrderNumber.toLowerCase().includes(term) ||
            wo.description.toLowerCase().includes(term) ||
            wo.propertyName.toLowerCase().includes(term) ||
            wo.assignedEmployeeName?.toLowerCase().includes(term)
          );
        }

        if (criteria?.propertyId) {
          filtered = filtered.filter(wo => wo.propertyId === criteria.propertyId);
        }

        if (criteria?.assignedEmployeeId) {
          filtered = filtered.filter(wo => wo.assignedEmployeeId === criteria.assignedEmployeeId);
        }

        if (criteria?.status && criteria.status.length > 0) {
          filtered = filtered.filter(wo => criteria.status!.includes(wo.status));
        }

        if (criteria?.priority && criteria.priority.length > 0) {
          filtered = filtered.filter(wo => criteria.priority!.includes(wo.priority));
        }

        if (criteria?.category && criteria.category.length > 0) {
          filtered = filtered.filter(wo => criteria.category!.includes(wo.category));
        }

        if (criteria?.isEmergency !== undefined) {
          filtered = filtered.filter(wo => wo.isEmergency === criteria.isEmergency);
        }

        if (criteria?.dateRange) {
          filtered = filtered.filter(wo => {
            if (!wo.scheduledDate) return false;
            return wo.scheduledDate >= criteria.dateRange!.from && 
                   wo.scheduledDate <= criteria.dateRange!.to;
          });
        }

        return {
          workOrders: filtered,
          totalCount: filtered.length,
          pageSize: 50,
          currentPage: 1,
          totalPages: Math.ceil(filtered.length / 50)
        };
      }),
      delay(500) // Simulate API delay
    );
  }

  getWorkOrderById(id: string): Observable<WorkOrder | null> {
    return this.workOrders$.pipe(
      map(workOrders => workOrders.find(wo => wo.id === id) || null)
    );
  }

  createWorkOrder(data: CreateWorkOrderDto): Observable<WorkOrder> {
    const newWorkOrder: WorkOrder = {
      id: 'wo-' + Date.now(),
      workOrderNumber: this.generateWorkOrderNumber(),
      ...data,
      customerApprovalRequired: data.customerApprovalRequired ?? false,
      propertyName: this.getPropertyNameById(data.propertyId),
      assignedEmployeeName: data.assignedEmployeeId ? this.getEmployeeNameById(data.assignedEmployeeId) : undefined,
      status: 'draft',
      progressPercentage: 0,
      requiredMaterials: data.requiredMaterials?.map(mat => ({
        ...mat,
        id: 'mat-' + Date.now() + Math.random(),
        isOrdered: false
      })) || [],
      usedMaterials: [],
      requiredTools: data.requiredTools || [],
      beforePhotos: [],
      afterPhotos: [],
      attachments: [],
      qualityChecklist: data.qualityChecklist?.map(item => ({
        ...item,
        id: 'qc-' + Date.now() + Math.random(),
        isCompleted: false
      })) || [],
      inspectionCompleted: false,
      timeEntries: [],
      customerNotificationSent: false,
      customerApproved: (data.customerApprovalRequired ?? false) ? false : true,
      isEmergency: data.isEmergency || false,
      permitsRequired: data.permitsRequired || [],
      followUpRequired: data.followUpRequired || false,
      inspectionRequired: data.inspectionRequired || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user',
      lastModifiedBy: 'current-user'
    };

    const currentWorkOrders = this.workOrdersSubject.value;
    this.workOrdersSubject.next([...currentWorkOrders, newWorkOrder]);

    return of(newWorkOrder).pipe(delay(300));
  }

  updateWorkOrder(id: string, data: UpdateWorkOrderDto): Observable<WorkOrder> {
    const currentWorkOrders = this.workOrdersSubject.value;
    const index = currentWorkOrders.findIndex(wo => wo.id === id);
    
    if (index === -1) {
      throw new Error('Work order not found');
    }

    const updatedWorkOrder: WorkOrder = {
      ...currentWorkOrders[index],
      ...data,
      requiredMaterials: data.requiredMaterials?.map(mat => ({
        ...mat,
        id: 'mat-' + Date.now() + Math.random(),
        isOrdered: false
      })) || currentWorkOrders[index].requiredMaterials,
      qualityChecklist: data.qualityChecklist?.map(item => ({
        ...item,
        id: 'qc-' + Date.now() + Math.random(),
        isCompleted: false
      })) || currentWorkOrders[index].qualityChecklist,
      updatedAt: new Date(),
      lastModifiedBy: 'current-user'
    };

    // Update assigned employee name if employee ID changed
    if (data.assignedEmployeeId) {
      updatedWorkOrder.assignedEmployeeName = this.getEmployeeNameById(data.assignedEmployeeId);
    }

    const updatedWorkOrders = [...currentWorkOrders];
    updatedWorkOrders[index] = updatedWorkOrder;
    this.workOrdersSubject.next(updatedWorkOrders);

    return of(updatedWorkOrder).pipe(delay(300));
  }

  deleteWorkOrder(id: string): Observable<boolean> {
    const currentWorkOrders = this.workOrdersSubject.value;
    const filtered = currentWorkOrders.filter(wo => wo.id !== id);
    this.workOrdersSubject.next(filtered);
    return of(true).pipe(delay(300));
  }

  // Status Management
  updateWorkOrderStatus(id: string, status: WorkOrderStatus, notes?: string): Observable<WorkOrder> {
    const updateData: UpdateWorkOrderDto = { status };
    
    // Automatically update progress and dates based on status
    switch (status) {
      case 'in-progress':
        updateData.actualStartDate = new Date();
        updateData.progressPercentage = 10;
        break;
      case 'completed':
        updateData.actualEndDate = new Date();
        updateData.progressPercentage = 100;
        break;
      case 'closed':
        updateData.progressPercentage = 100;
        break;
    }

    if (notes) {
      updateData.completionNotes = notes;
    }

    return this.updateWorkOrder(id, updateData);
  }

  // Time Tracking
  addTimeEntry(workOrderId: string, timeEntry: Omit<TimeEntry, 'id'>): Observable<WorkOrder> {
    const currentWorkOrders = this.workOrdersSubject.value;
    const workOrder = currentWorkOrders.find(wo => wo.id === workOrderId);
    
    if (!workOrder) {
      throw new Error('Work order not found');
    }

    const newTimeEntry: TimeEntry = {
      ...timeEntry,
      id: 'time-' + Date.now()
    };

    const updatedTimeEntries = [...workOrder.timeEntries, newTimeEntry];
    const totalLaborCost = updatedTimeEntries.reduce((sum, entry) => sum + (entry.totalCost || 0), 0);

    return this.updateWorkOrder(workOrderId, {
      timeEntries: updatedTimeEntries,
      laborCost: totalLaborCost,
      actualCost: totalLaborCost + (workOrder.materialsCost || 0)
    });
  }

  // Material Management
  updateMaterialRequirement(workOrderId: string, materialId: string, updates: Partial<MaterialRequirement>): Observable<WorkOrder> {
    const currentWorkOrders = this.workOrdersSubject.value;
    const workOrder = currentWorkOrders.find(wo => wo.id === workOrderId);
    
    if (!workOrder) {
      throw new Error('Work order not found');
    }

    const updatedMaterials = workOrder.requiredMaterials.map(mat =>
      mat.id === materialId ? { ...mat, ...updates } : mat
    );

    return this.updateWorkOrder(workOrderId, {
      requiredMaterials: updatedMaterials
    });
  }

  addUsedMaterial(workOrderId: string, material: Omit<UsedMaterial, 'id'>): Observable<WorkOrder> {
    const currentWorkOrders = this.workOrdersSubject.value;
    const workOrder = currentWorkOrders.find(wo => wo.id === workOrderId);
    
    if (!workOrder) {
      throw new Error('Work order not found');
    }

    const newUsedMaterial: UsedMaterial = {
      ...material,
      id: 'used-mat-' + Date.now()
    };

    const updatedUsedMaterials = [...workOrder.usedMaterials, newUsedMaterial];
    const totalMaterialsCost = updatedUsedMaterials.reduce((sum, mat) => sum + mat.actualCost, 0);

    return this.updateWorkOrder(workOrderId, {
      usedMaterials: updatedUsedMaterials,
      materialsCost: totalMaterialsCost,
      actualCost: (workOrder.laborCost || 0) + totalMaterialsCost
    });
  }

  // Statistics and Analytics
  getWorkOrderStatistics(): Observable<WorkOrderStatistics> {
    return this.workOrders$.pipe(
      map(workOrders => {
        const totalWorkOrders = workOrders.length;
        const openStatuses: WorkOrderStatus[] = ['draft', 'assigned', 'scheduled', 'in-progress', 'paused', 'waiting-parts', 'waiting-approval'];
        const openWorkOrders = workOrders.filter(wo => openStatuses.includes(wo.status)).length;
        const completedWorkOrders = workOrders.filter(wo => wo.status === 'completed' || wo.status === 'closed').length;
        const inProgressWorkOrders = workOrders.filter(wo => wo.status === 'in-progress').length;
        
        // Calculate overdue work orders (scheduled date passed and not completed)
        const now = new Date();
        const overdueWorkOrders = workOrders.filter(wo => 
          wo.scheduledDate && 
          wo.scheduledDate < now && 
          !['completed', 'closed', 'cancelled'].includes(wo.status)
        ).length;

        // Calculate averages
        const completedWithDuration = workOrders.filter(wo => wo.actualDuration && wo.status === 'completed');
        const avgCompletionTime = completedWithDuration.length > 0 
          ? completedWithDuration.reduce((sum, wo) => sum + wo.actualDuration!, 0) / completedWithDuration.length / 60 // Convert to hours
          : 0;

        const completedWithCost = workOrders.filter(wo => wo.actualCost && wo.status === 'completed');
        const avgCompletionCost = completedWithCost.length > 0
          ? completedWithCost.reduce((sum, wo) => sum + wo.actualCost!, 0) / completedWithCost.length
          : 0;

        // Calculate customer satisfaction
        const withFeedback = workOrders.filter(wo => wo.customerFeedback);
        const customerSatisfactionScore = withFeedback.length > 0
          ? withFeedback.reduce((sum, wo) => sum + wo.customerFeedback!.rating, 0) / withFeedback.length
          : 0;

        // Status distribution
        const workOrdersByStatus = this.getStatusDistribution(workOrders);
        const workOrdersByPriority = this.getPriorityDistribution(workOrders);
        const workOrdersByCategory = this.getCategoryDistribution(workOrders);

        return {
          totalWorkOrders,
          openWorkOrders,
          completedWorkOrders,
          overdueWorkOrders,
          inProgressWorkOrders,
          avgCompletionTime,
          avgCompletionCost,
          customerSatisfactionScore,
          workOrdersByStatus,
          workOrdersByPriority,
          workOrdersByCategory,
          completionTrend: [], // Would be populated with real data
          avgTimeByCategory: [], // Would be populated with real data
          employeePerformance: [], // Would be populated with real data
          totalCosts: completedWithCost.reduce((sum, wo) => sum + wo.actualCost!, 0),
          avgCostByCategory: [], // Would be populated with real data
          budgetVariance: [] // Would be populated with real data
        };
      })
    );
  }

  // Template Management
  getWorkOrderTemplates(): Observable<WorkOrderTemplate[]> {
    return this.templates$;
  }

  createWorkOrderFromTemplate(templateId: string, propertyId: string, customData?: Partial<CreateWorkOrderDto>): Observable<WorkOrder> {
    return this.templates$.pipe(
      switchMap(templates => {
        const template = templates.find(t => t.id === templateId);
        if (!template) {
          throw new Error('Template not found');
        }

        const workOrderData: CreateWorkOrderDto = {
          propertyId,
          title: template.name,
          description: template.description,
          category: template.category,
          priority: 'medium',
          estimatedDuration: template.estimatedDuration,
          estimatedCost: template.estimatedCost,
          workInstructions: template.workInstructions,
          requiredMaterials: template.requiredMaterials,
          requiredTools: template.requiredTools,
          qualityChecklist: template.qualityChecklist,
          inspectionRequired: template.inspectionRequired,
          safetyNotes: template.safetyNotes,
          followUpRequired: template.followUpRequired,
          warrantyPeriod: template.warrantyPeriod,
          ...customData
        };

        return this.createWorkOrder(workOrderData);
      }),
      delay(300)
    ).pipe(
      // Flatten the observable
      map(createObservable => createObservable)
    ) as Observable<WorkOrder>;
  }

  // Schedule Integration
  createWorkOrderFromSchedule(scheduleId: string, customData?: Partial<CreateWorkOrderDto>): Observable<WorkOrder> {
    // This would integrate with the scheduling service
    // For now, we'll create a basic work order
    const workOrderData: CreateWorkOrderDto = {
      scheduleId,
      propertyId: 'prop1', // Would come from schedule
      title: 'Scheduled Service',
      description: 'Work order generated from scheduled service',
      category: 'general-maintenance',
      priority: 'medium',
      estimatedDuration: 120,
      ...customData
    };

    return this.createWorkOrder(workOrderData);
  }

  // Helper Methods
  private generateWorkOrderNumber(): string {
    const year = new Date().getFullYear();
    const sequence = this.workOrdersSubject.value.length + 1;
    return `WO-${year}-${sequence.toString().padStart(3, '0')}`;
  }

  private getPropertyNameById(propertyId: string): string {
    const properties = {
      'prop1': 'Sunset Apartments - Building A',
      'prop2': 'Oak Street Condos - Unit 101',
      'prop3': 'Riverside Complex - Pool Area',
      'prop4': 'Downtown Office - Lobby'
    };
    return properties[propertyId as keyof typeof properties] || 'Unknown Property';
  }

  private getEmployeeNameById(employeeId: string): string {
    const employees = {
      'emp1': 'Mike Davis',
      'emp2': 'Sarah Wilson',
      'emp3': 'John Smith',
      'emp4': 'Lisa Johnson'
    };
    return employees[employeeId as keyof typeof employees] || 'Unknown Employee';
  }

  private getStatusDistribution(workOrders: WorkOrder[]): Record<WorkOrderStatus, number> {
    const distribution: Record<WorkOrderStatus, number> = {
      'draft': 0, 'assigned': 0, 'scheduled': 0, 'in-progress': 0,
      'paused': 0, 'waiting-parts': 0, 'waiting-approval': 0,
      'completed': 0, 'inspected': 0, 'closed': 0, 'cancelled': 0
    };

    workOrders.forEach(wo => {
      distribution[wo.status]++;
    });

    return distribution;
  }

  private getPriorityDistribution(workOrders: WorkOrder[]): Record<Priority, number> {
    const distribution: Record<Priority, number> = {
      'low': 0, 'medium': 0, 'high': 0, 'emergency': 0
    };

    workOrders.forEach(wo => {
      distribution[wo.priority]++;
    });

    return distribution;
  }

  private getCategoryDistribution(workOrders: WorkOrder[]): Record<ServiceCategory, number> {
    const distribution: Record<ServiceCategory, number> = {
      'plumbing': 0, 'electrical': 0, 'hvac': 0, 'cleaning': 0,
      'landscaping': 0, 'painting': 0, 'carpentry': 0, 'appliance-repair': 0,
      'pest-control': 0, 'security': 0, 'general-maintenance': 0, 'emergency': 0, 'other': 0
    };

    workOrders.forEach(wo => {
      distribution[wo.category]++;
    });

    return distribution;
  }

  private generateMockWorkOrders(): WorkOrder[] {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return [
      {
        id: 'wo-1',
        workOrderNumber: 'WO-2025-001',
        propertyId: 'prop1',
        propertyName: 'Sunset Apartments - Building A',
        title: 'HVAC Filter Replacement',
        description: 'Replace air filters in all units on the 3rd floor',
        category: 'hvac',
        priority: 'medium',
        assignedEmployeeId: 'emp1',
        assignedEmployeeName: 'Mike Davis',
        scheduledDate: tomorrow,
        estimatedDuration: 120,
        actualDuration: 105,
        status: 'completed',
        progressPercentage: 100,
        estimatedCost: 150,
        actualCost: 145,
        laborCost: 100,
        materialsCost: 45,
        workInstructions: 'Replace all HVAC filters on 3rd floor. Check filter sizes before ordering.',
        completionNotes: 'All filters replaced successfully. Found one unit with slightly dirty coil - recommended cleaning.',
        requiredMaterials: [
          {
            id: 'mat-1',
            name: '16x20 MERV-8 Filter',
            quantity: 12,
            unit: 'pieces',
            estimatedCost: 3.75,
            isOrdered: true,
            actualDeliveryDate: oneWeekAgo
          }
        ],
        usedMaterials: [
          {
            id: 'used-1',
            name: '16x20 MERV-8 Filter',
            quantity: 12,
            unit: 'pieces',
            actualCost: 45,
            usedDate: tomorrow
          }
        ],
        requiredTools: ['Screwdriver', 'Flashlight', 'Step ladder'],
        beforePhotos: [],
        afterPhotos: [],
        attachments: [],
        qualityChecklist: [
          {
            id: 'qc-1',
            description: 'All filters properly installed',
            isRequired: true,
            isCompleted: true,
            completedBy: 'Mike Davis',
            completedAt: tomorrow,
            passedInspection: true
          }
        ],
        inspectionRequired: false,
        inspectionCompleted: false,
        timeEntries: [
          {
            id: 'time-1',
            employeeId: 'emp1',
            employeeName: 'Mike Davis',
            startTime: new Date(tomorrow.getTime() + 9 * 60 * 60 * 1000),
            endTime: new Date(tomorrow.getTime() + 10.75 * 60 * 60 * 1000),
            duration: 105,
            description: 'HVAC filter replacement',
            billableTime: 105,
            hourlyRate: 57.14,
            totalCost: 100
          }
        ],
        createdAt: oneWeekAgo,
        updatedAt: tomorrow,
        createdBy: 'system',
        lastModifiedBy: 'emp1',
        customerNotificationSent: true,
        customerApprovalRequired: false,
        customerApproved: true,
        isEmergency: false,
        permitsRequired: [],
        followUpRequired: false
      },
      {
        id: 'wo-2',
        workOrderNumber: 'WO-2025-002',
        propertyId: 'prop2',
        propertyName: 'Oak Street Condos - Unit 101',
        title: 'Leaky Kitchen Faucet Repair',
        description: 'Tenant reported dripping kitchen faucet in Unit 101',
        category: 'plumbing',
        priority: 'high',
        assignedEmployeeId: 'emp2',
        assignedEmployeeName: 'Sarah Wilson',
        scheduledDate: now,
        estimatedDuration: 90,
        status: 'in-progress',
        progressPercentage: 60,
        estimatedCost: 85,
        workInstructions: 'Check faucet for worn washers or O-rings. Replace as needed.',
        requiredMaterials: [
          {
            id: 'mat-2',
            name: 'Faucet Repair Kit',
            quantity: 1,
            unit: 'kit',
            estimatedCost: 25,
            isOrdered: true,
            actualDeliveryDate: now
          }
        ],
        usedMaterials: [],
        requiredTools: ['Adjustable wrench', 'Screwdriver set', 'Plumber\'s grease'],
        beforePhotos: [],
        afterPhotos: [],
        attachments: [],
        qualityChecklist: [
          {
            id: 'qc-2',
            description: 'No leaks after repair',
            isRequired: true,
            isCompleted: false
          },
          {
            id: 'qc-3',
            description: 'Water pressure normal',
            isRequired: true,
            isCompleted: false
          }
        ],
        inspectionRequired: false,
        inspectionCompleted: false,
        timeEntries: [
          {
            id: 'time-2',
            employeeId: 'emp2',
            employeeName: 'Sarah Wilson',
            startTime: new Date(now.getTime() - 45 * 60 * 1000),
            description: 'Diagnosing faucet leak',
            billableTime: 45,
            hourlyRate: 65,
            totalCost: 48.75
          }
        ],
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: now,
        createdBy: 'tenant-request',
        lastModifiedBy: 'emp2',
        tenantId: 'tenant-101',
        tenantName: 'Jennifer Martinez',
        tenantContactInfo: {
          name: 'Jennifer Martinez',
          phone: '555-0123',
          email: 'jennifer.martinez@email.com',
          preferredContact: 'phone',
          emergencyContact: false
        },
        customerNotificationSent: true,
        customerApprovalRequired: false,
        customerApproved: true,
        isEmergency: false,
        permitsRequired: [],
        followUpRequired: true,
        followUpDate: nextWeek
      },
      {
        id: 'wo-3',
        workOrderNumber: 'WO-2025-003',
        propertyId: 'prop3',
        propertyName: 'Riverside Complex - Pool Area',
        title: 'Pool Equipment Emergency Repair',
        description: 'Pool filtration system failure - immediate attention required',
        category: 'emergency',
        priority: 'emergency',
        assignedEmployeeId: 'emp3',
        assignedEmployeeName: 'John Smith',
        scheduledDate: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        estimatedDuration: 240,
        status: 'waiting-parts',
        progressPercentage: 30,
        estimatedCost: 450,
        workInstructions: 'Diagnose filtration system failure. Pool must be operational within 24 hours.',
        safetyNotes: 'Pool is currently closed to residents. Ensure proper chemical levels before reopening.',
        requiredMaterials: [
          {
            id: 'mat-3',
            name: 'Pool Pump Motor',
            quantity: 1,
            unit: 'unit',
            estimatedCost: 300,
            isOrdered: true,
            expectedDeliveryDate: tomorrow
          }
        ],
        usedMaterials: [],
        requiredTools: ['Electrical tester', 'Pipe wrench set', 'Pool chemical test kit'],
        beforePhotos: [],
        afterPhotos: [],
        attachments: [],
        qualityChecklist: [
          {
            id: 'qc-4',
            description: 'System operational and pressure within normal range',
            isRequired: true,
            isCompleted: false
          },
          {
            id: 'qc-5',
            description: 'Chemical levels balanced',
            isRequired: true,
            isCompleted: false
          }
        ],
        inspectionRequired: true,
        inspectionCompleted: false,
        timeEntries: [
          {
            id: 'time-3',
            employeeId: 'emp3',
            employeeName: 'John Smith',
            startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            endTime: new Date(now.getTime() - 60 * 60 * 1000),
            duration: 60,
            description: 'Initial diagnosis and assessment',
            billableTime: 60,
            hourlyRate: 75,
            totalCost: 75
          }
        ],
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
        createdBy: 'property-manager',
        lastModifiedBy: 'emp3',
        customerNotificationSent: true,
        customerApprovalRequired: true,
        customerApproved: true,
        isEmergency: true,
        permitsRequired: [],
        followUpRequired: true,
        followUpDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        warrantyPeriod: 90,
        warrantyExpirationDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  private generateMockTemplates(): WorkOrderTemplate[] {
    return [
      {
        id: 'template-1',
        name: 'HVAC Filter Replacement',
        description: 'Standard HVAC filter replacement procedure',
        category: 'hvac',
        estimatedDuration: 120,
        estimatedCost: 150,
        workInstructions: 'Replace all HVAC filters. Check filter sizes and note any unusual wear patterns.',
        requiredMaterials: [
          {
            name: 'HVAC Filters (Various Sizes)',
            quantity: 1,
            unit: 'set',
            estimatedCost: 50
          }
        ],
        requiredTools: ['Screwdriver', 'Flashlight', 'Step ladder'],
        qualityChecklist: [
          {
            description: 'All filters properly installed',
            isRequired: true
          },
          {
            description: 'System airflow checked',
            isRequired: true
          }
        ],
        inspectionRequired: false,
        followUpRequired: false,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        createdBy: 'system'
      },
      {
        id: 'template-2',
        name: 'Apartment Move-Out Inspection',
        description: 'Complete apartment inspection and cleaning checklist for move-out',
        category: 'cleaning',
        estimatedDuration: 180,
        estimatedCost: 200,
        workInstructions: 'Complete thorough inspection of apartment. Document any damages and required repairs.',
        requiredMaterials: [
          {
            name: 'Cleaning Supplies',
            quantity: 1,
            unit: 'set',
            estimatedCost: 30
          }
        ],
        requiredTools: ['Camera', 'Inspection checklist', 'Cleaning supplies'],
        qualityChecklist: [
          {
            description: 'All rooms inspected and documented',
            isRequired: true
          },
          {
            description: 'Damage assessment completed',
            isRequired: true
          },
          {
            description: 'Apartment cleaned to standard',
            isRequired: true
          }
        ],
        inspectionRequired: true,
        followUpRequired: true,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        createdBy: 'system'
      }
    ];
  }
}