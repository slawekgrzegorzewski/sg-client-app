import {ClientPayment} from './client-payment';
import {PerformedService} from './performed-service';

export class PerformedServicePayment {

  public id: number;
  public performedService: PerformedService;
  public clientPayment: ClientPayment;
  public date: Date;
  public currency: string;
  public price: number;
  public billOfSale: boolean;
  public billOfSaleAsInvoice: boolean;
  public invoice: boolean;
  public notRegistered: boolean;

  constructor(data?: any) {
    this.id = data && data.id;
    this.performedService = data && new PerformedService(data.performedService) || null;
    this.clientPayment = data && new ClientPayment(data.clientPayment) || null;
    this.date = data && new Date(data.date) || null;
    this.currency = data && data.currency || '';
    this.price = data && data.price || 0;
    this.billOfSale = data && data.billOfSale || false;
    this.billOfSaleAsInvoice = data && data.billOfSaleAsInvoice || false;
    this.invoice = data && data.invoice || false;
    this.notRegistered = data && data.notRegistered || false;
  }
}

export class PerformedServicePaymentShort {

  public id: number;
  public performedService: PerformedService;
  public clientPayment: ClientPayment;
  public price: number;

  constructor(data?: PerformedServicePayment) {
    this.id = data && data.id;
    this.performedService = data && new PerformedService(data.performedService) || null;
    this.clientPayment = data && new ClientPayment(data.clientPayment) || null;
    this.price = data && data.price || 0;
  }
}
