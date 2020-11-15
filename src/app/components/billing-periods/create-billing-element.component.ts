import {Component, Input, OnInit} from '@angular/core';
import {BillingPeriodsService} from '../../services/billing-periods.service';
import {BillingPeriod} from '../../model/billings/billing-period';
import {Subject, throwError} from 'rxjs';
import {Income} from '../../model/billings/income';
import {Expense} from '../../model/billings/expense';
import {AccountsService} from '../../services/accounts.service';
import {ToastService} from '../../services/toast.service';
import {Account} from '../../model/account';
import {Category} from '../../model/billings/category';

export const INCOME = 'income';
export const EXPENSE = 'expense';

@Component({
  selector: 'app-create-billing-element',
  templateUrl: './create-billing-element.component.html',
  styleUrls: ['./create-billing-element.component.css']
})
export class CreateBillingElementComponent implements OnInit {

  private availableAccountsInternal: Account[];

  get availableAccounts(): Account[] {
    return this.availableAccountsInternal || [];
  }

  set availableAccounts(value: Account[]) {
    this.availableAccountsInternal = value;
    this.availableCurrencies = [...new Set(this.availableAccountsInternal.map(c => c.currency))];
  }

  selectedAccountInternal: Account;

  get selectedAccount(): Account {
    return this.selectedAccountInternal || new Account();
  }

  set selectedAccount(value: Account) {
    this.selectedAccountInternal = value;
    this.billingElement.currency = this.selectedAccount.currency;
  }

  forAccountIdInternal: number;

  get forAccountId(): number {
    return Number(this.forAccountIdInternal);
  }

  set forAccountId(value: number) {
    this.forAccountIdInternal = value;
    this.selectedAccount = this.availableAccounts.find(account => account.id === (this.forAccountId || -1));
  }

  availableCurrenciesInternal: string[] = [];

  get availableCurrencies(): string[] {
    return this.availableCurrenciesInternal || [];
  }

  set availableCurrencies(value: string[]) {
    this.availableCurrenciesInternal = value;
  }

  private incomeDisplay: string;
  closeSubject = new Subject<any>();

  get display(): string {
    return this.incomeDisplay;
  }

  @Input() set display(value: string) {
    if (value === INCOME || value === EXPENSE) {
      this.incomeDisplay = value;
    } else {
      throwError('incorrect value for display');
    }
  }

  @Input() public billingPeriod: BillingPeriod;
  @Input() title: string;

  billingElement: Income | Expense;

  categories: Category[] = [];

  private categoryIdInternal: number;

  get categoryId(): number {
    return Number(this.categoryIdInternal);
  }

  set categoryId(value: number) {
    this.categoryIdInternal = value;
    this.billingElement.category = this.categories.find(c => c.id === this.categoryId);
  }

  constructor(private billingsService: BillingPeriodsService,
              private accountsService: AccountsService,
              private toastService: ToastService) {
  }

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
  }

  public elements(): any[] {
    const elements = this.incomeDisplay === INCOME ? this.billingPeriod.incomes : this.billingPeriod.expenses;
    return elements ? elements : [];
  }

  add(): void {
    this.billingsService.createBillingElement(this.billingPeriod, this.billingElement, this.selectedAccount.id)
      .subscribe(
        data => this.closeSubject.next(data),
        error => this.closeSubject.next(error)
      );
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
}
