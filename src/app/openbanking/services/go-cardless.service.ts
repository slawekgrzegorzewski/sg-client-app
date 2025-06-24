import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {map} from 'rxjs/operators';
import {NodrigenInstitution} from '../model/go-cardless/nodrigen-institution';
import {NodrigenPermission} from '../model/go-cardless/nodrigen-permission';
import {BankTransactionToImport} from '../model/go-cardless/bank-transaction-to-import';
import {NgEventBus} from 'ng-event-bus';
import {TRANSACTIONS_TO_IMPORT_CHANGED} from '../../general/utils/event-bus-events';

@Injectable({
  providedIn: 'root'
})
export class GoCardlessService {

  private readonly endpoint = `${environment.serviceUrl}/go_cardless`;
  private transactionsToImport: Observable<any> | null = null;


  constructor(private http: HttpClient, private eventBus: NgEventBus) {
  }

  listInstitutions(country: string): Observable<NodrigenInstitution[]> {
    return this.http.get<NodrigenInstitution[]>(`${this.endpoint}/institutions/${country}`)
      .pipe(map((data: NodrigenInstitution[]) => data.map(d => new NodrigenInstitution(d))));
  }

  getInstitutionsToRecreate(): Observable<NodrigenInstitution[]> {
    return this.http.get<NodrigenInstitution[]>(`${this.endpoint}/institutions_to_recreate`)
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
    if (this.transactionsToImport === null) {
      this.transactionsToImport = this.http.get<BankTransactionToImport[]>(`${this.endpoint}/go_cardless_transactions_to_import`)
        .pipe(map((data: BankTransactionToImport[]) => data.map(d => new BankTransactionToImport(d))));
    }
    return this.transactionsToImport;
  }

  mutuallyCancelTransactions(transactionToImport: BankTransactionToImport, otherTransactionForTransfer: BankTransactionToImport) {
    const firstId = transactionToImport.credit > 0
      ? transactionToImport.creditGoCardlessTransactionPublicId
      : transactionToImport.debitGoCardlessTransactionPublicId;
    const secondId = otherTransactionForTransfer.credit > 0
      ? otherTransactionForTransfer.creditGoCardlessTransactionPublicId
      : otherTransactionForTransfer.debitGoCardlessTransactionPublicId;
    return this.http.put<void>(`${this.endpoint}/go_cardless_transactions_to_mutually_cancel/${firstId}/${secondId}`, null)
      .pipe(tap(value => this.refreshTransactionsToImport()));
  }

  ignoreTransactions(transactionsToIgnore: BankTransactionToImport[]) {
    return this.http.put<void>(`${this.endpoint}/ignore_go_cardless_transaction/${transactionsToIgnore.map(t => t.goCardlessTransactionPublicId)}`, null)
      .pipe(tap(value => this.refreshTransactionsToImport()));
  }

  private refreshTransactionsToImport() {
    this.transactionsToImport = null;
    this.eventBus.cast(TRANSACTIONS_TO_IMPORT_CHANGED);
  }

  fetchBankAccountData(bankAccountPublicId: string) {
    return this.http.post<void>(`${this.endpoint}/fetch/${bankAccountPublicId}`, {});
  }
}
