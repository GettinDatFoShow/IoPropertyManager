import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'properties',
        loadComponent: () =>
          import('../layout/main-tabs/properties.page').then((m) => m.PropertiesPage),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('../layout/main-tabs/services.page').then((m) => m.ServicesPage),
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import('../layout/main-tabs/schedule.page').then((m) => m.SchedulePage),
      },
      {
        path: 'work-orders',
        loadComponent: () =>
          import('../features/work-orders/components/work-order-list.component').then((m) => m.WorkOrderListComponent),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('../layout/main-tabs/reports.page').then((m) => m.ReportsPage),
      },
      {
        path: 'property-detail/:id',
        loadComponent: () =>
          import('../features/properties/components/property-detail/property-detail.component').then((m) => m.PropertyDetailComponent),
      },
      {
        path: 'property-form',
        loadComponent: () =>
          import('../features/properties/components/property-form/property-form.component').then((m) => m.PropertyFormComponent),
      },
      {
        path: 'property-form/:id',
        loadComponent: () =>
          import('../features/properties/components/property-form/property-form.component').then((m) => m.PropertyFormComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../features/settings/settings.component').then((m) => m.SettingsComponent),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
