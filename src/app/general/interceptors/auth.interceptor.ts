import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {LoginService} from '../services/login.service';
import {catchError, map} from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private loginService: LoginService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.loginService.getToken()) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.loginService.getToken()}`,
          locale: navigator.language ? navigator.language : 'pl-PL',
          'X-Timezone-Id': Intl.DateTimeFormat().resolvedOptions().timeZone
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
        }
        return evt;
      }),
      catchError(err => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          this.loginService.logout();
        }
        return throwError(err);
      })
    );
  }
}
