import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RolesRoutingModule } from './roles-routing.module';
import { RoleListComponent } from './role-list/role-list.component';
import { RoleEditRegisterComponent } from './role-edit-register/role-edit-register.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    RoleListComponent,
    RoleEditRegisterComponent
  ],
  imports: [
    CommonModule,
    RolesRoutingModule,
    FormsModule
  ]
})
export class RolesModule { }
