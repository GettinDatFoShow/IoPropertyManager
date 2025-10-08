import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonCard, 
  IonCardContent,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Access Denied</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <div class="unauthorized-container">
        <ion-card>
          <ion-card-content class="content">
            <ion-icon name="lock-closed-outline" class="lock-icon"></ion-icon>
            <h1>Access Denied</h1>
            <p>You don't have permission to access this page.</p>
            <p>Please contact your administrator if you believe this is an error.</p>
            
            <ion-button expand="block" routerLink="/dashboard">
              <ion-icon name="arrow-back-outline" slot="start"></ion-icon>
              Back to Dashboard
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .unauthorized-container {
      max-width: 400px;
      margin: 2rem auto;
    }

    .content {
      text-align: center;
    }

    .lock-icon {
      font-size: 4rem;
      color: var(--ion-color-warning);
      margin-bottom: 1rem;
    }

    h1 {
      color: var(--ion-color-warning);
      margin: 1rem 0;
    }

    p {
      color: var(--ion-color-medium);
      line-height: 1.4;
      margin-bottom: 1rem;
    }
  `]
})
export class UnauthorizedComponent {
  constructor() {
    addIcons({ lockClosedOutline, arrowBackOutline });
  }
}