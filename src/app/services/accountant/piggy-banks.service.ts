import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {PiggyBank} from '../../model/accountant/piggy-bank';
import {CurrencyPipe} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PiggyBanksService {

  private readonly endpoint = `${environment.serviceUrl}/piggy-banks`;

  constructor(private http: HttpClient, private currencyPipe: CurrencyPipe) {
  }

  currentDomainPiggyBanks(): Observable<PiggyBank[]> {
    return this.http.get<PiggyBank[]>(this.endpoint)
      .pipe(map((data: PiggyBank[]) => data.map(d => new PiggyBank(this.currencyPipe, d))));
  }

  create(piggyBank: PiggyBank): Observable<number> {
    return this.http.put<number>(this.endpoint, piggyBank);
  }

  update(piggyBank: PiggyBank): Observable<string> {
    return this.http.patch(this.endpoint, piggyBank, {responseType: 'text'});
  }

}
