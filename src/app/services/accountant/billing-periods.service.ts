import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {SettingsService} from './settings.service';
import {BillingPeriod, BillingPeriodInfo} from '../../model/accountant/billings/billing-period';
import {DatePipe} from '@angular/common';
import {Category} from '../../model/accountant/billings/category';
import {map} from 'rxjs/operators';
import {Expense} from '../../model/accountant/billings/expense';
import {Income} from '../../model/accountant/billings/income';
import {PiggyBank} from '../../model/accountant/piggy-bank';
import {Dates} from '../../../utils/dates';

@Injectable({
  providedIn: 'root'
})
export class BillingPeriodsService {
  serviceUrl: string;

  static sortMapWithDatesKeys(resultUnsorted: Map<Date, any>): Map<Date, any> {
    const resultSorted = new Map<Date, any>();
    if (resultUnsorted) {
      BillingPeriodsService.getMapWithDatesKeysSorted(resultUnsorted)
        .forEach(d => resultSorted.set(d, resultUnsorted.get(d)));
    }
    return resultSorted;
  }

  static getMapWithDatesKeysSorted(resultUnsorted: Map<Date, any>): Date[] {
    let dates: Date[] = [];
    if (resultUnsorted) {
      for (const date of resultUnsorted.keys()) {
        dates.push(date);
      }
    }
    dates = dates.sort(Dates.compareDates);
    return dates;
  }

  constructor(private http: HttpClient,
              private settingsService: SettingsService,
              private datePipe: DatePipe,
              @Inject(LOCALE_ID) private defaultLocale: string) {
    this.serviceUrl = environment.serviceUrl;
  }

  currentBillingPeriod(): Observable<BillingPeriodInfo> {
    return this.http.get<BillingPeriodInfo>(environment.serviceUrl + '/billing-periods')
      .pipe(map(d => new BillingPeriodInfo(d)));
  }

  billingPeriodFor(date: Date): Observable<BillingPeriodInfo> {
    return this.http.get<BillingPeriodInfo>(environment.serviceUrl + '/billing-periods/' + this.datePipe.transform(date, 'yyyy-MM'))
      .pipe(map(d => new BillingPeriodInfo(d)));
  }

  createCurrentBillingPeriod(): Observable<BillingPeriodInfo> {
    return this.http.put<BillingPeriodInfo>(environment.serviceUrl + '/billing-periods', null)
      .pipe(map(d => new BillingPeriodInfo(d)));
  }

  createBillingPeriodFor(date: Date): Observable<BillingPeriodInfo> {
    return this.http.put<BillingPeriodInfo>(environment.serviceUrl + '/billing-periods/' + this.datePipe.transform(date, 'yyyy-MM'), null)
      .pipe(map(d => new BillingPeriodInfo(d)));
  }

  finishBillingPeriod(period: BillingPeriod): Observable<BillingPeriodInfo> {
    return this.finishBillingPeriodOf(period.period);
  }

  finishBillingPeriodOf(date: Date): Observable<BillingPeriodInfo> {
    return this.http.get<BillingPeriodInfo>(environment.serviceUrl + '/billing-periods/' + this.datePipe.transform(date, 'yyyy-MM') + '/finish')
      .pipe(map(d => new BillingPeriodInfo(d)));
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

  createBillingElement(element: Income | Expense, accountId: number): Observable<string> {
    if (element instanceof Income) {
      return this.http.put<string>(environment.serviceUrl + '/billing-periods/income/' + accountId, element);
    } else {
      return this.http.put<string>(environment.serviceUrl + '/billing-periods/expense/' + accountId, element);
    }
  }

  getHistoricalSavings(noOfMonths: number): Observable<Map<Date, Map<string, number>>> {
    return this.http.get<Map<Date, Map<string, number>>>(environment.serviceUrl + '/month-summaries/savings/' + noOfMonths)
      .pipe(map(d => {
        const resultUnsorted = new Map<Date, Map<string, number>>();
        Object.entries(d).forEach(value => {
          const key = new Date(value[0]);
          const entry = resultUnsorted.get(key) || new Map<string, number>();
          Object.entries<number>(value[1]).forEach(v => {
            entry.set(v[0], v[1]);
          });
          resultUnsorted.set(key, entry);
        });
        return BillingPeriodsService.sortMapWithDatesKeys(resultUnsorted);
      }));
  }

  getHistoricalPiggyBanks(noOfMonths: number): Observable<Map<Date, PiggyBank[]>> {
    return this.http.get<Map<Date, PiggyBank[]>>(environment.serviceUrl + '/month-summaries/piggy-banks/' + noOfMonths)
      .pipe(map(d => {
        const resultUnsorted = new Map<Date, PiggyBank[]>();
        const piggyBanksPerId = new Map<number, PiggyBank[]>();
        Object.entries(d).forEach(dateToPiggyBanks => {
          const date = new Date(dateToPiggyBanks[0]);
          const piggyBanksForDate = resultUnsorted.get(date) || [];
          dateToPiggyBanks[1].forEach(pg => {
            const piggyBank = new PiggyBank(pg);
            this.updatePerIdMap(piggyBanksPerId, piggyBank);
            piggyBanksForDate.push(piggyBank);
          });
          resultUnsorted.set(date, piggyBanksForDate);
        });
        this.makeTheSameNamesForEqualId(piggyBanksPerId);
        return BillingPeriodsService.sortMapWithDatesKeys(resultUnsorted);
      }));
  }

  private updatePerIdMap(piggyBanksPerId: Map<number, PiggyBank[]>, piggyBank: PiggyBank): void {
    const piggyBanksForId = piggyBanksPerId.get(piggyBank.id) || [];
    piggyBanksForId.push(piggyBank);
    piggyBanksPerId.set(piggyBank.id, piggyBanksForId);
  }

  private makeTheSameNamesForEqualId(piggyBanksPerId: Map<number, PiggyBank[]>): void {
    piggyBanksPerId.forEach((piggyBanksWithTheSameId, id) => {
      const commonName = piggyBanksWithTheSameId[piggyBanksWithTheSameId.length - 1].name;
      piggyBanksWithTheSameId.forEach(pb => pb.name = commonName);
    });
  }
}
