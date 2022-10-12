import {Domain} from '../../general/model/domain';
import {Service} from './service';
import {Client} from './client';
import {SimplePerformedServicePayment} from './simple-performed-service-payment';
import {Payable, PaymentStatus} from './payable';

export type PerformedServiceDTO = Omit<Partial<PerformedService>, 'date' | 'service' | 'client' | 'clientPaymentsRelations'>
  & {
  date?: string,
  client?: Partial<Client>,
  service?: Partial<Service>,
  clientPaymentsRelations?: (Omit<SimplePerformedServicePayment, 'date'> & { date: string }) []
}

export class PerformedService implements Payable {

  public id: number;
  public date: Date;
  public service: Service;
  public client: Client;
  public price: number;
  public currency: string;
  public clientPaymentsRelations: SimplePerformedServicePayment[];
  public domain: Domain;

  constructor(data?: PerformedServiceDTO) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.date = data.date && new Date(data.date) || new Date();
    this.service = new Service(data.service);
    this.client = new Client(data.client);
    this.price = data.price || 0;
    this.currency = data.currency || '';
    this.clientPaymentsRelations = data.clientPaymentsRelations && data.clientPaymentsRelations.map(sr => new SimplePerformedServicePayment(sr)) || [];
    this.domain = new Domain(data.domain);
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

  getPrice(): number {
    return this.price;
  }

  getCurrency(): string {
    return this.currency;
  }
}
