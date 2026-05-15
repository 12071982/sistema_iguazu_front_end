import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { const_uri } from '../constantes/const_uri';
import { DetalleReservaModel } from '../models/detalleReservas.model';
import { SesionService } from './sesion.service';

@Injectable({
  providedIn: 'root'
})

export class DetallereservaService {

  url = const_uri.mant_pago;
  constructor(
    private _http: HttpClient,
    private _sesionservice: SesionService
  ) { }

  getAll(cantidad: number = 20): Observable<DetalleReservaModel[]> {
    const params = new HttpParams().set('cantidad', cantidad.toString());
    return this._http.get<DetalleReservaModel[]>(this.url, { params });
  }

  create(detallereserva: DetalleReservaModel): Observable<DetalleReservaModel> {
    return this._http.post<DetalleReservaModel>(this.url, detallereserva);
  }

  update(detallereserva: DetalleReservaModel): Observable<DetalleReservaModel> {
    return this._http.put<DetalleReservaModel>(this.url, detallereserva)
  }

  delete(id: number): Observable<number> {
    return this._http.delete<number>(`${this.url}${id}`);
  }
}
