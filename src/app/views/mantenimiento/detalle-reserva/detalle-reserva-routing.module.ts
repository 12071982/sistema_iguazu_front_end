import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { detalleReservaListComponent } from './detalle-reserva-list/detalle-reserva-list.component';

const routes: Routes = [
  {
    path: '',
    component: detalleReservaListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DetalleReservaRoutingModule { }
