import {Component, Input, OnInit, Output} from '@angular/core';
import {BillingPeriod} from '../../model/billings/billing-period';
import {Observable, of, Subject, throwError} from 'rxjs';
import {Income} from '../../model/billings/income';
import {Expense} from '../../model/billings/expense';
import {Account} from '../../model/account';
import {Category} from '../../model/billings/category';
import {NgbCalendar, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {PiggyBank} from '../../model/piggy-bank';
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

  private categoryIdInternal: number;

  get categoryId(): number {
    return Number(this.categoryIdInternal);
  }

  set categoryId(value: number) {
    this.categoryIdInternal = value;
    this.billingElement.category = this.categories.find(c => c.id === this.categoryId);
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
  piggyBanksForSelectedAccount: number[];
  elementDate: NgbDateStruct;

  constructor(private currencyPipe: CurrencyPipe,
              private ngbCalendar: NgbCalendar) {
  }

  ngOnInit(): void {
    if (this.elementType === INCOME) {
      this.billingElement = new Income();
    } else {
      this.billingElement = new Expense();
    }
    this.elementDate = this.ngbCalendar.getToday();
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
      this.piggyBanksForSelectedAccount = this.piggyBanks.filter(pg => pg.currency === this.selectedAccount.currency).map(pg => pg.id);
    } else {
      this.piggyBanksForSelectedAccount = null;
    }
  }

  public elements(): any[] {
    return (this.elementType === INCOME ? this.billingPeriod.incomes : this.billingPeriod.expenses) || [];
  }

  add(): void {
    let amount = this.billingElement.amount;
    if (this.billingElement instanceof Income) {
      this.billingElement.incomeDate = this.convertToDate(this.elementDate);
    } else {
      this.billingElement.expenseDate = this.convertToDate(this.elementDate);
      amount = -amount;
    }
    const piggyBank = this.piggyBankToFinance();
    if (piggyBank) {
      piggyBank.balance += amount;
    }
    this.editEvent.next([this.billingElement, this.selectedAccount.id, piggyBank]);
  }

  private convertToDate(date: NgbDateStruct): Date {
    const result = new Date();
    result.setFullYear(date.year);
    result.setMonth(date.month - 1);
    result.setDate(date.day);
    return result;
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

  categoryIdExtractor(category: Category): number {
    if (!category) {
      return null;
    }
    return category.id;
  }

  categoryToString(category: Category): string {
    return category.fullName();
  }

  piggyBanksForTypeAhead(): () => Observable<PiggyBank[]> {
    const that = this;
    return () => of(
      that.piggyBanks
        .filter(pb => that.selectedAccount && pb.currency === this.selectedAccount.currency)
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  }

  piggyBankIdExtractor(piggyBank: PiggyBank): number {
    if (!piggyBank) {
      return null;
    }
    return piggyBank.id;
  }

  piggyBankToString(): (PiggyBank) => string {
    const that = this;
    return piggyBank => piggyBank.name + ' ' + that.currencyPipe.transform(piggyBank.balance, piggyBank.currency);
  }

  getCurrencySymbol(currency: string): string {
    return getCurrencySymbol(currency, 'narrow');
  }
}
