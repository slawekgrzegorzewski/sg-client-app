import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Service} from '../../../model/accountant/service';
import {Currency} from '../../../model/accountant/currency';
import {Client} from '../../../model/accountant/client';
import {ClientPayment} from '../../../model/accountant/client-payment';
import {PerformedService} from '../../../model/accountant/performed-service';
import {PerformedServicePayment} from '../../../model/accountant/performed-service-payment';
import {DatePipe} from '@angular/common';
import {Grouping} from './performed-services.component';

type CompanyLogDisplayType = 'desktop' | 'mobile';
type ShowEntity = 'services' | 'payments'

@Component({
  selector: 'app-company-log',
  templateUrl: './company-log.component.html',
  styleUrls: ['./company-log.component.css']
})
export class CompanyLogComponent implements OnInit {

  @Input() services: Service[] = [];
  @Input() clients: Client[] = [];
  @Input() clientPayments: ClientPayment[] = [];
  @Input() allCurrencies: Currency[] = [];
  private _performedServices: PerformedService[] = [];
  @Input() get performedServices(): PerformedService[] {
    return this._performedServices;
  }

  set performedServices(value: PerformedService[]) {
    this._performedServices = value;
    this.filterDataToShow();
  }

  performedServicesToShow: PerformedService[] = [];

  @Input() displayType: CompanyLogDisplayType = 'desktop';

  @Output() onPerformedServiceCreate = new EventEmitter<PerformedService>();
  @Output() onPerformedServiceUpdate = new EventEmitter<PerformedService>();
  @Output() onPerformedServicePaymentCreate = new EventEmitter<PerformedServicePayment>();
  @Output() onClientPaymentCreate = new EventEmitter<ClientPayment>();
  @Output() onClientPaymentUpdate = new EventEmitter<ClientPayment>();
  @Output() onDateSelected = new EventEmitter<Date>();

  private _displayingDate = new Date(0);
  get displayingDate(): Date {
    return this._displayingDate;
  }

  set displayingDate(value: Date) {
    const monthChanged = !CompanyLogComponent.isTheSameMonth(value, this._displayingDate);
    this._displayingDate = value;
    if (this.displayType === 'mobile') {
      this.setMobileTitle();
    }
    if (monthChanged) {
      this.onDateSelected.emit(value);
    }
    this.filterDataToShow();
  }

  private performedServicesGroupingMode: Grouping = Grouping.LACK;

  showEntity: ShowEntity = 'services';
  mobilePerformedServicesTitle = '';
  mobileClientPaymentsTitle = '';

  constructor(private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.displayingDate = new Date();
  }

  private setMobileTitle() {
    if (this.performedServicesGroupingMode === Grouping.LACK) {
      this.mobilePerformedServicesTitle = this.datePipe.transform(this.displayingDate, 'dd MMMM y') || '';
    } else if (this.performedServicesGroupingMode === Grouping.BY_CLIENTS) {
      this.mobilePerformedServicesTitle = this.datePipe.transform(this.displayingDate, 'LLLL\'\'yy') || '';
    }
    this.mobileClientPaymentsTitle = this.datePipe.transform(this.displayingDate, 'LLLL\'\'yy') || '';
  }

  previousMonth(): void {
    const newDate = new Date(this.displayingDate);
    newDate.setMonth(newDate.getMonth() - 1);
    this.displayingDate = newDate;
  }

  nextMonth(): void {
    const newDate = new Date(this.displayingDate);
    newDate.setMonth(newDate.getMonth() + 1);
    this.displayingDate = newDate;
  }

  nextDayPerformedServices() {
    if (this.displayType === 'mobile' && this.performedServicesGroupingMode === Grouping.LACK) {
      this.moveToNextDay(1);
    } else {
      this.moveToNextMonth(1);
    }
  }

  previousDayPerformedServices() {
    if (this.displayType === 'mobile' && this.performedServicesGroupingMode === Grouping.LACK) {
      this.moveToNextDay(-1);
    } else {
      this.moveToNextMonth(-1);
    }
  }

  private moveToNextDay(days: number) {
    this.changeDay(
      days,
      (date, numberOfUnits) => new Date(date.setDate((date.getDate() + numberOfUnits)))
    );
  }

  private moveToNextMonth(months: number): void {
    this.changeDay(
      months,
      (date, numberOfUnits) => {
        const nextDate = new Date(date.setMonth((date.getMonth() + numberOfUnits)));
        const now = new Date();
        return now.getTime() > nextDate.getTime() ? nextDate : now;
      }
    );
  }

  private changeDay(numberOfUnits: number, dateChangingFunction: (date: Date, numberOfUnits: number) => Date): void {
    const next = dateChangingFunction(new Date(this.displayingDate), numberOfUnits);
    if (next.getTime() > new Date().getTime()) {
      return;
    }
    this.displayingDate = next;
  }

  public onGroupingModeChange(event: Grouping) {
    this.performedServicesGroupingMode = event;
    this.filterDataToShow();
    this.setMobileTitle();
  }

  private filterDataToShow(): void {
    if (this.displayType === 'mobile' && this.performedServicesGroupingMode === Grouping.LACK) {
      this.performedServicesToShow = this.performedServices.filter(ps => CompanyLogComponent.isTheSameDay(ps.date, this.displayingDate));
    } else {
      this.performedServicesToShow = this.performedServices;
    }
  }

//region Just utils - simple getters and setters and more trivial yet useful stuff

  public isDesktop() {
    return this.displayType === 'desktop';
  }

  public isMobile() {
    return this.displayType === 'mobile';
  }

  public displayingServices(): boolean {
    return this.showEntity === 'services';
  }

  public showServices(): void {
    this.showEntity = 'services';
  }

  public displayingPayments(): boolean {
    return this.showEntity === 'payments';
  }

  public showPayments(): void {
    this.showEntity = 'payments';
  }

  private static isTheSameMonth(date1: Date, date2: Date): boolean {
    return date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth();
  }

  private static isTheSameDay(date1: Date, date2: Date): boolean {
    return this.isTheSameMonth(date1, date2) && date1.getDate() == date2.getDate();
  }

  //endregion
}
