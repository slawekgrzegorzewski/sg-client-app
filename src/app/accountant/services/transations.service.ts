import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Account} from '../model/account';
import {Observable} from 'rxjs';
import {Transaction, TransactionDTO} from '../model/transaction';
import {map, tap} from 'rxjs/operators';
import {NgEventBus} from 'ng-event-bus';
import {ACCOUNTS_CHANGED, TRANSACTIONS_TO_IMPORT_CHANGED} from '../../general/utils/event-bus-events';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  private readonly endpoint = `${environment.serviceUrl}/transactions`;

  constructor(private http: HttpClient, private eventBus: NgEventBus) {
  }

  domainTransactions(): Observable<Transaction[]> {
    return this.http.get<TransactionDTO[]>(this.endpoint, {responseType: 'json'})
      .pipe(map((data: TransactionDTO[]) => (data.map(d => new Transaction(d)))));
  }

  credit(account: Account, amount: number, description: string): Observable<Transaction> {
    return this.http.post<TransactionDTO>(`${this.endpoint}/credit/${account.id}/${amount}`, description, {responseType: 'json'})
      .pipe(map(d => new Transaction(d)));
  }

  debit(account: Account, amount: number, description: string): Observable<Transaction> {
    return this.http.post<TransactionDTO>(`${this.endpoint}/debit/${account.id}/${amount}`, description, {responseType: 'json'})
      .pipe(map(d => new Transaction(d)));
  }

  transfer(account: Account, targetAccount: Account, amount: number, description: string): Observable<Transaction> {
    return this.http.post<TransactionDTO>(
      `${this.endpoint}/transfer/${account.id}/${targetAccount.id}/${amount}`,
      description,
      {responseType: 'json'})
      .pipe(map(d => new Transaction(d)));
  }

  transferWithBankTransactions(account: Account, targetAccount: Account, amount: number, description: string, involvedBankTransactions: number[]): Observable<Transaction> {
    let url = `${this.endpoint}/transfer${involvedBankTransactions.length > 1 ? '' : '_cash'}/${account.id}/${targetAccount.id}/${amount}/${involvedBankTransactions[0]}`;
    if (involvedBankTransactions.length > 1) {
      url = `${url}/${involvedBankTransactions[1]}`;
    }
    return this.http.post<TransactionDTO>(url, description, {responseType: 'json'})
      .pipe(
        map(d => new Transaction(d)),
        tap(d => {
          this.eventBus.cast(ACCOUNTS_CHANGED);
          this.eventBus.cast(TRANSACTIONS_TO_IMPORT_CHANGED);
        })
      );
  }

  transferWithConversion(account: Account, targetAccount: Account, amount: number, targetAmount: number, description: string,
                         rate: number): Observable<Transaction> {
    return this.http.post<TransactionDTO>(
      `${this.endpoint}/transfer_with_conversion/${account.id}/${targetAccount.id}/${amount}/${targetAmount}/${rate}`,
      description,
      {responseType: 'json'}
    )
      .pipe(map(d => new Transaction(d)));
  }

  transferWithConversionWithBankTransactions(account: Account, targetAccount: Account, amount: number, targetAmount: number, description: string,
                                             rate: number, involvedBankTransactions: number[]): Observable<Transaction> {
    let url = `${this.endpoint}/transfer${involvedBankTransactions.length > 1 ? '' : '_cash'}_with_conversion/${account.id}/${targetAccount.id}/${amount}/${targetAmount}/${rate}/${involvedBankTransactions[0]}`;
    if (involvedBankTransactions.length > 1) {
      url = `${url}/${involvedBankTransactions[1]}`;
    }
    return this.http.post<TransactionDTO>(url, description, {responseType: 'json'})
      .pipe(
        map(d => new Transaction(d)),
        tap(d => {
          this.eventBus.cast(ACCOUNTS_CHANGED);
          this.eventBus.cast(TRANSACTIONS_TO_IMPORT_CHANGED);
        })
      );
  }
}
