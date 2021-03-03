import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Currency} from '../../../model/accountant/currency';
import {ClientPayment, ClientPaymentStatus} from '../../../model/accountant/client-payment';
import {Client} from '../../../model/accountant/client';
import {SimplePerformedServicePayment} from '../../../model/accountant/simple-performed-service-payment';
import {PerformedService} from '../../../model/accountant/performed-service';

const GENERAL_EDIT_MODE = 'general';
const CREATE_EDIT_MODE = 'create';
const EMPTY_EDIT_MODE = '';

@Component({
  selector: 'app-client-payments',
  templateUrl: './client-payments.component.html',
  styleUrls: ['./client-payments.component.css']
})
export class ClientPaymentComponent implements OnInit {

  @Input() title: string;

  clientPaymentsInternal: ClientPayment[];

  @Input() get clientPayments(): ClientPayment[] {
    return this.clientPaymentsInternal;
  }

  set clientPayments(value: ClientPayment[]) {
    this.clientPaymentsInternal = (value || []).sort(ClientPayment.compareByDateAndCurrency);
  }

  @Input() allCurrencies: Currency[];
  @Input() clients: Client[];
  @Input() performedServices: PerformedService[];

  @Output() updateEvent = new EventEmitter<ClientPayment>();
  @Output() createEvent = new EventEmitter<ClientPayment>();

  editMode: string = EMPTY_EDIT_MODE;
  overElement: ClientPayment;
  editElement: ClientPayment;

  @ViewChild('utilBox') utilBox: ElementRef;
  utilBoxTop: number;
  utilBoxLeft: number;
  utilBoxVisibility = 'hidden';

  private selectedElement: ClientPayment;

  constructor() {
  }

  ngOnInit(): void {
  }

  setOverClientPayment(cp: ClientPayment, row: HTMLTableRowElement): void {
    this.overElement = cp;
    if (cp) {
      const adjustment = (row.offsetHeight - this.utilBox.nativeElement.offsetHeight) / 2;
      this.utilBoxTop = row.getBoundingClientRect().top + adjustment;
      this.utilBoxLeft = row.getBoundingClientRect().left + row.clientWidth - (this.utilBox.nativeElement.offsetWidth / 2);
      this.utilBoxVisibility = 'visible';
    } else {
      this.utilBoxVisibility = 'hidden';
    }
  }

  prepareToCreate(): void {
    const clientPayment = new ClientPayment();
    clientPayment.currency = 'PLN';
    clientPayment.date = new Date();
    this.prepareToEdit(clientPayment, CREATE_EDIT_MODE);
  }

  prepareToGeneralEdit(): void {
    this.prepareToEdit(this.overElement, GENERAL_EDIT_MODE);
  }

  prepareToEdit(editElement: ClientPayment, editMode): void {
    this.editElement = editElement;
    this.editMode = editMode;
  }

  resetEditForm(): void {
    this.editMode = EMPTY_EDIT_MODE;
    this.editElement = null;
    this.setOverClientPayment(null, null);
  }

  create(clientPayment: ClientPayment): void {
    this.createEvent.emit(clientPayment);
    this.resetEditForm();
  }

  update(clientPayment: ClientPayment): void {
    this.updateEditElement(clientPayment);
  }

  private updateEditElement(clientPayment: ClientPayment): void {
    this.updateEvent.emit(this.editElement);
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

  setClientPayment(clientPayment: ClientPayment): void {
    if (this.isEqualToSelectedElement(clientPayment)) {
      this.selectedElement = null;
    } else {
      this.selectedElement = clientPayment;
    }
  }

  isEqualToSelectedElement(clientPayment: ClientPayment): boolean {
    return this.selectedElement && this.selectedElement.id === clientPayment.id;
  }

  getClientPaymentClass(clientPayment: ClientPayment): string {
    const paymentStatus = clientPayment.getPaymentStatus();
    if (paymentStatus === ClientPaymentStatus.PAID) {
      return 'paid-ps';
    }
    if (paymentStatus === ClientPaymentStatus.NOT_PAID) {
      return 'not-paid-ps';
    }
    if (paymentStatus === ClientPaymentStatus.UNDERPAID) {
      return 'underpaid-ps';
    }
  }

  getClientPayment(payment: SimplePerformedServicePayment): ClientPayment {
    return this.clientPayments.find(cp => cp.id === payment.clientPaymentId);
  }

  getPerformedService(payment: SimplePerformedServicePayment): PerformedService {
    return this.performedServices.find(cp => cp.id === payment.performedServiceId);
  }
}
