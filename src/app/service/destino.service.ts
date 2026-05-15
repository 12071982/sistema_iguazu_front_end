import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { const_uri } from '../constantes/const_uri';
import { DestinoModel } from '../models/destino.model';
import { SesionService } from './sesion.service';

@Injectable({
  providedIn: 'root'
})

export class DestinoService {

  url = const_uri.mant_destino;
  constructor(
    private _http: HttpClient,
    private _sesionservice: SesionService
  ) { }

  getAll(cantidad: number = 10): Observable<DestinoModel[]> {
    const params = new HttpParams().set('cantidad', cantidad.toString());
    return this._http.get<DestinoModel[]>(this.url, { params });
  }

  create(destino: DestinoModel): Observable<DestinoModel> {
    return this._http.post<DestinoModel>(this.url, destino);
  }

  update(destino: DestinoModel): Observable<DestinoModel> {
    return this._http.put<DestinoModel>(this.url, destino)
  }

  delete(id: number): Observable<number> {
    return this._http.delete<number>(`${this.url}${id}`);
  }
}
