export class ClienteModel {
    iD_Cliente: number;
    iD_Usuario: number;
    correo: string;
    apellido: string;
    telefono: string;
    nombre: string;
    direccion: string;
    fecha_Nacimiento: string;
    nacionalidad: string;
    pasaporte: string;
    frecuencia_Viajero: string;
    nombreUsuario?: string; // Propiedad opcional
  
    constructor() {
      this.iD_Cliente = 0;
      this.iD_Usuario = 0;
      this.nombre = "";
      this.apellido = "";
      this.correo = "";
      this.telefono = "";
      this.direccion = "";
      this.fecha_Nacimiento = "";
      this.nacionalidad = "";
      this.pasaporte = "";
      this.frecuencia_Viajero = "";
    }
  }
  