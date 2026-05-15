import { PaqueteModel } from "./paquete.model";
import { ReservasModel } from "./reservas.model"

export class DetalleReservaModel {

    //USUARIO
    iD_Usuario: number;

    //PAGO
    iD_Pago: number;
    metodo_Pago: string;
    monto: number;
    fecha_Pago: string;
    numero_Transaccion: string;
        
    //RESERVA DATOS:
    iD_Reserva: number;
    iD_Cliente: number;
    fecha_Reserva: string;
    numero_Personas: number;
    precio_Total: number;
    estatus: string;
    observaciones: string;
    
    // PAQUETE DATOS
    iD_Paquete: number;
    nombre_paquete:string;
    descripcion_paquete:string;
    duracion_paquete:string;
    fecha_inicio_paquete:string;
    fecha_fin_paquete:string;
    precio_base_paquete:number;
    destino_paquete:string;
    moneda_paquete:string;

    paquete?:PaqueteModel;
    reservas?:ReservasModel;

    constructor(){
        this.iD_Usuario=0
        //PAGO
        this.iD_Pago=0;
        this.metodo_Pago='';
        this.monto=0;
        this.fecha_Pago='';
        this.numero_Transaccion = '';
        
        //RESERVA DATOS
        this.iD_Reserva=0;
        this.iD_Cliente=0;
        this.fecha_Reserva='';
        this.numero_Personas=0;
        this.precio_Total=0;
        this.estatus='';
        this.observaciones='';
        
        // PAQUETE DATOS
        this.iD_Paquete=0;
        this.nombre_paquete ="";
        this.descripcion_paquete ="";
        this.duracion_paquete='';
        this.fecha_inicio_paquete = '';
        this.fecha_fin_paquete = '';
        this.precio_base_paquete = 0;
        this.destino_paquete = '';
        this.moneda_paquete='';

        this.paquete=new PaqueteModel();        
        this.reservas=new ReservasModel();        
    }
}