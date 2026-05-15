import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { const_uri } from '../constantes/const_uri';
import { PaqueteModel } from '../models/paquete.model';

@Injectable({
  providedIn: 'root'
})
export class PaqueteService {

  url = const_uri.mant_paquete;
  constructor(
    private _http: HttpClient
  ) { }

  getAll(cantidad: number = 10): Observable<PaqueteModel[]> {
    const params = new HttpParams().set('cantidad', cantidad.toString());
    return this._http.get<PaqueteModel[]>(this.url, { params });
  }

  getById(id: number): Observable<PaqueteModel> {
    return this._http.get<PaqueteModel>(`${this.url}${id}`);
  }

  create(paquete: PaqueteModel): Observable<PaqueteModel> {
    return this._http.post<PaqueteModel>(this.url, paquete);
  }

  update(paquete: PaqueteModel): Observable<PaqueteModel> {
    return this._http.put<PaqueteModel>(this.url, paquete);
  }

  delete(id: number): Observable<number> {
    return this._http.delete<number>(`${this.url}${id}`);
  }
}
