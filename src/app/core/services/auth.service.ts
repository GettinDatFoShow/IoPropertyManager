import { Injectable } from '@angular/core';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { User, CreateUserData, UserRole } from '../models';
import { removeUndefinedValues } from '../../shared/utils/data-utils';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private firebaseService: FirebaseService) {
    this.initAuthStateListener();
  }

  private initAuthStateListener(): void {
    onAuthStateChanged(this.firebaseService.auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this.getUserData(firebaseUser.uid);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } else {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
      }
    });
  }

  async loginWithEmail(email: string, password: string): Promise<User> {
    try {
      const credential = await signInWithEmailAndPassword(
        this.firebaseService.auth, 
        email, 
        password
      );
      const user = await this.getUserData(credential.user.uid);
      if (!user) {
        throw new Error('User data not found');
      }
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async loginWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.firebaseService.auth, provider);
      
      let user = await this.getUserData(credential.user.uid);
      
      // If user doesn't exist, this is a new user - they need to complete setup
      if (!user) {
        throw new Error('User not found. Please complete registration.');
      }
      
      return user;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  async register(userData: CreateUserData): Promise<User> {
    try {
      const credential = await createUserWithEmailAndPassword(
        this.firebaseService.auth,
        userData.email,
        userData.password
      );

      // Filter out undefined values to prevent Firestore errors
      const userProfile: any = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        dateHired: serverTimestamp()
      };

      // Only add optional fields if they have values
      if (userData.phoneNumber) {
        userProfile.phoneNumber = userData.phoneNumber;
      }
      if (userData.homeAddress) {
        userProfile.homeAddress = userData.homeAddress;
      }

      const newUser: User = {
        id: credential.user.uid,
        businessId: userData.businessId || 'default-business',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: `${userData.firstName} ${userData.lastName}`,
        role: userData.role || 'owner',
        profile: userProfile,
        assignedProperties: [],
        workSchedule: [],
        isActive: true,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any
      };

      await setDoc(
        doc(this.firebaseService.firestore, 'users', credential.user.uid), 
        removeUndefinedValues(newUser)
      );
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.firebaseService.auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  hasRole(roles: UserRole | UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  }

  private async getUserData(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(this.firebaseService.firestore, 'users', uid));
      if (userDoc.exists()) {
        return { id: uid, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  async updateUserActivity(action: string, location?: { latitude: number; longitude: number }): Promise<void> {
    const user = this.getCurrentUser();
    if (user) {
      try {
        await updateDoc(doc(this.firebaseService.firestore, 'users', user.id), {
          'lastActivity.timestamp': serverTimestamp(),
          'lastActivity.action': action,
          ...(location && { 'lastActivity.location': location }),
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating user activity:', error);
      }
    }
  }
}