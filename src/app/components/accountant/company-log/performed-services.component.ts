import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PerformedService} from '../../../model/accountant/performed-service';
import {Service} from '../../../model/accountant/service';
import {Currency} from '../../../model/accountant/currency';
import {Client} from '../../../model/accountant/client';
import {PerformedServicePayment} from '../../../model/accountant/performed-service-payment';
import {ClientPayment} from '../../../model/accountant/client-payment';
import {SimplePerformedServicePayment} from '../../../model/accountant/simple-performed-service-payment';
import {DatePipe} from '@angular/common';
import {Payable, PaymentStatus} from '../../../model/accountant/payable';
import {PayableGroup} from '../../../model/accountant/payable-groupper';

const GENERAL_EDIT_MODE = 'general';
const CREATE_EDIT_MODE = 'create';
const PAYMENT_SELECTION_EDIT_MODE = 'payment-selection';
const EMPTY_EDIT_MODE = '';

@Component({
  selector: 'app-performed-services',
  templateUrl: './performed-services.component.html',
  styleUrls: ['./performed-services.component.css']
})
export class PerformedServicesComponent implements OnInit {
  @Input() title: string;

  allPerformedServices: PerformedService[];
  performedServicesInternal: PerformedService[];

  @Input() get performedServices(): PerformedService[] {
    return this.performedServicesInternal;
  }

  set performedServices(value: PerformedService[]) {
    this.allPerformedServices = value;
    this.performedServicesInternal = (value || [])
      .sort(PerformedService.compareByDateAndClientAndServiceAndId);
    if (this.editElement) {
      this.editElement = this.performedServicesInternal.find(ps => ps.id === this.editElement.id);
    }
    if (this.selectedElement) {
      this.selectedElement = this.performedServicesInternal.find(ps => ps.id === this.selectedElement.id);
    }
    this.noGrouping();
  }

  displayData: PayableGroup<PerformedService>[];

  @Input() services: Service[];

  @Input() clients: Client[];
  @Input() clientPayments: ClientPayment[];
  @Input() allCurrencies: Currency[];
  @Output() updateEvent = new EventEmitter<PerformedService>();

  @Output() createEvent = new EventEmitter<PerformedService>();
  @Output() createPerformedServicePaymentEvent = new EventEmitter<PerformedServicePayment>();
  editMode: string = EMPTY_EDIT_MODE;

  editElement: PerformedService;
  selectedGroup: PayableGroup<PerformedService>;
  selectedElement: PerformedService;

  showDateColumn = true;
  showClientColumn = true;
  showServiceColumn = true;

  constructor(private datePipe: DatePipe) {
  }

  ngOnInit(): void {
  }

  noGrouping(): void {
    this.displayData = PayableGroup.groupData(this.performedServices, ps => null, ps => '');
    this.selectedGroup = this.displayData.length > 0 ? this.displayData[0] : null;
    this.enableAllColumns();
  }

  byClients(): void {
    this.displayData = PayableGroup.groupData(
      this.performedServices,
      ps => ps && ps.client && ps.client.id || null,
      ps => ps && ps.client && ps.client.name || ''
    );
    this.selectedGroup = null;
    this.enableAllColumns();
    this.showClientColumn = false;
  }

  byDates(): void {
    this.displayData = PayableGroup.groupData(
      this.performedServices,
      ps => ps && ps.date && ps.date.getTime() || null,
      ps => ps && ps.date && this.datePipe.transform(ps.date, 'dd MMMM yyyy') || ''
    );
    this.selectedGroup = null;
    this.enableAllColumns();
    this.showDateColumn = false;
  }

  byServices(): void {
    this.displayData = PayableGroup.groupData(
      this.performedServices,
      ps => ps && ps.service && ps.service.id || null,
      ps => ps && ps.service && ps.service.name || ''
    );
    this.selectedGroup = null;
    this.enableAllColumns();
    this.showServiceColumn = false;
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
    this.prepareToEdit(this.selectedElement, GENERAL_EDIT_MODE);
  }

  prepareToPaymentSelectionEdit(): void {
    this.prepareToEdit(this.selectedElement, PAYMENT_SELECTION_EDIT_MODE);
  }

  prepareToEdit(editElement: PerformedService, editMode): void {
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
    return this.selectedElement && this.selectedElement.id === performedService.id;
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
    return this.selectedGroup && this.selectedGroup.isEqual(payableGroup);
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
}
