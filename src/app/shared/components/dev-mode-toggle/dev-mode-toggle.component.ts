import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-dev-mode-toggle',
  templateUrl: './dev-mode-toggle.component.html',
  styleUrls: ['./dev-mode-toggle.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DevModeToggleComponent {
  
  isDevelopmentMode = true; // Set to true for development
  
  constructor(private mockDataService: MockDataService) {}

  switchUser(userType: 'owner' | 'manager' | 'employee') {
    this.mockDataService.switchUser(userType);
  }

  getCurrentUserType() {
    return this.mockDataService.getCurrentUser().role;
  }

  getCurrentUserName() {
    return this.mockDataService.getCurrentUser().displayName;
  }
}