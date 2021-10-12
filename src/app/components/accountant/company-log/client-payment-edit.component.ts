import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Currency} from '../../../model/accountant/currency';
import {ClientPayment} from '../../../model/accountant/client-payment';
import {Client} from '../../../model/accountant/client';
import {PerformedService} from '../../../model/accountant/performed-service';

@Component({
  selector: 'app-client-payment-edit',
  templateUrl: './client-payment-edit.component.html',
  styleUrls: ['./client-payment-edit.component.css']
})
export class ClientPaymentEditComponent implements OnInit {

  get receiptType(): string | null {
    if (this.clientPayment) {
      if (this.clientPayment.billOfSale) {
        return 'BOS';
      }
      if (this.clientPayment.billOfSaleAsInvoice) {
        return 'BOSAI';
      }
      if (this.clientPayment.invoice) {
        return 'I';
      }
      if (this.clientPayment.notRegistered) {
        return 'NR';
      }
    }
    return null;
  }

  set receiptType(value: string | null) {
    switch (value) {
      case 'BOS':
        this.setBillOfSale();
        break;
      case 'BOSAI':
        this.setBillAsInvoice();
        break;
      case 'I':
        this.setInvoice();
        break;
      case 'NR':
        this.setNotRegistered();
        break;
      default:
        this.clearReceiptType();
        break;
    }
  }

  @Input() clientPayment: ClientPayment | null = null;
  @Input() performedServices: PerformedService[] = [];
  @Input() editMode = false;
  @Input() createMode = false;
  @Input() allCurrencies: Currency[] = [];
  @Input() clients: Client[] = [];

  @Output() onClientPaymentUpdate = new EventEmitter<ClientPayment>();
  @Output() onClientPaymentCreate = new EventEmitter<ClientPayment>();
  @Output() onEditCancel = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit(): void {
  }

  resetEditForm(): void {
    this.onEditCancel.emit();
  }

  create(): void {
    if (this.clientPayment) {
      this.onClientPaymentCreate.emit(this.clientPayment);
    }
  }

  update(): void {
    this.updateEditElement();
  }

  private updateEditElement(): void {
    if (this.clientPayment) {
      this.onClientPaymentUpdate.emit(this.clientPayment);
    }
  }

  canCreate(): boolean {
    return true; // this.isCreateEditMode() && this.allRequiredFieldsSet();
  }

  canEdit(): boolean {
    return true; // this.isGeneralEditMode() && this.allRequiredFieldsSet();
  }

  private allRequiredFieldsSet(): boolean {
    return this.clientPayment !== null
      && this.clientPayment.price > 0
      && this.clientPayment.currency !== ''
      && this.clientPayment.date !== null;
  }

  currenciesForTypeAhead(): () => Observable<Currency[]> {
    const that = this;
    return () => of(that.allCurrencies);
  }

  clientsForTypeAhead(): () => Observable<Client[]> {
    const that = this;
    const clientsOccurrences: Map<number, number> = new Map<number, number>();
    that.performedServices.filter(ps => ps.date.getMonth() >= new Date().getMonth() - 1).forEach(ps => {
      clientsOccurrences.set(ps.client.id, (clientsOccurrences.get(ps.client.id) || 0) + 1);
    });
    const clientsToShow = that.clients.sort((a, b) => {
      const order = (clientsOccurrences.get(b.id) || 0) - (clientsOccurrences.get(a.id) || 0);
      if (order !== 0) {
        return order;
      }
      return a.name.localeCompare(b.name);
    });
    return () => of(clientsToShow);
  }

  setBillOfSale(): void {
    if (this.clientPayment) {
      this.clientPayment.billOfSale = true;
      this.clientPayment.billOfSaleAsInvoice = false;
      this.clientPayment.invoice = false;
      this.clientPayment.notRegistered = false;
    }
  }

  setBillAsInvoice(): void {
    if (this.clientPayment) {
      this.clientPayment.billOfSale = false;
      this.clientPayment.billOfSaleAsInvoice = true;
      this.clientPayment.invoice = false;
      this.clientPayment.notRegistered = false;
    }
  }

  setInvoice(): void {
    if (this.clientPayment) {
      this.clientPayment.billOfSale = false;
      this.clientPayment.billOfSaleAsInvoice = false;
      this.clientPayment.invoice = true;
      this.clientPayment.notRegistered = false;
    }
  }

  setNotRegistered(): void {
    if (this.clientPayment) {
      this.clientPayment.billOfSale = false;
      this.clientPayment.billOfSaleAsInvoice = false;
      this.clientPayment.invoice = false;
      this.clientPayment.notRegistered = true;
    }
  }

  private clearReceiptType(): void {
    if (this.clientPayment) {
      this.clientPayment.billOfSale = false;
      this.clientPayment.billOfSaleAsInvoice = false;
      this.clientPayment.invoice = false;
      this.clientPayment.notRegistered = false;
    }
  }
}
