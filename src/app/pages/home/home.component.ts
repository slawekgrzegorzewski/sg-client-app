import {Component, OnInit} from '@angular/core';
import {AccountsService} from '../../services/accounts.service';
import {ToastService} from '../../services/toast.service';
import {Account} from '../../model/account';
import {LoginService} from '../../services/login.service';
import {PiggyBanksService} from '../../services/piggy-banks.service';
import {PiggyBank} from '../../model/piggy-bank';
import {TransactionsService} from '../../services/transations.service';
import {BillingPeriodsService} from '../../services/billing-periods.service';
import {BillingPeriod, BillingPeriodInfo} from '../../model/billings/billing-period';
import {Category} from '../../model/billings/category';
import {Income} from '../../model/billings/income';
import {Expense} from '../../model/billings/expense';
import {Router} from '@angular/router';

@Component({
  selector: 'app-accounts-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  accounts: Account[];
  piggyBanks: PiggyBank[];
  categories: Category[];
  billingPeriodInfo: BillingPeriodInfo;
  historicalSavings: Map<Date, Map<string, number>>;

  constructor(private accountsService: AccountsService,
              private transactionsService: TransactionsService,
              private piggyBanksService: PiggyBanksService,
              private billingsService: BillingPeriodsService,
              private toastService: ToastService,
              public loginService: LoginService,
              private router: Router) {
  }

  ngOnInit(): void {
    if (window.innerWidth < 640) {
      this.router.navigate(['/home-small']);
    }
    this.refreshData();
    this.billingsService.getAllCategories().subscribe(data => this.categories = data);
  }

  refreshData(): void {
    this.fetchAccounts();
    this.fetchPiggyBanks();
    this.fetchHistoricalSavings();
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

  private fetchHistoricalSavings(): void {
    this.billingsService.getHistoricalSavings(12).subscribe(
      data => this.historicalSavings = data
    );
  }

  createElement(billingPeriod: BillingPeriod, element: Income | Expense, accountId: number): void {
    this.billingsService.createBillingElement(element, accountId)
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
