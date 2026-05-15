import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroUsuario'
})
export class FiltroUsuarioPipe implements PipeTransform {

  transform(value: any, arg: any): any {
    if (arg === '' || arg.length < 2) return value;

    const resultPosts = [];

    for (const post of value) {
      if (
        post.nombre.toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.apellido.toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.correo_Electronico.toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.rol.toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.fecha_Registro.toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.estatus.toLowerCase().indexOf(arg.toLowerCase()) > -1
      ) {
        resultPosts.push(post);
      }
    }

    return resultPosts;
  }

}
