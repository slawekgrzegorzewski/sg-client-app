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

  constructor(data?: any) {
    this.id = data && data.id || 0;
    this.year = data && data.year || 0;
    this.country = data && new Country(data.country) || null;
    this.population = data && data.population || null;
    this.ratio1PublisherTo = data && data.ratio1PublisherTo || null;
    this.peak = data && data.peak || null;
    this.average = data && data.average || null;
    this.averagePreviousYear = data && data.averagePreviousYear || null;
    this.percentIncrease = data && data.percentIncrease || null;
    this.baptized = data && data.baptized || null;
    this.averageAuxiliaryPioneers = data && data.averageAuxiliaryPioneers || null;
    this.averagePioneers = data && data.averagePioneers || null;
    this.numberOfCongregations = data && data.numberOfCongregations || null;
    this.totalHours = data && data.totalHours || null;
    this.averageBibleStudies = data && data.averageBibleStudies || null;
    this.memorialAttendance = data && data.memorialAttendance || null;
  }
}
