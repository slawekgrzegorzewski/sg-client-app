import {Domain} from '../../general/model/domain';
import {ForTypeahead} from './for-typeahead';

export class Client implements ForTypeahead {
  public id: number;
  public name: string;
  public domain: Domain;

  constructor(data?: Partial<Client>) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.name = data.name || '';
    this.domain = new Domain(data.domain);
  }

  getTypeaheadId(): string {
    return String(this.id);
  }

  getTypeaheadDescription(): string {
    return this.name;
  }
}
