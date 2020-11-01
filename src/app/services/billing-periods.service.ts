import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {SettingsService} from './settings.service';
import {BillingPeriod} from '../model/billings/billing-period';
import {DatePipe} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class BillingPeriodsService {
  serviceUrl: string;

  constructor(private http: HttpClient,
              private settingsService: SettingsService,
              private datePipe: DatePipe,
              @Inject(LOCALE_ID) private defaultLocale: string) {
    this.serviceUrl = environment.serviceUrl;
  }

  currentBillingPeriod(): Observable<BillingPeriod> {
    return this.http.get<BillingPeriod>(environment.serviceUrl + '/billing-periods');
  }

  billingPeriodFor(date: Date): Observable<BillingPeriod> {
    return this.http.get<BillingPeriod>(environment.serviceUrl + '/billing-periods/' + this.datePipe.transform(date, 'yyyy-MM'));
  }

  createCurrentBillingPeriod(): Observable<BillingPeriod> {
    return this.http.put<BillingPeriod>(environment.serviceUrl + '/billing-periods', null);
  }

  createBillingPeriodFor(date: Date): Observable<BillingPeriod> {
    return this.http.put<BillingPeriod>(environment.serviceUrl + '/billing-periods/' + this.datePipe.transform(date, 'yyyy-MM'), null);
  }

}
