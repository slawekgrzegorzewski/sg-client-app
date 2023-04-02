import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Account} from '../model/account';
import {Observable} from 'rxjs';
import {map, share, tap} from 'rxjs/operators';
import {Currency} from '../model/currency';
import {SettingsService} from './settings.service';
import {Refreshable} from '../../general/services/refreshable';
import {NgEventBus} from 'ng-event-bus';
import {ACCOUNTS_CHANGED} from '../../general/utils/event-bus-events';

@Injectable({
  providedIn: 'root'
})
export class AccountsService extends Refreshable {

  private readonly accountEndpoint = `${environment.serviceUrl}/accounts`;
  private readonly currenciesEndpoint = `${environment.serviceUrl}/currencies`;

  allAccountsObservable: Observable<Account[]> | null = null;
  currenciesObservable: Observable<Currency[]> | null = null;
  usersAccounts: Observable<Account[]> | null = null;

  constructor(private http: HttpClient,
              private settingsService: SettingsService,
              eventBus: NgEventBus,
              @Inject(LOCALE_ID) private defaultLocale: string) {
    super(eventBus);
    this.eventBus.on(ACCOUNTS_CHANGED).subscribe(md => this.refreshIP());
  }


  allAccounts(): Observable<Account[]> {
    if (this.allAccountsObservable === null) {
      this.allAccountsObservable = this.http.get<Account[]>(this.accountEndpoint)
        .pipe(
          share(),
          map((data: Account[]) => data.map(d => new Account(d))));
    }
    return this.allAccountsObservable;
  }

  currencies(): Observable<Currency[]> {
    if (this.currenciesObservable === null) {
      this.currenciesObservable = this.http.get<Currency[]>(`${this.currenciesEndpoint}/${this.settingsService.getUsersLocale()}`)
        .pipe(
          share(),
          map((data: Currency[]) => data.map(d => Currency.fromData(d)))
        );
    }
    return this.currenciesObservable;
  }

  currentDomainAccounts(): Observable<Account[]> {
    if (this.usersAccounts === null) {
      this.usersAccounts = this.http.get<Account[]>(`${this.accountEndpoint}/mine`)
        .pipe(
          share(),
          map((data: Account[]) => data.map(d => new Account(d))));
    }
    return this.usersAccounts;
  }

  delete(a: Account): Observable<string> {
    return this.http.delete(`${this.accountEndpoint}/${a.id}`, {responseType: 'text'})
      .pipe(
        tap(d => {
          this.allAccountsObservable = null;
          this.usersAccounts = null;
        })
      );
  }

  create(account: Account): Observable<Account> {
    return this.http.put<Account>(this.accountEndpoint, account)
      .pipe(
        tap(d => {
          this.allAccountsObservable = null;
          this.usersAccounts = null;
        }),
        map(a => new Account(a)));
  }

  update(account: Account): Observable<string> {
    return this.http.patch(this.accountEndpoint, account, {responseType: 'text'})
      .pipe(
        tap(d => {
          this.allAccountsObservable = null;
          this.usersAccounts = null;
        })
      );
  }

  protected refreshIP(): void {
    this.allAccountsObservable = null;
    this.currenciesObservable = null;
    this.usersAccounts = null;
  }
}
