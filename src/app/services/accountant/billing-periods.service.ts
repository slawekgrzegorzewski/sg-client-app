import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {BillingPeriod, BillingPeriodInfo, BillingPeriodInfoDTO} from '../../model/accountant/billings/billing-period';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {map} from 'rxjs/operators';
import {Expense} from '../../model/accountant/billings/expense';
import {Income} from '../../model/accountant/billings/income';
import {PiggyBank} from '../../model/accountant/piggy-bank';
import {Dates} from '../../../utils/dates';

@Injectable({
  providedIn: 'root'
})
export class BillingPeriodsService {

  private readonly billingEndpoint = `${environment.serviceUrl}/billing-periods`;
  private readonly summariesEndpoint = `${environment.serviceUrl}/month-summaries`;

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
              private datePipe: DatePipe,
              private currencyPipe: CurrencyPipe,
              @Inject(LOCALE_ID) private defaultLocale: string) {
  }


  currentBillingPeriod(): Observable<BillingPeriodInfo> {
    return this.http.get<BillingPeriodInfoDTO>(this.billingEndpoint)
      .pipe(map(d => new BillingPeriodInfo(d)));
  }

  billingPeriodFor(date: Date): Observable<BillingPeriodInfo> {
    return this.http.get<BillingPeriodInfoDTO>(
      `${this.billingEndpoint}/${this.datePipe.transform(date, 'yyyy-MM')}`)
      .pipe(map(d => new BillingPeriodInfo(d)));
  }

  createCurrentBillingPeriod(): Observable<BillingPeriodInfo> {
    return this.createBillingPeriod(this.billingEndpoint);
  }

  createBillingPeriodFor(date: Date): Observable<BillingPeriodInfo> {
    return this.createBillingPeriod(`${this.billingEndpoint}/${this.datePipe.transform(date, 'yyyy-MM')}`);
  }

  private createBillingPeriod(url: string): Observable<BillingPeriodInfo> {
    return this.http.put<BillingPeriodInfoDTO>(url, null).pipe(map(d => new BillingPeriodInfo(d)));
  }

  finishBillingPeriod(period: BillingPeriod): Observable<BillingPeriodInfo> {
    return this.finishBillingPeriodOf(period.period);
  }

  finishBillingPeriodOf(date: Date): Observable<BillingPeriodInfo> {
    const dateString = this.datePipe.transform(date, 'yyyy-MM');
    const url = `${this.billingEndpoint}/${dateString}/finish`;
    return this.http.patch<BillingPeriodInfoDTO>(url, {responseType: 'json'}).pipe(map(d => new BillingPeriodInfo(d)));
  }

  createBillingElement(element: Income | Expense, accountId: number): Observable<string> {
    if (element instanceof Income) {
      return this.http.put<string>(`${this.billingEndpoint}/income/${accountId}`, element);
    } else {
      return this.http.put<string>(`${this.billingEndpoint}/expense/${accountId}`, element);
    }
  }


  getHistoricalSavings(noOfMonths: number): Observable<Map<Date, Map<string, number>>> {
    const url = `${this.summariesEndpoint}/savings/${noOfMonths}`;
    return this.http.get<Map<Date, Map<string, number>>>(url)
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
    const url = `${this.summariesEndpoint}/piggy-banks/${noOfMonths}`;
    return this.http.get<Map<Date, PiggyBank[]>>(url)
      .pipe(map(d => {
        const resultUnsorted = new Map<Date, PiggyBank[]>();
        const piggyBanksPerId = new Map<number, PiggyBank[]>();
        Object.entries(d).forEach(dateToPiggyBanks => {
          const date = new Date(dateToPiggyBanks[0]);
          const piggyBanksForDate = resultUnsorted.get(date) || [];
          dateToPiggyBanks[1].forEach((pg: PiggyBank) => {
            const piggyBank = new PiggyBank(this.currencyPipe, pg);
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
