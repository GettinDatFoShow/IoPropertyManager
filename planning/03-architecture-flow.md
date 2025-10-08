# IoPropertyManager - Application Architecture & Flow

## Application Flow Diagrams

### 1. User Authentication Flow
```mermaid
graph TD
    A[App Start] --> B{User Authenticated?}
    B -->|Yes| C[Load User Profile]
    B -->|No| D[Login Page]
    D --> E{Login Method}
    E -->|Email/Password| F[Firebase Email Auth]
    E -->|Google| G[Google OAuth]
    E -->|Sign Up| H[Registration Page]
    F --> I{Auth Success?}
    G --> I
    I -->|Yes| J[Check User Role]
    I -->|No| K[Show Error]
    K --> D
    J --> L{First Time Login?}
    L -->|Yes| M[Business Setup]
    L -->|No| N[Navigate to Dashboard]
    M --> O[Create Business Profile]
    O --> N
    H --> P[Create Account]
    P --> Q[Email Verification]
    Q --> R[Business Registration]
    R --> N
    C --> N
```

### 2. Dashboard Navigation Flow
```mermaid
graph TD
    A[Dashboard] --> B{User Role}
    B -->|Owner| C[Owner Dashboard]
    B -->|Manager| D[Manager Dashboard]
    B -->|Employee| E[Employee Dashboard]
    
    C --> F[Today's Tasks]
    C --> G[Upcoming Tasks]
    C --> H[All Properties]
    C --> I[Employee Management]
    C --> J[Reports & Analytics]
    
    D --> F
    D --> G
    D --> K[Assigned Properties]
    D --> L[Team Overview]
    
    E --> F
    E --> G
    E --> M[My Properties]
    E --> N[My Profile]
```

### 3. Property Management Flow
```mermaid
graph TD
    A[Properties List] --> B{Has Properties?}
    B -->|No| C[Add Property Button]
    B -->|Yes| D[Property Cards Grid]
    
    C --> E[Property Form]
    E --> F[Fill Property Details]
    F --> G[Add Photos]
    G --> H[Set Address & Location]
    H --> I[Submit to Firebase]
    I --> J[Success Notification]
    J --> D
    
    D --> K[Property Card Click]
    K --> L[Property Detail View]
    L --> M[View Items]
    L --> N[View Calendar]
    L --> O[Assign Employees]
    L --> P[Edit Property]
    
    M --> Q{Has Items?}
    Q -->|No| R[Add Item Button]
    Q -->|Yes| S[Items List]
    
    R --> T[Item Form]
    T --> U[Fill Item Details]
    U --> V[Set Service Schedule]
    V --> W[Submit Item]
    W --> S
```

### 4. Work Order Management Flow
```mermaid
graph TD
    A[Service Item Review] --> B{Needs Repair?}
    B -->|Yes| C[Create Work Order]
    B -->|No| D[Mark Service Complete]
    
    C --> E[Work Order Form]
    E --> F[Set Priority]
    F --> G[Assign Employee]
    G --> H[Set Due Date]
    H --> I[Add Photos/Notes]
    I --> J[Submit Work Order]
    J --> K[Notify Assigned Employee]
    
    D --> L[Add Service Photos]
    L --> M[Add Comments]
    M --> N[Record Service Cost]
    N --> O[Update Service History]
    O --> P[Calculate Next Service Date]
    P --> Q[Send Completion Notification]
```

### 5. Employee Task Flow
```mermaid
graph TD
    A[Employee Login] --> B[View Dashboard]
    B --> C[Today's Tasks]
    C --> D[Select Task]
    D --> E[Navigate to Property]
    E --> F[Check-in with Geolocation]
    F --> G[Review Item]
    G --> H{Item Status}
    H -->|Good| I[Mark Complete]
    H -->|Needs Repair| J[Create Work Order]
    H -->|Needs Replacement| K[Create Work Order]
    
    I --> L[Add Service Photos]
    L --> M[Add Comments]
    M --> N[Record Time Spent]
    N --> O[Submit Service Record]
    O --> P[Check-out with Geolocation]
    P --> Q[Update Task Status]
```

## Component Architecture

### 1. Core Modules Structure
```
src/app/
├── core/
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   ├── role.guard.ts
│   │   └── business.guard.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── firebase.service.ts
│   │   ├── geolocation.service.ts
│   │   ├── camera.service.ts
│   │   ├── notification.service.ts
│   │   └── storage.service.ts
│   ├── models/ (existing)
│   └── interceptors/
│       ├── auth.interceptor.ts
│       └── error.interceptor.ts
├── shared/
│   ├── components/
│   │   ├── loading/
│   │   ├── image-viewer/
│   │   ├── confirmation-modal/
│   │   ├── date-picker/
│   │   ├── address-picker/
│   │   └── employee-selector/
│   ├── pipes/
│   │   ├── currency.pipe.ts
│   │   ├── time-ago.pipe.ts
│   │   └── role-display.pipe.ts
│   └── directives/
├── features/
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   └── business-setup/
│   ├── dashboard/
│   │   ├── owner-dashboard/
│   │   ├── manager-dashboard/
│   │   └── employee-dashboard/
│   ├── properties/
│   │   ├── property-list/
│   │   ├── property-detail/
│   │   ├── property-form/
│   │   └── property-map/
│   ├── items/
│   │   ├── item-list/
│   │   ├── item-detail/
│   │   ├── item-form/
│   │   └── service-history/
│   ├── work-orders/
│   │   ├── work-order-list/
│   │   ├── work-order-detail/
│   │   └── work-order-form/
│   ├── employees/
│   │   ├── employee-list/
│   │   ├── employee-detail/
│   │   └── employee-form/
│   ├── calendar/
│   │   └── calendar-view/
│   ├── messages/
│   │   ├── message-list/
│   │   └── message-detail/
│   ├── reports/
│   │   ├── overview/
│   │   ├── cost-analysis/
│   │   └── invoice-generator/
│   └── settings/
│       ├── user-profile/
│       ├── business-settings/
│       └── app-settings/
└── layout/
    ├── tabs/
    ├── menu/
    └── header/
```

### 2. State Management Strategy
- **Local State**: Component-level reactive forms and UI state
- **Service State**: Business logic and API communication via services
- **Firebase Real-time**: Real-time updates for collaborative features
- **Local Storage**: User preferences and offline capability

### 3. Routing Structure
```typescript
const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes') },
  { 
    path: 'dashboard', 
    loadChildren: () => import('./features/dashboard/dashboard.routes'),
    canActivate: [AuthGuard]
  },
  { 
    path: 'properties', 
    loadChildren: () => import('./features/properties/properties.routes'),
    canActivate: [AuthGuard]
  },
  // ... other feature routes
];
```

## Data Flow Architecture

### 1. Service Layer Pattern
```typescript
// Example: PropertyService
@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private propertiesCollection = this.firestore.collection<Property>('properties');
  
  // Real-time properties stream
  getProperties(businessId: string): Observable<Property[]> {
    return this.propertiesCollection
      .where('businessId', '==', businessId)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .valueChanges({ idField: 'id' });
  }
  
  // CRUD operations with optimistic updates
  async createProperty(property: CreatePropertyData): Promise<string> {
    const id = this.firestore.createId();
    await this.propertiesCollection.doc(id).set({
      ...property,
      id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return id;
  }
}
```

### 2. Real-time Updates Pattern
```typescript
// Component subscribes to real-time data
export class PropertyListComponent {
  properties$ = this.propertyService.getProperties(this.businessId);
  
  constructor(private propertyService: PropertyService) {}
}
```

### 3. Offline-First Strategy
- Cache critical data locally
- Queue mutations for when online
- Sync when connection restored
- Show offline indicators