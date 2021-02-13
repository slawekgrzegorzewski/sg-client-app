import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Account} from '../../model/accountant/account';
import {Observable, of, throwError} from 'rxjs';
import {Currency} from '../../model/accountant/currency';
import {SettingsService} from './settings.service';
import {flatMap, map, tap} from 'rxjs/internal/operators';
import {LoginService} from '../login.service';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  serviceUrl: string;
  currencies: Currency[] = [];

  constructor(private http: HttpClient,
              private settingsService: SettingsService,
              private loginService: LoginService,
              @Inject(LOCALE_ID) private defaultLocale: string) {
    this.serviceUrl = environment.serviceUrl;
  }

  private fetchCurrencies(): Observable<Currency[]> {
    return this.http.get<Currency[]>(environment.serviceUrl + '/currencies/' + this.settingsService.getUsersLocale())
      .pipe(map(data => data.map(d => Currency.fromData(d))))
      .pipe(map(data => {
        this.currencies = data;
        return data;
      }));
  }

  allAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(environment.serviceUrl + '/accounts')
      .pipe(map(data => data.map(d => new Account(d))));
  }

  currentUserAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(environment.serviceUrl + '/accounts/mine/' + this.loginService.currentDomainId)
      .pipe(map(data => data.map(d => new Account(d))));
  }

  delete(a: Account): Observable<string> {
    return this.http.delete(environment.serviceUrl + '/accounts/' + a.id, {responseType: 'text'});
  }

  possibleCurrencies(): Observable<Currency[]> {
    return this.currencies === null ?
      throwError('Error during fetching currencies.') :
      (this.currencies.length === 0 ? this.fetchCurrencies() : of(this.currencies));
  }

  create(account: Account): Observable<Account> {
    return this.loginService.currentDomain
      .pipe(
        tap(d => account.domain = d),
        flatMap(_ => this.http.put<Account>(environment.serviceUrl + '/accounts', account)),
        map(a => new Account(a))
      );
  }

  update(account: Account): Observable<string> {
    return this.http.patch(environment.serviceUrl + '/accounts', account, {responseType: 'text'});
  }
}
