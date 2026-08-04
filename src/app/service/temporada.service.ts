import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { const_uri } from '../constantes/const_uri';
import { TemporadaModel } from '../models/temporada.model';

@Injectable({ providedIn: 'root' })
export class TemporadaService {
  url = const_uri.mant_temporada;

  constructor(private _http: HttpClient) {}

  getAll(): Observable<TemporadaModel[]> {
    return this._http.get<TemporadaModel[]>(this.url);
  }

  getById(id: number): Observable<TemporadaModel> {
    return this._http.get<TemporadaModel>(`${this.url}/${id}`);
  }
}