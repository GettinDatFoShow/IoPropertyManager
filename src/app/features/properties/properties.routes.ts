import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/property-list/property-list.component').then(m => m.PropertyListComponent)
  }
];