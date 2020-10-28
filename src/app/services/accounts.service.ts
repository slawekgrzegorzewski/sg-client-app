import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";
import {Account} from "../model/account";
import {Observable, of, throwError} from "rxjs";
import {Currency} from "../model/currency";
import {LoginService} from "./login.service";
import {SettingsService} from "./settings.service";

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  serviceUrl: string;
  currencies: Currency[] = [];

  constructor(private http: HttpClient,
              private settingsService: SettingsService,
              @Inject(LOCALE_ID) private defaultLocale: string) {
    this.serviceUrl = environment.serviceUrl;
    this.fetchCurrencies();
  }

  private fetchCurrencies(): void {
    this.http.get<Currency[]>(environment.serviceUrl + "/currency/all/" + this.settingsService.getUsersLocale())
      .subscribe(
        data => {
          this.currencies = data;
        },
        error => {
          this.currencies = null;
          setTimeout(() => this.fetchCurrencies(), 100);
        }
      )
  }

  allAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(environment.serviceUrl + "/accounts");
  }

  currentUserAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(environment.serviceUrl + "/accounts/mine");
  }

  delete(a: Account): Observable<string> {
    return this.http.delete(environment.serviceUrl + "/accounts/" + a.id, {responseType: 'text'});
  }

  possibleCurrencies(): Observable<Currency[]> {
    return this.currencies === null ? throwError("Error during fetching currencies.") : of(this.currencies);
  }

  create(account: Account): Observable<Account> {
    return this.http.put<Account>(environment.serviceUrl + "/accounts", account);
  }

  update(account: Account): Observable<string> {
    return this.http.patch(environment.serviceUrl + "/accounts", account, {responseType: 'text'});
  }
}
