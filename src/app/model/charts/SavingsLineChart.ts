import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, Label} from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import {DatePipe} from '@angular/common';
import {Dates} from '../../../utils/dates';

export class SavingsLineChart {

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

  constructor(data: Map<Date, Map<string, number>>, datePipe: DatePipe) {

    this.lineChartData = [];
    this.lineChartLabels = [];
    let dates: Date[] = [];
    for (const key of data.keys()) {
      dates.push(key);
    }
    dates = dates.sort(Dates.compareDates);
    const dataPerCurrency = new Map<string, number[]>();
    dates.forEach(d => {
      this.lineChartLabels.push(datePipe.transform(d, 'yyyy-MM'));
      const dateData = data.get(d);
      for (const currency of dateData.keys()) {
        const values = dataPerCurrency.get(currency) || [];
        values.push(dateData.get(currency));
        dataPerCurrency.set(currency, values);
      }
    });
    for (const currency of dataPerCurrency.keys()) {
      this.lineChartData.push({data: dataPerCurrency.get(currency), label: 'Oszczędności (' + currency + ')'});
    }
  }
}
