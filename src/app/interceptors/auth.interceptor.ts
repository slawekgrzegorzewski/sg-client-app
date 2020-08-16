import {Injectable} from "@angular/core";
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {LoginServiceService} from "../services/login-service/login-service.service";
import {Router} from "@angular/router";
import {catchError, map} from "rxjs/operators";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private _loginService: LoginServiceService, private _router: Router) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this._loginService.getToken()) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this._loginService.getToken()}`
        }
      });
    }

    return next.handle(request).pipe(
      map(evt => {
        if (evt instanceof HttpResponse) {
          if (evt.body && evt.status === 200 && evt.body.toString().startsWith("Authorization: Bearer ")) {
            this._loginService.login(evt.body.replace("Authorization: Bearer ", ""));
            return evt.clone({
              body: "Login successfull"
            });
          }
          return evt;
        }
      }),
      catchError(err => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          this._loginService.logout();
        }
        return throwError(err);
      })
    )
  }
}
