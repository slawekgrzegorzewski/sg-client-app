import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Subject} from 'rxjs';
import {environment} from "../../../environments/environment";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {
  authSub = new Subject<any>();
  serviceUrl: string;

  constructor(private _http: HttpClient, private _router: Router) {
    this.serviceUrl = environment.serviceUrl;
  }

  authenticate(userObj: any) {
    var httpHeaders = new HttpHeaders({
      'x-tfa': userObj.authcode
    });
    return this._http.post(this.serviceUrl + "/login", {
      name: userObj.uname,
      pass: userObj.upass
    }, {observe: 'response', headers: httpHeaders, responseType: 'text'});
  }

  registerUser(userObj: any) {
    return this._http.post(this.serviceUrl + "/register", {
      name: userObj.uname,
      pass: userObj.upass
    }, {observe: "response", responseType: "text"});
  }

  setup2FA(userObj: any) {
    return this._http.post(this.serviceUrl + "/register/setup2FA", {
      name: userObj.uname,
      pass: userObj.upass,
      secretFor2FA: userObj.secretFor2FA
    }, {observe: "response", responseType: "text"});
  }

  isLoggedIn(): boolean {
    let token = this.getToken();
    return token !== undefined && token !== null && token !== "";
  }

  logout() {
    this.setToken("");
  }

  login(token: string) {
    this.setToken(token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  private setToken(token: string) {
    localStorage.setItem('token', token);
    this.authSub.next(this.isLoggedIn());
    if (this.isLoggedIn()) {
      setTimeout(() => this._router.navigate(['/home']), 100)
    } else {
      setTimeout(() => this._router.navigate(['/login']), 100)
    }
  }
}
