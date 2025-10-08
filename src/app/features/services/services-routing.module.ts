import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ServiceRequestListComponent } from './components/service-request-list/service-request-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'requests',
    pathMatch: 'full'
  },
  {
    path: 'requests',
    component: ServiceRequestListComponent
  },
  // Future routes
  // {
  //   path: 'requests/create',
  //   component: ServiceRequestCreateComponent
  // },
  // {
  //   path: 'requests/:id',
  //   component: ServiceRequestDetailComponent
  // },
  // {
  //   path: 'requests/:id/edit',
  //   component: ServiceRequestEditComponent
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicesRoutingModule { }