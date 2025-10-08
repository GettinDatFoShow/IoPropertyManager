import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, 
  IonIcon, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonTextarea, IonDatetime, IonToggle, IonGrid, IonRow, IonCol,
  IonAccordion, IonAccordionGroup,
  ModalController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  addOutline, calendarOutline, saveOutline, closeOutline,
  businessOutline, personOutline, timeOutline, constructOutline,
  chevronDownOutline, chevronUpOutline
} from 'ionicons/icons';

import { Priority, ServiceCategory } from '../../services/models/service-request.interface';

@Component({
  selector: 'app-quick-schedule-widget',
  template: `
    <ion-card class="quick-schedule-card">
      <ion-accordion-group>
        <ion-accordion value="quick-schedule" [disabled]="false">
          <ion-item slot="header" class="accordion-header" (click)="toggleAccordion()">
            <ion-icon name="add-outline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h2>Quick Schedule</h2>
              <p>Create a new service appointment</p>
            </ion-label>
            <ion-icon 
              [name]="isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'" 
              slot="end"
              color="medium">
            </ion-icon>
          </ion-item>
          
          <div class="ion-padding" slot="content">
            <form [formGroup]="quickScheduleForm" (ngSubmit)="onQuickSchedule()">
              <ion-grid>
            <ion-row>
              <ion-col size="12">
                <ion-item>
                  <ion-label position="stacked">Service Title *</ion-label>
                  <ion-input 
                    formControlName="title" 
                    placeholder="Enter service title">
                  </ion-input>
                </ion-item>
              </ion-col>
            </ion-row>
            
            <ion-row>
              <ion-col size="12" size-md="6">
                <ion-item>
                  <ion-label position="stacked">Property *</ion-label>
                  <ion-select formControlName="propertyId" placeholder="Select property">
                    <ion-select-option *ngFor="let property of properties" [value]="property.id">
                      {{ property.name }}
                    </ion-select-option>
                  </ion-select>
                </ion-item>
              </ion-col>
              
              <ion-col size="12" size-md="6">
                <ion-item>
                  <ion-label position="stacked">Category *</ion-label>
                  <ion-select formControlName="category" placeholder="Select category">
                    <ion-select-option *ngFor="let category of categoryOptions" [value]="category">
                      {{ formatCategory(category) }}
                    </ion-select-option>
                  </ion-select>
                </ion-item>
              </ion-col>
            </ion-row>
            
            <ion-row>
              <ion-col size="12" size-md="6">
                <ion-item>
                  <ion-label position="stacked">Priority *</ion-label>
                  <ion-select formControlName="priority" placeholder="Select priority">
                    <ion-select-option *ngFor="let priority of priorityOptions" [value]="priority">
                      {{ priority | titlecase }}
                    </ion-select-option>
                  </ion-select>
                </ion-item>
              </ion-col>
              
              <ion-col size="12" size-md="6">
                <ion-item>
                  <ion-label position="stacked">Date *</ion-label>
                  <ion-datetime 
                    formControlName="scheduledDate" 
                    display-format="MMM DD, YYYY"
                    placeholder="Select date">
                  </ion-datetime>
                </ion-item>
              </ion-col>
            </ion-row>
            
            <ion-row>
              <ion-col size="12" size-md="6">
                <ion-item>
                  <ion-label position="stacked">Duration (minutes)</ion-label>
                  <ion-input 
                    type="number" 
                    formControlName="estimatedDuration" 
                    placeholder="60"
                    min="15">
                  </ion-input>
                </ion-item>
              </ion-col>
              
              <ion-col size="12" size-md="6">
                <ion-item>
                  <ion-label position="stacked">Employee</ion-label>
                  <ion-select formControlName="assignedEmployeeId" placeholder="Select employee">
                    <ion-select-option *ngFor="let employee of employees" [value]="employee.id">
                      {{ employee.name }}
                    </ion-select-option>
                  </ion-select>
                </ion-item>
              </ion-col>
            </ion-row>

            <ion-row>
              <ion-col size="12">
                <ion-item>
                  <ion-label>Recurring Service</ion-label>
                  <ion-toggle formControlName="isRecurring" slot="end"></ion-toggle>
                </ion-item>
              </ion-col>
            </ion-row>

            <ion-row *ngIf="quickScheduleForm.get('isRecurring')?.value">
              <ion-col size="12">
                <ion-item>
                  <ion-label position="stacked">Recurrence</ion-label>
                  <ion-select formControlName="recurrenceType" placeholder="Select frequency">
                    <ion-select-option value="weekly">Weekly</ion-select-option>
                    <ion-select-option value="monthly">Monthly</ion-select-option>
                    <ion-select-option value="quarterly">Quarterly</ion-select-option>
                  </ion-select>
                </ion-item>
              </ion-col>
            </ion-row>
          </ion-grid>

          <div class="form-actions">
            <ion-button 
              type="submit" 
              expand="block" 
              [disabled]="quickScheduleForm.invalid || submitting">
              <ion-icon name="save-outline" slot="start"></ion-icon>
              {{ submitting ? 'Creating...' : 'Create Schedule' }}
            </ion-button>
            
            <ion-button 
              (click)="openFullScheduleForm()" 
              expand="block" 
              fill="outline" 
              color="secondary">
              <ion-icon name="calendar-outline" slot="start"></ion-icon>
              Advanced Options
            </ion-button>
          </div>
              </form>
            </div>
          </ion-accordion>
        </ion-accordion-group>
      </ion-card>
  `,
  styles: [`
    .quick-schedule-card {
      margin: 1rem 0;
      border: 2px dashed var(--ion-color-medium);
      background: var(--ion-background-color);
    }

    .accordion-header {
      --padding-start: 1rem;
      --padding-end: 1rem;
      --inner-padding-end: 0;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .accordion-header:hover {
      --background: var(--ion-color-light);
    }

    .accordion-header ion-label h2 {
      margin: 0;
      color: var(--ion-color-primary);
      font-size: 1.2rem;
      font-weight: 600;
    }

    .accordion-header ion-label p {
      margin: 4px 0 0 0;
      color: var(--ion-color-medium);
      font-size: 0.9rem;
    }

    .form-actions {
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    ion-item {
      --padding-start: 0;
      --inner-padding-end: 0;
    }

    ion-input, ion-select, ion-textarea {
      --padding-start: 0.5rem;
    }

    @media (max-width: 768px) {
      .form-actions {
        margin-top: 1.5rem;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonCard, IonButton, IonIcon, IonItem, IonLabel, IonInput, 
    IonSelect, IonSelectOption, IonDatetime, IonToggle, 
    IonGrid, IonRow, IonCol, IonAccordion, IonAccordionGroup
  ]
})
export class QuickScheduleWidgetComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private modalController = inject(ModalController);
  private toastController = inject(ToastController);

  quickScheduleForm: FormGroup;
  submitting = false;
  isExpanded = false;

  // Mock data
  properties = [
    { id: 'prop1', name: 'Sunset Apartments - Building A' },
    { id: 'prop2', name: 'Oak Street Condos - Unit 101' },
    { id: 'prop3', name: 'Riverside Complex - Pool Area' },
    { id: 'prop4', name: 'Downtown Office - Lobby' }
  ];

  employees = [
    { id: 'emp1', name: 'Mike Davis' },
    { id: 'emp2', name: 'Sarah Wilson' },
    { id: 'emp3', name: 'John Smith' },
    { id: 'emp4', name: 'Lisa Johnson' }
  ];

  priorityOptions: Priority[] = ['low', 'medium', 'high', 'emergency'];
  categoryOptions: ServiceCategory[] = [
    'general-maintenance', 'plumbing', 'electrical', 'hvac', 'cleaning', 
    'landscaping', 'painting', 'carpentry', 'appliance-repair'
  ];

  constructor() {
    addIcons({
      addOutline, calendarOutline, saveOutline, closeOutline,
      businessOutline, personOutline, timeOutline, constructOutline,
      chevronDownOutline, chevronUpOutline
    });

    this.quickScheduleForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      propertyId: ['', Validators.required],
      category: ['general-maintenance', Validators.required],
      priority: ['medium', Validators.required],
      scheduledDate: [new Date().toISOString(), Validators.required],
      estimatedDuration: [60, [Validators.min(15)]],
      assignedEmployeeId: [''],
      isRecurring: [false],
      recurrenceType: ['']
    });
  }

  async onQuickSchedule(): Promise<void> {
    if (this.quickScheduleForm.valid && !this.submitting) {
      this.submitting = true;

      try {
        const formValue = this.quickScheduleForm.value;
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Show success toast
        const toast = await this.toastController.create({
          message: `Service "${formValue.title}" scheduled successfully!`,
          duration: 3000,
          color: 'success',
          position: 'top',
          buttons: [
            {
              text: 'View',
              handler: () => {
                this.router.navigate(['/tabs/schedule']);
              }
            }
          ]
        });
        await toast.present();

        // Reset form
        this.quickScheduleForm.reset({
          category: 'general-maintenance',
          priority: 'medium',
          scheduledDate: new Date().toISOString(),
          estimatedDuration: 60,
          isRecurring: false
        });

      } catch (error) {
        console.error('Error creating schedule:', error);
        
        const toast = await this.toastController.create({
          message: 'Error creating schedule. Please try again.',
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      } finally {
        this.submitting = false;
      }
    }
  }

  async openFullScheduleForm(): Promise<void> {
    // Pre-fill the full form with current data if available
    const currentData = this.quickScheduleForm.value;
    
    const { ScheduleModalComponent } = await import('../../scheduling/components/schedule-modal/schedule-modal.component');
    
    const modal = await this.modalController.create({
      component: ScheduleModalComponent,
      componentProps: {
        prefillData: currentData
      },
      breakpoints: [0, 0.8, 1],
      initialBreakpoint: 0.8
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    
    if (role === 'created' && data) {
      // Reset the quick form
      this.quickScheduleForm.reset({
        category: 'general-maintenance',
        priority: 'medium',
        scheduledDate: new Date().toISOString(),
        estimatedDuration: 60,
        isRecurring: false
      });

      // Show success message
      const toast = await this.toastController.create({
        message: 'Schedule created successfully!',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
    }
  }

  formatCategory(category: string): string {
    return category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  toggleAccordion(): void {
    this.isExpanded = !this.isExpanded;
  }
}