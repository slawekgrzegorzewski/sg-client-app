import {Domain} from '../domain';
import {ForTypeahead} from './for-typeahead';

export class Service implements ForTypeahead {
  public id: number;
  public name: string;
  public domain: Domain;

  constructor(data?: any) {
    this.id = data && data.id;
    this.name = data && data.name || '';
    this.domain = data && new Domain(data.domain) || null;
  }

  getTypeaheadId(): string {
    return String(this.id);
  }

  getTypeaheadDescription(): string {
    return this.name;
  }
}
