import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-property-detail',
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class PropertyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mockDataService = inject(MockDataService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private propertyService = inject(PropertyService);

  property: any = null;
  isLoading = true;

  ngOnInit() {
    const propertyId = this.route.snapshot.paramMap.get('id');
    if (propertyId) {
      this.loadProperty(propertyId);
    } else {
      this.router.navigate(['/tabs/properties']);
    }
  }

  loadProperty(id: string) {
    this.isLoading = true;
    
    this.propertyService.getPropertyById(id).subscribe({
      next: (property) => {
        this.property = property;
        this.isLoading = false;
        
        if (!this.property) {
          this.router.navigate(['/tabs/properties']);
        }
      },
      error: (error) => {
        console.error('Error loading property:', error);
        this.showToast('Error loading property', 'danger');
        this.isLoading = false;
        this.router.navigate(['/tabs/properties']);
      }
    });
  }

  goBack() {
    this.router.navigate(['/tabs/properties']);
  }

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

  async deleteProperty() {
    const alert = await this.alertController.create({
      header: 'Delete Property',
      message: `Are you sure you want to delete "${this.property?.name}"? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              if (this.property?.id) {
                await this.propertyService.deleteProperty(this.property.id).toPromise();
                this.showToast('Property deleted successfully', 'success');
                this.router.navigate(['/tabs/properties']);
              }
            } catch (error) {
              console.error('Error deleting property:', error);
              this.showToast('Error deleting property', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async archiveProperty() {
    const alert = await this.alertController.create({
      header: 'Archive Property',
      message: `Archive "${this.property?.name}"? You can restore it later if needed.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Archive',
          role: 'confirm',
          handler: async () => {
            try {
              if (this.property?.id) {
                await this.propertyService.archiveProperty(this.property.id).toPromise();
                this.showToast('Property archived successfully', 'success');
                this.router.navigate(['/tabs/properties']);
              }
            } catch (error) {
              console.error('Error archiving property:', error);
              this.showToast('Error archiving property', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  // Get current user permissions
  get canEditProperty(): boolean {
    return this.mockDataService.canManageProperties();
  }

  get canDeleteProperty(): boolean {
    return this.mockDataService.hasRole('owner');
  }
}