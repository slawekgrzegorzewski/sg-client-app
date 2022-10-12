import {Country} from './country';

type SyrCreationResultDTO = Omit<Partial<SyrCreationResult>, 'knownCountries'> & { knownCountries?: Partial<Country>[] }

export class SyrCreationResult {
  public notMatchedCountries: string[];
  public knownCountries: Country[];

  constructor(data?: Partial<SyrCreationResult>) {
    if (!data) {
      data = {};
    }
    this.notMatchedCountries = data.notMatchedCountries || [];
    this.knownCountries = data.knownCountries && data.knownCountries.map(c => new Country(c)) || [];
  }
}
