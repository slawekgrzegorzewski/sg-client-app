import {Component, Input, OnInit} from '@angular/core';
import {BillingPeriodsService} from '../../services/billing-periods.service';
import {BillingPeriod} from '../../model/billings/billing-period';
import {Subject, throwError} from 'rxjs';
import {Income} from '../../model/billings/income';
import {Expense} from '../../model/billings/expense';

export const INCOME = 'income';
export const EXPENSE = 'expense';

@Component({
  selector: 'app-create-billing-element',
  templateUrl: './create-billing-element.component.html',
  styleUrls: ['./create-billing-element.component.css']
})
export class CreateBillingElementComponent implements OnInit {

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

  constructor(private billingsService: BillingPeriodsService) {
  }

  ngOnInit(): void {
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

  }

  nameOfType(): string {
    return this.display === INCOME ? 'incomes' : 'expenses';
  }

  confirm(): void {
    this.closeSubject.next('ok');
  }

  cancel(): void {
    this.closeSubject.next('cancel');
  }
}
