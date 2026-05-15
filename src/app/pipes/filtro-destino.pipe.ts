import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroDestino'
})
export class FiltroDestinoPipe implements PipeTransform {

  
  transform(value: any, arg: any): any {
    if (arg === '' || arg.length < 2) return value;
    const resultPosts = [];
    for (const post of value) {
      if (
        post.nombre.toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.pais.toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.ciudad.toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.atracciones.toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.clima.toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.idioma.toLowerCase().indexOf(arg.toLowerCase()) > -1 ||
        post.moneda.toLowerCase().indexOf(arg.toLowerCase()) > -1
      ) {
        resultPosts.push(post);
      };
      
    };
    return resultPosts;
  }

}
