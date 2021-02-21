import {Domain} from '../domain';

export class Client {
  public id: number;
  public name: string;
  public domain: Domain;

  constructor(data?: any) {
    this.id = data && data.id;
    this.name = data && data.name || '';
    this.domain = data && new Domain(data.domain) || null;
  }
}
