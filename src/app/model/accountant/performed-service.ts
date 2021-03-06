import {Domain} from '../domain';
import {Service} from './service';
import {Client} from './client';
import {SimplePerformedServicePayment} from './simple-performed-service-payment';

export enum PaymentStatus {
  NOT_PAID, UNDERPAID, PAID
}

export class PerformedService {

  public id: number;
  public date: Date;
  public service: Service;
  public client: Client;
  public price: number;
  public currency: string;
  public clientPaymentsRelations: SimplePerformedServicePayment[];
  public domain: Domain;

  constructor(data?: any) {
    this.id = data && data.id;
    this.date = data && new Date(data.date) || null;
    this.service = data && new Service(data.service) || null;
    this.client = data && new Client(data.client) || null;
    this.price = data && data.price || 0;
    this.currency = data && data.currency || '';
    this.clientPaymentsRelations = data
      && data.clientPaymentsRelations
      && data.clientPaymentsRelations.map(sr => new SimplePerformedServicePayment(sr)) || [];
    this.domain = data && new Domain(data.domain) || null;
  }

  public static compareByDateAndClientAndServiceAndId(first: PerformedService, second: PerformedService): number {
    const dateComparison = first.date.getTime() - second.date.getTime();
    if (dateComparison !== 0) {
      return -dateComparison;
    } else {
      const clientComparison = first.client.name.localeCompare(second.client.name);
      if (clientComparison !== 0) {
        return clientComparison;
      } else {
        const serviceComparison = first.service.name.localeCompare(second.service.name);
        if (serviceComparison !== 0) {
          return serviceComparison;
        }
        return first.id - second.id;
      }
    }
  }

  public isForCurrentMonth(): boolean {
    return this.date.getMonth() === new Date().getMonth();
  }

  public getPaymentStatus(): PaymentStatus {
    const sum = this.getPaidAmountForNow();
    if (sum === this.price) {
      return PaymentStatus.PAID;
    } else if (sum > 0) {
      return PaymentStatus.UNDERPAID;
    } else {
      return PaymentStatus.NOT_PAID;
    }
  }

  getPaidAmountForNow(): number {
    return this.clientPaymentsRelations.map(p => p.price).reduce((a, b) => a + b, 0);
  }
}
