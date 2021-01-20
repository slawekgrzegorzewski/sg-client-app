export class SecretCountriesSYR {
  id: number;
  year: number;
  numberOfCountries: number;
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
    return value.hasOwnProperty('numberOfCountries');
  }

  constructor(data?: any) {
    this.id = data && data.id || 0;
    this.year = data && data.year || 0;
    this.numberOfCountries = data && data.numberOfCountries || 0;
    this.peak = data && data.peak || 0;
    this.average = data && data.average || 0;
    this.averagePreviousYear = data && data.averagePreviousYear || 0;
    this.percentIncrease = data && data.percentIncrease || 0;
    this.baptized = data && data.baptized || 0;
    this.averageAuxiliaryPioneers = data && data.averageAuxiliaryPioneers || 0;
    this.averagePioneers = data && data.averagePioneers || 0;
    this.numberOfCongregations = data && data.numberOfCongregations || 0;
    this.totalHours = data && data.totalHours || 0;
    this.averageBibleStudies = data && data.averageBibleStudies || 0;
    this.memorialAttendance = data && data.memorialAttendance || 0;
  }
}
