export class UsuarioModel {
    iD_Usuario: number;
    nombre: string;
    apellido: string;
    correo_Electronico: string;
    password: string;
    rol: string;
    fecha_Registro: string;
    estatus: string;
    
    constructor(){
        this.iD_Usuario = 0;
        this.nombre = "";
        this.apellido = "";
        this.correo_Electronico = "";
        this.password = "";
        this.rol = "";

        // Obtener la fecha y hora actual en la zona horaria de Perú y formatearla como dd/mm/yyyy hh:mm:ss
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        const hours = today.getHours().toString().padStart(2, '0');
        const minutes = today.getMinutes().toString().padStart(2, '0');
        const seconds = today.getSeconds().toString().padStart(2, '0');

        this.fecha_Registro = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        // this.fecha_Registro = "";
        
        this.estatus = "";
    }
}
