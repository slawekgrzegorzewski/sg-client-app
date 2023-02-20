import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {BillingPeriod, BillingPeriodInfo, BillingPeriodInfoDTO} from '../model/billings/billing-period';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {Expense} from '../model/billings/expense';
import {Income} from '../model/billings/income';
import {PiggyBank} from '../model/piggy-bank';
import {DatesUtils} from '../../general/utils/dates-utils';
import {Observable, tap} from 'rxjs';
import {map} from 'rxjs/operators';
import {ACCOUNTS_CHANGED, BILLING_PERIOD_CHANGED} from '../../general/utils/event-bus-events';
import {NgEventBus} from 'ng-event-bus';
import {
  AffectedBankTransactionsToImportInfo
} from '../../openbanking/model/nodrigen/affected-bank-transactions-to-import-info';

@Injectable({
  providedIn: 'root'
})
export class BillingPeriodsService {

  private readonly billingEndpoint = `${environment.serviceUrl}/billing-periods`;
  private readonly summariesEndpoint = `${environment.serviceUrl}/month-summaries`;

  constructor(private http: HttpClient,
              private datePipe: DatePipe,
              private currencyPipe: CurrencyPipe,
              private eventBus: NgEventBus,
              @Inject(LOCALE_ID) private defaultLocale: string) {

    this.eventBus.on(BILLING_PERIOD_CHANGED).subscribe(md => /*this.refreshData()*/ {
    });
  }


  currentBillingPeriod(): Observable<BillingPeriodInfo> {
    return this.http.get<BillingPeriodInfoDTO>(this.billingEndpoint)
      .pipe(map((d: Partial<BillingPeriodInfoDTO>) => new BillingPeriodInfo(d)));
  }

  billingPeriodFor(date: Date): Observable<BillingPeriodInfo> {
    return this.http.get<BillingPeriodInfoDTO>(
      `${this.billingEndpoint}/${this.datePipe.transform(date, 'yyyy-MM')}`)
      .pipe(map((d: Partial<BillingPeriodInfoDTO>) => new BillingPeriodInfo(d)));
  }

  createCurrentBillingPeriod(): Observable<BillingPeriodInfo> {
    return this.createBillingPeriod(this.billingEndpoint);
  }

  createBillingPeriodFor(date: Date): Observable<BillingPeriodInfo> {
    return this.createBillingPeriod(`${this.billingEndpoint}/${this.datePipe.transform(date, 'yyyy-MM')}`);
  }

  private createBillingPeriod(url: string): Observable<BillingPeriodInfo> {
    return this.http.put<BillingPeriodInfoDTO>(url, null).pipe(map((d: Partial<BillingPeriodInfoDTO>) => new BillingPeriodInfo(d)));
  }

  finishBillingPeriod(period: BillingPeriod): Observable<BillingPeriodInfo> {
    return this.finishBillingPeriodOf(period.period);
  }

  finishBillingPeriodOf(date: Date): Observable<BillingPeriodInfo> {
    const dateString = this.datePipe.transform(date, 'yyyy-MM');
    const url = `${this.billingEndpoint}/${dateString}/finish`;
    return this.http.patch<BillingPeriodInfoDTO>(url, {responseType: 'json'}).pipe(map((d: Partial<BillingPeriodInfoDTO>) => new BillingPeriodInfo(d)));
  }

  createBillingElement(element: Income | Expense, accountId: number): Observable<string> {
    if (element instanceof Income) {
      return this.http.put<string>(`${this.billingEndpoint}/income/${accountId}`, element);
    } else {
      return this.http.put<string>(`${this.billingEndpoint}/expense/${accountId}`, element);
    }
  }

  createBillingElementWithImportingBankTransaction(element: Income | Expense, accountId: number, affectedBankTransactionsToImportInfo: AffectedBankTransactionsToImportInfo): Observable<string> {
    let observable: Observable<string> | null;
    const creditTransactionId = affectedBankTransactionsToImportInfo.creditTransactions.length > 0 ? affectedBankTransactionsToImportInfo.creditTransactions[0] : null;
    const debitTransactionId = affectedBankTransactionsToImportInfo.debitTransactions.length > 0 ? affectedBankTransactionsToImportInfo.debitTransactions[0] : null;

    function alignmentTransactionIdPart(id: number | null) {
      return id ? ('/' + id.toString()) : '';
    }

    if (element instanceof Income) {
      observable = this.http.put(
        `${this.billingEndpoint}/income/${accountId}/${creditTransactionId}${alignmentTransactionIdPart(debitTransactionId)}`,
        element,
        {responseType: 'text'});
    } else {
      observable = this.http.put(
        `${this.billingEndpoint}/expense/${accountId}/${debitTransactionId}${alignmentTransactionIdPart(creditTransactionId)}`,
        element,
        {responseType: 'text'});
    }
    return observable.pipe(tap(data => this.onUpdate()));
  }

  private onUpdate() {
    this.eventBus.cast(BILLING_PERIOD_CHANGED);
    this.eventBus.cast(ACCOUNTS_CHANGED);
  }

  getHistoricalSavings(noOfMonths: number): Observable<Map<Date, Map<string, number>>> {
    const url = `${this.summariesEndpoint}/savings/${noOfMonths}`;
    return this.http.get<Map<Date, Map<string, number>>>(url)
      .pipe(map((d: any) => {
        const resultUnsorted = new Map<Date, Map<string, number>>();
        Object.entries(d).forEach((value: any[]) => {
          const key = new Date(value[0]);
          const entry = resultUnsorted.get(key) || new Map<string, number>();
          Object.entries<number>(value[1]).forEach(v => {
            entry.set(v[0], v[1]);
          });
          resultUnsorted.set(key, entry);
        });
        return DatesUtils.sortMapWithDatesKeys(resultUnsorted);
      }));
  }

  getHistoricalPiggyBanks(noOfMonths: number): Observable<Map<Date, PiggyBank[]>> {
    const url = `${this.summariesEndpoint}/piggy-banks/${noOfMonths}`;
    return this.http.get<Map<Date, PiggyBank[]>>(url)
      .pipe(map((d: any) => {
        const resultUnsorted = new Map<Date, PiggyBank[]>();
        const piggyBanksPerId = new Map<number, PiggyBank[]>();
        Object.entries(d).forEach((dateToPiggyBanks: any[]) => {
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
        return DatesUtils.sortMapWithDatesKeys(resultUnsorted);
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
