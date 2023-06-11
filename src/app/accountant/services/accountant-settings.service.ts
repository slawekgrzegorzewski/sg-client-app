import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {AccountantSettings} from '../model/accountant-settings';
import {NgEventBus} from 'ng-event-bus';
import {map, share, switchMap, tap} from 'rxjs/operators';
import {Refreshable} from '../../general/services/refreshable';
import {ACCOUNTANT_SETTINGS_CHANGED} from '../../general/utils/event-bus-events';

@Injectable({
  providedIn: 'root'
})
export class AccountantSettingsService extends Refreshable {

  readonly API_URL = `${environment.serviceUrl}/accountant-settings`;

  private domainAccountantSetting: Observable<AccountantSettings> | null = null;

  constructor(private http: HttpClient, eventBus: NgEventBus) {
    super(eventBus);
  }

  getForDomain(): Observable<AccountantSettings> {
    if (!this.domainAccountantSetting) {
      this.domainAccountantSetting = this.http.get<AccountantSettings>(this.API_URL).pipe(
        share(),
        map(data => new AccountantSettings(data))
      );
    }
    return this.domainAccountantSetting;
  }

  setIsCompany(isCompany: boolean): Observable<AccountantSettings> {
    const operation = isCompany ? 'enable' : 'disable';
    return this.http.patch<AccountantSettings>(`${this.API_URL}/is-company/${operation}`, {})
      .pipe(
        map(data => new AccountantSettings(data)),
        tap(data => this.refreshData()),
        tap(data => this.eventBus.cast(ACCOUNTANT_SETTINGS_CHANGED)),
        switchMap(data => this.getForDomain())
      );
  }

  protected refreshData(): void {
    this.domainAccountantSetting = null;
  }
}
