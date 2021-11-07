import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {Router} from '@angular/router';
import jwt_decode from 'jwt-decode';
import {AccountantSettingsService} from './accountant/accountant-settings.service';
import {DomainService} from './domain.service';
import {NgEventBus} from 'ng-event-bus';
import {APP_LOGIN_STATUS_EVENT, APP_LOGIN_STATUS_REQUEST_EVENT, AppLoginStatus} from '../app.module';
import {ACCOUNTANT_APP, CHECKER_APP, CUBES_APP, SYR_APP} from './applications.service';

class TokenData {
  sub: string = '';
  roles: string[] = [];
  defaultDomain: number = Number.NaN;
  exp: Date = new Date(0);
}

type ChangePasswordRequest = {
  uname: string;
  oldpass: string;
  authcode: string;
  newpass: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private readonly registerEndpoint = `${environment.serviceUrl}/register`;

  constructor(
    private http: HttpClient,
    private accountantSettingsService: AccountantSettingsService,
    private router: Router,
    private domainService: DomainService,
    private eventBus: NgEventBus
  ) {
    this.eventBus.on(APP_LOGIN_STATUS_REQUEST_EVENT).subscribe(() => {
      this.eventBus.cast(APP_LOGIN_STATUS_EVENT, new AppLoginStatus(this.isLoggedIn(), this.getDefaultDomain()));
    });
  }

  authenticate(userObj: any): Observable<HttpResponse<string>> {
    const httpHeaders = new HttpHeaders({
      'x-tfa': userObj.authcode
    });
    return this.http.post(`${environment.serviceUrl}/login`, {
      name: userObj.uname,
      pass: userObj.upass
    }, {observe: 'response', headers: httpHeaders, responseType: 'text'});
  }

  registerUser(userObj: any): Observable<HttpResponse<string>> {
    return this.http.post(this.registerEndpoint, {
      name: userObj.uname,
      pass: userObj.upass
    }, {observe: 'response', responseType: 'text'});
  }

  setup2FA(userObj: any): Observable<HttpResponse<string>> {
    return this.http.post(`${this.registerEndpoint}/setup2FA`, {
      name: userObj.uname,
      pass: userObj.upass,
      secretFor2FA: userObj.secretFor2FA
    }, {observe: 'response', responseType: 'text'});
  }

  changePassword(changePasswordObject: ChangePasswordRequest): Observable<HttpResponse<string>> {
    return this.http.post(`${this.registerEndpoint}/change-password`, {
      name: changePasswordObject.uname,
      oldpass: changePasswordObject.oldpass,
      authcode: changePasswordObject.authcode,
      newpass: changePasswordObject.newpass
    }, {observe: 'response', responseType: 'text'});
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return token !== undefined && token !== null && token !== '';
  }

  logout(): void {
    localStorage.removeItem('token');
    this.domainService.resetCurrentDomainId();
    this.eventBus.cast(APP_LOGIN_STATUS_EVENT, new AppLoginStatus(false, null));
    setTimeout(() => this.router.navigate(['/login']), 100);
  }

  login(token: string): void {
    localStorage.setItem('token', token);
    if (this.isLoggedIn()) {
      this.eventBus.cast(APP_LOGIN_STATUS_EVENT, new AppLoginStatus(true, this.getDefaultDomain()));
      setTimeout(() => this.router.navigate(['/']), 100);
      ;
    }
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  public getUserId(): number {
    const token = this.getToken();
    if (token) {
      try {
        const sub = jwt_decode<TokenData>(token).sub;
        return Number(sub.split(':')[0]);
      } catch (Error) {
        return Number.NaN;
      }
    }
    return Number.NaN;
  }

  public getUserName(): string {
    const token = this.getToken();
    if (token) {
      try {
        const sub = jwt_decode<TokenData>(token).sub;
        const split = sub.split(':');
        return sub.replace(split[0] + ':', '');
      } catch (Error) {
        return '';
      }
    }
    return '';
  }

  public getAvailableApps(): string[] {
    const apps: string[] = [];
    const token = this.getToken();
    if (token) {
      const roles = jwt_decode<TokenData>(token).roles;
      if (roles.includes('ACCOUNTANT_ADMIN') || roles.includes('ACCOUNTANT_USER')) {
        apps.push(ACCOUNTANT_APP);
      }
      if (roles.includes('CHECKER_ADMIN') || roles.includes('CHECKER_USER')) {
        apps.push(CHECKER_APP);
      }
      if (roles.includes('SYR_ADMIN') || roles.includes('SYR_USER')) {
        apps.push(SYR_APP);
      }
      if (roles.includes('CUBES')) {
        apps.push(CUBES_APP);
      }
    }
    return apps;
  }

  public containsRole(role: string): boolean {
    const token = this.getToken();
    if (token) {
      try {
        return jwt_decode<TokenData>(token).roles.includes(role);
      } catch (Error) {
        return false;
      }
    }
    return false;
  }

  public getDefaultDomain(): number | null {
    const token = this.getToken();
    if (token) {
      return jwt_decode<TokenData>(token).defaultDomain;
    }
    return null;
  }
}
