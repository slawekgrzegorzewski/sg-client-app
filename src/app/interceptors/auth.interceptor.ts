import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {LoginService} from '../services/login.service';
import {Router} from '@angular/router';
import {catchError, map} from 'rxjs/operators';
import {DomainService} from '../services/domain.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private loginService: LoginService, private domainService: DomainService, private router: Router) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.loginService.getToken()) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.loginService.getToken()}`
        }
      });
    }

    return next.handle(request).pipe(
      map(evt => {
        if (evt instanceof HttpResponse) {
          if (evt.body && evt.status === 200 && evt.body.toString().startsWith('Authorization: Bearer ')) {
            this.loginService.login(evt.body.replace('Authorization: Bearer ', ''));
            return evt.clone({
              body: 'Login successfull'
            });
          }
          return evt;
        }
      }),
      catchError(err => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          this.domainService.resetCurrentDomainId();
          this.loginService.logout();
        }
        return throwError(err);
      })
    );
  }
}
