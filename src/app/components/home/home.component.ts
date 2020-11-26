import {Component, OnInit} from '@angular/core';
import {AccountsService} from '../../services/accounts.service';
import {ToastService} from '../../services/toast.service';
import {Account} from '../../model/account';
import {LoginService} from '../../services/login.service';
import {PiggyBanksService} from '../../services/piggy-banks.service';
import {PiggyBank} from '../../model/piggy-bank';
import {TransactionsService} from '../../services/transations.service';
import {Transaction} from '../../model/transaction';
import {map} from 'rxjs/operators';
import {BillingPeriodsService} from '../../services/billing-periods.service';
import {BillingPeriod} from '../../model/billings/billing-period';
import {Category} from '../../model/billings/category';
import {Income} from '../../model/billings/income';
import {Expense} from '../../model/billings/expense';

@Component({
  selector: 'app-accounts',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  accounts: Account[];
  selectedAccount: Account;
  showTransactions = false;
  allTransactions: Transaction[];
  transactionsOfSelectedAccount: Transaction[];
  piggyBanks: PiggyBank[];
  savingsTotal = new Map<string, number>();
  displayingPeriod = new Date();
  currentBilling: BillingPeriod;
  unfinishedBillings: BillingPeriod[];
  categories: Category[];

  accountCurrencyExtractor = (acc: Account) => acc.currency;
  accountBalanceExtractor = (acc: Account) => acc.currentBalance;
  piggyBankCurrencyExtractor = (pg: PiggyBank) => pg.currency;
  piggyBankBalanceExtractor = (pg: PiggyBank) => pg.balance;

  constructor(private accountsService: AccountsService,
              private transactionsService: TransactionsService,
              private piggyBanksService: PiggyBanksService,
              private billingsService: BillingPeriodsService,
              private toastService: ToastService,
              public loginService: LoginService) {
  }


  ngOnInit(): void {
    this.refreshData();
    this.accountsService.possibleCurrencies()
      .pipe(map(data => data.sort((a, b) => a.code.localeCompare(b.code))));
    this.billingsService.getAllCategories().subscribe(data => this.categories = data);
  }

  refreshData(): void {
    this.fetchAccounts();
    this.fetchTransactions();
    this.fetchPiggyBanks();
    this.fetchBillingPeriod();
  }

  fetchAccounts(): void {
    this.accountsService.currentUserAccounts().subscribe(
      data => this.accounts = data.sort(Account.compareByCurrencyAndName),
      error => this.accounts = []
    );
  }

  fetchTransactions(): void {
    this.transactionsService.userTransactions().subscribe(
      data => {
        this.allTransactions = data;
        this.transactionsOfSelectedAccount = this.filterTransactionsForSelectedAccount();
      },
      error => {
        this.toastService.showWarning('Could not obtain transactions information.');
        this.allTransactions = [];
        this.transactionsOfSelectedAccount = [];
      }
    );
  }

  private filterTransactionsForSelectedAccount(): Transaction[] {
    if (!this.selectedAccount) {
      return [];
    }
    if (!this.allTransactions) {
      return [];
    }
    return this.allTransactions
      .filter(t => this.isTransactionRelatedToSelectedAccount(t))
      .sort((a, b) => a.timeOfTransaction.getTime() - b.timeOfTransaction.getTime());
  }

  private isTransactionRelatedToSelectedAccount(t: Transaction): boolean {
    return this.areAccountsEqual(t.source, this.selectedAccount) || this.areAccountsEqual(t.destination, this.selectedAccount);
  }

  private areAccountsEqual(a: Account, b: Account): boolean {
    if (!a || !b) {
      return false;
    }
    return a.id === b.id;
  }

  private fetchBillingPeriod(): void {
    this.billingsService.billingPeriodFor(this.displayingPeriod).subscribe(
      data => {
        this.currentBilling = data.result;
        this.unfinishedBillings = data.unfinishedPeriods;
      },
      error => {
        this.currentBilling = null;
        this.unfinishedBillings = [];
      }
    );
  }

  private fetchPiggyBanks(): void {
    this.piggyBanksService.getAllPiggyBanks().subscribe(data => {
      this.piggyBanks = data.sort((a, b) => a.name.localeCompare(b.name));
      this.savingsTotal.clear();
      this.piggyBanks.filter(pg => pg.savings).forEach(
        value => {
          let totalForCurrency = this.savingsTotal.get(value.currency) || 0;
          totalForCurrency += value.balance;
          this.savingsTotal.set(value.currency, totalForCurrency);
        }
      );
    });
  }

  selectAccount(account: Account): void {
    this.selectedAccount = account;
    this.transactionsOfSelectedAccount = this.filterTransactionsForSelectedAccount();
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
          this.unfinishedBillings = data.unfinishedPeriods;
        }
      );
    }
  }

  previous(): void {
    this.displayingPeriod.setMonth(this.displayingPeriod.getMonth() - 1);
    this.fetchBillingPeriod();
  }

  next(): void {
    this.displayingPeriod.setMonth(this.displayingPeriod.getMonth() + 1);
    this.fetchBillingPeriod();
  }
}
