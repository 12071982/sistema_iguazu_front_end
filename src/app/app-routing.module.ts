import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guard/auth.guard';

const routes: Routes = [

  //ya tenemos configurado lo que es lazy loading
  {
    path: '',
    loadChildren: () => import("./views/auth/auth.module").then(x => x.AuthModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import("./views/dasboard/dasboard.module").then(x => x.DasboardModule)
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
