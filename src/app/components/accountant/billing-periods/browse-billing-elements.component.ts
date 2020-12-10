import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BillingPeriod, BillingPeriodInfo} from '../../../model/accountant/billings/billing-period';
import {Account} from '../../../model/accountant/account';
import {PiggyBank} from '../../../model/accountant/piggy-bank';
import {Category} from '../../../model/accountant/billings/category';
import {Income} from '../../../model/accountant/billings/income';
import {Expense} from '../../../model/accountant/billings/expense';
import {DatePipe, TitleCasePipe} from '@angular/common';

@Component({
  selector: 'app-browse-billing-elements',
  templateUrl: './browse-billing-elements.component.html',
  styleUrls: ['./browse-billing-elements.component.css']
})
export class BrowseBillingElementsComponent implements OnInit {

  billingPeriodInfoInternal: BillingPeriodInfo;

  @Input() get billingPeriodInfo(): BillingPeriodInfo {
    return this.billingPeriodInfoInternal;
  }

  set billingPeriodInfo(value: BillingPeriodInfo) {
    this.billingPeriodInfoInternal = value;
    if (this.billingPeriodInfoInternal) {
      this.currentBilling = this.billingPeriodInfoInternal.result;
      this.unfinishedBillingPeriods = this.billingPeriodInfoInternal.unfinishedBillingPeriods || [];
      this.isCurrentBillingFinished = !this.unfinishedBillingPeriods.some(bp => this.currentBilling && bp.id === this.currentBilling.id);
    } else {
      this.currentBilling = null;
      this.unfinishedBillingPeriods = [];
      this.isCurrentBillingFinished = false;
    }
  }

  @Input() accounts: Account[];
  @Input() piggyBanks: PiggyBank[];
  @Input() categories: Category[];
  @Input() minRowHeight: number;

  @Output() dateSelected = new EventEmitter<Date>();
  @Output() finishBillingPeriod = new EventEmitter<Date>();
  @Output() createBillingPeriod = new EventEmitter<Date>();
  @Output() createElementEvent = new EventEmitter<[BillingPeriod, Income | Expense, number]>();
  @Output() updatePiggyBankEvent = new EventEmitter<PiggyBank>();

  currentBilling: BillingPeriod;
  isCurrentBillingFinished: boolean;
  unfinishedBillingPeriods: BillingPeriod[] = [];
  displayingPeriod: Date;

  constructor(private datePipe: DatePipe,
              private titleCasePipe: TitleCasePipe) {
  }

  ngOnInit(): void {
    this.setDisplayingDate(new Date());
  }

  private setDisplayingDate(date: Date): void {
    this.displayingPeriod = date;
    this.dateSelected.emit(this.displayingPeriod);
  }

  previous(): void {
    const newDate = new Date(this.displayingPeriod);
    newDate.setMonth(newDate.getMonth() - 1);
    this.setDisplayingDate(newDate);
  }

  next(): void {
    const newDate = new Date(this.displayingPeriod);
    newDate.setMonth(newDate.getMonth() + 1);
    this.setDisplayingDate(newDate);
  }

  monthYearString(date: Date): string {
    const value = this.datePipe.transform(date, 'LLLL') + '\'' + this.datePipe.transform(date, 'yy');
    return this.titleCasePipe.transform(value);
  }

}
