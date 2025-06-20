import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Account} from '../../accountant/model/account';
import {BankAccount} from '../model/bank-account';

@Injectable({
  providedIn: 'root'
})
export class BanksService {

  private readonly endpoint = `${environment.serviceUrl}/banks`;


  constructor(private http: HttpClient) {
  }

  getBankAccountsNotAssignedToAnyAccount(): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${this.endpoint}/account_to_assign`)
      .pipe(map((data: BankAccount[]) => data.map(ba => new BankAccount(ba))));
  }

  assignBankAccountToAnAccount(account: Account, bankAccount: BankAccount): Observable<void> {
    return this.http.put<void>(`${this.endpoint}/${bankAccount.publicId}`, account.id);
  }

  fetchAllTransactions(): Observable<void> {
    return this.http.post<void>(`${this.endpoint}/transactions`, {});
  }

  fetchAllBalances(): Observable<void> {
    return this.http.post<void>(`${this.endpoint}/balances`, {});
  }
}
