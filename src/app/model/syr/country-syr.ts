import {Country} from './country';

export class CountrySYR {
  id: number;
  year: number;
  country: Country;
  population: number;
  ratio1PublisherTo: number;
  peak: number;
  average: number;
  averagePreviousYear: number;
  percentIncrease: number;
  baptized: number;
  averageAuxiliaryPioneers: number;
  averagePioneers: number;
  numberOfCongregations: number;
  totalHours: number;
  averageBibleStudies: number;
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
    this.average = data.average || 0;
    this.averagePreviousYear = data.averagePreviousYear || 0;
    this.percentIncrease = data.percentIncrease || 0;
    this.baptized = data.baptized || 0;
    this.averageAuxiliaryPioneers = data.averageAuxiliaryPioneers || 0;
    this.averagePioneers = data.averagePioneers || 0;
    this.numberOfCongregations = data.numberOfCongregations || 0;
    this.totalHours = data.totalHours || 0;
    this.averageBibleStudies = data.averageBibleStudies || 0;
    this.memorialAttendance = data.memorialAttendance || 0;
  }
}
