import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DetalleReservaRoutingModule } from './detalle-reserva-routing.module';
import { detalleReservaListComponent } from './detalle-reserva-list/detalle-reserva-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
@NgModule({
  declarations: [
    detalleReservaListComponent 
  ],
  imports: [
    CommonModule,
    DetalleReservaRoutingModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
  ]
})
export class DetalleReservaModule { }
