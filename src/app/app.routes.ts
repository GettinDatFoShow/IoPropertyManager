import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { BusinessGuard } from './core/guards/business.guard';

// Development mode flag - set to true to skip authentication
const DEVELOPMENT_MODE = true;

export const routes: Routes = [
  {
    path: '',
    redirectTo: DEVELOPMENT_MODE ? '/tabs/dashboard' : '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.routes)
  },
  {
    path: 'properties',
    loadChildren: () => import('./features/properties/properties.routes').then((m) => m.routes),
    canActivate: DEVELOPMENT_MODE ? [] : [AuthGuard, BusinessGuard]
  },
  {
    path: 'work-orders',
    loadChildren: () => import('./features/work-orders/work-orders-routing.module').then((m) => m.WorkOrdersRoutingModule),
    canActivate: DEVELOPMENT_MODE ? [] : [AuthGuard, BusinessGuard]
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: DEVELOPMENT_MODE ? [] : [AuthGuard, BusinessGuard]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    redirectTo: DEVELOPMENT_MODE ? '/tabs/dashboard' : '/auth/login'
  }
];
