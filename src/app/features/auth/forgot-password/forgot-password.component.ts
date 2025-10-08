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
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, arrowBackOutline } from 'ionicons/icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { FirebaseService } from '../../../core/services/firebase.service';

@Component({
  selector: 'app-forgot-password',
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
        <ion-button slot="start" fill="clear" routerLink="/auth/login">
          <ion-icon name="arrow-back-outline"></ion-icon>
        </ion-button>
        <ion-title>Reset Password</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <div class="forgot-password-container">
        <!-- Header Section -->
        <div class="header-section">
          <ion-icon name="mail-outline" class="mail-icon"></ion-icon>
          <h1>Reset Your Password</h1>
          <p>Enter your email address and we'll send you a link to reset your password</p>
        </div>

        <!-- Reset Form -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Password Reset</ion-card-title>
          </ion-card-header>

          <ion-card-content>
            @if (!emailSent) {
              <form [formGroup]="resetForm" (ngSubmit)="onResetPassword()">
                <!-- Email Input -->
                <ion-item>
                  <ion-icon name="mail-outline" slot="start"></ion-icon>
                  <ion-label position="stacked">Email Address</ion-label>
                  <ion-input
                    type="email"
                    formControlName="email"
                    placeholder="Enter your email address"
                    [class.ion-invalid]="emailControl.invalid && emailControl.touched"
                  ></ion-input>
                </ion-item>
                @if (emailControl.invalid && emailControl.touched) {
                  <ion-text color="danger">
                    <p class="error-text">Please enter a valid email address</p>
                  </ion-text>
                }

                <!-- Reset Button -->
                <ion-button 
                  expand="block" 
                  type="submit" 
                  [disabled]="resetForm.invalid || isLoading"
                  class="reset-button"
                >
                  @if (isLoading) {
                    <ion-spinner name="crescent"></ion-spinner>
                  } @else {
                    Send Reset Link
                  }
                </ion-button>
              </form>
            } @else {
              <!-- Success Message -->
              <div class="success-message">
                <ion-icon name="mail-outline" color="success" class="success-icon"></ion-icon>
                <h2>Check Your Email</h2>
                <p>
                  We've sent a password reset link to:
                  <br>
                  <strong>{{ sentToEmail }}</strong>
                </p>
                <p class="help-text">
                  Click the link in the email to reset your password. 
                  If you don't see the email, check your spam folder.
                </p>
                
                <ion-button 
                  expand="block" 
                  fill="outline" 
                  (click)="resendEmail()"
                  [disabled]="isLoading"
                  class="resend-button"
                >
                  @if (isLoading) {
                    <ion-spinner name="crescent"></ion-spinner>
                  } @else {
                    Resend Email
                  }
                </ion-button>
              </div>
            }
          </ion-card-content>
        </ion-card>

        <!-- Back to Login Link -->
        <div class="back-to-login">
          <p>
            Remember your password? 
            <ion-button fill="clear" size="small" routerLink="/auth/login">
              Sign In
            </ion-button>
          </p>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .forgot-password-container {
      max-width: 400px;
      margin: 0 auto;
      padding: 2rem 0;
    }

    .header-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .mail-icon {
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
      line-height: 1.4;
    }

    .error-text {
      font-size: 0.8rem;
      margin: 0.5rem 0 0 0;
      padding-left: 1rem;
    }

    .reset-button {
      margin-top: 1.5rem;
    }

    .success-message {
      text-align: center;
    }

    .success-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .success-message h2 {
      color: var(--ion-color-success);
      margin: 0 0 1rem 0;
    }

    .success-message p {
      color: var(--ion-color-medium);
      line-height: 1.4;
      margin-bottom: 1rem;
    }

    .help-text {
      font-size: 0.9rem;
      margin-bottom: 2rem !important;
    }

    .resend-button {
      margin-top: 1rem;
    }

    .back-to-login {
      text-align: center;
      margin-top: 2rem;
    }

    .back-to-login p {
      color: var(--ion-color-medium);
      margin: 0;
    }

    ion-item {
      margin-bottom: 1rem;
    }
  `]
})
export class ForgotPasswordComponent {
  resetForm: FormGroup;
  isLoading = false;
  emailSent = false;
  sentToEmail = '';

  private firebaseService = inject(FirebaseService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  constructor() {
    addIcons({ mailOutline, arrowBackOutline });
    
    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get emailControl() {
    return this.resetForm.get('email')!;
  }

  async onResetPassword() {
    if (this.resetForm.valid) {
      this.isLoading = true;
      
      try {
        const email = this.resetForm.value.email;
        await sendPasswordResetEmail(this.firebaseService.auth, email);
        
        this.sentToEmail = email;
        this.emailSent = true;
        
      } catch (error: any) {
        await this.showAlert('Reset Failed', this.getErrorMessage(error));
      } finally {
        this.isLoading = false;
      }
    }
  }

  async resendEmail() {
    if (this.sentToEmail) {
      this.isLoading = true;
      
      try {
        await sendPasswordResetEmail(this.firebaseService.auth, this.sentToEmail);
        await this.showToast('Reset email sent again!', 'success');
      } catch (error: any) {
        await this.showAlert('Resend Failed', this.getErrorMessage(error));
      } finally {
        this.isLoading = false;
      }
    }
  }

  private getErrorMessage(error: any): string {
    if (error.code === 'auth/user-not-found') {
      return 'No account found with this email address.';
    } else if (error.code === 'auth/invalid-email') {
      return 'Invalid email address format.';
    } else if (error.code === 'auth/too-many-requests') {
      return 'Too many reset attempts. Please try again later.';
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