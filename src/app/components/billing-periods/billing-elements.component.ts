import {Component, Input, OnInit} from '@angular/core';
import {BillingPeriodsService} from '../../services/billing-periods.service';
import {BillingPeriod} from '../../model/billings/billing-period';
import {throwError} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CreateBillingElementComponent} from './create-billing-element.component';
import {NgEventBus} from 'ng-event-bus';
import {Events} from '../../model/events';
import {Income} from '../../model/billings/income';
import {Expense} from '../../model/billings/expense';
import {Category} from '../../model/billings/category';

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

  mode: string = this.GENERAL_VIEW;

  private incomeDisplay: string;

  get display(): string {
    return this.incomeDisplay;
  }

  @Input() set display(value: string) {
    if (value === INCOME || value === EXPENSE) {
      this.incomeDisplay = value;
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

  elements: Income[] | Expense[];
  categoryBreakdown: Map<string, Map<string, number>> = new Map<string, Map<string, number>>();
  summary: Map<string, number> = new Map<string, number>();

  @Input() title: string;

  constructor(
    private billingsService: BillingPeriodsService,
    private modalService: NgbModal,
    private eventBus: NgEventBus
  ) {
  }

  ngOnInit(): void {
  }

  private selectElementsToShow(): void {
    const elements = this.incomeDisplay === INCOME ? this.billingPeriod.incomes.sort((a, b) => this.sortIncomes(a, b)) :
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
    const ngbModalRef = this.modalService.open(CreateBillingElementComponent, {centered: true});
    const component = ngbModalRef.componentInstance as CreateBillingElementComponent;
    const closeHandler = this.onModalClose(ngbModalRef, this);
    component.closeSubject.subscribe(closeHandler, closeHandler);
    component.display = this.display;
    component.billingPeriod = this.billingPeriod;
  }

  onModalClose(ngbModalRef, that): (input) => void {
    return input => {
      ngbModalRef.close();
      this.eventBus.cast(Events.TRANSACTIONS_CHANGED);
    };
  }

  nameOfType(): string {
    return this.display === INCOME ? 'incomes' : 'expenses';
  }
}
