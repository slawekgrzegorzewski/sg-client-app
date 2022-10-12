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

  constructor(data?: Partial<SecretCountriesSYR>) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.year = data.year || 0;
    this.numberOfCountries = data.numberOfCountries || 0;
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
