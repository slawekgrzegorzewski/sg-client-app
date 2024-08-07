import {Domain} from '../../general/model/domain';
import {Client} from './client';
import {SimplePerformedServicePayment} from './simple-performed-service-payment';
import {Payable, PaymentStatus} from './payable';


export type ClientPaymentDTO = Omit<Partial<ClientPayment>, 'date' | 'client' | 'serviceRelations'>
  & {
  client?: Partial<Client>,
  date?: string,
  serviceRelations?: (Omit<SimplePerformedServicePayment, 'date'> & { date: string }) []
}

export class ClientPayment implements Payable {
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

  constructor(data?: ClientPaymentDTO) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.date = data.date && new Date(data.date) || new Date();
    this.client = new Client(data.client);
    this.price = data.price || 0;
    this.currency = data.currency || '';
    this.billOfSale = data.billOfSale || false;
    this.billOfSaleAsInvoice = data.billOfSaleAsInvoice || false;
    this.invoice = data.invoice || false;
    this.notRegistered = data.notRegistered || false;
    this.serviceRelations = (data.serviceRelations || []).map(sr => new SimplePerformedServicePayment(sr));
    this.domain = new Domain(data.domain);
  }

  public static compareByDateAndCurrencyAndId(first: ClientPayment, second: ClientPayment): number {
    const dateComparison = first.date.getTime() - second.date.getTime();
    if (dateComparison !== 0) {
      return -dateComparison;
    } else {
      const currencyComparison = first.currency.localeCompare(second.currency);
      if (currencyComparison !== 0) {
        return currencyComparison;
      }
      return first.id - second.id;
    }
  }

  getPaidAmountForNow(): number {
    return this.serviceRelations
      .filter(psp => psp.clientPaymentId === this.id)
      .map(psp => psp.price)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
  }

  public isForCurrentMonth(): boolean {
    return this.date.getMonth() === new Date().getMonth();
  }

  public getPaymentStatus(): PaymentStatus {
    const sum = this.serviceRelations.map(p => p.price).reduce((a, b) => a + b, 0);
    if (sum === this.price) {
      return PaymentStatus.PAID;
    } else if (sum > 0) {
      return PaymentStatus.UNDERPAID;
    } else {
      return PaymentStatus.NOT_PAID;
    }
  }

  getPrice(): number {
    return this.price;
  }

  getCurrency(): string {
    return this.currency;
  }
}
