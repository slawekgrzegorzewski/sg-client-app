import {Domain} from '../../general/model/domain';

export class BankAccount {
  id: number;
  iban: string;
  currency: string;
  owner: string;
  product: string;
  bic: string;
  externalId: string;
  domain: Domain;

  constructor(data?: Partial<BankAccount>) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.iban = data.iban || '';
    this.currency = data.currency || '';
    this.owner = data.owner || '';
    this.product = data.product || '';
    this.bic = data.bic || '';
    this.externalId = data.externalId || '';
    this.domain = new Domain(data.domain);
  }
}
