import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ServiceCalendarComponent } from '../../features/scheduling/components/service-calendar/service-calendar.component';

@Component({
  selector: 'app-schedule-page',
  template: `
    <app-service-calendar></app-service-calendar>
  `,
  standalone: true,
  imports: [CommonModule, IonicModule, ServiceCalendarComponent],
})
export class SchedulePage {
  constructor() {}
}