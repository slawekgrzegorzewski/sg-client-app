import {CurrencyPipe} from '@angular/common';

export class NodrigenInstitution {
  public id: string;
  public name: string;
  public bic: string;
  public transaction_total_days: number;
  public countries: string[];
  public logo: string;

  constructor(data?: Partial<NodrigenInstitution>) {
    if (!data) {
      data = {};
    }
    this.id = data.id || '';
    this.name = data.name || '';
    this.bic = data.bic || '';
    this.transaction_total_days = data.transaction_total_days || 0;
    this.countries = data.countries || [];
    this.logo = data.logo || '';
  }
}
