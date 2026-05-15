import { DestinoModel } from './destino.model';


export class PaqueteModel {
  iD_Paquete: number;
  iD_Destino: number;
  nombre: string;
  descripcion: string;
  duracion: string;
  precio_Base: number;
  tipo: string;
  fecha_Inicio: string;
  fecha_Fin: string;
  inclusiones: string;
  exclusiones: string;
  imagen: string | null;
  
  destino?: DestinoModel;

  constructor() {
    this.iD_Paquete = 0;
    this.iD_Destino = 0;
    this.nombre = '';
    this.descripcion = '';
    this.duracion = '';
    this.precio_Base = 0;
    this.tipo = '';
    this.fecha_Inicio = '';
    this.fecha_Fin = '';
    this.inclusiones = '';
    this.exclusiones = '';
    this.imagen = '';

    this.destino = new DestinoModel();
  }
}
