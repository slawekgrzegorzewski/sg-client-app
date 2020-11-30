import {Component, Input, OnInit} from '@angular/core';
import {Account} from '../../model/account';
import {PiggyBank} from '../../model/piggy-bank';

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

  @Input() historicalSavings: Map<Date, Map<string, number>>;
  savingsTotal = new Map<string, number>();

  accountCurrencyExtractor = (acc: Account) => acc.currency;
  accountBalanceExtractor = (acc: Account) => acc.currentBalance;
  piggyBankCurrencyExtractor = (pg: PiggyBank) => pg.currency;
  piggyBankBalanceExtractor = (pg: PiggyBank) => pg.balance;

  constructor() {
  }

  ngOnInit(): void {
  }

}
