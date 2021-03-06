export interface Payable {

  getPaidAmountForNow(): number;

  getPaymentStatus(): PaymentStatus;

  getPrice(): number;

  getCurrency(): string;

}

export enum PaymentStatus {
  NOT_PAID, UNDERPAID, PAID
}
