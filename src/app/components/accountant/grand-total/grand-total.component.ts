import {Component, Input, OnInit} from '@angular/core';
import {Account} from '../../../model/accountant/account';
import {PiggyBank} from '../../../model/accountant/piggy-bank';
import {BillingPeriodsService} from '../../../services/accountant/billing-periods.service';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-accounts-grand-total',
  templateUrl: './grand-total.component.html',
  styleUrls: ['./grand-total.component.css']
})
export class GrandTotalComponent implements OnInit {

  @Input() title = '';
  @Input() accounts: Account[] = [];
  piggyBanksInternal: PiggyBank[] = [];

  @Input() get piggyBanks(): PiggyBank[] {
    return this.piggyBanksInternal;
  }

  set piggyBanks(value: PiggyBank[]) {
    this.piggyBanksInternal = value || [];
    this.savingsTotal.clear();
    this.piggyBanks.filter(pg => pg.savings).forEach(
      pg => {
        let totalForCurrency = this.savingsTotal.get(pg.currency) || 0;
        totalForCurrency += pg.balance;
        this.savingsTotal.set(pg.currency, totalForCurrency);
      }
    );
  }

  historicalSavingsInternal = new Map<Date, Map<string, number>>();

  @Input() get historicalSavings(): Map<Date, Map<string, number>> {
    return this.historicalSavingsInternal;
  }

  set historicalSavings(value: Map<Date, Map<string, number>>) {
    this.historicalSavingsInternal = value;
    this.dates = BillingPeriodsService.getMapWithDatesKeysSorted(this.historicalSavings);
  }

  dates: Date[] = [];
  savingsTotal = new Map<string, number>();

  constructor(
    private datePipe: DatePipe
  ) {
  }

  ngOnInit(): void {
  }

  accountsPresent(): boolean {
    return this.accounts && this.accounts.length > 0;
  }

  getHistoricalSavings(month: Date): Map<string, number> {
    return this.historicalSavings.get(month) || new Map<string, number>();
  }

  formatMonthDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM') || '';
  }
}
