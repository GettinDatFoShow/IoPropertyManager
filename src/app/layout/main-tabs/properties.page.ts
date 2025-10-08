import { Component } from '@angular/core';
import { PropertyListComponent } from '../../features/properties/components/property-list/property-list.component';

@Component({
  selector: 'app-properties-page',
  template: '<app-property-list></app-property-list>',
  imports: [PropertyListComponent],
})
export class PropertiesPage {
  constructor() {}
}