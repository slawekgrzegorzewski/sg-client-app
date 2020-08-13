import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Subject} from 'rxjs';
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {
  authSub = new Subject<any>();
  serviceUrl: string;

  constructor(private _http: HttpClient) {
    this.serviceUrl = environment.serviceUrl;
  }

  login(userObj: any) {
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

  logoutUser() {
    this.setToken("");
    this.authSub.next(this.isLoggedIn());
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token: string) {
    localStorage.setItem('token', token)
  }
}
