import {ChartConfiguration, ChartOptions} from 'chart.js';

export class SyrCell {
  private nameInternal: string;
  private valueInternal: number | null;

  constructor(name: string, value: number | null) {
    this.nameInternal = name;
    this.valueInternal = value;
  }

  get name(): string {
    return this.nameInternal;
  }

  get value(): number | null {
    return this.valueInternal;
  }
}

export class CountrySyrLineChart {

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    datasets: [],
    labels: []
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true
  };

  private years: number[] = [];
  public chartsData = new Map<string, (number | null)[]>();
  private _selectedChart: string = '';
  get selectedChart(): string {
    return this._selectedChart;
  }

  set selectedChart(value: string) {
    this._selectedChart = value;
    for (const line of this.chartsData.keys()) {
      if (this.selectedChart === line) {
        this.lineChartData = {
          datasets: [{data: this.chartsData.get(line) || [], label: line}],
          labels: this.years
        };
      }
    }
  }

  constructor(data: Map<string, Map<number, SyrCell[]>>) {
    this.years = [];
    data.forEach(d => {
      for (const key of d.keys()) {
        if (!this.years.includes(key)) {
          this.years.push(key);
        }
      }
    });
    this.years = this.years.sort();
    this.years.forEach(year => {
      data.forEach((countryData, countryName) => {
        const yearStats = countryData.get(year);
        if (yearStats) {
          yearStats.forEach(cell => {
            const label = cell.name;
            let values = this.chartsData.get(label);
            if (!values) {
              values = [];
            }
            values.push(cell.value);
            this.chartsData.set(label, values);
          });
        } else {
          this.chartsData.forEach((dataSet, label) => {
            if (label.startsWith(countryName + ' - ')) {
              dataSet.push(null);
            }
          });
        }
      });
    });
    this.selectedChart = this.chartsData.keys().next()?.value || '';
  }
}
