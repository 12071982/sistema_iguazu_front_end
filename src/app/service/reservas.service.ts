import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { const_uri } from '../constantes/const_uri';
import { ReservasModel } from '../models/reservas.model';
import { SesionService } from './sesion.service';
import { ClienteModel } from '../models/clientes.model';
import { PaqueteModel } from '../models/paquete.model';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {

  url = const_uri.mant_reserva;
  constructor(
    private _http: HttpClient,
    private _sesionservice: SesionService
  ) { }

  getAll(cantidad: number = 10): Observable<ReservasModel[]> {
    const params = new HttpParams().set('cantidad', cantidad.toString());
    return this._http.get<ReservasModel[]>(this.url, { params });
  }

  create(reservas: ReservasModel): Observable<ReservasModel> {
    return this._http.post<ReservasModel>(this.url, reservas);
  }

  update(reservas: ReservasModel): Observable<ReservasModel> {
    return this._http.put<ReservasModel>(this.url, reservas)
  }

  updateEstatus(reserva: ReservasModel, cliente: ClienteModel, paquete: PaqueteModel, destino: string, moneda: string): Observable<any> {
    const body = {
      iD_Reserva: reserva.iD_Reserva,
      estatus: reserva.estatus,
      precio_Total:  reserva.precio_Total,
      correoCliente: cliente.correo,
      nombreCliente: `${cliente.nombre} ${cliente.apellido}`,
      nombrePaquete: paquete.nombre,
      destino: destino,
      fechaInicio: paquete.fecha_Inicio,
      fechaFin: paquete.fecha_Fin,
      moneda: moneda
    };
    return this._http.put(`${this.url}estatus`, body);
  }

  delete(id: number): Observable<number> {
    return this._http.delete<number>(`${this.url}${id}`);
  }

  getById(id:number){
    return this._http.get<ReservasModel[]>(`${this.url}${id}`);
  }
}