import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path:'rol',
    loadChildren:() => import("./roles/roles.module").then(x => x.RolesModule)
  },  
  {
    path:'paquete',
    loadChildren:() => import("./paquete/paquete.module").then(x => x.PaqueteModule)
  },  
  {
    path:'cliente',
    loadChildren:() => import("./clientes/clientes.module").then(x => x.ClientesModule)
  },
  {
    path:'destino',
    loadChildren:() => import("./destino/destino.module").then(x => x.DestinoModule)
  },
  {
    path:'usuario',
    loadChildren:() => import("./usuario/usuario.module").then(x => x.UsuarioModule)
  },  
  {
    path:'reserva',
    loadChildren:() => import("./reservas/reservas.module").then(x => x.ReservasModule)
  },
  {
    path:'pago',
    loadChildren:() => import("./detalle-reserva/detalle-reserva.module").then(x => x.DetalleReservaModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MantenimientoRoutingModule { }
