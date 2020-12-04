import {Component, Input, OnInit} from '@angular/core';
import {Account} from '../../model/account';
import {PiggyBank} from '../../model/piggy-bank';
import {BillingPeriodsService} from '../../services/billing-periods.service';

@Component({
  selector: 'app-accounts-grand-total',
  templateUrl: './grand-total.component.html',
  styleUrls: ['./grand-total.component.css']
})
export class GrandTotalComponent implements OnInit {

  @Input() title: string;
  @Input() accounts: Account[];
  piggyBanksInternal: PiggyBank[];

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

  historicalSavingsInternal: Map<Date, Map<string, number>>;

  @Input() get historicalSavings(): Map<Date, Map<string, number>> {
    return this.historicalSavingsInternal;
  }

  set historicalSavings(value: Map<Date, Map<string, number>>) {
    this.historicalSavingsInternal = value;
    this.dates = BillingPeriodsService.getMapWithDatesKeysSorted(this.historicalSavings);
  }

  dates: Date[];
  savingsTotal = new Map<string, number>();

  public accountCurrencyExtractor = (acc: Account) => acc.currency;
  public accountBalanceExtractor = (acc: Account) => acc.currentBalance;
  public piggyBankCurrencyExtractor = (pg: PiggyBank) => pg.currency;
  public piggyBankBalanceExtractor = (pg: PiggyBank) => pg.balance;

  constructor() {
  }

  ngOnInit(): void {
  }

}