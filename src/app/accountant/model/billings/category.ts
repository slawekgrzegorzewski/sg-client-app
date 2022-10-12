import {Domain} from '../../../general/model/domain';
import {ForTypeahead} from '../for-typeahead';

export class Category implements ForTypeahead {
  public id: number;
  public name: string;
  public description: string;
  public domain: Domain;

  constructor(data?: Partial<Category>) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.name = data.name || '';
    this.description = data.description || '';
    this.domain = new Domain(data.domain);
  }

  public fullName(): string {
    return this.name + ' - ' + this.description;
  }

  getTypeaheadId(): string {
    return String(this.id);
  }

  getTypeaheadDescription(): string {
    return this.fullName();
  }
}
