import {Component, Input, OnInit, Output} from '@angular/core';
import {BillingPeriod} from '../../../model/accountant/billings/billing-period';
import {Observable, of, Subject, throwError} from 'rxjs';
import {Income} from '../../../model/accountant/billings/income';
import {Expense} from '../../../model/accountant/billings/expense';
import {Account} from '../../../model/accountant/account';
import {Category} from '../../../model/accountant/billings/category';
import {NgbCalendar} from '@ng-bootstrap/ng-bootstrap';
import {PiggyBank} from '../../../model/accountant/piggy-bank';
import {CurrencyPipe, getCurrencySymbol} from '@angular/common';

export const INCOME = 'income';
export const EXPENSE = 'expense';

@Component({
  selector: 'app-create-billing-element',
  templateUrl: './create-billing-element.component.html',
  styleUrls: ['./create-billing-element.component.css']
})
export class CreateBillingElementComponent implements OnInit {

  @Input() billingPeriod: BillingPeriod;

  @Input() categories: Category[] = [];

  private elementTypeInternal: string;

  get elementType(): string {
    return this.elementTypeInternal;
  }

  @Input() set elementType(value: string) {
    if (value === INCOME || value === EXPENSE) {
      this.elementTypeInternal = value;
    } else {
      throwError('incorrect value for display');
    }
  }

  get elementDate(): Date {
    return this.billingElement instanceof Income ? this.billingElement.incomeDate : this.billingElement.expenseDate;
  }

  set elementDate(value: Date) {
    if (this.billingElement instanceof Income) {
      this.billingElement.incomeDate = value;
    } else {
      this.billingElement.expenseDate = value;
    }
  }

  private userAccountsInternal: Account[];

  get userAccounts(): Account[] {
    return this.userAccountsInternal || [];
  }

  @Input() set userAccounts(value: Account[]) {
    this.userAccountsInternal = value;
    this.availableCurrencies = [...new Set(this.userAccountsInternal.map(c => c.currency))];
  }

  @Output() editEvent = new Subject<[Income | Expense, number, PiggyBank]>();

  selectedAccountInternal: Account;

  get selectedAccount(): Account {
    return this.selectedAccountInternal || new Account();
  }

  set selectedAccount(value: Account) {
    this.selectedAccountInternal = value;
    this.billingElement.currency = this.selectedAccount.currency;
    this.filterPiggyBanks();
  }

  forAccountIdInternal: number;

  get forAccountId(): number {
    return Number(this.forAccountIdInternal);
  }

  set forAccountId(value: number) {
    this.forAccountIdInternal = value;

    this.selectedAccount = this.userAccounts.find(account => account.id === (this.forAccountId || -1));
  }

  availableCurrenciesInternal: string[] = [];

  get availableCurrencies(): string[] {
    return this.availableCurrenciesInternal || [];
  }

  set availableCurrencies(value: string[]) {
    this.availableCurrenciesInternal = value;
  }

  private piggyBankIdInternal: number;

  get piggyBankId(): number {
    return Number(this.piggyBankIdInternal);
  }

  set piggyBankId(value: number) {
    this.piggyBankIdInternal = value;
  }

  piggyBanksInternal: PiggyBank[] = [];

  @Input() get piggyBanks(): PiggyBank[] {
    return this.piggyBanksInternal;
  }

  set piggyBanks(value: PiggyBank[]) {
    this.piggyBanksInternal = value;
    this.filterPiggyBanks();
  }

  billingElement: Income | Expense;
  piggyBanksForSelectedAccount: string[];

  constructor(private currencyPipe: CurrencyPipe,
              private ngbCalendar: NgbCalendar) {
  }

  ngOnInit(): void {
    if (this.elementType === INCOME) {
      this.billingElement = new Income();
      this.billingElement.incomeDate = new Date();
    } else {
      this.billingElement = new Expense();
      this.billingElement.expenseDate = new Date();
    }
  }

  piggyBankAction(): string {
    return 'Skarbonka do ' + (this.elementType === INCOME ? 'uznania' : 'obciążenia');
  }

  piggyBankToFinance(): PiggyBank {
    let piggyBank: PiggyBank = null;
    if (this.piggyBankIdInternal) {
      piggyBank = this.piggyBanks.find(pg => pg.id === this.piggyBankId);
    }
    return piggyBank;
  }

  private filterPiggyBanks(): void {
    if (this.selectedAccount?.currency) {
      this.piggyBanksForSelectedAccount = this.piggyBanks
        .filter(pg => pg.currency === this.selectedAccount.currency)
        .map(pg => pg.getTypeaheadId());
    } else {
      this.piggyBanksForSelectedAccount = null;
    }
  }

  public elements(): any[] {
    return (this.elementType === INCOME ? this.billingPeriod.incomes : this.billingPeriod.expenses) || [];
  }

  add(): void {
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
    return this.isIncome() || this.billingElement.amount <= this.selectedAccount.currentBalance;
  }

  categoriesForTypeAhead(): () => Observable<Category[]> {
    const that = this;
    return () => of(that.categories.sort((a, b) => a.name.localeCompare(b.name)));
  }

  piggyBanksForTypeAhead(): () => Observable<PiggyBank[]> {
    const that = this;
    return () => of(
      that.piggyBanks
        .filter(pb => that.selectedAccount && pb.currency === this.selectedAccount.currency)
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  }

  getCurrencySymbol(currency: string): string {
    return getCurrencySymbol(currency, 'narrow');
  }
}
