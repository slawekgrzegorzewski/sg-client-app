import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, Label} from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import {DatePipe} from '@angular/common';
import {Dates} from '../../../utils/dates';
import {PiggyBank} from '../piggy-bank';

export class PiggyBanksLineChart {

  public lineChartData: ChartDataSets[];
  public lineChartLabels: Label[];
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    maintainAspectRatio: false,
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
      position: 'left'
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

  constructor(data: Map<Date, PiggyBank[]>, datePipe: DatePipe) {

    this.lineChartData = [];
    this.lineChartLabels = [];

    let dates: Date[] = [];
    const piggyBanksNames = new Set<string>();
    for (const entry of data.entries()) {
      dates.push(entry[0]);
      entry[1].map(this.descriptionOfPiggyBank).forEach(value => piggyBanksNames.add(value));
    }
    dates = dates.sort(Dates.compareDates);

    const dataPerPiggyName = new Map<string, number[]>();
    dates.forEach(d => {
      this.lineChartLabels.push(datePipe.transform(d, 'yyyy-MM'));
      const dateData = data.get(d);
      for (const piggyBank of dateData) {
        const key = this.descriptionOfPiggyBank(piggyBank);
        const values = dataPerPiggyName.get(key) || [];
        values.push(piggyBank.balance);
        dataPerPiggyName.set(key, values);
      }
      piggyBanksNames.forEach(pgName => {
        if (!dateData.find(pg => this.descriptionOfPiggyBank(pg) === pgName)) {
          const values = dataPerPiggyName.get(pgName) || [];
          values.push(null);
          dataPerPiggyName.set(pgName, values);
        }
      });
    });
    Array.from(piggyBanksNames).sort((a, b) => a.localeCompare(b))
      .forEach(piggyBankName => this.lineChartData.push({data: dataPerPiggyName.get(piggyBankName), label: piggyBankName}));
  }

  private descriptionOfPiggyBank(piggyBank: PiggyBank): string {
    return piggyBank.name + ' (' + piggyBank.currency + ')';
  }
}
