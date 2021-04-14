import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Currency} from '../../../model/accountant/currency';
import {ClientPayment} from '../../../model/accountant/client-payment';
import {Client} from '../../../model/accountant/client';
import {SimplePerformedServicePayment} from '../../../model/accountant/simple-performed-service-payment';
import {PerformedService} from '../../../model/accountant/performed-service';
import {PaymentStatus} from '../../../model/accountant/payable';
import {PayableGroup} from '../../../model/accountant/payable-groupper';

const GENERAL_EDIT_MODE = 'general';
const CREATE_EDIT_MODE = 'create';
const EMPTY_EDIT_MODE = '';

enum Grouping {
  LACK, BY_CLIENTS, BY_RECEIPT_TYPE
}

@Component({
  selector: 'app-client-payments',
  templateUrl: './client-payments.component.html',
  styleUrls: ['./client-payments.component.css']
})
export class ClientPaymentComponent implements OnInit {

  @Input() title: string;

  clientPaymentsInternal: ClientPayment[];
  groupingMode = Grouping.LACK;

  @Input() get clientPayments(): ClientPayment[] {
    return this.clientPaymentsInternal;
  }

  set clientPayments(value: ClientPayment[]) {
    this.clientPaymentsInternal = (value || [])
      .sort(ClientPayment.compareByDateAndCurrencyAndId);
    this.totalIncomes.clear();
    this.clientPaymentsInternal.forEach(cp => this.totalIncomes.set(cp.currency, (this.totalIncomes.get(cp.currency) || 0) + cp.price));
    this.group();
  }

  displayData: PayableGroup<ClientPayment>[];
  totalIncomes = new Map<string, number>();

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

  selectedGroup: PayableGroup<ClientPayment>;
  private selectedElement: ClientPayment;

  showClientColumn = true;
  showReceiptTypeColumns = true;

  constructor() {
  }

  ngOnInit(): void {
  }

  resetColumnsVisibility(): void {
    this.showClientColumn = true;
    this.showReceiptTypeColumns = true;
  }

  group(): void {
    switch (this.groupingMode) {
      case Grouping.LACK:
        this.disableGrouping();
        break;
      case Grouping.BY_CLIENTS:
        this.groupByClients();
        break;
      case Grouping.BY_RECEIPT_TYPE:
        this.groupByReceiptType();
        break;
    }
  }

  noGrouping(): void {
    this.groupingMode = Grouping.LACK;
    this.disableGrouping();
  }

  byClients(): void {
    this.groupingMode = Grouping.BY_CLIENTS;
    this.groupByClients();
  }

  byReceiptType(): void {
    this.groupingMode = Grouping.BY_RECEIPT_TYPE;
    this.groupByReceiptType();
  }

  disableGrouping(): void {
    this.displayData = PayableGroup.groupData(this.clientPayments, ps => null, ps => '');
    this.selectedGroup = this.displayData.length > 0 ? this.displayData[0] : null;
    this.resetColumnsVisibility();
  }

  groupByClients(): void {
    this.displayData = PayableGroup.groupData(
      this.clientPayments,
      cp => cp && cp.client && cp.client.id || null,
      cp => cp && cp.client && cp.client.name || ''
    );
    this.selectGroup();
    this.resetColumnsVisibility();
    this.showClientColumn = false;
  }

  groupByReceiptType(): void {
    this.displayData = PayableGroup.groupData(
      this.clientPayments,
      cp => cp && this.convertReceiptTypeToId(cp),
      cp => cp && this.convertReceiptTypeToName(cp)
    );
    this.selectGroup();
    this.resetColumnsVisibility();
    this.showReceiptTypeColumns = false;
  }

  private selectGroup(): void {
    if (this.selectedGroup !== null) {
      this.selectedGroup = (this.displayData || []).find(g => g.title === this.selectedGroup.title);
    }
  }

  convertReceiptTypeToId(cp: ClientPayment): number {
    return cp.invoice ? 1 : cp.billOfSale ? 2 : cp.billOfSaleAsInvoice ? 3 : cp.notRegistered ? 4 : 5;
  }

  convertReceiptTypeToName(cp: ClientPayment): string {
    return cp.invoice ? 'faktura'
      : cp.billOfSale ? 'paragon'
        : cp.billOfSaleAsInvoice ? 'paragon jako faktura'
          : cp.notRegistered ? 'na czarno' : 'brak';
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

  setGroupToDisplay(payableGroup: PayableGroup<ClientPayment>): void {
    if (this.selectedGroup && this.selectedGroup.isEqual(payableGroup)) {
      this.selectedGroup = null;
    } else {
      this.selectedGroup = payableGroup;
    }
  }

  setClientPayment(clientPayment: ClientPayment): void {
    if (this.isEqualToSelectedElement(clientPayment)) {
      this.selectedElement = null;
    } else {
      this.selectedElement = clientPayment;
    }
  }

  isGrouped(): boolean {
    return this.displayData.length > 1;
  }

  isEqualToSelectedGroup(payableGroup: PayableGroup<ClientPayment>): boolean {
    return this.selectedGroup && this.selectedGroup.isEqual(payableGroup);
  }

  isEqualToSelectedElement(clientPayment: ClientPayment): boolean {
    return this.selectedElement && this.selectedElement.id === clientPayment.id;
  }

  getGroupClass(payableGroup: PayableGroup<ClientPayment>): string {
    if (this.selectedGroup && this.selectedGroup.isEqual(payableGroup)) {
      return '';
    }
    return this.getPaymentStatusClass(payableGroup.status);
  }

  getClientPaymentClass(clientPayment: ClientPayment): string {
    const paymentStatus = clientPayment.getPaymentStatus();
    return this.getPaymentStatusClass(paymentStatus);
  }

  private getPaymentStatusClass(paymentStatus: PaymentStatus): string {
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

  getPerformedService(payment: SimplePerformedServicePayment): PerformedService {
    return this.performedServices.find(cp => cp.id === payment.performedServiceId);
  }

  getDataLength(): number {
    return this.displayData.reduce((a, b) => a + (b && b.data && b.data.length || 0), 0);
  }
}
