import {Domain} from '../domain';
import {Client} from './client';
import {SimplePerformedServicePayment} from './simple-performed-service-payment';

export enum ClientPaymentStatus {
  NOT_PAID, UNDERPAID, PAID
}

export class ClientPayment {
  public id: number;
  public date: Date;
  public client: Client;
  public price: number;
  public currency: string;
  public billOfSale: boolean;
  public billOfSaleAsInvoice: boolean;
  public invoice: boolean;
  public notRegistered: boolean;
  public serviceRelations: SimplePerformedServicePayment[];
  public domain: Domain;

  constructor(data?: any) {
    this.id = data && data.id;
    this.date = data && new Date(data.date) || null;
    this.client = data && new Client(data.client) || null;
    this.price = data && data.price || 0;
    this.currency = data && data.currency || '';
    this.billOfSale = data && data.billOfSale || false;
    this.billOfSaleAsInvoice = data && data.billOfSaleAsInvoice || false;
    this.invoice = data && data.invoice || false;
    this.notRegistered = data && data.notRegistered || false;
    this.serviceRelations = data
      && data.serviceRelations
      && data.serviceRelations.map(sr => new SimplePerformedServicePayment(sr)) || [];
    this.domain = data && new Domain(data.domain) || null;
  }

  public static compareByDateAndCurrency(first: ClientPayment, second: ClientPayment): number {
    const dateComparison = first.date.getTime() - second.date.getTime();
    if (dateComparison !== 0) {
      return dateComparison;
    } else {
      return first.currency.localeCompare(second.currency);
    }
  }

  getPaidAmountForNow(): number {
    return this.serviceRelations
      .filter(psp => psp.clientPaymentId === this.id)
      .map(psp => psp.price)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
  }

  public getPaymentStatus(): ClientPaymentStatus {
    const sum = this.serviceRelations.map(p => p.price).reduce((a, b) => a + b, 0);
    if (sum === this.price) {
      return ClientPaymentStatus.PAID;
    } else if (sum > 0) {
      return ClientPaymentStatus.UNDERPAID;
    } else {
      return ClientPaymentStatus.NOT_PAID;
    }
  }
}
