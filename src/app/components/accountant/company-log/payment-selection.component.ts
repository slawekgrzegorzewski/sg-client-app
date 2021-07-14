import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ClientPayment} from '../../../model/accountant/client-payment';
import {PerformedServicePayment} from '../../../model/accountant/performed-service-payment';
import {PerformedService} from '../../../model/accountant/performed-service';
import {ComparatorBuilder} from '../../../../utils/comparator-builder';

@Component({
  selector: 'app-payment-selection',
  templateUrl: './payment-selection.component.html',
  styleUrls: ['./payment-selection.component.css']
})
export class PaymentSelectionComponent implements OnInit {

  forServiceInternal: PerformedService | null = null;

  @Input() get forService(): PerformedService | null {
    return this.forServiceInternal;
  }

  set forService(value: PerformedService | null) {
    this.forServiceInternal = value;
    this.filterPayments();
  }

  paymentsInternal: ClientPayment[] = [];

  @Input() get payments(): ClientPayment[] {
    return this.paymentsInternal;
  }

  set payments(value: ClientPayment[]) {
    this.paymentsInternal = value;
    this.filterPayments();
  }

  paymentsToChoose: ClientPayment[] = [];
  selectedPayment: ClientPayment | null = null;

  @Input() maxPrice: number = 0;
  price: number | null = null;

  @Output() createEvent = new EventEmitter<PerformedServicePayment>();
  @Output() cancelEvent = new EventEmitter<any>();

  ngOnInit(): void {
  }

  reset(): void {
    this.selectedPayment = null;
    this.price = null;
  }

  cancel(): void {
    this.reset();
    this.cancelEvent.emit();
  }

  pickPayment(payment: ClientPayment): void {
    this.selectedPayment = payment;
  }

  createPSP(): void {
    if (this.price) {
      this.create(this.price);
    }
  }

  createFullPSP(): void {
    this.create(this.currentMax());
  }

  private create(price: number): void {
    if (this.forService && this.selectedPayment) {
      const toCreate = new PerformedServicePayment();
      toCreate.performedService = this.forService;
      toCreate.clientPayment = this.selectedPayment;
      toCreate.price = price;
      this.createEvent.emit(toCreate);
      this.reset();
    }
  }

  canCreate(): boolean {
    return this.selectedPayment !== null && this.price !== null && this.price > 0 && this.price <= this.maxPrice;
  }

  private filterPayments(): void {
    const forService = this.forService;
    if (forService !== null && forService.client !== null) {
      this.paymentsToChoose = this.payments
        .filter(p => p.client)
        .filter(p => p.client.id === forService.client.id)
        .filter(p => p.getPaidAmountForNow() < p.price)
        .sort(ComparatorBuilder.comparingByDate<ClientPayment>(cp => cp?.date || new Date(0)).desc().build());
    } else {
      this.paymentsToChoose = [];
    }
    if (this.paymentsToChoose.length === 1) {
      this.pickPayment(this.paymentsToChoose[0]);
    }
  }

  currentMax(): number {
    if (this.selectedPayment) {
      return Math.min(this.maxPrice, this.selectedPayment.price - this.selectedPayment.getPaidAmountForNow());
    }
    return this.maxPrice;
  }
}
