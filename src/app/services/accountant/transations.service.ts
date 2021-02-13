import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Account} from '../../model/accountant/account';
import {Observable} from 'rxjs';
import {Currency} from '../../model/accountant/currency';
import {Transaction} from '../../model/accountant/transaction';
import {map} from 'rxjs/operators';
import {LoginService} from '../login.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  serviceUrl: string;
  currencies: Currency[] = [];

  constructor(private http: HttpClient,
              private loginService: LoginService) {
    this.serviceUrl = environment.serviceUrl;
  }

  userTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(
      environment.serviceUrl + '/transactions/' + this.loginService.currentDomainId,
      {responseType: 'json'}
    )
      .pipe(map(data => (data.map(d => new Transaction(d)))));
  }

  credit(account: Account, amount: number, description: string): Observable<Transaction> {
    return this.http.post<Transaction>(
      environment.serviceUrl + '/transactions/credit/' + account.id + '/' + amount,
      description,
      {responseType: 'json'}
    )
      .pipe(map(d => new Transaction(d)));
  }

  debit(account: Account, amount: number, description: string): Observable<Transaction> {
    return this.http.post<Transaction>(
      environment.serviceUrl + '/transactions/debit/' + account.id + '/' + amount,
      description,
      {responseType: 'json'}
    )
      .pipe(map(d => new Transaction(d)));
  }

  transfer(account: Account, targetAccount: Account, amount: number, description: string): Observable<Transaction> {
    return this.http.post<Transaction>(
      environment.serviceUrl + '/transactions/transfer/' + account.id + '/' + targetAccount.id + '/' + amount,
      description,
      {responseType: 'json'}
    )
      .pipe(map(d => new Transaction(d)));
  }

  transferWithConversion(account: Account, targetAccount: Account, amount: number, targetAmount: number, description: string, rate: number): Observable<Transaction> {
    return this.http.post<Transaction>(
      environment.serviceUrl + '/transactions/transfer_with_conversion/' + account.id + '/' + targetAccount.id + '/' + amount + '/' + targetAmount + '/' + rate,
      description,
      {responseType: 'json'}
    )
      .pipe(map(d => new Transaction(d)));
  }
}
