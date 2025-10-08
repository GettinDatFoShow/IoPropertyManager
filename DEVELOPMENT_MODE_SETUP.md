# Development Mode Setup - IoPropertyManager

## Overview
We've successfully implemented a development mode that bypasses authentication and uses mock data to facilitate feature development without dealing with login flows.

## Key Features Implemented

### 1. Mock Data Service (`mock-data.service.ts`)
- **Mock Business**: Complete business profile with realistic data
- **Mock Users**: Three user types (Owner, Manager, Employee) with full profiles
- **Mock Properties**: Three different property types with realistic data
- **Mock Tasks**: Today's tasks and upcoming tasks for testing
- **User Switching**: Ability to switch between different user roles dynamically

### 2. Development Mode Toggle Component (`dev-mode-toggle.component.ts`)
- **Visual Toggle**: Shows current user and role
- **Role Switching**: Easy buttons to switch between Owner, Manager, Employee
- **Responsive Design**: Works on both desktop and mobile
- **Development Only**: Only visible when `isDevelopmentMode = true`

### 3. Enhanced Dashboard (`dashboard.component.ts`)
- **Real Data Display**: Shows actual mock property and task counts
- **User-Specific Views**: Different data based on current user role
- **Interactive Stats**: Properties, tasks today, and upcoming tasks
- **Task Management**: Displays today's tasks with priority badges
- **Property Overview**: Shows all properties with service dates
- **Role-Based Actions**: Different action buttons based on user permissions

### 4. Development-Friendly Routing (`app.routes.ts`)
- **Development Flag**: `DEVELOPMENT_MODE = true` to skip authentication
- **Conditional Guards**: Authentication guards only apply when not in dev mode
- **Direct Access**: Routes directly to dashboard when in development mode

## Mock Data Structure

### Business Profile
- Name: "PropertyCare Solutions"
- Complete address and contact info
- Active Pro subscription
- Timezone and currency settings

### User Profiles
1. **Owner (John Smith)**
   - Full management permissions
   - Access to all properties
   - Business setup and employee management

2. **Manager (Sarah Johnson)**
   - Property and employee management
   - Limited to assigned properties
   - Task oversight capabilities

3. **Employee (Mike Davis)**
   - Task execution focused
   - Limited property access
   - Service completion tracking

### Properties
1. **Sunset Apartments** - 24-unit complex with pool
2. **Oak Street Homes** - 8-unit townhome community  
3. **Maple Manor** - Single family home

### Tasks
- **Today's Tasks**: 3 urgent maintenance items
- **Upcoming Tasks**: 4 scheduled maintenance items over next 10 days
- **Priority Levels**: High, Medium, Low with color coding

## Development Workflow

### Current State
✅ **Authentication System**: Complete but skippable in dev mode
✅ **Mock Data**: Comprehensive realistic data set
✅ **User Role Switching**: Easy testing of different user experiences
✅ **Dashboard**: Functional with real data display
✅ **Responsive Design**: Works on desktop and mobile

### Ready for Feature Development
With authentication working and mock data in place, we can now focus on:

1. **Property Management Features**
   - Property CRUD operations
   - Photo upload and management
   - Service item tracking
   - Google Maps integration

2. **Task Management System**
   - Task creation and assignment
   - Status tracking and updates
   - Photo documentation
   - Geolocation verification

3. **Employee Management**
   - Team member CRUD
   - Schedule management
   - Performance tracking
   - Communication tools

## Usage Instructions

### Enable Development Mode
1. Set `DEVELOPMENT_MODE = true` in `app.routes.ts`
2. Set `isDevelopmentMode = true` in `dashboard.component.ts`
3. Start the development server: `ionic serve`

### Switch User Roles
1. Look for the "Development Mode" orange card in the top-right
2. Click "Owner", "Manager", or "Employee" buttons to switch roles
3. Dashboard content updates automatically based on selected role

### Test Different Scenarios
- **Owner View**: See all properties and management features
- **Manager View**: Limited property access, team management
- **Employee View**: Task-focused interface, limited permissions

## Next Steps

### Phase 2: Property Management
1. Create property detail pages
2. Implement property CRUD operations
3. Add photo upload functionality
4. Integrate Google Maps for property locations
5. Build service item management

### Phase 3: Task Management  
1. Create task assignment interface
2. Build task completion workflow
3. Add photo documentation
4. Implement geolocation verification
5. Create task reporting and analytics

### Phase 4: Team Management
1. Employee onboarding system
2. Schedule management tools
3. Performance tracking
4. Communication features
5. Time tracking integration

## Technical Notes

### File Structure
```
src/app/
├── core/services/
│   └── mock-data.service.ts          # Mock data provider
├── shared/components/
│   └── dev-mode-toggle/              # Development controls
├── features/dashboard/
│   └── dashboard.component.ts        # Enhanced dashboard
└── app.routes.ts                     # Dev-friendly routing
```

### Configuration
- Development mode controlled by single flag
- Easy to disable for production builds
- Mock data service injectable throughout app
- Real services still available when needed

This setup provides a solid foundation for continued feature development while maintaining the ability to test with realistic data across different user roles.