import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ReservasRoutingModule } from './reservas-routing.module';
import { ReservasListComponent } from './reservas-list/reservas-list.component';
import { ReservasRegisterComponent } from './reservas-register/reservas-register.component';
import { RoundPipe } from './reservas-register/reservas-register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FiltroClienteSelectPipe } from '../../../pipes/filtro-cliente-select.pipe';
import { FiltroPaqueteSelectPipe } from '../../../pipes/filtro-paquete-select.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReservasComprobanteComponent } from './reservas-comprobante/reservas-comprobante.component';



@NgModule({
  declarations: [
    RoundPipe,
    ReservasListComponent,
    ReservasRegisterComponent,
    ReservasComprobanteComponent,
    FiltroClienteSelectPipe,
    FiltroPaqueteSelectPipe,
  ],
  imports: [
    CommonModule,
    ReservasRoutingModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
  ]
})
export class ReservasModule { }
