import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { const_uri } from '../constantes/const_uri';
import { ClienteModel } from '../models/clientes.model';
import { SesionService } from './sesion.service';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  url = const_uri.mant_cliente;

  constructor(
    private _http: HttpClient,
    private _sesionservice: SesionService
  ) { }

  getAll(cantidad: number = 10): Observable<ClienteModel[]> {
    const params = new HttpParams().set('cantidad', cantidad.toString());
    return this._http.get<ClienteModel[]>(this.url, { params });
  }
  
  create(clientes: ClienteModel): Observable<ClienteModel> {
    return this._http.post<ClienteModel>(this.url, clientes);
  }

  update(clientes: ClienteModel): Observable<ClienteModel> {
    return this._http.put<ClienteModel>(this.url, clientes);
  }

  delete(id: number): Observable<number> {
    return this._http.delete<number>(`${this.url}${id}`);
  }
  
  getById(id: number): Observable<ClienteModel> {
    return this._http.get<ClienteModel>(`${this.url}${id}`);
  }
}
