import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Account} from '../../model/accountant/account';
import {Observable} from 'rxjs';
import {Transaction, TransactionDTO} from '../../model/accountant/transaction';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  private readonly endpoint = `${environment.serviceUrl}/transactions`;

  constructor(private http: HttpClient) {
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

  transferWithConversion(account: Account, targetAccount: Account, amount: number, targetAmount: number, description: string,
                         rate: number): Observable<Transaction> {
    return this.http.post<TransactionDTO>(
      `${this.endpoint}/transfer_with_conversion/${account.id}/${targetAccount.id}/${amount}/${targetAmount}/${rate}`,
      description,
      {responseType: 'json'}
    )
      .pipe(map(d => new Transaction(d)));
  }
}
