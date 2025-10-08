import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
  IonSelect,
  IonSelectOption,
  LoadingController,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  mailOutline, 
  lockClosedOutline, 
  personOutline, 
  callOutline,
  eyeOutline, 
  eyeOffOutline,
  businessOutline
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { CreateUserData, UserRole } from '../../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
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
    IonSelect,
    IonSelectOption
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Create Account</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <div class="register-container">
        <!-- Logo Section -->
        <div class="logo-section">
          <img src="assets/logo.png" alt="IoPropertyManager" class="app-logo" />
          <h1>Join IoPropertyManager</h1>
          <p>Start managing your properties today</p>
        </div>

        <!-- Registration Form -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Sign Up</ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
              <!-- Account Type Selection -->
              <ion-item>
                <ion-icon name="business-outline" slot="start"></ion-icon>
                <ion-label position="stacked">Account Type</ion-label>
                <ion-select 
                  formControlName="role" 
                  placeholder="Select account type"
                  [class.ion-invalid]="roleControl.invalid && roleControl.touched"
                >
                  <ion-select-option value="owner">Business Owner</ion-select-option>
                  <ion-select-option value="employee">Employee</ion-select-option>
                </ion-select>
              </ion-item>
              @if (roleControl.invalid && roleControl.touched) {
                <ion-text color="danger">
                  <p class="error-text">Please select an account type</p>
                </ion-text>
              }

              <!-- First Name -->
              <ion-item>
                <ion-icon name="person-outline" slot="start"></ion-icon>
                <ion-label position="stacked">First Name</ion-label>
                <ion-input
                  type="text"
                  formControlName="firstName"
                  placeholder="Enter your first name"
                  [class.ion-invalid]="firstNameControl.invalid && firstNameControl.touched"
                ></ion-input>
              </ion-item>
              @if (firstNameControl.invalid && firstNameControl.touched) {
                <ion-text color="danger">
                  <p class="error-text">First name is required</p>
                </ion-text>
              }

              <!-- Last Name -->
              <ion-item>
                <ion-icon name="person-outline" slot="start"></ion-icon>
                <ion-label position="stacked">Last Name</ion-label>
                <ion-input
                  type="text"
                  formControlName="lastName"
                  placeholder="Enter your last name"
                  [class.ion-invalid]="lastNameControl.invalid && lastNameControl.touched"
                ></ion-input>
              </ion-item>
              @if (lastNameControl.invalid && lastNameControl.touched) {
                <ion-text color="danger">
                  <p class="error-text">Last name is required</p>
                </ion-text>
              }

              <!-- Email -->
              <ion-item>
                <ion-icon name="mail-outline" slot="start"></ion-icon>
                <ion-label position="stacked">Email</ion-label>
                <ion-input
                  type="email"
                  formControlName="email"
                  placeholder="Enter your email"
                  [class.ion-invalid]="emailControl.invalid && emailControl.touched"
                ></ion-input>
              </ion-item>
              @if (emailControl.invalid && emailControl.touched) {
                <ion-text color="danger">
                  <p class="error-text">Please enter a valid email address</p>
                </ion-text>
              }

              <!-- Phone Number -->
              <ion-item>
                <ion-icon name="call-outline" slot="start"></ion-icon>
                <ion-label position="stacked">Phone Number (Optional)</ion-label>
                <ion-input
                  type="tel"
                  formControlName="phoneNumber"
                  placeholder="Enter your phone number"
                ></ion-input>
              </ion-item>

              <!-- Password -->
              <ion-item>
                <ion-icon name="lock-closed-outline" slot="start"></ion-icon>
                <ion-label position="stacked">Password</ion-label>
                <ion-input
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Create a password"
                  [class.ion-invalid]="passwordControl.invalid && passwordControl.touched"
                ></ion-input>
                <ion-button 
                  fill="clear" 
                  slot="end" 
                  (click)="togglePasswordVisibility()"
                  size="small"
                >
                  <ion-icon [name]="showPassword ? 'eye-off-outline' : 'eye-outline'"></ion-icon>
                </ion-button>
              </ion-item>
              @if (passwordControl.invalid && passwordControl.touched) {
                <ion-text color="danger">
                  <p class="error-text">Password must be at least 6 characters</p>
                </ion-text>
              }

              <!-- Confirm Password -->
              <ion-item>
                <ion-icon name="lock-closed-outline" slot="start"></ion-icon>
                <ion-label position="stacked">Confirm Password</ion-label>
                <ion-input
                  [type]="showConfirmPassword ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  placeholder="Confirm your password"
                  [class.ion-invalid]="confirmPasswordControl.invalid && confirmPasswordControl.touched"
                ></ion-input>
                <ion-button 
                  fill="clear" 
                  slot="end" 
                  (click)="toggleConfirmPasswordVisibility()"
                  size="small"
                >
                  <ion-icon [name]="showConfirmPassword ? 'eye-off-outline' : 'eye-outline'"></ion-icon>
                </ion-button>
              </ion-item>
              @if (confirmPasswordControl.invalid && confirmPasswordControl.touched) {
                <ion-text color="danger">
                  <p class="error-text">
                    @if (confirmPasswordControl.errors?.['required']) {
                      Please confirm your password
                    } @else if (confirmPasswordControl.errors?.['passwordMismatch']) {
                      Passwords do not match
                    }
                  </p>
                </ion-text>
              }

              <!-- Register Button -->
              <ion-button 
                expand="block" 
                type="submit" 
                [disabled]="registerForm.invalid || isLoading"
                class="register-button"
              >
                @if (isLoading) {
                  <ion-spinner name="crescent"></ion-spinner>
                } @else {
                  Create Account
                }
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>

        <!-- Login Link -->
        <div class="login-link">
          <p>
            Already have an account? 
            <ion-button fill="clear" size="small" routerLink="/auth/login">
              Sign In
            </ion-button>
          </p>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .register-container {
      max-width: 400px;
      margin: 0 auto;
      padding: 2rem 0;
    }

    .logo-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .app-logo {
      width: 80px;
      height: 80px;
      margin-bottom: 1rem;
    }

    .logo-section h1 {
      margin: 0.5rem 0;
      color: var(--ion-color-primary);
    }

    .logo-section p {
      color: var(--ion-color-medium);
      margin: 0;
    }

    .error-text {
      font-size: 0.8rem;
      margin: 0.5rem 0 0 0;
      padding-left: 1rem;
    }

    .register-button {
      margin-top: 1.5rem;
    }

    .login-link {
      text-align: center;
      margin-top: 2rem;
    }

    .login-link p {
      color: var(--ion-color-medium);
      margin: 0;
    }

    ion-item {
      margin-bottom: 1rem;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private loadingController = inject(LoadingController);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  constructor() {
    addIcons({ 
      mailOutline, 
      lockClosedOutline, 
      personOutline, 
      callOutline,
      eyeOutline, 
      eyeOffOutline,
      businessOutline
    });
    
    this.registerForm = this.formBuilder.group({
      role: ['', [Validators.required]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  get roleControl() { return this.registerForm.get('role')!; }
  get firstNameControl() { return this.registerForm.get('firstName')!; }
  get lastNameControl() { return this.registerForm.get('lastName')!; }
  get emailControl() { return this.registerForm.get('email')!; }
  get passwordControl() { return this.registerForm.get('password')!; }
  get confirmPasswordControl() { return this.registerForm.get('confirmPassword')!; }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    return null;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onRegister() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      
      try {
        const formValue = this.registerForm.value;
        
        // Generate a temporary business ID for owners, empty for employees
        const businessId = formValue.role === 'owner' ? `temp_${Date.now()}` : '';
        
        const userData: CreateUserData = {
          email: formValue.email,
          password: formValue.password,
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          role: formValue.role as UserRole,
          phoneNumber: formValue.phoneNumber || undefined,
          businessId
        };

        await this.authService.register(userData);
        
        await this.showToast('Account created successfully!', 'success');
        
        // Navigate based on role
        if (formValue.role === 'owner') {
          this.router.navigate(['/auth/business-setup']);
        } else {
          this.router.navigate(['/dashboard']);
        }
        
      } catch (error: any) {
        await this.showAlert('Registration Failed', this.getErrorMessage(error));
      } finally {
        this.isLoading = false;
      }
    }
  }

  private getErrorMessage(error: any): string {
    if (error.code === 'auth/email-already-in-use') {
      return 'An account with this email already exists.';
    } else if (error.code === 'auth/weak-password') {
      return 'Password is too weak. Please choose a stronger password.';
    } else if (error.code === 'auth/invalid-email') {
      return 'Invalid email address format.';
    } else {
      return error.message || 'An unexpected error occurred. Please try again.';
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