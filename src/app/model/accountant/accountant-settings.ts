import {Domain} from '../domain';

export class AccountantSettings {
  public id: number;
  public company: boolean;
  public domain: Domain;

  constructor(data?: Partial<AccountantSettings>) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.company = data.company || false;
    this.domain = new Domain(data.domain);
  }
}
