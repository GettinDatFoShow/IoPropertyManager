import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkOrderListComponent } from './components/work-order-list.component';

const routes: Routes = [
  {
    path: '',
    component: WorkOrderListComponent
  }
  // Additional routes will be added here:
  // { path: 'create', component: WorkOrderCreateComponent },
  // { path: 'edit/:id', component: WorkOrderEditComponent },
  // { path: ':id', component: WorkOrderDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkOrdersRoutingModule { }