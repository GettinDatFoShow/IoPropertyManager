import { Injectable } from '@angular/core';
import { 
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FirebaseService } from './firebase.service';
import { AuthService } from './auth.service';
import { Business, CreateBusinessData, UpdateBusinessData } from '../models/business.models';
import { removeUndefinedValues } from '../../shared/utils/data-utils';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private currentBusinessSubject = new BehaviorSubject<Business | null>(null);
  public currentBusiness$ = this.currentBusinessSubject.asObservable();

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) {
    // Load business when user logs in
    this.authService.currentUser$.pipe(
      switchMap(user => {
        if (user?.businessId) {
          return this.getBusiness(user.businessId);
        }
        return from([null]);
      })
    ).subscribe(business => {
      this.currentBusinessSubject.next(business);
    });
  }

  private generateId(): string {
    return doc(collection(this.firebaseService.firestore, 'temp')).id;
  }

  async createBusiness(businessData: CreateBusinessData): Promise<string> {
    try {
      const businessId = this.generateId();
      
      const business: Business = {
        id: businessId,
        name: businessData.name,
        ownerId: businessData.ownerId,
        address: businessData.address,
        contactInfo: businessData.contactInfo,
        settings: {
          theme: 'system',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          currency: 'USD',
          defaultServiceReminder: 3,
          requireGeotagging: true,
          ...businessData.settings
        },
        subscription: {
          plan: 'basic',
          status: 'trial',
          expiresAt: new Timestamp(Date.now() / 1000 + 30 * 24 * 60 * 60, 0), // 30 days
          maxProperties: 5,
          maxEmployees: 3
        },
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any
      };

      // Only add description if it has a value
      if (businessData.description) {
        business.description = businessData.description;
      }

      await setDoc(
        doc(this.firebaseService.firestore, 'businesses', businessId), 
        removeUndefinedValues(business)
      );
      
      // Update the current user's businessId
      await this.updateUserBusinessId(businessData.ownerId, businessId);
      
      this.currentBusinessSubject.next(business);
      return businessId;
    } catch (error) {
      console.error('Error creating business:', error);
      throw error;
    }
  }

  async getBusiness(businessId: string): Promise<Business | null> {
    try {
      const businessDoc = await getDoc(doc(this.firebaseService.firestore, 'businesses', businessId));
      
      if (businessDoc.exists()) {
        return { id: businessId, ...businessDoc.data() } as Business;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching business:', error);
      throw error;
    }
  }

  async updateBusiness(businessId: string, updateData: UpdateBusinessData): Promise<void> {
    try {
      await updateDoc(doc(this.firebaseService.firestore, 'businesses', businessId), {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      // Update local state
      const currentBusiness = this.currentBusinessSubject.value;
      if (currentBusiness && currentBusiness.id === businessId) {
        const updatedBusiness: Business = { 
          ...currentBusiness, 
          ...updateData,
          settings: updateData.settings ? 
            { ...currentBusiness.settings, ...updateData.settings } : 
            currentBusiness.settings
        };
        this.currentBusinessSubject.next(updatedBusiness);
      }
    } catch (error) {
      console.error('Error updating business:', error);
      throw error;
    }
  }

  async deleteBusiness(businessId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.firebaseService.firestore, 'businesses', businessId));
      this.currentBusinessSubject.next(null);
    } catch (error) {
      console.error('Error deleting business:', error);
      throw error;
    }
  }

  getCurrentBusiness(): Business | null {
    return this.currentBusinessSubject.value;
  }

  isBusinessOwner(): boolean {
    const user = this.authService.getCurrentUser();
    const business = this.getCurrentBusiness();
    
    return !!(user && business && user.id === business.ownerId);
  }

  canManageEmployees(): boolean {
    const user = this.authService.getCurrentUser();
    return !!(user && ['owner', 'manager'].includes(user.role));
  }

  canManageProperties(): boolean {
    const user = this.authService.getCurrentUser();
    return !!(user && ['owner', 'manager'].includes(user.role));
  }

  async getBusinessUsers(businessId: string): Promise<any[]> {
    try {
      const usersQuery = query(
        collection(this.firebaseService.firestore, 'users'),
        where('businessId', '==', businessId),
        where('isActive', '==', true)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      return usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching business users:', error);
      throw error;
    }
  }

  private async updateUserBusinessId(userId: string, businessId: string): Promise<void> {
    try {
      await updateDoc(doc(this.firebaseService.firestore, 'users', userId), {
        businessId: businessId,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user business ID:', error);
      throw error;
    }
  }
}