import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReservasRegisterComponent } from './reservas-register/reservas-register.component';

const routes: Routes = [
  {
    path: '',
    component: ReservasRegisterComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReservasRoutingModule { }
