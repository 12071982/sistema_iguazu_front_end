import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DestinoRoutingModule } from './destino-routing.module';
import { DestinoListComponent } from './destino-list/destino-list.component';
import { DestinoRegisterComponent } from './destino-register/destino-register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FiltroDestinoPipe } from '../../../pipes/filtro-destino.pipe';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    DestinoListComponent,
    DestinoRegisterComponent,
    FiltroDestinoPipe
  ],
  imports: [
    CommonModule,
    DestinoRoutingModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule
  ]
})
export class DestinoModule { }

