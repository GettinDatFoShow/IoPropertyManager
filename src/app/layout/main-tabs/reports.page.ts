import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-reports-page',
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Reports</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <ion-card>
        <ion-card-content>
          <h2>Reports & Analytics</h2>
          <p>Reporting features coming soon!</p>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  imports: [CommonModule, IonicModule],
})
export class ReportsPage {
  constructor() {}
}