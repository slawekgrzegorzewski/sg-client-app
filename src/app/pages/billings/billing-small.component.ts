import {Component, OnInit} from '@angular/core';
import {Account} from '../../model/account';
import {PiggyBank} from '../../model/piggy-bank';
import {Category} from '../../model/billings/category';
import {BillingPeriod, BillingPeriodInfo} from '../../model/billings/billing-period';
import {AccountsService} from '../../services/accounts.service';
import {PiggyBanksService} from '../../services/piggy-banks.service';
import {BillingPeriodsService} from '../../services/billing-periods.service';
import {Income} from '../../model/billings/income';
import {Expense} from '../../model/billings/expense';

@Component({
  selector: 'app-billing-small',
  templateUrl: './billing-small.component.html',
  styleUrls: ['./billing-small.component.css']
})
export class BillingSmallComponent implements OnInit {

  accounts: Account[];
  piggyBanks: PiggyBank[];
  categories: Category[];
  billingPeriodInfo: BillingPeriodInfo;

  constructor(private accountsService: AccountsService,
              private piggyBanksService: PiggyBanksService,
              private billingsService: BillingPeriodsService
  ) {
  }

  ngOnInit(): void {
    this.refreshData();
    this.billingsService.getAllCategories().subscribe(data => this.categories = data);
  }

  refreshData(): void {
    this.fetchAccounts();
    this.fetchPiggyBanks();
  }

  fetchAccounts(): void {
    this.accountsService.currentUserAccounts().subscribe(
      data => this.accounts = data.sort(Account.compareByCurrencyAndName),
      error => this.accounts = []
    );
  }

  fetchBillingPeriod(date: Date): void {
    this.billingsService.billingPeriodFor(date).subscribe(
      data => this.billingPeriodInfo = data,
      error => this.billingPeriodInfo = null
    );
  }

  private fetchPiggyBanks(): void {
    this.piggyBanksService.getAllPiggyBanks().subscribe(data => {
      this.piggyBanks = data.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  createElement(billingPeriod: BillingPeriod, element: Income | Expense, accountId: number): void {
    this.billingsService.createBillingElement(billingPeriod, element, accountId)
      .subscribe(
        success => {
          this.refreshData();
          this.fetchBillingPeriod(billingPeriod.period);
        },
        error => {
          this.refreshData();
          this.fetchBillingPeriod(billingPeriod.period);
        });
  }

  updatePiggyBank(piggyBank: PiggyBank): void {
    this.piggyBanksService.update(piggyBank)
      .subscribe(
        success => this.refreshData(),
        error => this.refreshData()
      );
  }

  finishBillingPeriod(date: Date): void {
    this.billingsService.finishBillingPeriodOf(date).subscribe(
      data => this.fetchBillingPeriod(date)
    );
  }

  createBilling(date: Date): void {
    this.billingsService.createBillingPeriodFor(date).subscribe(
      data => this.fetchBillingPeriod(date)
    );
  }

}
