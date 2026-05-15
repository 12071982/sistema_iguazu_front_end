import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroPaqueteSelect'
})
export class FiltroPaqueteSelectPipe implements PipeTransform {

  transform(value: any, arg: any): any {
    if (arg === '' || arg.length < 2) return value;
    const resultPosts = [];
    for (const post of value) {
      if (
        post.nombre.toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.descripcion.toLowerCase().indexOf(arg.toLowerCase()) > -1 || 
        post.duracion.toLowerCase().indexOf(arg.toLowerCase()) > -1 || 
        post.precio_Base.toString().toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.tipo.toString().toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.fecha_Inicio.toString().toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.fecha_Fin.toString().toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.inclusiones.toString().toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.exclusiones.toLowerCase().indexOf(arg.toLowerCase()) > -1
      ) {
        resultPosts.push(post);
      }
      
    };
    return resultPosts;
    
  }
}
