import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaqueteListComponent } from './paquete-list/paquete-list.component';

const routes: Routes = [
  {
    path: '',
    component: PaqueteListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaqueteRoutingModule { }
