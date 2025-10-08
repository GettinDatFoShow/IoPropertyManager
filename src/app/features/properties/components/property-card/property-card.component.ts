import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-property-card',
  templateUrl: './property-card.component.html',
  styleUrls: ['./property-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class PropertyCardComponent {
  @Input() property: any;

  getPropertyTypeIcon(type: string): string {
    switch (type) {
      case 'apartment_complex': return 'business-outline';
      case 'housing_complex': return 'home-outline';
      case 'home': return 'house-outline';
      default: return 'location-outline';
    }
  }

  getPropertyTypeLabel(type: string): string {
    switch (type) {
      case 'apartment_complex': return 'Apartment Complex';
      case 'housing_complex': return 'Housing Complex';
      case 'home': return 'Single Home';
      default: return 'Property';
    }
  }

  getStatusColor(): string {
    if (!this.property?.nextServiceDate) return 'medium';
    
    const nextService = new Date(this.property.nextServiceDate);
    const today = new Date();
    const daysUntilService = Math.ceil((nextService.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilService <= 1) return 'danger';
    if (daysUntilService <= 7) return 'warning';
    return 'success';
  }

  getStatusText(): string {
    if (!this.property?.nextServiceDate) return 'No service scheduled';
    
    const nextService = new Date(this.property.nextServiceDate);
    const today = new Date();
    const daysUntilService = Math.ceil((nextService.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilService < 0) return 'Service overdue';
    if (daysUntilService === 0) return 'Service due today';
    if (daysUntilService === 1) return 'Service due tomorrow';
    if (daysUntilService <= 7) return `Service in ${daysUntilService} days`;
    return `Next service: ${nextService.toLocaleDateString()}`;
  }
}