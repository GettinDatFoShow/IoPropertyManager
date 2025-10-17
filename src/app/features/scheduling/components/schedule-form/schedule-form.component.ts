import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, 
  IonInput, IonSelect, IonSelectOption, IonTextarea, IonButton, 
  IonButtons, IonIcon, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonList, IonToggle, IonDatetime, IonCheckbox,
  IonGrid, IonRow, IonCol, IonNote, IonBadge, ModalController,
  IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  saveOutline, closeOutline, calendarOutline, timeOutline,
  personOutline, businessOutline, cashOutline, constructOutline,
  refreshOutline, alertCircleOutline, checkmarkCircleOutline,
  settingsOutline, listOutline
} from 'ionicons/icons';

import { ServiceSchedule, RecurrencePattern, SeasonalAdjustment, ServiceEventStatus } from '../../models/schedule.interface';
import { Priority, ServiceCategory } from '../../../services/models/service-request.interface';
import { SchedulingService } from '../../services/scheduling.service';

@Component({
  selector: 'app-schedule-form',
  template: `
    <ion-content>
      <form [formGroup]="scheduleForm" (ngSubmit)="onSave()">
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="calendar-outline"></ion-icon>
              {{ isEditMode ? 'Edit Schedule' : 'Create New Schedule' }}
            </ion-card-title>
          </ion-card-header>
          
          <ion-card-content>
            <!-- Basic Information -->
            <ion-list>
              <ion-item>
                <ion-label position="stacked">Title *</ion-label>
                <ion-input 
                  formControlName="title" 
                  placeholder="Enter service title"
                  [class.ion-invalid]="isFieldInvalid('title')">
                </ion-input>
                <ion-note slot="error" *ngIf="getFieldError('title')">{{ getFieldError('title') }}</ion-note>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Description</ion-label>
                <ion-textarea 
                  formControlName="description" 
                  placeholder="Enter detailed description"
                  rows="3">
                </ion-textarea>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Category *</ion-label>
                <ion-select formControlName="category" placeholder="Select category">
                  <ion-select-option *ngFor="let category of categoryOptions" [value]="category">
                    {{ category | titlecase }}
                  </ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Priority *</ion-label>
                <ion-select formControlName="priority" placeholder="Select priority">
                  <ion-select-option *ngFor="let priority of priorityOptions" [value]="priority">
                    <ion-badge [color]="getPriorityColor(priority)">{{ priority | titlecase }}</ion-badge>
                  </ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Property *</ion-label>
                <ion-select formControlName="propertyId" placeholder="Select property">
                  <ion-select-option *ngFor="let property of properties" [value]="property.id">
                    {{ property.name }}
                  </ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Assigned Employee</ion-label>
                <ion-select formControlName="assignedEmployeeId" placeholder="Select employee">
                  <ion-select-option *ngFor="let employee of employees" [value]="employee.id">
                    {{ employee.name }}
                  </ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Start Date *</ion-label>
                <ion-datetime 
                  formControlName="startDate" 
                  display-format="MMM DD, YYYY"
                  placeholder="Select start date">
                </ion-datetime>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Estimated Duration (minutes) *</ion-label>
                <ion-input 
                  type="number" 
                  formControlName="estimatedDuration" 
                  placeholder="60"
                  min="15">
                </ion-input>
                <ion-note>{{ formatDuration(scheduleForm.get('estimatedDuration')?.value || 0) }}</ion-note>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Estimated Cost</ion-label>
                <ion-input 
                  type="number" 
                  formControlName="estimatedCost" 
                  placeholder="0.00"
                  min="0">
                </ion-input>
              </ion-item>
            </ion-list>

            <!-- Recurrence Pattern -->
            <ion-card>
              <ion-card-header>
                <ion-card-title>
                  <ion-icon name="refresh-outline"></ion-icon>
                  Recurrence Pattern
                </ion-card-title>
              </ion-card-header>
              
              <ion-card-content formGroupName="recurrence">
                <ion-item>
                  <ion-label position="stacked">Recurrence Type *</ion-label>
                  <ion-select formControlName="type" placeholder="Select recurrence">
                    <ion-select-option *ngFor="let type of recurrenceTypes" [value]="type.value">
                      {{ type.label }}
                    </ion-select-option>
                  </ion-select>
                </ion-item>

                <div *ngIf="showAdvancedOptions">
                  <ion-item *ngIf="scheduleForm.get('recurrence.type')?.value === 'weekly'">
                    <ion-label position="stacked">Days of Week</ion-label>
                    <ion-grid>
                      <ion-row>
                        <ion-col size="auto" *ngFor="let day of daysOfWeek">
                          <ion-checkbox 
                            [checked]="isDaySelected(day.value)"
                            (ionChange)="toggleDayOfWeek(day.value)">
                          </ion-checkbox>
                          <ion-label>{{ day.short }}</ion-label>
                        </ion-col>
                      </ion-row>
                    </ion-grid>
                  </ion-item>

                  <ion-item>
                    <ion-label position="stacked">Interval</ion-label>
                    <ion-input 
                      type="number" 
                      formControlName="interval" 
                      min="1">
                    </ion-input>
                  </ion-item>

                  <ion-item>
                    <ion-label>Skip Weekends</ion-label>
                    <ion-toggle formControlName="skipWeekends"></ion-toggle>
                  </ion-item>

                  <ion-item>
                    <ion-label>Skip Holidays</ion-label>
                    <ion-toggle formControlName="skipHolidays"></ion-toggle>
                  </ion-item>

                  <ion-item>
                    <ion-label position="stacked">End Date (Optional)</ion-label>
                    <ion-datetime formControlName="endDate"></ion-datetime>
                  </ion-item>

                  <ion-item>
                    <ion-label position="stacked">Max Occurrences (Optional)</ion-label>
                    <ion-input 
                      type="number" 
                      formControlName="maxOccurrences" 
                      min="1">
                    </ion-input>
                  </ion-item>
                </div>
              </ion-card-content>
            </ion-card>

            <!-- Additional Notes -->
            <ion-list>
              <ion-item>
                <ion-label position="stacked">Notes</ion-label>
                <ion-textarea 
                  formControlName="notes" 
                  placeholder="Any additional notes"
                  rows="2">
                </ion-textarea>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Action Buttons -->
        <ion-grid>
          <ion-row>
            <ion-col>
              <ion-button 
                expand="block" 
                color="medium" 
                fill="outline"
                (click)="onCancel()">
                <ion-icon name="close-outline" slot="start"></ion-icon>
                Cancel
              </ion-button>
            </ion-col>
            <ion-col>
              <ion-button 
                expand="block" 
                type="submit"
                [disabled]="scheduleForm.invalid">
                <ion-icon name="save-outline" slot="start"></ion-icon>
                {{ isEditMode ? 'Update' : 'Create' }}
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </form>
    </ion-content>
  `,
  styles: [`
    ion-card {
      margin: 16px;
    }
    
    .ion-invalid {
      --border-color: var(--ion-color-danger);
    }
    
    ion-badge {
      margin: 4px;
    }
    
    ion-grid {
      padding: 16px;
    }
    
    ion-checkbox {
      margin-right: 8px;
    }
    
    ion-note[slot="error"] {
      color: var(--ion-color-danger);
      font-size: 12px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonContent, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, 
    IonTextarea, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonList, IonToggle, IonDatetime, IonCheckbox,
    IonGrid, IonRow, IonCol, IonNote, IonBadge
  ]
})
export class ScheduleFormComponent implements OnInit {
  @Input() schedule?: ServiceSchedule;
  @Input() isEditMode: boolean = false;
  @Output() scheduleCreated = new EventEmitter<ServiceSchedule>();
  @Output() scheduleUpdated = new EventEmitter<ServiceSchedule>();
  @Output() formCancelled = new EventEmitter<void>();

  scheduleForm: FormGroup;
  showAdvancedOptions = false;
  showSeasonalAdjustments = false;

  // Enum references for templates
  priorityOptions: Priority[] = ['low', 'medium', 'high', 'emergency'];
  statusOptions: ServiceEventStatus[] = ['scheduled', 'assigned', 'in-progress', 'completed', 'overdue', 'cancelled', 'rescheduled'];
  categoryOptions: ServiceCategory[] = [
    'plumbing', 'electrical', 'hvac', 'cleaning', 'landscaping', 'painting',
    'carpentry', 'appliance-repair', 'pest-control', 'security', 'general-maintenance', 'emergency', 'other'
  ];

  // Recurrence pattern options
  recurrenceTypes = [
    { value: 'once', label: 'One Time' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annually', label: 'Annually' },
    { value: 'custom', label: 'Custom' }
  ];

  // Day of week options
  daysOfWeek = [
    { value: 0, label: 'Sunday', short: 'Sun' },
    { value: 1, label: 'Monday', short: 'Mon' },
    { value: 2, label: 'Tuesday', short: 'Tue' },
    { value: 3, label: 'Wednesday', short: 'Wed' },
    { value: 4, label: 'Thursday', short: 'Thu' },
    { value: 5, label: 'Friday', short: 'Fri' },
    { value: 6, label: 'Saturday', short: 'Sat' }
  ];

  // Employee options (mock data)
  employees = [
    { id: 'emp1', name: 'Mike Davis' },
    { id: 'emp2', name: 'Sarah Wilson' },
    { id: 'emp3', name: 'John Smith' },
    { id: 'emp4', name: 'Lisa Johnson' }
  ];

  // Property options (mock data)
  properties = [
    { id: 'prop1', name: 'Sunset Apartments - Building A' },
    { id: 'prop2', name: 'Oak Street Condos - Unit 101' },
    { id: 'prop3', name: 'Riverside Complex - Pool Area' },
    { id: 'prop4', name: 'Downtown Office - Lobby' }
  ];

  constructor(
    private fb: FormBuilder,
    private schedulingService: SchedulingService,
    private modalController: ModalController
  ) {
    addIcons({
      saveOutline, closeOutline, calendarOutline, timeOutline,
      personOutline, businessOutline, cashOutline, constructOutline,
      refreshOutline, alertCircleOutline, checkmarkCircleOutline,
      settingsOutline, listOutline
    });

    this.scheduleForm = this.createForm();
  }

  ngOnInit() {
    if (this.schedule && this.isEditMode) {
      this.populateForm(this.schedule);
    }

    // Watch for recurrence type changes
    this.scheduleForm.get('recurrence.type')?.valueChanges.subscribe(type => {
      this.onRecurrenceTypeChange(type);
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Basic Information
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      category: ['general-maintenance', Validators.required],
      priority: ['medium', Validators.required],
      status: ['scheduled', Validators.required],

      // Property and Assignment
      propertyId: ['', Validators.required],
      assignedEmployeeId: [''],

      // Scheduling
      startDate: [new Date().toISOString(), Validators.required],
      estimatedDuration: [60, [Validators.required, Validators.min(15)]],
      
      // Cost Information
      estimatedCost: [0, [Validators.min(0)]],
      materialsCost: [0, [Validators.min(0)]],

      // Recurrence Pattern
      recurrence: this.fb.group({
        type: ['once', Validators.required],
        interval: [1, [Validators.min(1)]],
        daysOfWeek: [[]],
        endDate: [''],
        maxOccurrences: [''],
        skipWeekends: [false],
        skipHolidays: [false]
      }),

      // Seasonal Adjustments
      seasonalAdjustments: this.fb.array([]),

      // Additional Information
      notes: [''],
      coordinationNotes: ['']
    });
  }

  private populateForm(schedule: ServiceSchedule): void {
    this.scheduleForm.patchValue({
      title: schedule.title,
      description: schedule.description,
      category: schedule.category,
      priority: schedule.priority,
      status: 'scheduled',
      propertyId: schedule.propertyId,
      assignedEmployeeId: schedule.assignedEmployeeId,
      startDate: schedule.nextServiceDate,
      estimatedDuration: schedule.estimatedDuration,
      estimatedCost: schedule.estimatedCost,
      materialsCost: 0,
      notes: schedule.specialInstructions,
      coordinationNotes: '',
      recurrence: {
        type: schedule.recurrencePattern.type,
        interval: schedule.recurrencePattern.interval,
        daysOfWeek: schedule.recurrencePattern.daysOfWeek || [],
        endDate: schedule.recurrencePattern.endDate,
        maxOccurrences: schedule.recurrencePattern.maxOccurrences,
        skipWeekends: schedule.recurrencePattern.skipWeekends,
        skipHolidays: schedule.recurrencePattern.skipHolidays
      }
    });

    // Set advanced options visibility if needed
    if (schedule.recurrencePattern.type !== 'once') {
      this.showAdvancedOptions = true;
    }
    if (schedule.seasonalAdjustments && schedule.seasonalAdjustments.length > 0) {
      this.showSeasonalAdjustments = true;
    }
  }

  onRecurrenceTypeChange(type: string): void {
    const recurrenceGroup = this.scheduleForm.get('recurrence');
    
    if (type === 'once') {
      this.showAdvancedOptions = false;
      recurrenceGroup?.patchValue({
        interval: 1,
        daysOfWeek: [],
        endDate: '',
        maxOccurrences: '',
        skipWeekends: false,
        skipHolidays: false
      });
    } else {
      this.showAdvancedOptions = true;
      
      // Set default values based on type
      switch (type) {
        case 'weekly':
          recurrenceGroup?.patchValue({
            interval: 1,
            daysOfWeek: [new Date().getDay()]
          });
          break;
        case 'monthly':
          recurrenceGroup?.patchValue({
            interval: 1,
            daysOfWeek: []
          });
          break;
        case 'quarterly':
          recurrenceGroup?.patchValue({
            interval: 3,
            daysOfWeek: []
          });
          break;
        case 'annually':
          recurrenceGroup?.patchValue({
            interval: 12,
            daysOfWeek: []
          });
          break;
      }
    }
  }

  toggleDayOfWeek(day: number): void {
    const daysOfWeek = this.scheduleForm.get('recurrence.daysOfWeek')?.value || [];
    const index = daysOfWeek.indexOf(day);
    
    if (index > -1) {
      daysOfWeek.splice(index, 1);
    } else {
      daysOfWeek.push(day);
    }
    
    this.scheduleForm.get('recurrence.daysOfWeek')?.setValue(daysOfWeek.sort());
  }

  isDaySelected(day: number): boolean {
    const daysOfWeek = this.scheduleForm.get('recurrence.daysOfWeek')?.value || [];
    return daysOfWeek.includes(day);
  }

  toggleAdvancedOptions(): void {
    this.showAdvancedOptions = !this.showAdvancedOptions;
  }

  toggleSeasonalAdjustments(): void {
    this.showSeasonalAdjustments = !this.showSeasonalAdjustments;
  }

  async onSave(): Promise<void> {
    if (this.scheduleForm.valid) {
      const formValue = this.scheduleForm.value;
      
      const scheduleData: Partial<ServiceSchedule> = {
        title: formValue.title,
        description: formValue.description,
        category: formValue.category,
        priority: formValue.priority,
        propertyId: formValue.propertyId,
        assignedEmployeeId: formValue.assignedEmployeeId,
        nextServiceDate: new Date(formValue.startDate),
        estimatedDuration: formValue.estimatedDuration,
        estimatedCost: formValue.estimatedCost || 0,
        specialInstructions: formValue.notes,
        isActive: true,
        recurrencePattern: {
          type: formValue.recurrence.type,
          interval: formValue.recurrence.interval || 1,
          daysOfWeek: formValue.recurrence.daysOfWeek,
          endDate: formValue.recurrence.endDate,
          maxOccurrences: formValue.recurrence.maxOccurrences,
          skipWeekends: formValue.recurrence.skipWeekends || false,
          skipHolidays: formValue.recurrence.skipHolidays || false
        },
        seasonalAdjustments: []
      };

      try {
        if (this.isEditMode && this.schedule) {
          // For now, emit the updated data - implement update later
          this.scheduleUpdated.emit({...this.schedule, ...scheduleData} as ServiceSchedule);
        } else {
          // For now, emit the new data - implement create later
          const newSchedule: ServiceSchedule = {
            id: 'new-' + Date.now(),
            propertyName: 'Selected Property',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'current-user',
            lastModifiedBy: 'current-user',
            ...scheduleData
          } as ServiceSchedule;
          this.scheduleCreated.emit(newSchedule);
        }
        
        await this.modalController.dismiss();
      } catch (error) {
        console.error('Error saving schedule:', error);
        // Handle error - show toast or alert
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.scheduleForm.markAllAsTouched();
    }
  }

  async onCancel(): Promise<void> {
    this.formCancelled.emit();
    await this.modalController.dismiss();
  }

  // Helper methods for template
  getFieldError(fieldName: string): string | null {
    const field = this.scheduleForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) return 'This field is required';
      if (field.errors?.['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
      if (field.errors?.['min']) return `Minimum value is ${field.errors['min'].min}`;
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.scheduleForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
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
}