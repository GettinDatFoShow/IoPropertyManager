import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner,
  IonTextarea,
  LoadingController,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  businessOutline, 
  mailOutline, 
  callOutline,
  locationOutline,
  informationCircleOutline
} from 'ionicons/icons';
import { BusinessService } from '../../../core/services/business.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreateBusinessData } from '../../../core/models/business.models';

@Component({
  selector: 'app-business-setup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    IonSpinner,
    IonTextarea
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Setup Your Business</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <div class="setup-container">
        <!-- Header Section -->
        <div class="header-section">
          <ion-icon name="business-outline" class="setup-icon"></ion-icon>
          <h1>Setup Your Business</h1>
          <p>Let's get your property management business configured</p>
        </div>

        <!-- Business Setup Form -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Business Information</ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <form [formGroup]="businessForm" (ngSubmit)="onSetupBusiness()">
              <!-- Business Name -->
              <ion-item>
                <ion-icon name="business-outline" slot="start"></ion-icon>
                <ion-label position="stacked">Business Name *</ion-label>
                <ion-input
                  type="text"
                  formControlName="name"
                  placeholder="Enter your business name"
                  [class.ion-invalid]="nameControl.invalid && nameControl.touched"
                ></ion-input>
              </ion-item>
              @if (nameControl.invalid && nameControl.touched) {
                <ion-text color="danger">
                  <p class="error-text">Business name is required</p>
                </ion-text>
              }

              <!-- Business Description -->
              <ion-item>
                <ion-icon name="information-circle-outline" slot="start"></ion-icon>
                <ion-label position="stacked">Description (Optional)</ion-label>
                <ion-textarea
                  formControlName="description"
                  placeholder="Describe your business"
                  rows="3"
                ></ion-textarea>
              </ion-item>

              <!-- Contact Email -->
              <ion-item>
                <ion-icon name="mail-outline" slot="start"></ion-icon>
                <ion-label position="stacked">Business Email *</ion-label>
                <ion-input
                  type="email"
                  formControlName="email"
                  placeholder="Enter business email"
                  [class.ion-invalid]="emailControl.invalid && emailControl.touched"
                ></ion-input>
              </ion-item>
              @if (emailControl.invalid && emailControl.touched) {
                <ion-text color="danger">
                  <p class="error-text">Valid business email is required</p>
                </ion-text>
              }

              <!-- Phone Number -->
              <ion-item>
                <ion-icon name="call-outline" slot="start"></ion-icon>
                <ion-label position="stacked">Phone Number *</ion-label>
                <ion-input
                  type="tel"
                  formControlName="phoneNumber"
                  placeholder="Enter business phone"
                  [class.ion-invalid]="phoneControl.invalid && phoneControl.touched"
                ></ion-input>
              </ion-item>
              @if (phoneControl.invalid && phoneControl.touched) {
                <ion-text color="danger">
                  <p class="error-text">Phone number is required</p>
                </ion-text>
              }

              <!-- Website -->
              <ion-item>
                <ion-icon name="business-outline" slot="start"></ion-icon>
                <ion-label position="stacked">Website (Optional)</ion-label>
                <ion-input
                  type="url"
                  formControlName="website"
                  placeholder="https://yourwebsite.com"
                ></ion-input>
              </ion-item>

              <!-- Address Section -->
              <div class="section-header">
                <ion-icon name="location-outline"></ion-icon>
                <h3>Business Address</h3>
              </div>

              <!-- Street Address -->
              <ion-item>
                <ion-label position="stacked">Street Address *</ion-label>
                <ion-input
                  type="text"
                  formControlName="street"
                  placeholder="Enter street address"
                  [class.ion-invalid]="streetControl.invalid && streetControl.touched"
                ></ion-input>
              </ion-item>
              @if (streetControl.invalid && streetControl.touched) {
                <ion-text color="danger">
                  <p class="error-text">Street address is required</p>
                </ion-text>
              }

              <!-- City -->
              <ion-item>
                <ion-label position="stacked">City *</ion-label>
                <ion-input
                  type="text"
                  formControlName="city"
                  placeholder="Enter city"
                  [class.ion-invalid]="cityControl.invalid && cityControl.touched"
                ></ion-input>
              </ion-item>
              @if (cityControl.invalid && cityControl.touched) {
                <ion-text color="danger">
                  <p class="error-text">City is required</p>
                </ion-text>
              }

              <!-- State -->
              <ion-item>
                <ion-label position="stacked">State *</ion-label>
                <ion-input
                  type="text"
                  formControlName="state"
                  placeholder="Enter state"
                  [class.ion-invalid]="stateControl.invalid && stateControl.touched"
                ></ion-input>
              </ion-item>
              @if (stateControl.invalid && stateControl.touched) {
                <ion-text color="danger">
                  <p class="error-text">State is required</p>
                </ion-text>
              }

              <!-- ZIP Code -->
              <ion-item>
                <ion-label position="stacked">ZIP Code *</ion-label>
                <ion-input
                  type="text"
                  formControlName="zipCode"
                  placeholder="Enter ZIP code"
                  [class.ion-invalid]="zipCodeControl.invalid && zipCodeControl.touched"
                ></ion-input>
              </ion-item>
              @if (zipCodeControl.invalid && zipCodeControl.touched) {
                <ion-text color="danger">
                  <p class="error-text">ZIP code is required</p>
                </ion-text>
              }

              <!-- Country -->
              <ion-item>
                <ion-label position="stacked">Country *</ion-label>
                <ion-input
                  type="text"
                  formControlName="country"
                  placeholder="Enter country"
                  [class.ion-invalid]="countryControl.invalid && countryControl.touched"
                ></ion-input>
              </ion-item>
              @if (countryControl.invalid && countryControl.touched) {
                <ion-text color="danger">
                  <p class="error-text">Country is required</p>
                </ion-text>
              }

              <!-- Setup Button -->
              <ion-button 
                expand="block" 
                type="submit" 
                [disabled]="businessForm.invalid || isLoading"
                class="setup-button"
              >
                @if (isLoading) {
                  <ion-spinner name="crescent"></ion-spinner>
                } @else {
                  Complete Setup
                }
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .setup-container {
      max-width: 500px;
      margin: 0 auto;
      padding: 2rem 0;
    }

    .header-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .setup-icon {
      font-size: 4rem;
      color: var(--ion-color-primary);
      margin-bottom: 1rem;
    }

    .header-section h1 {
      margin: 0.5rem 0;
      color: var(--ion-color-primary);
    }

    .header-section p {
      color: var(--ion-color-medium);
      margin: 0;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 2rem 1rem 1rem 1rem;
      color: var(--ion-color-primary);
    }

    .section-header h3 {
      margin: 0;
      font-size: 1.1rem;
    }

    .error-text {
      font-size: 0.8rem;
      margin: 0.5rem 0 0 0;
      padding-left: 1rem;
    }

    .setup-button {
      margin-top: 2rem;
    }

    ion-item {
      margin-bottom: 1rem;
    }
  `]
})
export class BusinessSetupComponent {
  businessForm: FormGroup;
  isLoading = false;

  private businessService = inject(BusinessService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private loadingController = inject(LoadingController);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  constructor() {
    addIcons({ 
      businessOutline, 
      mailOutline, 
      callOutline,
      locationOutline,
      informationCircleOutline
    });
    
    this.businessForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      website: [''],
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required]],
      country: ['', [Validators.required]]
    });

    // Pre-fill email with user's email if available
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.email) {
      this.businessForm.patchValue({ email: currentUser.email });
    }
  }

  get nameControl() { return this.businessForm.get('name')!; }
  get emailControl() { return this.businessForm.get('email')!; }
  get phoneControl() { return this.businessForm.get('phoneNumber')!; }
  get streetControl() { return this.businessForm.get('street')!; }
  get cityControl() { return this.businessForm.get('city')!; }
  get stateControl() { return this.businessForm.get('state')!; }
  get zipCodeControl() { return this.businessForm.get('zipCode')!; }
  get countryControl() { return this.businessForm.get('country')!; }

  async onSetupBusiness() {
    if (this.businessForm.valid) {
      this.isLoading = true;
      
      try {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
          throw new Error('User not authenticated');
        }

        const formValue = this.businessForm.value;
        
        const businessData: CreateBusinessData = {
          name: formValue.name,
          ownerId: currentUser.id,
          address: {
            street: formValue.street,
            city: formValue.city,
            state: formValue.state,
            zipCode: formValue.zipCode,
            country: formValue.country,
            formatted: `${formValue.street}, ${formValue.city}, ${formValue.state} ${formValue.zipCode}, ${formValue.country}`
          },
          contactInfo: {
            email: formValue.email,
            phoneNumber: formValue.phoneNumber,
            ...(formValue.website && { website: formValue.website })
          },
          ...(formValue.description && { description: formValue.description })
        };

        const businessId = await this.businessService.createBusiness(businessData);
        
        // Update user's business ID
        // This would typically be done through a user service
        // For now, we'll assume it's handled by the business service
        
        await this.showToast('Business setup completed successfully!', 'success');
        this.router.navigate(['/dashboard']);
        
      } catch (error: any) {
        await this.showAlert('Setup Failed', error.message || 'Failed to setup business. Please try again.');
      } finally {
        this.isLoading = false;
      }
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async showToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}