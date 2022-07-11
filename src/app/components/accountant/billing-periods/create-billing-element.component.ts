import {Component, Input, OnInit, Output} from '@angular/core';
import {BillingPeriod} from '../../../model/accountant/billings/billing-period';
import {Observable, of, Subject} from 'rxjs';
import {Income} from '../../../model/accountant/billings/income';
import {Expense} from '../../../model/accountant/billings/expense';
import {Account} from '../../../model/accountant/account';
import {Category} from '../../../model/accountant/billings/category';
import {NgbCalendar} from '@ng-bootstrap/ng-bootstrap';
import {PiggyBank} from '../../../model/accountant/piggy-bank';
import {CurrencyPipe, getCurrencySymbol} from '@angular/common';
import {CategoriesService} from '../../../services/accountant/categories.service';
import {map} from 'rxjs/operators';
import {AccountsService} from '../../../services/accountant/accounts.service';
import {ComparatorBuilder} from '../../../utils/comparator-builder';
import {PiggyBanksService} from '../../../services/accountant/piggy-banks.service';

export const INCOME = 'income';
export const EXPENSE = 'expense';
export type BillingElementType = 'income' | 'expense';

@Component({
  selector: 'app-create-billing-element',
  templateUrl: './create-billing-element.component.html',
  styleUrls: ['./create-billing-element.component.css']
})
export class CreateBillingElementComponent implements OnInit {

  @Input() elementType: BillingElementType = 'income';
  @Output() editEvent = new Subject<[Income | Expense | null, number | null, PiggyBank | null]>();

  categories: Category[] = [];
  userAccounts: Account[] = [];
  availableCurrencies: string[] = [];
  piggyBanks: PiggyBank[] = [];
  piggyBank: PiggyBank | null = null;
  @Input() billingElement: Income | Expense | null = null;
  piggyBanksForSelectedAccount: string[] | null = null;

  get elementDate(): Date | null {
    if (!this.billingElement) {
      return null;
    }
    if (this.billingElement instanceof Income) {
      return this.billingElement.incomeDate;
    }
    return this.billingElement.expenseDate;
  }

  set elementDate(value: Date | null) {
    if (!value || !this.billingElement) {
      return;
    }
    if (this.billingElement instanceof Income) {
      this.billingElement.incomeDate = value;
    } else {
      this.billingElement.expenseDate = value;
    }
  }

  selectedAccountInternal: Account | null = null;

  get selectedAccount(): Account | null {
    return this.selectedAccountInternal;
  }

  set selectedAccount(value: Account | null) {
    this.selectedAccountInternal = value;
    if (this.selectedAccountInternal && this.billingElement) {
      this.billingElement.currency = this.selectedAccountInternal.currency;
    } else {
      this.billingElement = null;
    }
    this.filterPiggyBanks();
  }

  private _account: Account | null = null;

  get account(): Account | null {
    return this._account;
  }

  @Input() set account(value: Account | null) {
    this._account = value;
    this.selectedAccount = value;
  }

  forAccountIdInternal: number | null = null;

  get forAccountId(): number | null {
    return Number(this.forAccountIdInternal);
  }

  set forAccountId(value: number | null) {
    this.forAccountIdInternal = value;
    if (this.forAccountId) {
      this.selectedAccount = this.userAccounts.find(account => account.id === this.forAccountId) || null;
    } else {
      this.selectedAccount = null;
    }
  }

  constructor(private currencyPipe: CurrencyPipe,
              private accountsService: AccountsService,
              private categoriesService: CategoriesService,
              private piggyBanksService: PiggyBanksService,
              private ngbCalendar: NgbCalendar) {
  }

  ngOnInit(): void {
    if (this.elementType === INCOME) {
      if (this.billingElement === null) {
        this.billingElement = new Income();
        this.billingElement.incomeDate = new Date();
      } else if (!(this.billingElement instanceof Income)) {
        throw 'billing element should be an income';
      }
    } else if (this.elementType === EXPENSE) {
      if (this.billingElement === null) {
        this.billingElement = new Expense();
        this.billingElement.expenseDate = new Date();
      } else if (!(this.billingElement instanceof Expense)) {
        throw 'billing element should be an income';
      }
    } else {
      this.billingElement = null;
    }
    this.categoriesService.currentDomainCategories().subscribe(categories => this.categories = categories);
    this.accountsService.currentDomainAccounts().pipe(
      map((accounts: Account[]) => accounts.filter(a => a.visible)),
      map((accounts: Account[]) => accounts.sort(
        ComparatorBuilder.comparing<Account>(a => a.currency)
          .thenComparing(a => a.name)
          .build()))
    ).subscribe(accounts => {
      this.userAccounts = accounts;
      this.availableCurrencies = [...new Set(this.userAccounts.map(c => c.currency))];
    });
    this.piggyBanksService.currentDomainPiggyBanks().subscribe(piggyBanks => {
      this.piggyBanks = piggyBanks;
      this.filterPiggyBanks();
    });
  }

  piggyBankAction(): string {
    return 'Skarbonka do ' + (this.elementType === INCOME ? 'uznania' : 'obciążenia');
  }

  piggyBankToFinance(): PiggyBank | null {
    let piggyBank: PiggyBank | null = null;
    const currentPiggyBank = this.piggyBank;
    if (currentPiggyBank) {
      piggyBank = this.piggyBanks.find(pg => pg.id === currentPiggyBank.id) || null;
    }
    return piggyBank;
  }

  private filterPiggyBanks(): void {
    const account = this.selectedAccount;
    if (account?.currency) {
      this.piggyBanksForSelectedAccount = this.piggyBanks
        .filter(pg => pg.currency === account.currency)
        .map(pg => pg.getTypeaheadId());
    } else {
      this.piggyBanksForSelectedAccount = null;
    }
  }

  add(): void {
    if (!this.selectedAccount || !this.billingElement) {
      return;
    }
    let amount = this.billingElement.amount;
    if (this.billingElement instanceof Expense) {
      amount = -amount;
    }
    const piggyBank = this.piggyBankToFinance();
    if (piggyBank) {
      piggyBank.balance += amount;
    }
    this.editEvent.next([this.billingElement, this.selectedAccount.id, piggyBank]);
  }

  cancel(): void {
    this.editEvent.next([null, null, null]);
  }

  isIncome(): boolean {
    return this.elementType === INCOME;
  }

  isAllowed(): boolean {
    return this.selectedAccount !== null && this.billingElement !== null
      && (this.isIncome() || this.billingElement.amount <= this.selectedAccount.currentBalance);
  }

  categoriesForTypeAhead(): () => Category[] {
    const that = this;
    return () => that.categories.sort((a, b) => a.name.localeCompare(b.name));
  }

  piggyBanksForTypeAhead(): () => PiggyBank[] {
    const that = this;
    return () =>
      that.piggyBanks
        .filter(pb => that.selectedAccount && pb.currency === that.selectedAccount.currency)
        .sort((a, b) => a.name.localeCompare(b.name))
    ;
  }

  getCurrencySymbol(currency: string): string {
    return getCurrencySymbol(currency, 'narrow');
  }
}
