# IoPropertyManager - Firebase Configuration & Security

## Firebase Project Setup

### 1. Firebase Services Configuration
```typescript
// environments/environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: "your-api-key",
    authDomain: "io-property-manager.firebaseapp.com",
    projectId: "io-property-manager",
    storageBucket: "io-property-manager.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456",
    measurementId: "G-XXXXXXXXXX"
  },
  googleMapsApiKey: "your-google-maps-api-key"
};
```

### 2. Firebase Module Configuration
```typescript
// app/app.config.ts
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    // ... other providers
  ]
};
```

## Firestore Security Rules

### 1. Authentication Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isBusinessOwner(businessId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/businesses/$(businessId)).data.ownerId == request.auth.uid;
    }
    
    function isBusinessMember(businessId) {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/businesses/$(businessId)/users/$(request.auth.uid));
    }
    
    function getUserRole(businessId) {
      return get(/databases/$(database)/documents/businesses/$(businessId)/users/$(request.auth.uid)).data.role;
    }
    
    function hasRole(businessId, roles) {
      return isBusinessMember(businessId) && 
             getUserRole(businessId) in roles;
    }
  }
}
```

### 2. Business Collection Rules
```javascript
// Business documents
match /businesses/{businessId} {
  allow read: if isBusinessMember(businessId);
  allow create: if isAuthenticated() && 
                   request.resource.data.ownerId == request.auth.uid;
  allow update: if isBusinessOwner(businessId);
  allow delete: if isBusinessOwner(businessId);
  
  // Users subcollection
  match /users/{userId} {
    allow read: if isBusinessMember(businessId);
    allow create: if hasRole(businessId, ['owner', 'manager']) ||
                     (userId == request.auth.uid && 
                      request.resource.data.role == 'employee');
    allow update: if hasRole(businessId, ['owner', 'manager']) ||
                     userId == request.auth.uid;
    allow delete: if hasRole(businessId, ['owner', 'manager']) &&
                     userId != request.auth.uid; // Can't delete self
  }
  
  // Properties subcollection
  match /properties/{propertyId} {
    allow read: if isBusinessMember(businessId);
    allow create: if hasRole(businessId, ['owner', 'manager']);
    allow update: if hasRole(businessId, ['owner', 'manager']) ||
                     (hasRole(businessId, ['employee']) && 
                      request.auth.uid in resource.data.assignedEmployees);
    allow delete: if hasRole(businessId, ['owner', 'manager']);
    
    // ServiceableItems subcollection
    match /items/{itemId} {
      allow read: if isBusinessMember(businessId);
      allow create: if hasRole(businessId, ['owner', 'manager']);
      allow update: if hasRole(businessId, ['owner', 'manager', 'employee']);
      allow delete: if hasRole(businessId, ['owner', 'manager']);
      
      // Service History subcollection
      match /serviceHistory/{historyId} {
        allow read: if isBusinessMember(businessId);
        allow create: if hasRole(businessId, ['owner', 'manager', 'employee']);
        allow update: if hasRole(businessId, ['owner', 'manager']) ||
                         resource.data.employeeId == request.auth.uid;
        allow delete: if hasRole(businessId, ['owner', 'manager']);
      }
    }
    
    // Work Orders subcollection
    match /workOrders/{workOrderId} {
      allow read: if isBusinessMember(businessId);
      allow create: if hasRole(businessId, ['owner', 'manager', 'employee']);
      allow update: if hasRole(businessId, ['owner', 'manager']) ||
                       resource.data.assignedTo == request.auth.uid ||
                       resource.data.createdBy == request.auth.uid;
      allow delete: if hasRole(businessId, ['owner', 'manager']);
    }
  }
  
  // Messages subcollection
  match /messages/{messageId} {
    allow read: if isBusinessMember(businessId) &&
                   (resource.data.recipientId == request.auth.uid ||
                    hasRole(businessId, ['owner', 'manager']));
    allow create: if isBusinessMember(businessId);
    allow update: if resource.data.recipientId == request.auth.uid;
    allow delete: if hasRole(businessId, ['owner', 'manager']);
  }
  
  // User Activities subcollection
  match /userActivities/{activityId} {
    allow read: if hasRole(businessId, ['owner', 'manager']);
    allow create: if isBusinessMember(businessId) &&
                     request.resource.data.userId == request.auth.uid;
    allow update: if false; // Activities are immutable
    allow delete: if hasRole(businessId, ['owner']);
  }
}
```

## Cloud Storage Security Rules

### 1. File Upload Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Business files structure: businesses/{businessId}/{category}/{fileName}
    match /businesses/{businessId}/{allPaths=**} {
      allow read: if isBusinessMember(businessId);
      allow write: if isBusinessMember(businessId) && 
                      request.resource.size < 10 * 1024 * 1024 && // 10MB limit
                      request.resource.contentType.matches('image/.*');
    }
    
    // User profile photos
    match /users/{userId}/profile/{fileName} {
      allow read: if true; // Profile photos are public
      allow write: if request.auth != null &&
                      request.auth.uid == userId &&
                      request.resource.size < 5 * 1024 * 1024 && // 5MB limit
                      request.resource.contentType.matches('image/.*');
    }
    
    // Helper function for business membership check
    function isBusinessMember(businessId) {
      return request.auth != null &&
             firestore.exists(/databases/(default)/documents/businesses/$(businessId)/users/$(request.auth.uid));
    }
  }
}
```

## Cloud Functions for Backend Logic

### 1. User Management Functions
```typescript
// functions/src/user-management.ts
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getAuth } from 'firebase-admin/auth';

// Auto-create user document when Firebase Auth user is created
export const createUserProfile = onDocumentCreated(
  'businesses/{businessId}/users/{userId}',
  async (event) => {
    const userData = event.data?.data();
    const { businessId, userId } = event.params;
    
    // Update user's custom claims for role-based access
    await getAuth().setCustomUserClaims(userId, {
      businessId,
      role: userData?.role || 'employee'
    });
  }
);

// Update custom claims when user role changes
export const updateUserClaims = onDocumentUpdated(
  'businesses/{businessId}/users/{userId}',
  async (event) => {
    const newData = event.data?.after.data();
    const { businessId, userId } = event.params;
    
    await getAuth().setCustomUserClaims(userId, {
      businessId,
      role: newData?.role
    });
  }
);
```

### 2. Automated Service Scheduling
```typescript
// functions/src/service-scheduler.ts
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';

// Daily function to check and create upcoming service tasks
export const scheduleServiceTasks = onSchedule('0 6 * * *', async () => {
  const db = getFirestore();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Query items due for service
  const itemsQuery = await db.collectionGroup('items')
    .where('nextServiceDate', '<=', tomorrow)
    .where('isActive', '==', true)
    .get();
  
  for (const itemDoc of itemsQuery.docs) {
    const item = itemDoc.data();
    const businessId = item.businessId;
    
    // Create notification message for assigned employees
    if (item.assignedEmployee) {
      await db.collection(`businesses/${businessId}/messages`).add({
        type: 'assignment',
        recipientId: item.assignedEmployee,
        title: 'Service Due Today',
        content: `${item.name} at ${item.propertyName} needs service`,
        data: {
          itemId: itemDoc.id,
          propertyId: item.propertyId
        },
        isRead: false,
        priority: 'medium',
        createdAt: new Date()
      });
    }
  }
});
```

### 3. Cost Calculation Functions
```typescript
// functions/src/cost-calculations.ts
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

// Recalculate property costs when service history is added
export const updatePropertyCosts = onDocumentCreated(
  'businesses/{businessId}/properties/{propertyId}/items/{itemId}/serviceHistory/{historyId}',
  async (event) => {
    const historyData = event.data?.data();
    const { businessId, propertyId } = event.params;
    
    const db = getFirestore();
    const propertyRef = db.doc(`businesses/${businessId}/properties/${propertyId}`);
    
    // Aggregate total costs for the property
    const serviceHistoryQuery = await db
      .collectionGroup('serviceHistory')
      .where('propertyId', '==', propertyId)
      .get();
    
    let totalCost = 0;
    serviceHistoryQuery.docs.forEach(doc => {
      totalCost += doc.data().serviceCost || 0;
    });
    
    // Update property total cost
    await propertyRef.update({
      totalCost,
      updatedAt: new Date()
    });
  }
);
```

## Data Validation

### 1. Client-Side Validation
```typescript
// shared/validators/property.validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function addressValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const address = control.value;
    if (!address || !address.street || !address.city || !address.state || !address.zipCode) {
      return { invalidAddress: true };
    }
    return null;
  };
}

export function serviceScheduleValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const schedule = control.value;
    if (!schedule || !schedule.frequency || schedule.interval <= 0) {
      return { invalidSchedule: true };
    }
    return null;
  };
}
```

### 2. Server-Side Validation (Cloud Functions)
```typescript
// functions/src/validation.ts
export const validatePropertyData = (data: any): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Property name must be at least 2 characters';
  }
  
  if (!data.address || !data.address.street) {
    errors.address = 'Valid address is required';
  }
  
  if (!data.owner || !data.owner.name) {
    errors.owner = 'Property owner information is required';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};
```

## Performance Optimization

### 1. Firestore Query Optimization
```typescript
// Use composite indexes for complex queries
const optimizedQuery = this.firestore.collection('properties', ref =>
  ref.where('businessId', '==', businessId)
     .where('assignedEmployees', 'array-contains', userId)
     .where('isActive', '==', true)
     .orderBy('nextServiceDate')
     .limit(10)
);
```

### 2. Offline Data Strategy
```typescript
// Enable offline persistence
import { enableNetwork, disableNetwork } from 'firebase/firestore';

// In app initialization
await this.firestore.enablePersistence({
  synchronizeTabs: true
});
```

This Firebase configuration provides a robust, secure, and scalable backend for the IoPropertyManager application with proper authentication, authorization, and data validation.