import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {AccountantSettings} from '../../model/accountant/accountant-settings';

@Injectable({
  providedIn: 'root'
})
export class AccountantSettingsService {
  private readonly endpoint = `${environment.serviceUrl}/accountant-settings`;

  constructor(private http: HttpClient) {
  }

  getForDomain(): Observable<AccountantSettings> {
    return this.http.get<AccountantSettings>(this.endpoint)
      .pipe(map(data => new AccountantSettings(data)));
  }

  setIsCompany(isCompany: boolean): Observable<AccountantSettings> {
    const operation = isCompany ? 'enable' : 'disable';
    return this.http.patch<AccountantSettings>(`${this.endpoint}/is-company/${operation}`, {})
      .pipe(map(data => new AccountantSettings(data)));
  }
}
