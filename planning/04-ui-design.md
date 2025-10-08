# IoPropertyManager - User Interface Design & Components

## UI/UX Design Principles

### 1. Design System
- **Primary Color**: Ionic Blue (#3880ff)
- **Secondary Color**: Professional Green (#10dc60)
- **Warning Color**: Orange (#ffce00)
- **Danger Color**: Red (#f04141)
- **Typography**: Roboto/San Francisco (system defaults)
- **Spacing**: 8px base unit system (8, 16, 24, 32px)
- **Border Radius**: 8px for cards, 4px for buttons

### 2. Component Design Patterns

#### Property Card Component
```html
<ion-card class="property-card">
  <div class="property-image-container">
    <img [src]="property.photos[0]?.thumbnailUrl || defaultImage" 
         [alt]="property.name">
    <div class="property-status-badge" [class.urgent]="isUrgent">
      {{ getStatusText() }}
    </div>
  </div>
  
  <ion-card-header>
    <ion-card-subtitle>{{ property.type | titlecase }}</ion-card-subtitle>
    <ion-card-title>{{ property.name }}</ion-card-title>
  </ion-card-header>
  
  <ion-card-content>
    <div class="property-info">
      <div class="info-row">
        <ion-icon name="person-outline"></ion-icon>
        <span>{{ property.owner.name }}</span>
      </div>
      <div class="info-row">
        <ion-icon name="location-outline"></ion-icon>
        <span>{{ property.address.formatted }}</span>
      </div>
      <div class="info-row">
        <ion-icon name="calendar-outline"></ion-icon>
        <span>Next service: {{ property.nextServiceDate | date }}</span>
      </div>
      <div class="info-row">
        <ion-icon name="people-outline"></ion-icon>
        <span>{{ property.assignedEmployees.length }} assigned</span>
      </div>
    </div>
    
    <div class="property-stats">
      <div class="stat">
        <span class="stat-number">{{ property.serviceableItemsCount }}</span>
        <span class="stat-label">Items</span>
      </div>
      <div class="stat">
        <span class="stat-number">{{ property.totalCost | currency }}</span>
        <span class="stat-label">Total Cost</span>
      </div>
    </div>
  </ion-card-content>
  
  <ion-card-header class="card-actions">
    <ion-button fill="clear" (click)="viewProperty()">
      <ion-icon name="eye-outline"></ion-icon>
      View
    </ion-button>
    <ion-button fill="clear" (click)="editProperty()" *ngIf="canEdit">
      <ion-icon name="create-outline"></ion-icon>
      Edit
    </ion-button>
    <ion-button fill="clear" (click)="viewCalendar()">
      <ion-icon name="calendar-outline"></ion-icon>
      Calendar
    </ion-button>
  </ion-card-header>
</ion-card>
```

#### Task List Item Component
```html
<ion-item class="task-item" [class.priority-high]="task.priority === 'high'">
  <ion-avatar slot="start">
    <img [src]="task.property.photos[0]?.thumbnailUrl || defaultImage">
  </ion-avatar>
  
  <ion-label>
    <h2>{{ task.itemName }}</h2>
    <h3>{{ task.propertyName }}</h3>
    <p>
      <ion-icon name="calendar-outline"></ion-icon>
      Due: {{ task.dueDate | date:'short' }}
      <span class="time-remaining" [class.overdue]="isOverdue(task)">
        ({{ getTimeRemaining(task) }})
      </span>
    </p>
  </ion-label>
  
  <div slot="end" class="task-actions">
    <ion-button fill="clear" size="small" (click)="startTask(task)">
      <ion-icon name="play-outline"></ion-icon>
    </ion-button>
    <ion-button fill="clear" size="small" (click)="viewDetails(task)">
      <ion-icon name="information-circle-outline"></ion-icon>
    </ion-button>
  </div>
  
  <ion-chip slot="end" [color]="getPriorityColor(task.priority)">
    {{ task.priority | titlecase }}
  </ion-chip>
</ion-item>
```

## Screen Layouts

### 1. Dashboard Layout (Employee View)
```
┌─────────────────────────────────────┐
│ Header: Welcome, [User Name]        │
│ [Profile] [Notifications] [Menu]    │
├─────────────────────────────────────┤
│ Today's Tasks (5 items)            │
│ ┌─────────────────────────────────┐ │
│ │ ▣ Check HVAC - Main Street Apt │ │
│ │ ▣ Inspect Pool - Oak Complex   │ │
│ │ ▣ Replace Filter - Home #123   │ │
│ │ ...                            │ │
│ │ [View All Tasks]               │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Upcoming Tasks (Next 10 days)      │
│ ┌─────────────────────────────────┐ │
│ │ Sep 27 - Lawn Care             │ │
│ │ Sep 29 - Roof Inspection       │ │
│ │ Oct 1  - Paint Touch-up         │ │
│ │ ...                            │ │
│ │ [View Calendar]                │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ My Properties (3 assigned)         │
│ ┌─────────────────────────────────┐ │
│ │ [Property Card 1]              │ │
│ │ [Property Card 2]              │ │
│ │ [Property Card 3]              │ │
│ │ [Search Properties] [+]        │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 2. Dashboard Layout (Owner/Manager View)
```
┌─────────────────────────────────────┐
│ Header: Business Overview           │
│ [Analytics] [Messages] [Settings]   │
├─────────────────────────────────────┤
│ Quick Stats                        │
│ ┌───────┐ ┌───────┐ ┌───────┐      │
│ │  25   │ │  12   │ │ $2.5K │      │
│ │Props  │ │Emps   │ │Month  │      │
│ └───────┘ └───────┘ └───────┘      │
├─────────────────────────────────────┤
│ Today's Schedule                   │
│ ┌─────────────────────────────────┐ │
│ │ 8 tasks scheduled across team  │ │
│ │ 3 work orders pending          │ │
│ │ 2 properties need attention    │ │
│ │ [View Full Schedule]           │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Recent Activity                    │
│ ┌─────────────────────────────────┐ │
│ │ John completed HVAC service    │ │
│ │ Sarah created work order       │ │
│ │ New property added: Oak St     │ │
│ │ [View All Activity]            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 3. Property Detail Layout
```
┌─────────────────────────────────────┐
│ ← Property: Sunset Apartments       │
├─────────────────────────────────────┤
│ Photo Gallery                      │
│ ┌─────────────────────────────────┐ │
│ │ [Main Photo]        [+] [Edit]  │ │
│ │ [Thumb] [Thumb] [Thumb] [...]   │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Property Information               │
│ Owner: Jane Smith                  │
│ Type: Apartment Complex            │
│ Address: 123 Sunset Blvd          │
│ [📍 View on Map]                   │
├─────────────────────────────────────┤
│ Service Overview                   │
│ Next Service: Oct 15, 2025         │
│ Assigned: John, Sarah, Mike        │
│ Total Items: 24                    │
│ Monthly Cost: $850                 │
├─────────────────────────────────────┤
│ Actions                           │
│ [📋 View Items] [📅 Calendar]      │
│ [👥 Manage Team] [✏️ Edit]         │
└─────────────────────────────────────┘
```

## Navigation Structure

### 1. Bottom Tab Navigation (Main)
```
┌─────────────────────────────────────┐
│               Content               │
├─────────────────────────────────────┤
│ 🏠     📋     📅     💬     👤    │
│Home   Tasks Calendar Messages Profile│
└─────────────────────────────────────┘
```

### 2. Side Menu (Role-based)
```
Owner/Manager Menu:
├── 🏠 Dashboard
├── 🏢 Properties
│   ├── All Properties
│   ├── Add Property
│   └── Property Map
├── 👥 Team Management
│   ├── All Employees
│   ├── Add Employee
│   └── Schedules
├── 📊 Reports & Analytics
│   ├── Cost Analysis
│   ├── Service Reports
│   └── Generate Invoice
├── ⚙️ Settings
│   ├── Business Profile
│   ├── App Settings
│   └── Subscription
└── 🚪 Logout

Employee Menu:
├── 🏠 Dashboard
├── 📋 My Tasks
├── 🏢 My Properties
├── 📅 My Schedule
├── 👤 My Profile
├── ⚙️ Settings
└── 🚪 Logout
```

## Responsive Design Considerations

### 1. Mobile-First Approach
- Touch targets minimum 44px
- Thumb-friendly navigation
- Swipe gestures for common actions
- Pull-to-refresh on lists

### 2. Tablet Adaptations
- Split-view for list/detail
- Larger cards in grid layout
- More information density
- Side-by-side forms

### 3. Desktop Enhancements
- Multi-column layouts
- Hover states
- Keyboard shortcuts
- Right-click context menus

## Accessibility Features

### 1. WCAG Compliance
- Color contrast ratio 4.5:1 minimum
- Focus indicators
- Screen reader support
- Keyboard navigation

### 2. Ionic Accessibility
- Semantic HTML elements
- ARIA labels and roles
- Accessible form controls
- Skip navigation links

## Dark Mode Implementation

### 1. Theme Variables
```scss
// Dark theme overrides
[data-theme="dark"] {
  --ion-color-primary: #4c8dff;
  --ion-color-secondary: #50c8a3;
  --ion-background-color: #121212;
  --ion-text-color: #ffffff;
  --ion-card-background: #1e1e1e;
}
```

### 2. Dynamic Theme Switching
```typescript
export class ThemeService {
  setTheme(theme: 'light' | 'dark' | 'system'): void {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      document.body.classList.toggle('dark', prefersDark.matches);
    } else {
      document.body.classList.toggle('dark', theme === 'dark');
    }
  }
}
```