import {ForTypeahead} from '../../accountant/model/for-typeahead';

export class Country implements ForTypeahead {
  public id: number;
  public names: string[];

  constructor(data?: Partial<Country>) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.names = data.names || [];
  }

  getTypeaheadId(): string {
    return String(this.id);
  }

  getTypeaheadDescription(): string {
    return this.names.join(', ');
  }
}
