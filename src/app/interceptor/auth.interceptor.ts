import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse, HttpInterceptor } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { SesionService } from '../service/sesion.service';
import { alert_error, alert_warning } from '../functions/alert-function';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private _sesionService: SesionService,
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = this._sesionService.getvariableSesion("token");
    let request = req;
    if (token) {
      request = req.clone({
        setHeaders: {
          authorization: `Bearer ${token}`,
        }
      });
    }
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        let error =  err.error;
        let firstError: boolean = false;
        let title: string = "Error en el servidor | comuniquese con el área de T.I";
        switch (err.status) {
          case 401:
            //alert("realizar proceso de refresh token");
            alert_warning(`${title} / ${error.mensaje}`);
            this.router.navigate(['']);
            break;
          case 500:

            alert_error(title, error.mensaje);
            break;
          case 404:
            alert_error(title, "404 not found");
            break;
          default:
            alert_error(title, error.mensaje);
            break;
        }
        return throwError(err);
      })
    );

  }
}

