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

export const INCOME = 'income';
export const EXPENSE = 'expense';

@Component({
  selector: 'app-billing-elements',
  templateUrl: './billing-elements.component.html',
  styleUrls: ['./billing-elements.component.css']
})
export class BillingElementsComponent implements OnInit {

  private incomeDisplay: string;

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

  constructor(
    private billingsService: BillingPeriodsService,
    private modalService: NgbModal,
    private eventBus: NgEventBus
  ) {
  }

  ngOnInit(): void {
  }

  public elements(): any[] {
    const elements = this.incomeDisplay === INCOME ? this.billingPeriod.incomes.sort((a, b) => this.sortIncomes(a, b)) :
      this.billingPeriod.expenses.sort((a, b) => this.sortExpenses(a, b));
    return elements ? elements : [];
  }

  private sortIncomes(first: Income, second: Income): number {
    return this.compareDates(first.incomeDate, second.incomeDate);
  }

  private sortExpenses(first: Expense, second: Expense): number {
    return this.compareDates(first.expenseDate, second.expenseDate);
  }

  private compareDates(first: Date, second: Date): number {
    if (first > second) {
      return 1;
    }
    if (first === second) {
      return 0;
    }
    return -1;
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
