type SimplePerformedServicePaymentDTO = Omit<Partial<SimplePerformedServicePayment>, 'date'> & { date?: string };

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

  constructor(data?: SimplePerformedServicePaymentDTO) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.performedServiceId = data.performedServiceId || 0;
    this.clientPaymentId = data.clientPaymentId || 0;
    this.date = data.date && new Date(data.date) || new Date();
    this.currency = data.currency || '';
    this.price = data.price || 0;
    this.billOfSale = data.billOfSale || false;
    this.billOfSaleAsInvoice = data.billOfSaleAsInvoice || false;
    this.invoice = data.invoice || false;
    this.notRegistered = data.notRegistered || false;
  }
}
