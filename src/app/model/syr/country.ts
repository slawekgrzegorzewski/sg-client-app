import {ForTypeahead} from '../accountant/for-typeahead';

export class Country implements ForTypeahead {
  public id: number;
  public names: string[];

  constructor(data?: any) {
    this.id = data && data.id;
    this.names = data && data.names || [];
  }

  getTypeaheadId(): string {
    return String(this.id);
  }

  getTypeaheadDescription(): string {
    return this.names.join(', ');
  }
}
