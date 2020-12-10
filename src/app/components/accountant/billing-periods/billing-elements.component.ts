import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BillingPeriod} from '../../../model/accountant/billings/billing-period';
import {throwError} from 'rxjs';
import {Income} from '../../../model/accountant/billings/income';
import {Expense} from '../../../model/accountant/billings/expense';
import {Category} from '../../../model/accountant/billings/category';
import {PiggyBank} from '../../../model/accountant/piggy-bank';

export const INCOME = 'income';
export const EXPENSE = 'expense';

@Component({
  selector: 'app-billing-elements',
  templateUrl: './billing-elements.component.html',
  styleUrls: ['./billing-elements.component.css']
})
export class BillingElementsComponent implements OnInit {

  readonly GENERAL_VIEW = 'general';
  readonly DETAILED_VIEW = 'detailed';
  readonly EDIT_VIEW = 'edit';

  mode: string = this.GENERAL_VIEW;
  private previousMode: string;

  private elementTypeInternal: string;

  get elementType(): string {
    return this.elementTypeInternal;
  }

  @Input() set elementType(value: string) {
    if (value === INCOME || value === EXPENSE) {
      this.elementTypeInternal = value;
      this.selectElementsToShow();
    } else {
      throwError('incorrect value for display');
    }
  }

  public billingPeriodInternal: BillingPeriod;

  @Input() get billingPeriod(): BillingPeriod {
    return this.billingPeriodInternal;
  }

  set billingPeriod(value: BillingPeriod) {
    this.billingPeriodInternal = value;
    this.selectElementsToShow();
  }

  elements: (Income | Expense)[];
  categoryBreakdown: Map<string, Map<string, number>> = new Map<string, Map<string, number>>();
  summary: Map<string, number> = new Map<string, number>();

  @Input() title: string;

  @Input() userAccounts: Account[];
  @Input() categories: Category[];
  @Input() piggyBanks: PiggyBank[];
  @Input() editable = false;
  @Input() minRowHeight: number;
  @Output() createElementEvent = new EventEmitter<[Income | Expense, number]>();
  @Output() updatePiggyBankEvent = new EventEmitter<PiggyBank>();
  showCategory: string;

  constructor() {
  }

  ngOnInit(): void {
  }

  private selectElementsToShow(): void {
    const elements = this.elementTypeInternal === INCOME ? this.billingPeriod.incomes.sort((a, b) => this.sortIncomes(a, b)) :
      this.billingPeriod.expenses.sort((a, b) => this.sortExpenses(a, b));
    this.elements = elements || [];
    this.categoryBreakdown.clear();
    this.summary.clear();
    this.elements.forEach(value => {
      const sumPerCurrency = this.categoryBreakdown.get(value.category.name) || new Map<string, number>();
      const sum = sumPerCurrency.get(value.currency) || 0;
      sumPerCurrency.set(value.currency, sum + value.amount);
      this.categoryBreakdown.set(value.category.name, sumPerCurrency);

      const summary = this.summary.get(value.currency) || 0;
      this.summary.set(value.currency, summary + value.amount);
    });
  }

  private sortIncomes(first: Income, second: Income): number {
    return this.compareDates(first.incomeDate, first.description, second.incomeDate, second.description);
  }

  private sortExpenses(first: Expense, second: Expense): number {
    return this.compareDates(first.expenseDate, first.description, second.expenseDate, second.description);
  }

  private compareDates(first: Date, firstDescription: string, second: Date, secondDescription: string): number {
    if (first > second) {
      return 1;
    }
    if (first < second) {
      return -1;
    }
    return firstDescription.localeCompare(secondDescription);
  }

  add(): void {
    if (this.editable) {
      this.previousMode = this.mode || this.GENERAL_VIEW;
      this.mode = this.EDIT_VIEW;
    }
  }

  createElement(elementToCreate: Income | Expense, accountIdForElement: number, piggyBankToUpdate: PiggyBank): void {
    if (elementToCreate && accountIdForElement) {
      this.createElementEvent.emit([elementToCreate, accountIdForElement]);
      if (piggyBankToUpdate) {
        this.updatePiggyBankEvent.emit(piggyBankToUpdate);
      }
    }
    this.mode = this.previousMode || this.GENERAL_VIEW;
    this.previousMode = null;
  }

  nameOfType(): string {
    return this.elementType === INCOME ? 'incomes' : 'expenses';
  }

  setCategory(key: string): void {
    if (this.showCategory === key) {
      this.showCategory = null;
    } else {
      this.showCategory = key;
    }
  }

  shouldShow(key: string): boolean {
    return this.showCategory === key;
  }

  filterTransactions(key: string): (Income | Expense)[] {
    return this.elements.filter(e => e.category.name === key);
  }
}
