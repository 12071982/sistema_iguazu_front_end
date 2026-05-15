import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { UsuarioRoutingModule } from './usuario-routing.module';
import { UsuarioListComponent } from './usuario-list/usuario-list.component';
import { UsuarioRegisterComponent } from './usuario-register/usuario-register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FiltroUsuarioPipe } from '../../../pipes/filtro-usuario.pipe';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [
    UsuarioListComponent,
    UsuarioRegisterComponent,
    FiltroUsuarioPipe
  ],
  imports: [
    CommonModule,
    UsuarioRoutingModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule
  ]
})
export class UsuarioModule { }
