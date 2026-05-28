import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { const_uri } from '../constantes/const_uri';
import { PaqueteTemporadaModel } from '../models/paquete-temporada.model';

@Injectable({ providedIn: 'root' })
export class PaqueteTemporadaService {
  url = const_uri.mant_paquete_temporada; // Ej: 'api/PaqueteTemporada'
  constructor(private _http: HttpClient) {}

  create(relacion: PaqueteTemporadaModel): Observable<PaqueteTemporadaModel> {
    return this._http.post<PaqueteTemporadaModel>(this.url, relacion);
  }
}