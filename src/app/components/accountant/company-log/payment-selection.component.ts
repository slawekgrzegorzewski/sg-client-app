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

  forServiceInternal: PerformedService;

  @Input() get forService(): PerformedService {
    return this.forServiceInternal;
  }

  set forService(value: PerformedService) {
    this.forServiceInternal = value;
    this.filterPayments();
  }

  paymentsInternal: ClientPayment[];

  @Input() get payments(): ClientPayment[] {
    return this.paymentsInternal;
  }

  set payments(value: ClientPayment[]) {
    this.paymentsInternal = value;
    this.filterPayments();
  }

  paymentsToChoose: ClientPayment[];
  selectedPayment: ClientPayment;

  @Input() maxPrice: number;
  price: number;

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
    this.create(this.price);
  }

  createFullPSP(): void {
    this.create(this.currentMax());
  }

  private create(price: number): void {
    if (this.selectedPayment) {
      const toCreate = new PerformedServicePayment();
      toCreate.performedService = this.forService;
      toCreate.clientPayment = this.selectedPayment;
      toCreate.price = price;
      this.createEvent.emit(toCreate);
      this.reset();
    }
  }

  canCreate(): boolean {
    return this.selectedPayment && this.price > 0 && this.price <= this.maxPrice;
  }

  private filterPayments(): void {
    if (!this.forService || !this.forService.client) {
      this.paymentsToChoose = [];
    } else {
      this.paymentsToChoose = (this.payments || [])
        .filter(p => p.client)
        .filter(p => p.client.id === this.forService.client.id)
        .filter(p => p.getPaidAmountForNow() < p.price)
        .sort(ComparatorBuilder.comparingByDate<ClientPayment>(cp => cp?.date || new Date(0)).desc().build());
    }
    if ((this.paymentsToChoose && this.paymentsToChoose.length || 0) === 1) {
      this.pickPayment(this.paymentsToChoose[0]);
    }
  }

  currentMax(): number {
    return Math.min(this.maxPrice, this.selectedPayment.price - this.selectedPayment.getPaidAmountForNow());
  }
}
