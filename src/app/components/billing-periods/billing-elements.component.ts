import {Component, Input, OnInit} from '@angular/core';
import {BillingPeriodsService} from '../../services/billing-periods.service';
import {BillingPeriod} from '../../model/billings/billing-period';
import {throwError} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CreateBillingElementComponent} from './create-billing-element.component';

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
    private modalService: NgbModal
  ) {
  }

  ngOnInit(): void {
  }

  public elements(): any[] {
    const elements = this.incomeDisplay === INCOME ? this.billingPeriod.incomes : this.billingPeriod.expenses;
    return elements ? elements : [];
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
      // that.fetchData();
    };
  }

  nameOfType(): string {
    return this.display === INCOME ? 'incomes' : 'expenses';
  }
}
