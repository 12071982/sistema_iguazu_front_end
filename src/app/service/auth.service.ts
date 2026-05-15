import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginRequestModel } from '../models/common/login-request.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // urlback = "https://hostingweb0-001-site4.atempurl.com/api/Auth";
  urlback = "https://localhost:7047/api/Auth";
  constructor(
    private http: HttpClient
  ) { }

  login(request: LoginRequestModel) {
    return this.http.post(this.urlback, request);
  }
}
