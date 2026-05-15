import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ClientesRoutingModule } from './clientes-routing.module';
import { ClientesListComponent } from './clientes-list/clientes-list.component';
import { ClientesRegisterComponent } from './clientes-register/clientes-register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FiltroClientePipe } from '../../../pipes/filtro-cliente.pipe';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    ClientesListComponent,
    ClientesRegisterComponent,
    FiltroClientePipe
  ],
  imports: [
    CommonModule,
    ClientesRoutingModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule
  ]
})
export class ClientesModule { }