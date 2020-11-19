import {Component, Input, OnInit} from '@angular/core';
import {BillingPeriodsService} from '../../services/billing-periods.service';
import {BillingPeriod} from '../../model/billings/billing-period';
import {Observable, Subject, throwError} from 'rxjs';
import {Income} from '../../model/billings/income';
import {Expense} from '../../model/billings/expense';
import {AccountsService} from '../../services/accounts.service';
import {ToastService} from '../../services/toast.service';
import {Account} from '../../model/account';
import {Category} from '../../model/billings/category';
import {NgbCalendar, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {map} from 'rxjs/operators';
import {PiggyBanksService} from '../../services/piggy-banks.service';
import {PiggyBank} from '../../model/piggy-bank';
import {CurrencyPipe} from '@angular/common';
import {NgEventBus} from 'ng-event-bus';
import {Events} from '../../model/events';

export const INCOME = 'income';
export const EXPENSE = 'expense';

@Component({
  selector: 'app-create-billing-element',
  templateUrl: './create-billing-element.component.html',
  styleUrls: ['./create-billing-element.component.css']
})
export class CreateBillingElementComponent implements OnInit {

  get availableAccounts(): Account[] {
    return this.availableAccountsInternal || [];
  }

  set availableAccounts(value: Account[]) {
    this.availableAccountsInternal = value;
    this.availableCurrencies = [...new Set(this.availableAccountsInternal.map(c => c.currency))];
  }

  get selectedAccount(): Account {
    return this.selectedAccountInternal || new Account();
  }

  set selectedAccount(value: Account) {
    this.selectedAccountInternal = value;
    this.billingElement.currency = this.selectedAccount.currency;
  }

  get forAccountId(): number {
    return Number(this.forAccountIdInternal);
  }

  set forAccountId(value: number) {
    this.forAccountIdInternal = value;

    this.selectedAccount = this.availableAccounts.find(account => account.id === (this.forAccountId || -1));
  }

  get availableCurrencies(): string[] {
    return this.availableCurrenciesInternal || [];
  }

  set availableCurrencies(value: string[]) {
    this.availableCurrenciesInternal = value;
  }

  get display(): string {
    return this.incomeDisplay;
  }

  get piggyBankAction(): string {
    return this.incomeDisplay === INCOME ? 'Credit' : 'Debit';
  }

  @Input() set display(value: string) {
    if (value === INCOME || value === EXPENSE) {
      this.incomeDisplay = value;
    } else {
      throwError('incorrect value for display');
    }
  }

  get categoryId(): number {
    return Number(this.categoryIdInternal);
  }

  set categoryId(value: number) {
    this.categoryIdInternal = value;
    this.billingElement.category = this.categories.find(c => c.id === this.categoryId);
  }

  get piggyBankToFinance(): PiggyBank {
    let piggyBank: PiggyBank = null;
    if (this.piggyBankIdInternal) {
      piggyBank = this.piggyBanks.find(pg => pg.id === this.piggyBankId);
    }
    return piggyBank;
  }

  get piggyBankId(): number {
    return Number(this.piggyBankIdInternal);
  }

  set piggyBankId(value: number) {
    this.piggyBankIdInternal = value;
  }

  constructor(public billingsService: BillingPeriodsService,
              private accountsService: AccountsService,
              private piggyBanksService: PiggyBanksService,
              private currencyPipe: CurrencyPipe,
              private eventBus: NgEventBus,
              private toastService: ToastService,
              private ngbCalendar: NgbCalendar) {
  }

  private availableAccountsInternal: Account[];

  selectedAccountInternal: Account;

  forAccountIdInternal: number;

  availableCurrenciesInternal: string[] = [];

  private incomeDisplay: string;
  closeSubject = new Subject<any>();

  @Input() public billingPeriod: BillingPeriod;
  @Input() title: string;

  billingElement: Income | Expense;

  categories: Category[] = [];

  private categoryIdInternal: number;

  piggyBanks: PiggyBank[] = [];

  private piggyBankIdInternal: number;

  elementDate: NgbDateStruct;

  ngOnInit(): void {

    this.accountsService.currentUserAccounts().subscribe(
      data => this.availableAccounts = data,
      err => this.toastService.showWarning('Could not obtain accounts ' + err)
    );

    this.billingsService.getAllCategories().subscribe(
      data => this.categories = data,
      err => this.toastService.showWarning('Could not obtain categories ' + err)
    );

    if (this.display === INCOME) {
      this.billingElement = new Income();
    } else {
      this.billingElement = new Expense();
    }
    this.elementDate = this.ngbCalendar.getToday();
  }

  public elements(): any[] {
    const elements = this.incomeDisplay === INCOME ? this.billingPeriod.incomes : this.billingPeriod.expenses;
    return elements ? elements : [];
  }

  add(): void {
    let amount = this.billingElement.amount;
    if (this.billingElement instanceof Income) {
      this.billingElement.incomeDate = this.convertToDate(this.elementDate);
    } else {
      this.billingElement.expenseDate = this.convertToDate(this.elementDate);
      amount = -amount;
    }
    if (this.piggyBankToFinance) {
      const pg = this.piggyBankToFinance;
      pg.balance += amount;
      this.piggyBanksService.update(pg).subscribe(
        data => this.eventBus.cast(Events.PIGGY_BANK_CHANGED),
        error => this.toastService.showWarning('Error during operation on piggy bank')
      );
    }
    this.billingsService.createBillingElement(this.billingPeriod, this.billingElement, this.selectedAccount.id)
      .subscribe(
        data => this.closeSubject.next(data),
        error => this.closeSubject.next(error)
      );
  }

  private convertToDate(date: NgbDateStruct): Date {
    const result = new Date();
    result.setFullYear(date.year);
    result.setMonth(date.month - 1);
    result.setDate(date.day);
    return result;
  }

  nameOfType(): string {
    return this.isIncome() ? 'incomes' : 'expenses';
  }

  confirm(): void {
    this.closeSubject.next('ok');
  }

  cancel(): void {
    this.closeSubject.next('cancel');
  }

  isExpense(): boolean {
    return this.display === EXPENSE;
  }

  isIncome(): boolean {
    return this.display === INCOME;
  }

  isAllowed(): boolean {
    return this.isIncome() || this.billingElement.amount <= this.selectedAccount.currentBalance;
  }

  categoriesForTypeAhead(): () => Observable<Category[]> {
    const that = this;
    return () => that.billingsService
      .getAllCategories()
      .pipe(map(data => data.sort((a, b) => a.name.localeCompare(b.name))));
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
    return () => that.piggyBanksService.getAllPiggyBanks()
      .pipe(map(data => data.filter(pb => that.selectedAccount && pb.currency === this.selectedAccount.currency)))
      .pipe(
        map(data => {
          that.piggyBanks = data;
          return data.sort((a, b) => a.name.localeCompare(b.name));
        })
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
}
