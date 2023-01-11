import {Country} from './country';

export class CountrySYR {
  id: number;
  year: number;
  country: Country;
  population: number;
  ratio1PublisherTo: number;
  peak: number;
  average: number | null;
  averagePreviousYear: number | null;
  percentIncrease: number;
  baptized: number;
  averageAuxiliaryPioneers: number | null;
  averagePioneers: number;
  numberOfCongregations: number;
  totalHours: number | null;
  averageBibleStudies: number | null;
  memorialAttendance: number;

  static isInstanceOf(value: any): boolean {
    return value.hasOwnProperty('ratio1PublisherTo');
  }

  constructor(data?: Partial<CountrySYR>) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.year = data.year || 0;
    this.country = new Country(data.country);
    this.population = data.population || 0;
    this.ratio1PublisherTo = data.ratio1PublisherTo || 0;
    this.peak = data.peak || 0;
    this.average = data.average || null;
    this.averagePreviousYear = data.averagePreviousYear || null;
    this.percentIncrease = data.percentIncrease || 0;
    this.baptized = data.baptized || 0;
    this.averageAuxiliaryPioneers = data.averageAuxiliaryPioneers || null;
    this.averagePioneers = data.averagePioneers || 0;
    this.numberOfCongregations = data.numberOfCongregations || 0;
    this.totalHours = data.totalHours || null;
    this.averageBibleStudies = data.averageBibleStudies || null;
    this.memorialAttendance = data.memorialAttendance || 0;
  }
}
