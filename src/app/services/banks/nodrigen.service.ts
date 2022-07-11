import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {map} from 'rxjs/operators';
import {NodrigenInstitution} from '../../model/banks/nodrigen/nodrigen-institution';
import {NodrigenPermission} from '../../model/banks/nodrigen/nodrigen-permission';
import {MatchingMode, BankTransactionToImport} from '../../model/banks/nodrigen/bank-transaction-to-import';
import {NgEventBus} from 'ng-event-bus';
import {BILLING_PERIOD_CHANGED, PIGGY_BANKS_CHANGED} from '../../app.module';

@Injectable({
  providedIn: 'root'
})
export class NodrigenService {

  private readonly endpoint = `${environment.serviceUrl}/nodrigen`;


  constructor(private http: HttpClient, private eventBus: NgEventBus) {
  }

  listInstitutions(country: string): Observable<NodrigenInstitution[]> {
    return this.http.get<NodrigenInstitution[]>(`${this.endpoint}/institutions/${country}`)
      .pipe(map((data: NodrigenInstitution[]) => data.map(d => new NodrigenInstitution(d))));
  }

  getPermissionsGranted(): Observable<NodrigenPermission[]> {
    return this.http.get<NodrigenPermission[]>(`${this.endpoint}/permissions/granted`)
      .pipe(map((data: NodrigenPermission[]) => data.map(d => new NodrigenPermission(d))));
  }

  getPermissionsToProcess(): Observable<NodrigenPermission[]> {
    return this.http.get<NodrigenPermission[]>(`${this.endpoint}/permissions/to_proccess`)
      .pipe(map((data: NodrigenPermission[]) => data.map(d => new NodrigenPermission(d))));
  }

  startPermissionRequest(institutionId: string, maxHistoricalDays: number, redirect: string, userLanguage: string): Observable<NodrigenPermission[]> {
    const body = {
      institutionId: institutionId,
      maxHistoricalDays: maxHistoricalDays,
      redirect: redirect,
      userLanguage: userLanguage
    };
    return this.http.post<NodrigenPermission[]>(`${this.endpoint}/permissions`, body)
      .pipe(map((data: NodrigenPermission[]) => data.map(d => new NodrigenPermission(d))));
  }

  confirmPermission(reference: string): Observable<string> {
    return this.http.put(`${this.endpoint}/permissions`, reference, {responseType: 'text'});
  }

  getNodrigenTransactionsToImport(): Observable<BankTransactionToImport[]> {
    return this.http.get<BankTransactionToImport[]>(`${this.endpoint}/nodrigen_transaction_to_import`)
      .pipe(map((data: BankTransactionToImport[]) => data.map(d => new BankTransactionToImport(d))));
  }

  matchNodrigenTransactionsToImport(nodrigenTransaction: number, financialTransaction: number, matchingMode: MatchingMode): Observable<BankTransactionToImport[]> {
    return this.http.put<BankTransactionToImport[]>(
      `${this.endpoint}/nodrigen_transaction_to_import/${nodrigenTransaction}/${financialTransaction}/${matchingMode}`,
      null)
      .pipe(map((data: BankTransactionToImport[]) => data.map(d => new BankTransactionToImport(d))));
  }

  matchNodrigenTransactionsToImportWithInternal(nodrigenTransactions: [number, number], financialTransaction: number) {
    return this.http.put<BankTransactionToImport[]>(
      `${this.endpoint}/nodrigen_transactions_to_import/${nodrigenTransactions[0]}/${nodrigenTransactions[1]}/${financialTransaction}`,
      null)
      .pipe(map((data: BankTransactionToImport[]) => data.map(d => new BankTransactionToImport(d))));
  }

  mutuallyCancelTransactions(transactionToImport: BankTransactionToImport, otherTransactionForTransfer: BankTransactionToImport) {
    const firstId = transactionToImport.credit > 0
      ? transactionToImport.creditNodrigenTransactionId
      : transactionToImport.debitNodrigenTransactionId;
    const secondId = otherTransactionForTransfer.credit > 0
      ? otherTransactionForTransfer.creditNodrigenTransactionId
      : otherTransactionForTransfer.debitNodrigenTransactionId;
    return this.http.put<BankTransactionToImport[]>(`${this.endpoint}/nodrigen_transactions_to_mutually_cancel/${firstId}/${secondId}`, null)
      .pipe(
        map((data: BankTransactionToImport[]) => data.map(d => new BankTransactionToImport(d))),
        tap(data => {
          this.eventBus.cast(BILLING_PERIOD_CHANGED);
          this.eventBus.cast(PIGGY_BANKS_CHANGED);
        })
      );
  }
}
