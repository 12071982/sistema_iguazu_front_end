export class TemporadaModel {
  iD_Temporada: number;
  nombre: string;
  descripcion: string;
  precioBase: number;

  constructor() {
    this.iD_Temporada = 0;
    this.nombre = '';
    this.descripcion = '';
    this.precioBase = 0;
  }
}