import { PaqueteModel } from './paquete.model';
import { TemporadaModel } from './temporada.model';

export class PaqueteTemporadaModel {
  iD_PaqueteTemporada: number;
  iD_Paquete: number;
  iD_Temporada: number;


  // Propiedades de navegación (opcionales)
  paquete?: PaqueteModel;
  temporada?: TemporadaModel;

  constructor() {
    this.iD_PaqueteTemporada = 0;
    this.iD_Paquete = 0;
    this.iD_Temporada = 0;
  }
}