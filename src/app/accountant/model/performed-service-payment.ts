import {ClientPayment, ClientPaymentDTO} from './client-payment';
import {PerformedService, PerformedServiceDTO} from './performed-service';

export type PerformedServicePaymentDTO = Omit<Partial<PerformedServicePayment>, 'performedService' | 'clientPayment' | 'date'>
  & {
  performedService?: Partial<PerformedServiceDTO>,
  clientPayment?: Partial<ClientPaymentDTO>,
  date?: string,
}

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

  constructor(data?: PerformedServicePaymentDTO) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.performedService = new PerformedService(data.performedService);
    this.clientPayment = new ClientPayment(data.clientPayment);
    this.date = data.date && new Date(data.date) || new Date();
    this.currency = data.currency || '';
    this.price = data.price || 0;
    this.billOfSale = data.billOfSale || false;
    this.billOfSaleAsInvoice = data.billOfSaleAsInvoice || false;
    this.invoice = data.invoice || false;
    this.notRegistered = data.notRegistered || false;
  }
}

export class PerformedServicePaymentShort {

  public id: number;
  public performedService: PerformedService;
  public clientPayment: ClientPayment;
  public price: number;

  constructor(data: PerformedServicePayment) {
    this.id = data.id || 0;
    this.performedService = data.performedService;
    this.clientPayment = data.clientPayment;
    this.price = data.price || 0;
  }
}
