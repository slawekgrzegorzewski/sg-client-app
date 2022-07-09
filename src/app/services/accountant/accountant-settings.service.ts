import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {map, share, tap} from 'rxjs/operators';
import {AccountantSettings} from '../../model/accountant/accountant-settings';
import {Refreshable} from '../refreshable';
import {NgEventBus} from 'ng-event-bus';

@Injectable({
  providedIn: 'root'
})
export class AccountantSettingsService extends Refreshable {

  private readonly endpoint = `${environment.serviceUrl}/accountant-settings`;

  private domainAccounts: Observable<AccountantSettings> | null = null;
  public static ACCOUNTANT_SETTINGS_CHANGED: string = 'accountant:settings:change';

  constructor(private http: HttpClient, eventBus: NgEventBus) {
    super(eventBus);
  }

  getForDomain(): Observable<AccountantSettings> {
    if (!this.domainAccounts) {
      this.domainAccounts = this.http.get<AccountantSettings>(this.endpoint).pipe(
        share(),
        map(data => new AccountantSettings(data))
      );
    }
    return this.domainAccounts;
  }

  setIsCompany(isCompany: boolean): Observable<AccountantSettings> {
    const operation = isCompany ? 'enable' : 'disable';
    return this.http.patch<AccountantSettings>(`${this.endpoint}/is-company/${operation}`, {})
      .pipe(
        map(data => new AccountantSettings(data)),
        tap(data => this.refreshData()),
        tap(data => this.eventBus.cast(AccountantSettingsService.ACCOUNTANT_SETTINGS_CHANGED))
      );
  }

  protected refreshData(): void {
    this.domainAccounts = null;
  }
}
