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

export const INCOME = 'income';
export const EXPENSE = 'expense';
export type BillingElementType = 'income' | 'expense';

@Component({
  selector: 'app-create-billing-element',
  templateUrl: './create-billing-element.component.html',
  styleUrls: ['./create-billing-element.component.css']
})
export class CreateBillingElementComponent implements OnInit {

  @Input() billingPeriod: BillingPeriod | null = null;

  @Input() categories: Category[] = [];

  @Input() elementType: BillingElementType = 'income';

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

  private userAccountsInternal: Account[] = [];

  get userAccounts(): Account[] {
    return this.userAccountsInternal || [];
  }

  @Input() set userAccounts(value: Account[]) {
    this.userAccountsInternal = value;
    this.availableCurrencies = [...new Set(this.userAccountsInternal.map(c => c.currency))];
  }

  @Output() editEvent = new Subject<[Income | Expense | null, number | null, PiggyBank | null]>();

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

  availableCurrenciesInternal: string[] = [];

  get availableCurrencies(): string[] {
    return this.availableCurrenciesInternal || [];
  }

  set availableCurrencies(value: string[]) {
    this.availableCurrenciesInternal = value;
  }

  private piggyBankInternal: PiggyBank | null = null;

  get piggyBank(): PiggyBank | null {
    return this.piggyBankInternal;
  }

  set piggyBank(value: PiggyBank | null) {
    this.piggyBankInternal = value;
  }

  piggyBanksInternal: PiggyBank[] = [];

  @Input() get piggyBanks(): PiggyBank[] {
    return this.piggyBanksInternal;
  }

  set piggyBanks(value: PiggyBank[]) {
    this.piggyBanksInternal = value;
    this.filterPiggyBanks();
  }

  billingElement: Income | Expense | null = null;

  piggyBanksForSelectedAccount: string[] | null = null;

  constructor(private currencyPipe: CurrencyPipe,
              private ngbCalendar: NgbCalendar) {
  }

  ngOnInit(): void {
    if (this.elementType === INCOME) {
      this.billingElement = new Income();
      this.billingElement.incomeDate = new Date();
    } else if (this.elementType === EXPENSE) {
      this.billingElement = new Expense();
      this.billingElement.expenseDate = new Date();
    } else {
      this.billingElement = null;
    }
  }

  piggyBankAction(): string {
    return 'Skarbonka do ' + (this.elementType === INCOME ? 'uznania' : 'obciążenia');
  }

  piggyBankToFinance(): PiggyBank | null {
    let piggyBank: PiggyBank | null = null;
    const currentPiggyBank = this.piggyBankInternal;
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

  public elements(): any[] {
    return (this.elementType === INCOME ? this.billingPeriod?.incomes : this.billingPeriod?.expenses) || [];
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

  categoriesForTypeAhead(): () => Observable<Category[]> {
    const that = this;
    return () => of(that.categories.sort((a, b) => a.name.localeCompare(b.name)));
  }

  piggyBanksForTypeAhead(): () => Observable<PiggyBank[]> {
    const that = this;
    return () => of(
      that.piggyBanks
        .filter(pb => that.selectedAccount && pb.currency === that.selectedAccount.currency)
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  }

  getCurrencySymbol(currency: string): string {
    return getCurrencySymbol(currency, 'narrow');
  }
}
