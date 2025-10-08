import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { WorkOrdersRoutingModule } from './work-orders-routing.module';

// Services
import { WorkOrderService } from './services/work-order.service';

// Components
import { WorkOrderListComponent } from './components/work-order-list.component';

@NgModule({
  declarations: [
    // Standalone components are imported, not declared
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    WorkOrdersRoutingModule,
    WorkOrderListComponent
  ],
  providers: [
    WorkOrderService
  ],
  exports: [
    WorkOrderListComponent
  ]
})
export class WorkOrdersModule { }