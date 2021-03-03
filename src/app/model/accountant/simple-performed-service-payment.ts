export class SimplePerformedServicePayment {

  public id: number;
  public performedServiceId: number;
  public clientPaymentId: number;
  public price: number;

  constructor(data?: any) {
    this.id = data && data.id;
    this.performedServiceId = data && data.performedServiceId || 0;
    this.clientPaymentId = data && data.clientPaymentId || 0;
    this.price = data && data.price || 0;
  }
}
