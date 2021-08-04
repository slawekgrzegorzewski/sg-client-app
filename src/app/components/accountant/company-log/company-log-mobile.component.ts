import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Service} from '../../../model/accountant/service';
import {Currency} from '../../../model/accountant/currency';
import {Client} from '../../../model/accountant/client';
import {PerformedService} from '../../../model/accountant/performed-service';
import {ClientPayment} from '../../../model/accountant/client-payment';
import {DatePipe} from '@angular/common';
import {PayableGroup} from '../../../model/accountant/payable-groupper';
import {ComparatorBuilder} from '../../../../utils/comparator-builder';

type DisplayKind = 'services' | 'payments'
type ServicesDisplayKind = 'by-clients' | 'day-by-day'

@Component({
  selector: 'app-company-log-mobile',
  templateUrl: './company-log-mobile.component.html',
  styleUrls: ['./company-log-mobile.component.css']
})
export class CompanyLogMobileComponent {

  private displayingDateInternal = new Date();

  get displayingDate(): Date {
    return this.displayingDateInternal;
  }

  set displayingDate(value: Date) {
    this.displayingDateInternal = value;
    this.filterPerformedServices();
  }

  @Output() displayingDateChanged = new EventEmitter<Date>();
  @Output() performedServiceCreated = new EventEmitter<PerformedService>();

  @Input() services: Service[] = [];
  @Input() clients: Client[] = [];
  @Input() allCurrencies: Currency[] = [];
  @Input() clientPayments: ClientPayment[] = [];
  performedServiceToCreate: PerformedService | null = null;


  private _performedServices: PerformedService[] = [];
  @Input() get performedServices(): PerformedService[] {
    return this._performedServices;
  }

  set performedServices(value: PerformedService[]) {
    this._performedServices = value;
    this.filterPerformedServices();
    this.performedServicesByClients = this.groupPerformedServicesByClients();
    this.selectGroup(null);
  }

  performedServicesForDay: PerformedService[] = [];
  performedServicesByClients: PayableGroup<PerformedService>[] = [];
  selectedPerformedServicesGroup: PayableGroup<PerformedService> | null = null;

  displayKind: DisplayKind = 'services';
  servicesDisplayKind: ServicesDisplayKind = 'day-by-day';

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
    if (this.displayingServicesDayByDay()) {
      this.moveToNextDay(1);
    } else {
      this.moveToNextMonth(1);
    }
  }

  nextDayPerformedServices() {
    if (this.displayingServicesDayByDay()) {
      this.moveToNextDay(-1);
    } else {
      this.moveToNextMonth(-1);
    }
  }

  private moveToNextDay(days: number) {
    this.changeDate(
      days,
      (date, numberOfUnits) => new Date(date.setDate((date.getDate() + numberOfUnits)))
    );
  }

  private moveToNextMonth(months: number): void {
    this.changeDate(
      months,
      (date, numberOfUnits) => new Date(date.setMonth((date.getMonth() + numberOfUnits)))
    );
  }

  private changeDate(numberOfUnits: number, dateChangingFunction: (date: Date, numberOfUnits: number) => Date): void {

    const previous = new Date(this.displayingDate);
    const next = dateChangingFunction(new Date(this.displayingDate), numberOfUnits);
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

  displayingServicesDayByDay(): boolean {
    return this.servicesDisplayKind === 'day-by-day';
  }

  showServicesDayByDay(): void {
    this.servicesDisplayKind = 'day-by-day';
  }

  displayingServicesByClients(): boolean {
    return this.servicesDisplayKind === 'by-clients';
  }

  showServicesByClients(): void {
    this.servicesDisplayKind = 'by-clients';
  }

  displayingPayments(): boolean {
    return this.displayKind === 'payments';
  }

  showPayments(): void {
    this.displayKind = 'payments';
  }

  groupPerformedServicesByClients(): PayableGroup<PerformedService>[] {
    return PayableGroup.groupData(
      this.performedServices,
      ps => ps && ps.client && ps.client.id || -1,
      ps => ps && ps.client && ps.client.name || '',
      ComparatorBuilder.comparingByDate<PerformedService>(ps => ps?.date || new Date(0)).desc()
        .thenComparing(ps => ps.service?.name || '')
        .thenComparing(ps => ps.price || 0)
        .build()
    )
      .sort(ComparatorBuilder.comparingByDate<PayableGroup<PerformedService>>(CompanyLogMobileComponent.getMaxDateOfPerformedService).desc().build());
  }

  private static getMaxDateOfPerformedService(group: PayableGroup<PerformedService>): Date {
    const dates = group.data.sort(ComparatorBuilder.comparingByDate<PerformedService>(ps => ps.date).desc().build());
    if (dates.length > 0) {
      return dates[0].date;
    } else {
      return new Date(0);
    }
  }

  selectGroup(group: PayableGroup<PerformedService> | null) {
    if (this.selectedPerformedServicesGroup && group && this.selectedPerformedServicesGroup.id === group.id) {
      this.selectedPerformedServicesGroup = null;
    } else {
      this.selectedPerformedServicesGroup = group;
    }
  }

  isGroupSelected(group: PayableGroup<PerformedService>) {
    return this.selectedPerformedServicesGroup && this.selectedPerformedServicesGroup.id === group.id;
  }

  getClientPaymentRowClass(ps: PerformedService): string {
    const paid = ps.clientPaymentsRelations.map(ps => ps.price).reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    if (paid === ps.price) {
      return 'paid-ps';
    } else if (paid === 0) {
      return 'not-paid-ps';
    } else {
      return 'underpaid-ps';
    }
  }
}
