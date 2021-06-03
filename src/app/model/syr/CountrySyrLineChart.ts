import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, Label} from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';

export class SyrCell {
  private nameInternal: string;
  private valueInternal: number;

  constructor(name: string, value: number) {
    this.nameInternal = name;
    this.valueInternal = value;
  }

  get name(): string {
    return this.nameInternal;
  }

  get value(): number {
    return this.valueInternal;
  }
}

export class CountrySyrLineChart {

  public lineChartData: ChartDataSets[];
  public lineChartLabels: Label[];
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{}],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
          ticks: {
            beginAtZero: true
          }
        }
      ]
    },
    annotation: {
      annotations: [
        {
          type: 'line',
          mode: 'vertical',
          scaleID: 'x-axis-0',
          value: 'March',
          borderColor: 'orange',
          borderWidth: 2,
          label: {
            enabled: true,
            fontColor: 'orange',
            content: 'LineAnno'
          }
        },
      ],
    },
    legend: {
      position: 'bottom'
    }
  };
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';
  public lineChartPlugins = [pluginAnnotations];
  public lineChartColors: Color[] = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // red
      backgroundColor: 'rgba(255,0,0,0.3)',
      borderColor: 'red',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];

  constructor(data: Map<string, Map<number, SyrCell[]>>) {

    this.lineChartData = [];
    this.lineChartLabels = [];

    let years: number[] = [];
    data.forEach(countryData => {
      for (const key of countryData.keys()) {
        if (!years.includes(key)) {
          years.push(key);
        }
      }
    });
    years = years.sort();

    const lines = new Map<string, (number | null)[]>();
    years.forEach(year => {
      this.lineChartLabels.push('' + year);
      data.forEach((countryData, countryName) => {
        const yearStats = countryData.get(year);
        if (yearStats) {
          yearStats.forEach(cell => {
            const label = CountrySyrLineChart.getDataSetLabel(countryName, cell);
            let values = lines.get(label);
            if (!values) {
              values = [];
            }
            values.push(cell.value);
            lines.set(label, values);
          });
        } else {
          lines.forEach((dataSet, label) => {
            if (label.startsWith(countryName + ' - ')) {
              dataSet.push(null);
            }
          });
        }
      });
    });
    for (const line of lines.keys()) {
      this.lineChartData.push({data: lines.get(line), label: line, lineTension: 0});
    }
  }

  private static getDataSetLabel(countryName: string, cell: SyrCell): string {
    return countryName + ' - ' + cell.name;
  }
}
