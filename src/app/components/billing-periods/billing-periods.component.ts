import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BillingPeriod} from '../../model/billings/billing-period';
import {NgEventBus} from 'ng-event-bus';

@Component({
  selector: 'app-billing-periods',
  templateUrl: './billing-periods.component.html',
  styleUrls: ['./billing-periods.component.css']
})
export class BillingPeriodsComponent implements OnInit {

  @Input() billing: BillingPeriod;
  @Output() createEvent = new EventEmitter<string>();

  constructor() {
  }

  ngOnInit(): void {
  }

  create(): void {
    this.createEvent.emit('OK!');
  }
}
