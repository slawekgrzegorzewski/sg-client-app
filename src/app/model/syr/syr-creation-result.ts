import {Country} from './country';

export class SyrCreationResult {
  public notMatchedCountries: string[];
  public allCountries: Country[];

  constructor(data?: any) {
    this.notMatchedCountries = data && data.notMatchedCountries || [];
    this.allCountries = data && data.knownCountries && data.knownCountries.map(c => new Country(c)) || [];
  }
}
