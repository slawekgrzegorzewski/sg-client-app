import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {forkJoin, Observable} from 'rxjs';
import {debounceTime, map, share, tap} from 'rxjs/operators';
import {PiggyBank} from '../../model/accountant/piggy-bank';
import {CurrencyPipe} from '@angular/common';
import {Refreshable} from '../refreshable';
import {NgEventBus} from 'ng-event-bus';
import {supportsNpm} from '@angular/cli/utilities/package-manager';
import {BILLING_PERIOD_CHANGED, PIGGY_BANKS_CHANGED} from '../../app.module';

@Injectable({
  providedIn: 'root'
})
export class PiggyBanksService extends Refreshable {

  private readonly endpoint = `${environment.serviceUrl}/piggy-banks`;

  constructor(private http: HttpClient, private currencyPipe: CurrencyPipe, eventBus: NgEventBus) {
    super(eventBus);
    this.eventBus.on(PIGGY_BANKS_CHANGED).subscribe(md => this.refreshData());
  }

  private currentDomainPiggyBanksObservable: Observable<PiggyBank[]> | null = null;

  currentDomainPiggyBanks(): Observable<PiggyBank[]> {
    if (this.currentDomainPiggyBanksObservable === null) {
      this.currentDomainPiggyBanksObservable = this.http.get<PiggyBank[]>(this.endpoint)
        .pipe(
          share(),
          map((data: PiggyBank[]) => data.map(d => new PiggyBank(this.currencyPipe, d))));
    }
    return this.currentDomainPiggyBanksObservable;
  }

  create(piggyBank: PiggyBank): Observable<number> {
    return this.http.put<number>(this.endpoint, piggyBank)
      .pipe(tap(data => this.refreshData()));
  }

  update(piggyBank: PiggyBank): Observable<string> {
    return this.http.patch(this.endpoint, piggyBank, {responseType: 'text'})
      .pipe(tap(data => this.refreshData()));
  }

  protected refreshData(): void {
    this.currentDomainPiggyBanksObservable = null;
  }

}
