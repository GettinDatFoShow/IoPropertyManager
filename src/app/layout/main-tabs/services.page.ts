import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ServiceRequestListComponent } from '../../features/services/components/service-request-list/service-request-list.component';

@Component({
  selector: 'app-services-page',
  template: `
    <app-service-request-list></app-service-request-list>
  `,
  standalone: true,
  imports: [CommonModule, IonicModule, ServiceRequestListComponent],
})
export class ServicesPage {
  constructor() {}
}