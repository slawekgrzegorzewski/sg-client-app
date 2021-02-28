import {Component, OnInit} from '@angular/core';
import {AccountsService} from '../../../services/accountant/accounts.service';
import {Account} from '../../../model/accountant/account';
import {PiggyBanksService} from '../../../services/accountant/piggy-banks.service';
import {PiggyBank} from '../../../model/accountant/piggy-bank';
import {BillingPeriodsService} from '../../../services/accountant/billing-periods.service';
import {Router} from '@angular/router';
import {Category} from '../../../model/accountant/billings/category';
import {BillingPeriod} from '../../../model/accountant/billings/billing-period';
import {Expense} from '../../../model/accountant/billings/expense';
import {Income} from '../../../model/accountant/billings/income';
import {CategoriesService} from '../../../services/accountant/categories.service';
import {DomainService} from '../../../services/domain.service';
import {forkJoin, Observable} from 'rxjs';


@Component({
  selector: 'app-accounts-home-small',
  templateUrl: './accountant-home-small.component.html',
  styleUrls: ['./accountant-home-small.component.css']
})
export class AccountantHomeSmallComponent implements OnInit {

  public readonly DISPLAY = 'DISPLAY';
  public readonly CREATE_INCOME = 'CREATE_INCOME';
  public readonly CREATE_EXPENSE = 'CREATE_EXPENSE';

  accounts: Account[];
  piggyBanks: PiggyBank[];
  historicalSavings: Map<Date, Map<string, number>>;
  categories: Category[];
  billingPeriod: BillingPeriod;
  mode = this.DISPLAY;
  currentDomainName: string;

  constructor(private domainService: DomainService,
              private accountsService: AccountsService,
              private categoriesService: CategoriesService,
              private piggyBanksService: PiggyBanksService,
              private billingsService: BillingPeriodsService,
              private router: Router) {
  }

  ngOnInit(): void {
    if (window.innerWidth >= 640) {
      this.router.navigate(['/accountant-home']);
    }
    this.refreshData();
    this.categoriesService.currentDomainCategories().subscribe(data => this.categories = data);
  }

  refreshData(): void {
    this.fetchAccounts();
    this.fetchPiggyBanks();
    this.fetchHistoricalSavings();
    this.fetchBillingPeriods();
    this.currentDomainName = this.domainService.currentDomain?.name || '';
  }

  fetchAccounts(): void {
    this.accountsService.currentDomainAccounts().subscribe(
      data => this.accounts = data.sort(Account.compareByCurrencyAndName),
      error => this.accounts = []
    );
  }

  private fetchPiggyBanks(): void {
    this.piggyBanksService.currentDomainPiggyBanks().subscribe(data => {
      this.piggyBanks = data.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  private fetchHistoricalSavings(): void {
    this.billingsService.getHistoricalSavings(12).subscribe(
      data => this.historicalSavings = data
    );
  }

  private fetchBillingPeriods(): void {
    this.billingsService.currentBillingPeriod().subscribe(
      data => this.billingPeriod = data.result
    );
  }

  addIncome(): void {
    this.mode = this.CREATE_INCOME;
  }

  addExpense(): void {
    this.mode = this.CREATE_EXPENSE;
  }

  createElement(elementToCreate: Income | Expense, accountIdForElement: number, piggyBankToUpdate: PiggyBank): void {
    const requests: Observable<any>[] = [
      this.billingsService.createBillingElement(elementToCreate, accountIdForElement)
    ];
    if (piggyBankToUpdate) {
      requests.push(this.piggyBanksService.update(piggyBankToUpdate));
    }
    forkJoin(requests)
      .subscribe(
        success => {
          this.refreshData();
          this.fetchBillingPeriods();
        },
        error => {
          this.refreshData();
          this.fetchBillingPeriods();
        });
    this.mode = this.DISPLAY;
  }
}
