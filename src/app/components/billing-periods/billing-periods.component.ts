import {Component, OnInit} from '@angular/core';
import {BillingPeriodsService} from '../../services/billing-periods.service';
import {BillingPeriod} from '../../model/billings/billing-period';
import {NgEventBus} from 'ng-event-bus';
import {Events} from '../../model/events';

@Component({
  selector: 'app-billing-periods',
  templateUrl: './billing-periods.component.html',
  styleUrls: ['./billing-periods.component.css']
})
export class BillingPeriodsComponent implements OnInit {

  private displayingPeriod = new Date();
  public currentBilling: BillingPeriod;

  constructor(private billingsService: BillingPeriodsService, private eventBus: NgEventBus) {
  }

  ngOnInit(): void {
    this.getBilling();
    this.eventBus.on(Events.TRANSACTIONS_CHANGED).subscribe(message => {
      this.getBilling();
    });
  }


  private getBilling(): void {
    this.billingsService.billingPeriodFor(this.displayingPeriod).subscribe(
      value => this.currentBilling = value,
      error => this.currentBilling = null
    );
  }

  create(): void {
    this.billingsService.createBillingPeriodFor(this.displayingPeriod).subscribe(
      value => this.currentBilling = value
    );
  }

  previous(): void {
    this.displayingPeriod.setMonth(this.displayingPeriod.getMonth() - 1);
    this.getBilling();
  }

  next(): void {
    this.displayingPeriod.setMonth(this.displayingPeriod.getMonth() + 1);
    this.getBilling();
  }
}
