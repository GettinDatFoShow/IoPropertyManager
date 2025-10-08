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
  LoadingController,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, logoGoogle, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
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
    IonSpinner
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Welcome Back</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <div class="login-container">
        <!-- Logo Section -->
        <div class="logo-section">
          <img src="assets/logo.png" alt="IoPropertyManager" class="app-logo" />
          <h1>IoPropertyManager</h1>
          <p>Manage your properties with ease</p>
        </div>

        <!-- Login Form -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Sign In</ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
              <!-- Email Input -->
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

              <!-- Password Input -->
              <ion-item>
                <ion-icon name="lock-closed-outline" slot="start"></ion-icon>
                <ion-label position="stacked">Password</ion-label>
                <ion-input
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Enter your password"
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
                  <p class="error-text">Password is required</p>
                </ion-text>
              }

              <!-- Login Button -->
              <ion-button 
                expand="block" 
                type="submit" 
                [disabled]="loginForm.invalid || isLoading"
                class="login-button"
              >
                @if (isLoading) {
                  <ion-spinner name="crescent"></ion-spinner>
                } @else {
                  Sign In
                }
              </ion-button>

              <!-- Divider -->
              <div class="divider">
                <span>or</span>
              </div>

              <!-- Google Login Button -->
              <ion-button 
                expand="block" 
                fill="outline" 
                (click)="onGoogleLogin()"
                [disabled]="isLoading"
                class="google-button"
              >
                <ion-icon name="logo-google" slot="start"></ion-icon>
                Continue with Google
              </ion-button>

              <!-- Forgot Password Link -->
              <div class="forgot-password">
                <ion-button fill="clear" size="small" routerLink="/auth/forgot-password">
                  Forgot Password?
                </ion-button>
              </div>
            </form>
          </ion-card-content>
        </ion-card>

        <!-- Sign Up Link -->
        <div class="signup-link">
          <p>
            Don't have an account? 
            <ion-button fill="clear" size="small" routerLink="/auth/register">
              Sign Up
            </ion-button>
          </p>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .login-container {
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

    .login-button {
      margin-top: 1.5rem;
    }

    .divider {
      text-align: center;
      margin: 1.5rem 0;
      position: relative;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--ion-color-light);
    }

    .divider span {
      background: var(--ion-background-color);
      padding: 0 1rem;
      color: var(--ion-color-medium);
      font-size: 0.9rem;
    }

    .google-button {
      margin-bottom: 1rem;
    }

    .forgot-password {
      text-align: center;
      margin-top: 1rem;
    }

    .signup-link {
      text-align: center;
      margin-top: 2rem;
    }

    .signup-link p {
      color: var(--ion-color-medium);
      margin: 0;
    }

    ion-item {
      margin-bottom: 1rem;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private loadingController = inject(LoadingController);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  constructor() {
    addIcons({ mailOutline, lockClosedOutline, logoGoogle, eyeOutline, eyeOffOutline });
    
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get emailControl() {
    return this.loginForm.get('email')!;
  }

  get passwordControl() {
    return this.loginForm.get('password')!;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      try {
        const { email, password } = this.loginForm.value;
        await this.authService.loginWithEmail(email, password);
        
        await this.showToast('Welcome back!', 'success');
        this.router.navigate(['/dashboard']);
      } catch (error: any) {
        await this.showAlert('Login Failed', this.getErrorMessage(error));
      } finally {
        this.isLoading = false;
      }
    }
  }

  async onGoogleLogin() {
    this.isLoading = true;
    
    try {
      await this.authService.loginWithGoogle();
      await this.showToast('Welcome back!', 'success');
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      if (error.message.includes('User not found')) {
        await this.showAlert(
          'Account Not Found', 
          'Please sign up first or contact your administrator.'
        );
      } else {
        await this.showAlert('Login Failed', this.getErrorMessage(error));
      }
    } finally {
      this.isLoading = false;
    }
  }

  private getErrorMessage(error: any): string {
    if (error.code === 'auth/user-not-found') {
      return 'No account found with this email address.';
    } else if (error.code === 'auth/wrong-password') {
      return 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      return 'Invalid email address format.';
    } else if (error.code === 'auth/user-disabled') {
      return 'This account has been disabled.';
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