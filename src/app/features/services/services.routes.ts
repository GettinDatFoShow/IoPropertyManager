import { Routes } from '@angular/router';
import { ServiceRequestListComponent } from './components/service-request-list/service-request-list.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'requests',
    pathMatch: 'full'
  },
  {
    path: 'requests',
    component: ServiceRequestListComponent
  }
  // Future routes will be added here:
  // {
  //   path: 'requests/create',
  //   loadComponent: () => import('./components/service-request-create/service-request-create.component')
  //     .then(m => m.ServiceRequestCreateComponent)
  // },
  // {
  //   path: 'requests/:id',
  //   loadComponent: () => import('./components/service-request-detail/service-request-detail.component')
  //     .then(m => m.ServiceRequestDetailComponent)
  // }
];