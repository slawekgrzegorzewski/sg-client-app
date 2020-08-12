import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {
  headerOptions: any = null
  token: string;

  _isLoggedIn: boolean = false
  authSub = new Subject<any>();

  constructor(private _http: HttpClient) {
  }

  loginAuth(userObj: any) {
    if (userObj.authcode) {
      console.log('Appending headers');
      this.headerOptions = new HttpHeaders({
        'x-tfa': userObj.authcode
      });
    }
    return this._http.post("http://localhost:8080/login", {
      name: userObj.uname,
      pass: userObj.upass
    }, {observe: 'response', headers: this.headerOptions, responseType: 'text'});
  }

  verifyLogin(userObj: any) {
    if (userObj.authcode) {
      console.log('Appending headers');
      this.headerOptions = new HttpHeaders({
        'x-tfa': userObj.authcode
      });
    }
    return this._http.post("http://localhost:8080/login", {
      name: userObj.uname,
      pass: userObj.upass
    }, {observe: 'response', headers: this.headerOptions, responseType: 'text'});
  }


  registerUser(userObj: any) {
    return this._http.post("http://localhost:8080/register", {
      name: userObj.uname,
      pass: userObj.upass
    }, {observe: "response", responseType: "text"});
  }

  setup2FA(userObj: any) {
    return this._http.post("http://localhost:8080/register/setup2FA", {
      name: userObj.uname,
      pass: userObj.upass,
      secretFor2FA: userObj.secretFor2FA
    }, {observe: "response", responseType: "text"});
  }

  updateAuthStatus(value: boolean) {
    this._isLoggedIn = value
    this.authSub.next(this._isLoggedIn);
    localStorage.setItem('isLoggedIn', value ? "true" : "false");
  }

  getAuthStatus() {
    this._isLoggedIn = localStorage.getItem('isLoggedIn') == "true";
    return this._isLoggedIn
  }

  logoutUser() {
    this._isLoggedIn = false;
    this.authSub.next(this._isLoggedIn);
    localStorage.setItem('isLoggedIn', "false")
  }

  getToken() {
    return this.token;
  }

  setToken(token: string) {
    this.token = token;
  }
}
