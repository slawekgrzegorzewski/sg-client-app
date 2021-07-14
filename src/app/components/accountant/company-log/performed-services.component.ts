import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PerformedService} from '../../../model/accountant/performed-service';
import {Service} from '../../../model/accountant/service';
import {Currency} from '../../../model/accountant/currency';
import {Client} from '../../../model/accountant/client';
import {PerformedServicePayment} from '../../../model/accountant/performed-service-payment';
import {ClientPayment} from '../../../model/accountant/client-payment';
import {DatePipe} from '@angular/common';
import {Payable, PaymentStatus} from '../../../model/accountant/payable';
import {PayableGroup} from '../../../model/accountant/payable-groupper';
import {ComparatorBuilder} from '../../../../utils/comparator-builder';
import {SimplePerformedServicePayment} from '../../../model/accountant/simple-performed-service-payment';

const GENERAL_EDIT_MODE = 'general';
const CREATE_EDIT_MODE = 'create';
const PAYMENT_SELECTION_EDIT_MODE = 'payment-selection';
const EMPTY_EDIT_MODE = '';

export type EditMode = 'general' | 'create' | 'payment-selection' | ''

enum Grouping {
  LACK, BY_CLIENTS, BY_DATES, BY_SERVICES
}

@Component({
  selector: 'app-performed-services',
  templateUrl: './performed-services.component.html',
  styleUrls: ['./performed-services.component.css']
})
export class PerformedServicesComponent implements OnInit {
  @Input() title: string | null = null;

  allPerformedServices: PerformedService[] = [];
  performedServicesInternal: PerformedService[] = [];
  groupingMode = Grouping.LACK;

  @Input() get performedServices(): PerformedService[] {
    return this.performedServicesInternal;
  }

  set performedServices(value: PerformedService[]) {
    this.allPerformedServices = value;
    this.performedServicesInternal = (value || []).sort(PerformedService.compareByDateAndClientAndServiceAndId);

    const editElement = this.editElement;
    const selectedElement = this.selectedElement;

    if (editElement) {
      this.editElement = this.performedServicesInternal.find(ps => ps.id === editElement.id) || null;
    }
    if (selectedElement) {
      this.selectedElement = this.performedServicesInternal.find(ps => ps.id === selectedElement.id) || null;
    }

    this.group();
  }

  displayData: PayableGroup<PerformedService>[] = [];

  @Input() services: Service[] = [];

  @Input() clients: Client[] = [];
  @Input() clientPayments: ClientPayment[] = [];
  @Input() allCurrencies: Currency[] = [];
  @Output() updateEvent = new EventEmitter<PerformedService>();

  @Output() createEvent = new EventEmitter<PerformedService>();
  @Output() createPerformedServicePaymentEvent = new EventEmitter<PerformedServicePayment>();
  editMode: EditMode = EMPTY_EDIT_MODE;

  editElement: PerformedService | null = null;
  selectedGroup: PayableGroup<PerformedService> | null = null;
  selectedElement: PerformedService | null = null;

  showDateColumn = true;
  showClientColumn = true;
  showServiceColumn = true;

  constructor(private datePipe: DatePipe) {
  }

  ngOnInit(): void {
  }

  group(): void {
    switch (this.groupingMode) {
      case Grouping.LACK:
        this.disableGrouping();
        break;
      case Grouping.BY_CLIENTS:
        this.groupByClients();
        break;
      case Grouping.BY_DATES:
        this.groupByDates();
        break;
      case Grouping.BY_SERVICES:
        this.groupByServices();
        break;
    }
  }

  noGrouping(): void {
    this.groupingMode = Grouping.LACK;
    this.group();
  }

  byClients(): void {
    this.groupingMode = Grouping.BY_CLIENTS;
    this.group();
  }

  byDates(): void {
    this.groupingMode = Grouping.BY_DATES;
    this.group();
  }

  byServices(): void {
    this.groupingMode = Grouping.BY_SERVICES;
    this.group();
  }

  disableGrouping(): void {
    this.displayData = PayableGroup.groupData(this.performedServices,
      ps => -1,
      ps => '',
      ComparatorBuilder.comparingByDate<PerformedService>(ps => ps?.date || new Date(0)).desc()
        .thenComparing(ps => ps.client?.name || '')
        .thenComparing(ps => ps.service?.name || '')
        .thenComparing(ps => ps.price || 0)
        .build()
    );
    this.selectedGroup = this.displayData.length > 0 ? this.displayData[0] : null;
    this.enableAllColumns();
  }

  groupByClients(): void {
    this.displayData = PayableGroup.groupData(
      this.performedServices,
      ps => ps && ps.client && ps.client.id || -1,
      ps => ps && ps.client && ps.client.name || '',
      ComparatorBuilder.comparingByDate<PerformedService>(ps => ps?.date || new Date(0)).desc()
        .thenComparing(ps => ps.service?.name || '')
        .thenComparing(ps => ps.price || 0)
        .build()
    );
    this.selectGroup();
    this.enableAllColumns();
    this.showClientColumn = false;
  }

  groupByDates(): void {
    this.displayData = PayableGroup.groupData(
      this.performedServices,
      ps => ps && ps.date && ps.date.getTime() || -1,
      ps => ps && ps.date && this.datePipe.transform(ps.date, 'dd MMMM yyyy') || '',
      ComparatorBuilder.comparing<PerformedService>(ps => ps.client?.name || '')
        .thenComparing(ps => ps.service?.name || '')
        .thenComparing(ps => ps.price || 0)
        .build()
    );
    this.selectGroup();
    this.enableAllColumns();
    this.showDateColumn = false;
  }

  groupByServices(): void {
    this.displayData = PayableGroup.groupData(
      this.performedServices,
      ps => ps && ps.service && ps.service.id || -1,
      ps => ps && ps.service && ps.service.name || '',
      ComparatorBuilder.comparingByDate<PerformedService>(ps => ps?.date || new Date(0)).desc()
        .thenComparing(ps => ps.client?.name || '')
        .thenComparing(ps => ps.price || 0)
        .build()
    );
    this.selectGroup();
    this.enableAllColumns();
    this.showServiceColumn = false;
  }

  private selectGroup(): void {
    const selectedGroup = this.selectedGroup;
    if (selectedGroup !== null) {
      this.selectedGroup = (this.displayData || []).find(g => g.title === selectedGroup.title) || null;
    }
  }

  private enableAllColumns(): void {
    this.showDateColumn = true;
    this.showClientColumn = true;
    this.showServiceColumn = true;
  }

  prepareToCreate(): void {
    const performedService = new PerformedService();
    performedService.currency = 'PLN';
    performedService.date = new Date();
    this.prepareToEdit(performedService, CREATE_EDIT_MODE);
  }

  prepareToGeneralEdit(): void {
    if (this.selectedElement) {
      this.prepareToEdit(this.selectedElement, GENERAL_EDIT_MODE);
    }
  }

  prepareToPaymentSelectionEdit(): void {
    if (this.selectedElement) {
      this.prepareToEdit(this.selectedElement, PAYMENT_SELECTION_EDIT_MODE);
    }
  }

  prepareToEdit(editElement: PerformedService, editMode: EditMode): void {
    this.editElement = editElement;
    this.editMode = editMode;
  }

  resetEditForm(): void {
    this.editElement = null;
    this.editMode = EMPTY_EDIT_MODE;
  }

  create(toCreate: PerformedService): void {
    this.createEvent.emit(toCreate);
    this.resetEditForm();
  }

  update(toUpdate: PerformedService): void {
    this.updateEditElement(toUpdate);
  }

  private updateEditElement(toUpdate: PerformedService): void {
    this.updateEvent.emit(toUpdate);
    this.resetEditForm();
  }

  isNonEditMode(): boolean {
    return this.editMode === EMPTY_EDIT_MODE;
  }

  isGeneralEditMode(): boolean {
    return this.editMode === GENERAL_EDIT_MODE;
  }

  isCreateEditMode(): boolean {
    return this.editMode === CREATE_EDIT_MODE;
  }

  isPaymentSelectionEditMode(): boolean {
    return this.editMode === PAYMENT_SELECTION_EDIT_MODE;
  }

  setGroupToDisplay(payableGroup: PayableGroup<PerformedService>): void {
    if (this.isEqualToSelectedGroup(payableGroup)) {
      this.selectedGroup = null;
    } else {
      this.selectedGroup = payableGroup;
    }
  }

  setPerformedService(ps: PerformedService): void {
    if (this.isEqualToSelectedElement(ps)) {
      this.selectedElement = null;
    } else {
      this.selectedElement = ps;
    }
  }

  isEqualToSelectedElement(performedService: PerformedService): boolean {
    return this.selectedElement !== null && this.selectedElement.id === performedService.id;
  }

  getPerformedServiceClass(p: Payable): string {
    const paymentStatus = p.getPaymentStatus();
    return this.getPaymentStatusClass(paymentStatus);
  }

  getGroupClass(payableGroup: PayableGroup<PerformedService>): string {
    if (this.isEqualToSelectedGroup(payableGroup)) {
      return '';
    }
    return this.getPaymentStatusClass(payableGroup.status);
  }

  isGrouped(): boolean {
    return this.displayData.length > 1 || (this.displayData.length === 1 && this.displayData[0].title !== '');
  }

  isEqualToSelectedGroup(payableGroup: PayableGroup<PerformedService>): boolean {
    return this.selectedGroup !== null && this.selectedGroup.isEqual(payableGroup);
  }

  getPaymentStatusClass(paymentStatus: PaymentStatus): string {
    if (paymentStatus === PaymentStatus.PAID) {
      return 'paid-ps';
    }
    if (paymentStatus === PaymentStatus.NOT_PAID) {
      return 'not-paid-ps';
    }
    if (paymentStatus === PaymentStatus.UNDERPAID) {
      return 'underpaid-ps';
    }
    return '';
  }

  serviceNeedsPayment(): boolean {
    if (!this.selectedElement) {
      return false;
    }
    const paymentStatus = this.selectedElement.getPaymentStatus();
    return paymentStatus === PaymentStatus.UNDERPAID || paymentStatus === PaymentStatus.NOT_PAID;
  }

  getLackingAmount(): number {
    if (!this.selectedElement) {
      return 0;
    }
    return this.selectedElement.price - this.selectedElement.getPaidAmountForNow();
  }

  createPerformedServicePayment(performedServicePayment: PerformedServicePayment): void {
    this.createPerformedServicePaymentEvent.emit(performedServicePayment);
    this.resetEditForm();
  }

  getDataLength(): number {
    return this.displayData.reduce((a, b) => a + (b && b.data && b.data.length || 0), 0);
  }

  getClientPaymentsRelations(performedService: PerformedService): SimplePerformedServicePayment[] {
    return performedService.clientPaymentsRelations.sort(
      ComparatorBuilder.comparingByDate<SimplePerformedServicePayment>(p => p?.date || new Date(0))
        .thenComparing(p => p.price)
        .build()
    );
  }
}
