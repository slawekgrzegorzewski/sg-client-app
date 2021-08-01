import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Service} from '../../../model/accountant/service';
import {Currency} from '../../../model/accountant/currency';
import {Client} from '../../../model/accountant/client';
import {PerformedService} from '../../../model/accountant/performed-service';
import {ClientPayment} from '../../../model/accountant/client-payment';
import {DatePipe} from '@angular/common';

type DisplayKind = 'services' | 'payments'

@Component({
  selector: 'app-company-log-day-by-day',
  templateUrl: './company-log-day-by-day.component.html',
  styleUrls: ['./company-log-day-by-day.component.css']
})
export class CompanyLogDayByDayComponent {

  private _displayingDate = new Date();

  get displayingDate(): Date {
    return this._displayingDate;
  }

  set displayingDate(value: Date) {
    this._displayingDate = value;
    this.filterPerformedServices();
  }

  @Output() displayingDateChanged = new EventEmitter<Date>();
  @Output() performedServiceCreated = new EventEmitter<PerformedService>();

  @Input() services: Service[] = [];
  @Input() clients: Client[] = [];
  @Input() allCurrencies: Currency[] = [];
  @Input() performedServicesForDay: PerformedService[] = [];
  @Input() clientPayments: ClientPayment[] = [];
  performedServiceToCreate: PerformedService | null = null;


  private _performedServices: PerformedService[] = [];
  @Input() get performedServices(): PerformedService[] {
    return this._performedServices;
  }

  set performedServices(value: PerformedService[]) {
    this._performedServices = value;
    this.filterPerformedServices();
  }

  displayKind: DisplayKind = 'services';

  constructor(private datePipe: DatePipe) {
  }


  addPerformedService(): void {
    this.performedServiceToCreate = new PerformedService();
    this.performedServiceToCreate.currency = 'PLN';
    this.performedServiceToCreate.date = this.displayingDate;
  }

  createPerformedService() {
    if (this.performedServiceToCreate) {
      this.performedServiceCreated.emit(this.performedServiceToCreate);
      this.performedServiceToCreate = null;
    }
  }

  previousDayPerformedServices() {
    this.moveToNextDay(1);
  }

  nextDayPerformedServices() {
    this.moveToNextDay(-1);
  }

  private moveToNextDay(days: number) {
    const previous = new Date(this.displayingDate);
    const next = new Date(this.displayingDate);
    next.setDate(next.getDate() + days);
    if (next.getTime() > new Date().getTime()) {
      return;
    }
    this.displayingDate = next;
    if (!this.isTheSameMonth(next, previous)) {
      this.displayingDateChanged.emit(next);
    }
  }

  isTheSameMonth(date1: Date, date2: Date): boolean {
    return date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth();
  }

  isTheSameDay(date1: Date, date2: Date): boolean {
    return this.isTheSameMonth(date1, date2) && date1.getDate() == date2.getDate();
  }


  private filterPerformedServices() {
    this.performedServicesForDay = this.performedServices.filter(ps => this.isTheSameDay(ps.date, this.displayingDate));
  }

  getClientPaymentsTitle(): string {
    return 'Płatności za ' + this.datePipe.transform(this.displayingDate, 'LLLL y');
  }

  displayingServices(): boolean {
    return this.displayKind === 'services';
  }

  showServices(): void {
    this.displayKind = 'services';
  }

  displayingPayments(): boolean {
    return this.displayKind === 'payments';
  }

  showPayments(): void {
    this.displayKind = 'payments';
  }
}
