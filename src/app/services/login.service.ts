import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Observable, of, Subject} from 'rxjs';
import {environment} from '../../environments/environment';
import {Router} from '@angular/router';
import jwt_decode from 'jwt-decode';
import {AccountantSettings} from '../model/accountant/accountant-settings';
import {AccountantSettingsService} from './accountant/accountant-settings.service';

export const ACCOUNTANT_APP = 'Accountant';
export const CHECKER_APP = 'Checker';
export const SYR_APP = 'SYR';
export const CUBES_APP = 'Cubes';

class TokenData {
  sub: string;
  roles: string[];
  defaultDomain: number;
  exp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private readonly loginEndpoint = `${environment.serviceUrl}/login`;
  private readonly registerEndpoint = `${environment.serviceUrl}/register`;
  loginSubject = new Subject<any>();
  accountantSettings: AccountantSettings;

  constructor(
    private http: HttpClient,
    private accountantSettingsService: AccountantSettingsService,
    private router: Router
  ) {
    if (this.isLoggedIn()) {
      setTimeout(() => {
        this.fetchAccountantSettings().subscribe(data => {
          this.accountantSettings = data;
          this.loginSubject.next(true);
        }, error => this.logout());
      }, 1);
    } else {
      setTimeout(() => this.loginSubject.next(false), 500);
    }
  }

  authenticate(userObj: any): Observable<HttpResponse<string>> {
    const httpHeaders = new HttpHeaders({
      'x-tfa': userObj.authcode
    });
    return this.http.post(this.loginEndpoint, {
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

  changePassword(changePasswordObject: { uname: string; oldpass: string; authcode: string; newpass: string })
    : Observable<HttpResponse<string>> {
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
    this.resetCurrentDomainId();
    this.accountantSettings = null;
    this.loginSubject.next(false);
    setTimeout(() => this.router.navigate(['/login']), 100);
  }

  login(token: string): void {
    localStorage.setItem('token', token);
    if (this.isLoggedIn()) {
      this.fetchAccountantSettings().subscribe(data => {
          this.accountantSettings = data;
          this.loginSubject.next(true);
          setTimeout(() => this.router.navigate(['/accountant-home']), 100);
        },
        error => {
          this.logout();
        });
    }
  }

  fetchAccountantSettings(): Observable<AccountantSettings> {
    if (this.getAvailableApps().get(ACCOUNTANT_APP)) {
      return this.accountantSettingsService.getForDomain();
    } else {
      return of(null);
    }
  }

  getToken(): string {
    return localStorage.getItem('token');
  }

  isAdmin(): boolean {
    try {
      return jwt_decode<TokenData>(this.getToken()).roles.includes('ACCOUNTANT_ADMIN');
    } catch (Error) {
      return false;
    }
  }

  getUserId(): number {
    try {
      const sub = jwt_decode<TokenData>(this.getToken()).sub;
      return Number(sub.split(':')[0]);
    } catch (Error) {
      return Number.NaN;
    }
  }

  getUserName(): string {
    try {
      const sub = jwt_decode<TokenData>(this.getToken()).sub;
      const split = sub.split(':');
      return sub.replace(split[0] + ':', '');
    } catch (Error) {
      return '';
    }
  }

  getAvailableApps(): Map<string, string> {
    const apps = new Map<string, string>();
    if (this.getToken()) {
      const roles = jwt_decode<TokenData>(this.getToken()).roles;
      if (roles.includes('ACCOUNTANT_ADMIN') || roles.includes('ACCOUNTANT_USER')) {
        apps.set(ACCOUNTANT_APP, 'accountant-home');
      }
      if (roles.includes('CHECKER_ADMIN') || roles.includes('CHECKER_USER')) {
        apps.set(CHECKER_APP, 'checker-home');
      }
      if (roles.includes('SYR_ADMIN') || roles.includes('SYR_USER')) {
        apps.set(SYR_APP, 'syr-home');
      }
      if (roles.includes('CUBES')) {
        apps.set(CUBES_APP, 'cubes-home');
      }
    }
    return apps;
  }

  containsRole(role: string): boolean {
    return this.getToken() ? jwt_decode<TokenData>(this.getToken()).roles.includes(role) : false;
  }

  public getDefaultDomain(): number {
    if (this.getToken()) {
      return jwt_decode<TokenData>(this.getToken()).defaultDomain;
    }
    return null;
  }

  isAccountant(app: string): boolean {
    return app === ACCOUNTANT_APP;
  }

  isChecker(app: string): boolean {
    return app === CHECKER_APP;
  }

  isSYR(app: string): boolean {
    return app === SYR_APP;
  }

  isSYRAdmin(app: string): boolean {
    return this.isSYR(app) && this.containsRole('SYR_ADMIN');
  }

  isCubesApp(app: string): boolean {
    return app === CUBES_APP;
  }

  get currentDomainId(): number {
    let item = localStorage.getItem('domain');
    if (!item) {
      if (this.getDefaultDomain()) {
        item = this.getDefaultDomain().toString();
      }
      if (item) {
        localStorage.setItem('domain', item);
      }
    }
    return Number(item);
  }

  set currentDomainId(value: number) {
    if (value) {
      localStorage.setItem('domain', value.toString());
      window.location.reload();
    } else {
      this.resetCurrentDomainId();
    }
  }

  resetCurrentDomainId(): void {
    localStorage.removeItem('domain');
  }
}
