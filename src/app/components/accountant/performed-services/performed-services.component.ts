import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PaymentStatus, PerformedService} from '../../../model/accountant/performed-service';
import {Service} from '../../../model/accountant/service';
import {Currency} from '../../../model/accountant/currency';
import {Client} from '../../../model/accountant/client';
import {PerformedServicePayment} from '../../../model/accountant/performed-service-payment';
import {ClientPayment} from '../../../model/accountant/client-payment';
import {SimplePerformedServicePayment} from '../../../model/accountant/simple-performed-service-payment';
import {CurrencyPipe} from '@angular/common';

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
      .filter(ps => ps.isForCurrentMonth() || ps.getPaymentStatus() !== PaymentStatus.PAID)
      .sort(PerformedService.compareByDateAndClientAndServiceAndId);
    if (this.editElement) {
      this.editElement = this.performedServicesInternal.find(ps => ps.id === this.editElement.id);
    }
    if (this.selectedElement) {
      this.selectedElement = this.performedServicesInternal.find(ps => ps.id === this.selectedElement.id);
    }
    this.noGrouping();
  }

  displayData: PerformedServicesGroup[];

  generatedGroups = 0;
  @Input() services: Service[];

  @Input() clients: Client[];
  @Input() clientPayments: ClientPayment[];
  @Input() allCurrencies: Currency[];
  @Output() updateEvent = new EventEmitter<PerformedService>();

  @Output() createEvent = new EventEmitter<PerformedService>();
  @Output() createPerformedServicePaymentEvent = new EventEmitter<PerformedServicePayment>();
  editMode: string = EMPTY_EDIT_MODE;

  editElement: PerformedService;
  selectedGroup: PerformedServicesGroup;
  selectedElement: PerformedService;
  showDateColumn = true;

  showClientColumn = true;
  showServiceColumn = true;
  showPriceColumn = true;
  readonly maxColumns = 4;
  visibleColumns = this.maxColumns;

  constructor(currencyPipe: CurrencyPipe) {
  }

  ngOnInit(): void {
  }

  byClients(): void {
    const data = new Map<number, PerformedServicesGroup>();
    for (const performedService of this.performedServices) {
      const group = data.get(performedService.client.id) || this.createGroup([], data.size);
      group.data.push(performedService);
      group.title = performedService.client.name;
      let toPay = group.additionalFinancialData.get(performedService.currency) || 0;
      toPay += (performedService.price - performedService.getPaidAmountForNow());
      group.additionalFinancialData.set(performedService.currency, toPay);
      data.set(performedService.client.id, group);
    }
    for (const group of data.values()) {
      const sum = Array.from(group.additionalFinancialData.values()).reduce((a, b) => a + b, 0);
      if (!sum) {
        group.additionalFinancialData = null;
      }
    }
    this.displayData = Array.from(data.values());
    this.selectedGroup = null;
    this.showDateColumn = true;
    this.showClientColumn = false;
    this.showServiceColumn = true;
    this.showPriceColumn = true;
    this.visibleColumns = 3;
  }

  private createGroup(performedServices: PerformedService[], order: number): PerformedServicesGroup {
    const group = new PerformedServicesGroup();
    group.id = this.generatedGroups++;
    group.data = performedServices;
    group.order = order;
    return group;
  }

  noGrouping(): void {
    const servicesGroup = this.createGroup(this.performedServices, 0);
    this.displayData = [servicesGroup];
    this.selectedGroup = servicesGroup;
    this.showDateColumn = true;
    this.showClientColumn = true;
    this.showServiceColumn = true;
    this.showPriceColumn = true;
    this.visibleColumns = this.maxColumns;
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

  setGroupToDisplay(performedServicesGroup: PerformedServicesGroup): void {
    if (this.isEqualToSelectedGroup(performedServicesGroup)) {
      this.selectedGroup = null;
    } else {
      this.selectedGroup = performedServicesGroup;
    }
  }

  isEqualToSelectedGroup(performedServicesGroup: PerformedServicesGroup): boolean {
    return this.selectedGroup && this.selectedGroup.id === performedServicesGroup.id;
  }

  setPerformedService(performedService: PerformedService): void {
    if (this.isEqualToSelectedElement(performedService)) {
      this.selectedElement = null;
    } else {
      this.selectedElement = performedService;
    }
  }

  isEqualToSelectedElement(performedService: PerformedService): boolean {
    return this.selectedElement && this.selectedElement.id === performedService.id;
  }

  getPerformedServiceClass(performedService: PerformedService): string {
    const paymentStatus = performedService.getPaymentStatus();
    return this.getPaymentStatusClass(paymentStatus);
  }

  getGroupClass(group: PerformedServicesGroup): string {
    if (this.isEqualToSelectedGroup(group)) {
      return '';
    }
    return this.getPaymentStatusClass(group.status);
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

  clientPayment(payment: SimplePerformedServicePayment): ClientPayment {
    return this.clientPayments.find(cp => cp.id === payment.clientPaymentId);
  }

  ceil(n: number): number {
    return Math.ceil(n);
  }

  floor(n: number): number {
    return Math.floor(n);
  }
}

class PerformedServicesGroup {

  id: number;
  title: string;
  additionalFinancialData = new Map<string, number>();
  data: PerformedService[];
  order: number;
  statusInternal: PaymentStatus;

  get status(): PaymentStatus {
    if (!this.statusInternal) {
      this.statusInternal = PaymentStatus.PAID;
      this.data.forEach(ps => {
        const paymentStatus = ps.getPaymentStatus();
        if (paymentStatus === PaymentStatus.UNDERPAID && this.statusInternal !== PaymentStatus.NOT_PAID) {
          this.statusInternal = PaymentStatus.UNDERPAID;
        } else if (paymentStatus === PaymentStatus.NOT_PAID) {
          this.statusInternal = PaymentStatus.NOT_PAID;
        }
      });
    }
    return this.statusInternal;
  }

}
