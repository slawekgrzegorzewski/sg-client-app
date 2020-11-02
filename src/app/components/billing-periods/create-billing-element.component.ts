import {Component, Input, OnInit} from '@angular/core';
import {BillingPeriodsService} from '../../services/billing-periods.service';
import {BillingPeriod} from '../../model/billings/billing-period';
import {throwError} from 'rxjs';

export const INCOME = 'income';
export const EXPENSE = 'expense';

@Component({
  selector: 'app-create-billing-element',
  templateUrl: './create-billing-element.component.html',
  styleUrls: ['./create-billing-element.component.css']
})
export class CreateBillingElementComponent implements OnInit {

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

  constructor(private billingsService: BillingPeriodsService) {
  }

  ngOnInit(): void {
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
}
