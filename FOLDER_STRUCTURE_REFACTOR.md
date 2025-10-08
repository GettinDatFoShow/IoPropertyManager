# File and Folder Structure Refactor Plan

## Current Issues Identified:

1. **Duplicate property-list components** in two locations
2. **Tab-based pages** conflicting with feature-based architecture
3. **Inconsistent naming** between components and their functionality
4. **Mixed routing strategies** causing confusion

## Proposed New Structure:

```
src/app/
├── core/                           ✅ (already correct)
│   ├── guards/
│   ├── services/
│   └── models/
├── shared/                         ✅ (already correct)
│   ├── components/
│   └── utils/
├── features/                       ✅ (already correct)
│   ├── auth/                       ✅ (already correct)
│   │   ├── components/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   └── auth.routes.ts
│   ├── dashboard/                  ✅ (already correct)
│   │   ├── dashboard.component.*
│   │   └── dashboard.routes.ts
│   ├── properties/                 🔄 (needs reorganization)
│   │   ├── components/
│   │   │   ├── property-list/
│   │   │   ├── property-detail/
│   │   │   ├── property-form/
│   │   │   └── property-card/
│   │   ├── services/
│   │   │   └── property.service.ts
│   │   ├── models/                 ➕ (new - for interfaces)
│   │   │   └── property.interface.ts
│   │   └── properties.routes.ts
│   ├── services/                   ➕ (new - for Phase 2C)
│   │   ├── components/
│   │   │   ├── service-list/
│   │   │   ├── service-detail/
│   │   │   ├── service-form/
│   │   │   └── service-card/
│   │   ├── services/
│   │   │   └── service.service.ts
│   │   ├── models/
│   │   │   └── service.interface.ts
│   │   └── services.routes.ts
│   ├── tasks/                      ➕ (new - for Phase 2C)
│   │   ├── components/
│   │   │   ├── task-list/
│   │   │   ├── task-detail/
│   │   │   ├── task-form/
│   │   │   └── task-card/
│   │   ├── services/
│   │   │   └── task.service.ts
│   │   ├── models/
│   │   │   └── task.interface.ts
│   │   └── tasks.routes.ts
│   └── reports/                    ➕ (new - for future phases)
│       ├── components/
│       ├── services/
│       └── reports.routes.ts
├── layout/                         🔄 (rename from tabs)
│   ├── tabs/
│   │   ├── tabs.component.*
│   │   └── tabs.routes.ts
│   └── main-layout/
└── pages/                          ❌ (remove - replace with feature routing)
    ├── properties/                 ➡️  Move to features/properties/pages/
    ├── services/                   ➡️  Move to features/services/pages/
    └── dashboard/                  ➡️  Already in features/dashboard/
```

## Files to Rename/Move:

### 1. Remove Duplicate Components:
- ❌ Delete: `src/app/features/properties/property-list/`
- ✅ Keep: `src/app/features/properties/components/property-list/`

### 2. Consolidate Tab Structure:
- 🔄 Rename: `src/app/tab1/` → `src/app/layout/main-tabs/`
- ❌ Remove: `src/app/tab2/` and `src/app/tab3/` (replace with feature-based pages)
- 🔄 Update: `src/app/tabs/` → `src/app/layout/tabs/`

### 3. Create Model Interfaces:
- ➕ Create: `src/app/features/properties/models/property.interface.ts`
- ➕ Create: `src/app/core/models/user.interface.ts`
- ➕ Create: `src/app/core/models/common.interface.ts`

### 4. Reorganize Services:
- ✅ Keep: `src/app/features/properties/services/property.service.ts`
- 🔄 Move: Any shared services to `src/app/core/services/`

### 5. Update Component Names for Clarity:
- ✅ `property-list.component` (clear)
- ✅ `property-detail.component` (clear)
- ✅ `property-form.component` (clear)
- ✅ `property-card.component` (clear)

## Routing Structure Update:

```typescript
// Main app routes
const routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes') },
  { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.routes') },
  { path: 'main', loadChildren: () => import('./layout/tabs/tabs.routes') }
];

// Tabs routes (main application layout)
const tabRoutes = [
  { path: 'properties', loadChildren: () => import('../features/properties/properties.routes') },
  { path: 'services', loadChildren: () => import('../features/services/services.routes') },
  { path: 'tasks', loadChildren: () => import('../features/tasks/tasks.routes') },
  { path: 'reports', loadChildren: () => import('../features/reports/reports.routes') }
];
```

## Benefits of This Structure:

1. **Clear Feature Separation**: Each major functionality has its own feature module
2. **Consistent Naming**: All files and folders clearly indicate their purpose
3. **Scalable Architecture**: Easy to add new features (services, tasks, reports)
4. **Maintainable Code**: Logical grouping makes development and debugging easier
5. **Reusable Components**: Shared components properly organized
6. **Type Safety**: Dedicated model interfaces for all entities

## Migration Steps:

1. **Phase 1**: Clean up duplicate files and organize existing structure
2. **Phase 2**: Create model interfaces and update imports
3. **Phase 3**: Restructure routing to be feature-based
4. **Phase 4**: Update all import paths and references
5. **Phase 5**: Test all functionality after refactor