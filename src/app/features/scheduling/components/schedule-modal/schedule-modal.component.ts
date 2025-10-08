import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

import { ServiceSchedule } from '../../models/schedule.interface';
import { ScheduleFormComponent } from '../schedule-form/schedule-form.component';

@Component({
  selector: 'app-schedule-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ schedule ? 'Edit Schedule' : 'Create Schedule' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <app-schedule-form
        [schedule]="schedule"
        [isEditMode]="!!schedule"
        (scheduleCreated)="onScheduleCreated($event)"
        (scheduleUpdated)="onScheduleUpdated($event)"
        (formCancelled)="dismiss()">
      </app-schedule-form>
    </ion-content>
  `,
  styles: [`
    ion-header {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
    ScheduleFormComponent
  ]
})
export class ScheduleModalComponent {
  @Input() schedule?: ServiceSchedule;

  constructor(private modalController: ModalController) {
    addIcons({ closeOutline });
  }

  async onScheduleCreated(schedule: ServiceSchedule): Promise<void> {
    await this.modalController.dismiss(schedule, 'created');
  }

  async onScheduleUpdated(schedule: ServiceSchedule): Promise<void> {
    await this.modalController.dismiss(schedule, 'updated');
  }

  async dismiss(): Promise<void> {
    await this.modalController.dismiss();
  }
}