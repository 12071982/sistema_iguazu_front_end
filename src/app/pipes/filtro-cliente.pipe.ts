import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroCliente'
})
export class FiltroClientePipe implements PipeTransform {

  transform(value: any, arg: any): any {
    if (arg === '' || arg.length < 1) return value;
    const resultPosts = [];
    for (const post of value) {
      if (
        post.nombre.toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.apellido.toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.telefono.toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.direccion.toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.fecha_Nacimiento.toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.nacionalidad.toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.pasaporte.toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.frecuencia_Viajero.toLowerCase().indexOf(arg.toLowerCase()) > -1 
      ) {
        resultPosts.push(post);
      }
    };
    return resultPosts;
  }
}

