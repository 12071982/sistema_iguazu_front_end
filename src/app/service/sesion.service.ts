import { Injectable } from '@angular/core';
import { UsuarioModel } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class SesionService {

  constructor() { }

  setVariableSesion(token: string, user: UsuarioModel) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }

  getvariableSesion(variable: string) {
    return localStorage.getItem(variable);
  }

  getUser(): UsuarioModel | null {
    let user = localStorage.getItem("user");
    if (user) {
      return JSON.parse(user) as UsuarioModel;
    }
    return null;
  }
}
