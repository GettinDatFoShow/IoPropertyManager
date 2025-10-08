import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { PropertyService, PropertyFormData } from '../../../properties/services/property.service';

@Component({
  selector: 'app-property-form',
  templateUrl: './property-form.component.html',
  styleUrls: ['./property-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule]
})
export class PropertyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private mockDataService = inject(MockDataService);
  private propertyService = inject(PropertyService);
  private toastController = inject(ToastController);

  propertyForm!: FormGroup;
  isEditing = false;
  isLoading = false;
  isSaving = false;
  propertyId: string | null = null;
  uploadedPhotos: string[] = [];

  // Property type options
  propertyTypes = [
    { value: 'home', label: 'Single Family Home', icon: 'house-outline' },
    { value: 'apartment_complex', label: 'Apartment Complex', icon: 'business-outline' },
    { value: 'housing_complex', label: 'Housing Complex', icon: 'home-outline' },
    { value: 'commercial', label: 'Commercial Property', icon: 'storefront-outline' },
    { value: 'industrial', label: 'Industrial Property', icon: 'construct-outline' }
  ];

  // Billing frequency options
  billingFrequencies = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annually', label: 'Annually' }
  ];

  ngOnInit() {
    this.initializeForm();
    this.checkIfEditing();
  }

  initializeForm() {
    this.propertyForm = this.fb.group({
      // Basic Information
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      type: ['', Validators.required],
      
      // Address Information
      address: this.fb.group({
        street: ['', [Validators.required, Validators.minLength(5)]],
        city: ['', [Validators.required, Validators.minLength(2)]],
        state: ['', [Validators.required, Validators.minLength(2)]],
        zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
        country: ['USA', Validators.required]
      }),
      
      // Owner Information
      owner: this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/)]]
      }),
      
      // Subscription Information
      subscription: this.fb.group({
        cost: ['', [Validators.required, Validators.min(0)]],
        billing: ['monthly', Validators.required]
      }),
      
      // Service Configuration
      serviceableItemsCount: [0, [Validators.required, Validators.min(0)]],
      nextServiceDate: [''],
      
      // Assignment
      assignedEmployees: [[]]
    });
  }

  checkIfEditing() {
    this.propertyId = this.route.snapshot.paramMap.get('id');
    if (this.propertyId) {
      this.isEditing = true;
      this.loadPropertyData();
    }
  }

  loadPropertyData() {
    if (!this.propertyId) return;
    
    this.isLoading = true;
    
    this.propertyService.getPropertyById(this.propertyId).subscribe({
      next: (property) => {
        if (property) {
          this.populateForm(property);
          this.uploadedPhotos = property.photos || [];
        } else {
          this.router.navigate(['/tabs/properties']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading property:', error);
        this.showToast('Error loading property data', 'danger');
        this.router.navigate(['/tabs/properties']);
        this.isLoading = false;
      }
    });
  }

  populateForm(property: any) {
    this.propertyForm.patchValue({
      name: property.name,
      description: property.description,
      type: property.type,
      address: {
        street: property.address.street,
        city: property.address.city,
        state: property.address.state,
        zipCode: property.address.zipCode,
        country: property.address.country
      },
      owner: {
        name: property.owner.name,
        email: property.owner.email,
        phone: property.owner.phone
      },
      subscription: {
        cost: property.subscription.cost,
        billing: property.subscription.billing
      },
      serviceableItemsCount: property.serviceableItemsCount,
      nextServiceDate: property.nextServiceDate ? new Date(property.nextServiceDate).toISOString().split('T')[0] : '',
      assignedEmployees: property.assignedEmployees || []
    });
  }

  async onSubmit() {
    if (this.propertyForm.valid) {
      this.isSaving = true;
      
      try {
        const formData = this.propertyForm.value;
        const propertyData = {
          ...formData,
          photos: this.uploadedPhotos,
          // Set default status for new properties
          status: this.propertyId ? formData.status : 'active',
          // Set default subscription status
          subscriptionStatus: formData.subscriptionStatus || 'pending'
        };
        
        if (this.propertyId) {
          // Update existing property
          await this.propertyService.updateProperty(this.propertyId, propertyData).toPromise();
          this.showToast('Property updated successfully!', 'success');
        } else {
          // Create new property
          await this.propertyService.createProperty(propertyData).toPromise();
          this.showToast('Property created successfully!', 'success');
        }
        
        // Navigate back to property list
        this.router.navigate(['/tabs/properties']);
        
      } catch (error) {
        console.error('Error saving property:', error);
        this.showToast('Error saving property. Please try again.', 'danger');
      } finally {
        this.isSaving = false;
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.propertyForm);
      this.showToast('Please correct the errors in the form', 'warning');
    }
  }

  onCancel() {
    this.router.navigate(['/tabs/properties']);
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

  // Photo upload simulation
  triggerPhotoUpload() {
    const input = document.getElementById('photo-upload') as HTMLInputElement;
    input?.click();
  }

  onPhotoUpload(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let file of files) {
        // Simulate upload and generate placeholder URL
        const placeholderUrl = `https://via.placeholder.com/400x300/${this.getRandomColor()}/FFFFFF?text=${encodeURIComponent(file.name.split('.')[0])}`;
        this.uploadedPhotos.push(placeholderUrl);
      }
    }
  }

  removePhoto(index: number) {
    this.uploadedPhotos.splice(index, 1);
  }

  private getRandomColor(): string {
    const colors = ['4A90E2', '10DC60', 'F04141', 'FFCE00', 'B620E0', '1BC98E'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Address autocomplete simulation
  onAddressChange() {
    const addressControl = this.propertyForm.get('address');
    if (addressControl?.get('street')?.value && addressControl?.get('city')?.value) {
      // Simulate address formatting
      const street = addressControl.get('street')?.value;
      const city = addressControl.get('city')?.value;
      const state = addressControl.get('state')?.value;
      const zipCode = addressControl.get('zipCode')?.value;
      
      console.log('Address updated:', { street, city, state, zipCode });
    }
  }

  // Validation helpers
  isFieldInvalid(fieldPath: string): boolean {
    const field = this.propertyForm.get(fieldPath);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldPath: string): string {
    const field = this.propertyForm.get(fieldPath);
    if (field && field.errors && field.touched) {
      const errors = field.errors;
      
      if (errors['required']) return 'This field is required';
      if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters required`;
      if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters allowed`;
      if (errors['email']) return 'Please enter a valid email address';
      if (errors['pattern']) {
        if (fieldPath.includes('zipCode')) return 'Please enter a valid ZIP code (12345 or 12345-6789)';
        if (fieldPath.includes('phone')) return 'Please enter phone as (123) 456-7890';
        return 'Please enter a valid format';
      }
      if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    }
    return '';
  }

  private markFormGroupTouched(formGroup: FormGroup = this.propertyForm) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        }
      }
    });
  }

  // Get current user permissions
  get canManageProperties(): boolean {
    return this.mockDataService.canManageProperties();
  }
}