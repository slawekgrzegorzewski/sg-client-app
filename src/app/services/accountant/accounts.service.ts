import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Account} from '../../model/accountant/account';
import {Observable, of, throwError} from 'rxjs';
import {map} from 'rxjs/operators';
import {Currency} from '../../model/accountant/currency';
import {SettingsService} from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  private readonly accountEndpoint = `${environment.serviceUrl}/accounts`;
  private readonly currenciesEndpoint = `${environment.serviceUrl}/currencies`;

  currencies: Currency[] = [];

  constructor(private http: HttpClient,
              private settingsService: SettingsService,
              @Inject(LOCALE_ID) private defaultLocale: string) {
  }

  private fetchCurrencies(): Observable<Currency[]> {
    return this.http.get<Currency[]>(`${this.currenciesEndpoint}/${this.settingsService.getUsersLocale()}`)
      .pipe(
        map((data: Currency[]) => data.map(d => Currency.fromData(d))),
        map((data: Currency[]) => {
          this.currencies = data;
          return data;
        })
      );
  }


  allAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(this.accountEndpoint).pipe(map((data: Account[]) => data.map(d => new Account(d))));
  }

  currentDomainAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.accountEndpoint}/mine`).pipe(map((data: Account[]) => data.map(d => new Account(d))));
  }

  delete(a: Account): Observable<string> {
    return this.http.delete(`${this.accountEndpoint}/${a.id}`, {responseType: 'text'});
  }

  possibleCurrencies(): Observable<Currency[]> {
    return this.currencies === null ?
      throwError('Error during fetching currencies.') :
      (this.currencies.length === 0 ? this.fetchCurrencies() : of(this.currencies));
  }

  create(account: Account): Observable<Account> {
    return this.http.put<Account>(this.accountEndpoint, account)
      .pipe(map(a => new Account(a)));
  }

  update(account: Account): Observable<string> {
    return this.http.patch(this.accountEndpoint, account, {responseType: 'text'});
  }
}
