import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {SettingsService} from './settings.service';
import {BillingPeriod} from '../model/billings/billing-period';
import {DatePipe} from '@angular/common';
import {Category} from '../model/billings/category';
import {map} from 'rxjs/operators';
import {Expense} from '../model/billings/expense';
import {Income} from '../model/billings/income';

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
    return this.http.get<BillingPeriod>(environment.serviceUrl + '/billing-periods')
      .pipe(map(d => new BillingPeriod(d)));
  }

  billingPeriodFor(date: Date): Observable<BillingPeriod> {
    return this.http.get<BillingPeriod>(environment.serviceUrl + '/billing-periods/' + this.datePipe.transform(date, 'yyyy-MM'))
      .pipe(map(d => new BillingPeriod(d)));
  }

  createCurrentBillingPeriod(): Observable<BillingPeriod> {
    return this.http.put<BillingPeriod>(environment.serviceUrl + '/billing-periods', null)
      .pipe(map(d => new BillingPeriod(d)));
  }

  createBillingPeriodFor(date: Date): Observable<BillingPeriod> {
    return this.http.put<BillingPeriod>(environment.serviceUrl + '/billing-periods/' + this.datePipe.transform(date, 'yyyy-MM'), null)
      .pipe(map(d => new BillingPeriod(d)));
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(environment.serviceUrl + '/billing-periods/categories')
      .pipe(map(data => (data.map(d => new Category(d)))));
  }

  updateCategory(category: Category): Observable<Category> {
    return this.putCategory(category);
  }

  createCategory(category: Category): Observable<Category> {
    return this.putCategory(category);
  }

  private putCategory(category: Category): Observable<Category> {
    return this.http.put(environment.serviceUrl + '/billing-periods/categories', category)
      .pipe(map(d => new Category(d)));
  }

  createBillingElement(period: BillingPeriod, element: Income | Expense, accountId: number): Observable<string> {
    if (element instanceof Income) {
      return this.http.put<string>(environment.serviceUrl + '/billing-periods/' + period.id + '/income/' + accountId, element);
    } else {
      return this.http.put<string>(environment.serviceUrl + '/billing-periods/' + period.id + '/expense/' + accountId, element);
    }
  }
}
