import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PaymentStatus, PerformedService} from '../../../model/accountant/performed-service';
import {Service} from '../../../model/accountant/service';
import {Currency} from '../../../model/accountant/currency';
import {Client} from '../../../model/accountant/client';
import {PerformedServicePayment} from '../../../model/accountant/performed-service-payment';
import {ClientPayment} from '../../../model/accountant/client-payment';
import {SimplePerformedServicePayment} from '../../../model/accountant/simple-performed-service-payment';

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

  performedServicesInternal: PerformedService[];

  @Input() get performedServices(): PerformedService[] {
    return this.performedServicesInternal;
  }

  set performedServices(value: PerformedService[]) {
    this.performedServicesInternal = (value || []).sort(PerformedService.compareByDateAndClientAndService);
    if (this.editElement) {
      this.editElement = this.performedServicesInternal.find(ps => ps.id === this.editElement.id);
    }
    if (this.selectedElement) {
      this.selectedElement = this.performedServicesInternal.find(ps => ps.id === this.selectedElement.id);
    }
  }

  @Input() services: Service[];
  @Input() clients: Client[];
  @Input() clientPayments: ClientPayment[];
  @Input() allCurrencies: Currency[];

  @Output() updateEvent = new EventEmitter<PerformedService>();
  @Output() createEvent = new EventEmitter<PerformedService>();
  @Output() createPerformedServicePaymentEvent = new EventEmitter<PerformedServicePayment>();

  editMode: string = EMPTY_EDIT_MODE;
  editElement: PerformedService;
  selectedElement: PerformedService;

  constructor() {
  }

  ngOnInit(): void {
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
}
