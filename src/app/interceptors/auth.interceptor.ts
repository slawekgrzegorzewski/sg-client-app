import {Injectable} from "@angular/core";
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {LoginServiceService} from "../services/login-service/login-service.service";
import {Router} from "@angular/router";
import {catchError, map} from "rxjs/operators";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private _loginService: LoginServiceService, private _router: Router) {
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this._loginService.getToken()) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this._loginService.getToken()}`
        }
      });
    }

    return next.handle(request)
      //   .tap(
      //   (event: HttpEvent<any>) => {
      //     if (event instanceof HttpResponse) {
      //       if (event.body && event.body.success && event.headers.has("Authorization")) {
      //         this._loginService.setToken(event.headers.get("Authorization").replace("Bearer ", ""));
      //       }
      //     }
      //   },
      //   (err: any) => {
      //     if (err instanceof HttpErrorResponse) {
      //       if (err.status === 401) {
      //         // redirect to the login route
      //         // or show a modal
      //       }
      //     }
      //   }
      // );
      .pipe(
        map(evt => {
            if (evt instanceof HttpResponse) {
              if (evt.body && evt.status === 200 && evt.body.startsWith("Authorization:Bearer ")) {
                this._loginService.setToken(evt.body.replace("Authorization:Bearer ", ""));
                this._router.navigate(["/home"]);
                return evt.clone({
                  body: "Login successfull"
                });
              }
            }
          },
        ),
        catchError(err => {
          if (err instanceof HttpErrorResponse) {
            this._loginService.setToken("");
          }
          return of(err);
        }))
    // catchError(error => {
    //   return of(error);
    // }));
  }
}
