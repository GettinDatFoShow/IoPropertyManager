import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonNote
} from '@ionic/angular/standalone';
import { ThemeService, ThemeMode } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonIcon,
    IonNote
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Settings</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="settings-container">
        <!-- Appearance Section -->
        <ion-list>
          <ion-list-header>
            <ion-label>Appearance</ion-label>
          </ion-list-header>

          <ion-item>
            <ion-icon name="moon" slot="start"></ion-icon>
            <ion-label>
              <h2>Theme</h2>
              <p>Choose your preferred color scheme</p>
            </ion-label>
            <ion-select
              [(ngModel)]="selectedTheme"
              (ionChange)="onThemeChange($event)"
              interface="popover"
              placeholder="Select theme">
              <ion-select-option value="light">
                <ion-icon name="sunny"></ion-icon> Light
              </ion-select-option>
              <ion-select-option value="dark">
                <ion-icon name="moon"></ion-icon> Dark
              </ion-select-option>
              <ion-select-option value="system">
                <ion-icon name="settings-outline"></ion-icon> System Default
              </ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item lines="none">
            <ion-note slot="start"></ion-note>
            <ion-note>
              <p class="theme-description">
                @if (selectedTheme === 'system') {
                  Using your device's theme preference. Currently: {{ getCurrentSystemTheme() }}
                } @else if (selectedTheme === 'light') {
                  Light theme is active
                } @else {
                  Dark theme is active
                }
              </p>
            </ion-note>
          </ion-item>
        </ion-list>

        <!-- Future settings sections can be added here -->
        <div class="settings-info">
          <ion-note>
            <p>More settings coming soon...</p>
          </ion-note>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .settings-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem 0;
    }

    ion-list {
      margin-bottom: 2rem;
    }

    ion-list-header {
      padding-top: 1rem;
      
      ion-label {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--ion-color-primary);
      }
    }

    ion-item {
      --padding-start: 1rem;
      --inner-padding-end: 1rem;
    }

    ion-item ion-icon[slot="start"] {
      font-size: 1.5rem;
      margin-right: 1rem;
      color: var(--ion-color-medium);
    }

    ion-item ion-label h2 {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    ion-item ion-label p {
      font-size: 0.875rem;
      color: var(--ion-color-medium);
    }

    .theme-description {
      font-size: 0.875rem;
      color: var(--ion-color-medium);
      margin: 0.5rem 0 0 0;
      padding: 0 1rem;
    }

    .settings-info {
      text-align: center;
      padding: 2rem 1rem;
      
      ion-note p {
        color: var(--ion-color-medium);
        font-style: italic;
      }
    }

    ion-select {
      min-width: 150px;
      --padding-start: 12px;
      --padding-end: 12px;
    }
  `]
})
export class SettingsComponent implements OnInit {
  selectedTheme: ThemeMode = 'system';

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.selectedTheme = this.themeService.getCurrentTheme();
  }

  onThemeChange(event: any) {
    const theme = event.detail.value as ThemeMode;
    this.themeService.setTheme(theme);
    this.selectedTheme = theme;
  }

  getCurrentSystemTheme(): string {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDark ? 'Dark' : 'Light';
  }
}
