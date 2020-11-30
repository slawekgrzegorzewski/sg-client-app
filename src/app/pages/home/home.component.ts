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
import {DatePipe, TitleCasePipe} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-accounts-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  accounts: Account[];
  piggyBanks: PiggyBank[];
  displayingPeriod = new Date();
  currentBilling: BillingPeriod;
  isCurrentBillingFinished: boolean;
  unfinishedBillingPeriods: BillingPeriod[] = [];
  categories: Category[];
  historicalSavings: Map<Date, Map<string, number>>;

  constructor(private accountsService: AccountsService,
              private transactionsService: TransactionsService,
              private piggyBanksService: PiggyBanksService,
              private billingsService: BillingPeriodsService,
              private toastService: ToastService,
              public loginService: LoginService,
              private datePipe: DatePipe,
              private titleCasePipe: TitleCasePipe,
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
    this.fetchBillingPeriod();
    this.fetchHistoricalSavings();
  }

  fetchAccounts(): void {
    this.accountsService.currentUserAccounts().subscribe(
      data => this.accounts = data.sort(Account.compareByCurrencyAndName),
      error => this.accounts = []
    );
  }

  private fetchBillingPeriod(): void {
    this.billingsService.billingPeriodFor(this.displayingPeriod).subscribe(
      data => this.setBillingPeriodRelatedData(data),
      error => this.clearBillingPeriodRelatedData()
    );
  }

  private clearBillingPeriodRelatedData(): void {
    this.currentBilling = null;
    this.unfinishedBillingPeriods = [];
    this.isCurrentBillingFinished = false;
  }

  private setBillingPeriodRelatedData(data: BillingPeriodInfo): void {
    this.currentBilling = data.result;
    this.unfinishedBillingPeriods = data.unfinishedBillingPeriods || [];
    this.isCurrentBillingFinished = !this.unfinishedBillingPeriods.some(bp => this.currentBilling && bp.id === this.currentBilling.id);
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

  createElement(element: Income | Expense, accountId: number): void {
    this.billingsService.createBillingElement(this.currentBilling, element, accountId)
      .subscribe(
        success => this.refreshData(),
        error => this.refreshData()
      );
  }

  updatePiggyBank(piggyBank: PiggyBank): void {
    this.piggyBanksService.update(piggyBank)
      .subscribe(
        success => this.refreshData(),
        error => this.refreshData()
      );
  }

  createBillingForCurrentDate(): void {
    if (!this.currentBilling) {
      this.billingsService.createBillingPeriodFor(this.displayingPeriod).subscribe(
        data => {
          this.currentBilling = data.result;
          this.unfinishedBillingPeriods = data.unfinishedBillingPeriods || [];
        }
      );
    }
  }

  previous(): void {
    const newDate = new Date(this.displayingPeriod);
    newDate.setMonth(newDate.getMonth() - 1);
    this.displayingPeriod = newDate;
    this.fetchBillingPeriod();
  }

  next(): void {
    const newDate = new Date(this.displayingPeriod);
    newDate.setMonth(newDate.getMonth() + 1);
    this.displayingPeriod = newDate;
    this.fetchBillingPeriod();
  }

  finish(currentBilling: BillingPeriod): void {
    this.billingsService.finishBillingPeriod(currentBilling).subscribe(
      data => this.refreshData(),
      error => this.refreshData()
    );
  }

  monthYearString(date: Date): string {
    const value = this.datePipe.transform(date, 'LLLL') + '\'' + this.datePipe.transform(date, 'yy');
    return this.titleCasePipe.transform(value);
  }
}
