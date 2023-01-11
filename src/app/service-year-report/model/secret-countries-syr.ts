export class SecretCountriesSYR {
  id: number;
  year: number;
  numberOfCountries: number;
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
