# IoPropertyManager - Data Models Architecture

## Core Data Models

### 1. User Model
```typescript
interface User {
  id: string;
  businessId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole; // 'owner' | 'manager' | 'employee'
  profile: UserProfile;
  assignedProperties: string[]; // propertyIds
  workSchedule: WorkSchedule[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
  lastKnownLocation?: GeoPoint;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  homeAddress?: Address;
  dateHired: Timestamp;
  emergencyContact?: EmergencyContact;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
}
```

### 2. Business Model
```typescript
interface Business {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  ownerId: string;
  address: Address;
  contactInfo: BusinessContact;
  settings: BusinessSettings;
  subscription: BusinessSubscription;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface BusinessContact {
  email: string;
  phoneNumber: string;
  website?: string;
}

interface BusinessSettings {
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  currency: string;
  defaultServiceReminder: number; // days before service
  requireGeotagging: boolean;
}

interface BusinessSubscription {
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'trial';
  expiresAt: Timestamp;
  maxProperties: number;
  maxEmployees: number;
}
```

### 3. Property Model (Enhanced)
```typescript
interface Property {
  id: string;
  businessId: string;
  name: string;
  description: string;
  type: PropertyType;
  owner: PropertyOwner;
  address: Address;
  location: GeoPoint;
  photos: PropertyPhoto[];
  subscription: PropertySubscription;
  assignedEmployees: string[];
  serviceableItemsCount: number;
  nextServiceDate: Timestamp;
  totalCost: number;
  isActive: boolean;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface PropertyPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  uploadedBy: string;
  uploadedAt: Timestamp;
}
```

### 4. ServiceableItem Model
```typescript
interface ServiceableItem {
  id: string;
  propertyId: string;
  name: string;
  description: string;
  category: string;
  webLink?: string;
  photos: string[];
  costs: ItemCosts;
  schedule: ServiceSchedule;
  lastServiceDate?: Timestamp;
  nextServiceDate: Timestamp;
  assignedEmployee?: string;
  priority: Priority;
  tags: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface ItemCosts {
  itemCost: number;
  serviceCost: number;
  estimatedReplacementCost?: number;
}

interface ServiceSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'custom';
  interval: number; // for custom frequency
  seasons: Season[];
  reminderDays: number;
  isRecurring: boolean;
}
```

### 5. ServiceHistory Model
```typescript
interface ServiceHistory {
  id: string;
  itemId: string;
  propertyId: string;
  employeeId: string;
  serviceDate: Timestamp;
  serviceCost: number;
  laborHours: number;
  comments: string;
  photos: string[];
  workOrderId?: string;
  status: 'completed' | 'partially_completed' | 'failed';
  rating?: number; // 1-5 stars
  location: GeoPoint;
  createdAt: Timestamp;
}
```

### 6. WorkOrder Model
```typescript
interface WorkOrder {
  id: string;
  itemId: string;
  propertyId: string;
  title: string;
  description: string;
  priority: Priority;
  status: WorkOrderStatus;
  assignedTo?: string;
  createdBy: string;
  estimatedCost: number;
  actualCost?: number;
  estimatedHours: number;
  actualHours?: number;
  dueDate: Timestamp;
  completedDate?: Timestamp;
  photos: string[];
  comments: WorkOrderComment[];
  location: GeoPoint;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface WorkOrderComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  photos: string[];
  createdAt: Timestamp;
}
```

### 7. Message Model
```typescript
interface Message {
  id: string;
  type: MessageType;
  businessId: string;
  senderId?: string; // null for system messages
  recipientId: string;
  title: string;
  content: string;
  data?: any; // additional data for notifications
  isRead: boolean;
  priority: Priority;
  expiresAt?: Timestamp;
  createdAt: Timestamp;
}
```

### 8. UserActivity Model
```typescript
interface UserActivity {
  id: string;
  userId: string;
  businessId: string;
  action: string;
  entityType: 'property' | 'item' | 'workorder' | 'user' | 'business';
  entityId?: string;
  description: string;
  location: GeoPoint;
  timestamp: Timestamp;
  metadata?: any;
}
```

## Firestore Collections Structure

```
businesses/
  {businessId}/
    users/
      {userId}
    properties/
      {propertyId}/
        items/
          {itemId}/
            serviceHistory/
              {historyId}
        workOrders/
          {workOrderId}
    messages/
      {messageId}
    userActivities/
      {activityId}
```

## Data Relationships

1. **Business** → **Users** (1:many)
2. **Business** → **Properties** (1:many)
3. **Property** → **ServiceableItems** (1:many)
4. **Property** → **WorkOrders** (1:many)
5. **ServiceableItem** → **ServiceHistory** (1:many)
6. **User** → **Properties** (many:many via assignedEmployees)
7. **User** → **WorkOrders** (1:many via assignedTo)
8. **User** → **Messages** (1:many)
9. **User** → **UserActivities** (1:many)

## Indexes Required

### Composite Indexes
- `businessId + type + isActive` (Properties)
- `propertyId + nextServiceDate + isActive` (ServiceableItems)
- `assignedTo + status + dueDate` (WorkOrders)
- `recipientId + isRead + createdAt` (Messages)
- `userId + timestamp` (UserActivities)

### Single Field Indexes
- All timestamp fields for ordering
- All ID fields for lookups
- Status fields for filtering