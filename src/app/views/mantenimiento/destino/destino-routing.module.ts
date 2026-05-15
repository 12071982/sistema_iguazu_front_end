import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DestinoListComponent } from './destino-list/destino-list.component';

const routes: Routes = [
  {
    path: '',
    component: DestinoListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DestinoRoutingModule { }
