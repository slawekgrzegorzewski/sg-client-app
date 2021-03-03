import {Domain} from '../domain';

export class AccountantSettings {
  public id: number;
  public company: boolean;
  public domain: Domain;

  constructor(data?: any) {
    this.id = data && data.id;
    this.company = data && data.company || false;
    this.domain = data && new Domain(data.domain) || null;
  }
}
