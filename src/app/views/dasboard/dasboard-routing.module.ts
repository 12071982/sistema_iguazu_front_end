import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { WelcomeComponent } from './welcome/welcome.component';
const routes: Routes = [
  {
    path:'', component:LayoutComponent,
    children:[
      {
        path:'home', component:WelcomeComponent
      },
      {
        path:'mant',
        loadChildren:() => import("./../mantenimiento/mantenimiento.module").then(x => x.MantenimientoModule)
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DasboardRoutingModule { }
