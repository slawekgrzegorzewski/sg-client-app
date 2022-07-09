import {Chart, ChartConfiguration, ChartType} from 'chart.js';

import {default as Annotation} from 'chartjs-plugin-annotation';

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

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };

  public lineChartOptions: ChartConfiguration['options'] = {

    responsive: true,
    maintainAspectRatio: true,
    elements: {
      line: {
        tension: 0.5
      }
    },
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      x: {},
      'y-axis-0':
        {
          position: 'left',
        },
      'y-axis-1': {
        position: 'right',
        grid: {
          color: 'rgba(255,0,0,0.3)',
        },
        ticks: {
          color: 'red'
        }
      }
    },

    plugins: {
      legend: {display: true},
      annotation: {
        annotations: [
          {
            type: 'line',
            scaleID: 'x-axis-0',
            value: 'March',
            borderColor: 'orange',
            borderWidth: 2,
            label: {
              position: 'center',
              enabled: true,
              color: 'orange',
              content: 'LineAnno',
              font: {
                weight: 'bold'
              }
            }
          }
        ]
      }
    }
  };

  public lineChartType: ChartType = 'line';

  constructor(data: Map<string, Map<number, SyrCell[]>>) {
    Chart.register(Annotation);

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
      this.lineChartData.datasets.push({data: lines.get(line) || [], label: line});
    }
  }

  private static getDataSetLabel(countryName: string, cell: SyrCell): string {
    return countryName + ' - ' + cell.name;
  }
}
