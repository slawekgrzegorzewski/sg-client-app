export class SimplePerformedServicePayment {

  public id: number;
  public performedServiceId: number;
  public clientPaymentId: number;
  public date: Date;
  public currency: string;
  public price: number;
  public billOfSale: boolean;
  public billOfSaleAsInvoice: boolean;
  public invoice: boolean;
  public notRegistered: boolean;

  constructor(data?: any) {
    this.id = data && data.id;
    this.performedServiceId = data && data.performedServiceId || 0;
    this.clientPaymentId = data && data.clientPaymentId || 0;
    this.date = data && new Date(data.date) || null;
    this.currency = data && data.currency || '';
    this.price = data && data.price || 0;
    this.billOfSale = data && data.billOfSale || false;
    this.billOfSaleAsInvoice = data && data.billOfSaleAsInvoice || false;
    this.invoice = data && data.invoice || false;
    this.notRegistered = data && data.notRegistered || false;
  }
}
