import {Domain} from '../../domain';
import {ForTypeahead} from '../for-typeahead';

export class Category implements ForTypeahead {
  public id: number;
  public name: string;
  public description: string;
  public domain: Domain;

  constructor(data?: any) {
    this.id = data && data.id;
    this.name = data && data.name || '';
    this.description = data && data.description || '';
    this.domain = data && new Domain(data.domain) || null;
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
