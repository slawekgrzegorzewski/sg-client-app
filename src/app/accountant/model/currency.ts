import {ForTypeahead} from './for-typeahead';

export class Currency implements ForTypeahead {

  public static fromData(data?: Partial<Currency>): Currency {
    if (!data) {
      data = {};
    }
    return new Currency(data.code || '', data.displayName || '');
  }

  constructor(public code: string, public displayName: string) {

  }

  public description(): string {
    return this.code + ' - ' + this.displayName;
  }

  getTypeaheadId(): string {
    return this.code;
  }

  getTypeaheadDescription(): string {
    return this.description();
  }
}

export const EMPTY_CURRENCY = new Currency('', '');
