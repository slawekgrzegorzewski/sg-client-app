import {Domain} from '../domain';

export class HolidayCurrencies {
  public id: number;
  public euroConversionRate: number;
  public kunaConversionRate: number;
  public domain: Domain;

  constructor(data?: Partial<HolidayCurrencies>) {
    if (!data) {
      data = {};
    }
    this.id = data && data.id || 0;
    this.euroConversionRate = data && data.euroConversionRate || 0;
    this.kunaConversionRate = data && data.kunaConversionRate || 0;
    this.domain = data && new Domain(data.domain);
  }
}
