import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";
import {Account} from "../model/account";
import {Observable} from "rxjs";
import {Currency} from "../model/currency";
import {Transaction} from "../model/transaction";

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  serviceUrl: string;
  currencies: Currency[] = [];

  constructor(private http: HttpClient) {
    this.serviceUrl = environment.serviceUrl;
  }

  allUsersTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(
      environment.serviceUrl + "/transactions",
      {responseType: 'json'}
    );
  }

  credit(account: Account, amount: number, description: string): Observable<Transaction> {
    return this.http.post<Transaction>(
      environment.serviceUrl + "/transactions/credit/" + account.id + "/" + amount,
      description,
      {responseType: 'json'}
    );
  }

  debit(account: Account, amount: number, description: string) {
    return this.http.post<Transaction>(
      environment.serviceUrl + "/transactions/debit/" + account.id + "/" + amount,
      description,
      {responseType: 'json'}
    );
  }

  transfer(account: Account, targetAccount: Account, amount: number, description: string) {
    return this.http.post<Transaction>(
      environment.serviceUrl + "/transactions/transfer/" + account.id + "/" + targetAccount.id + "/" + amount,
      description,
      {responseType: 'json'}
    );
  }

  transferWithConversion(account: Account, targetAccount: Account, amount: number, targetAmount: number, description: string, rate: number) {
    return this.http.post<Transaction>(
      environment.serviceUrl + "/transactions/transfer_with_conversion/" + account.id + "/" + targetAccount.id + "/" + amount + "/" + targetAmount + "/" + rate,
      description,
      {responseType: 'json'}
    );
  }
}
