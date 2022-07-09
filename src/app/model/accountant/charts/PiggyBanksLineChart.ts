import {Component, EventEmitter, ViewChild} from '@angular/core';
import {Chart, ChartConfiguration, ChartEvent, ChartType} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';

import {default as Annotation} from 'chartjs-plugin-annotation';
import {PiggyBank} from '../piggy-bank';
import {DatePipe} from '@angular/common';
import {ComparatorBuilder} from '../../../utils/comparator-builder';

export class PiggyBanksLineChart {

  public updateChart = new EventEmitter<any>();
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };
  public lineChartOptions: ChartConfiguration['options'] = {
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
            scaleID: 'x',
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
          },
        ],
      }
    }
  };
  public lineChartType: ChartType = 'line';

  constructor(data: Map<Date, PiggyBank[]>, datePipe: DatePipe) {

    Chart.register(Annotation);

    let dates: Date[] = [];
    const piggyBanksNames = new Set<string>();
    for (const entry of data.entries()) {
      dates.push(entry[0]);
      entry[1].map(this.descriptionOfPiggyBank).forEach(value => piggyBanksNames.add(value));
    }
    dates = dates.sort(ComparatorBuilder.comparingByDateDays<Date>(date => date).build());

    const dataPerPiggyName = new Map<string, (number | null)[]>();
    dates.forEach(d => {
      let dateLabel = datePipe.transform(d, 'yyyy-MM') || '';
      const dateData = data.get(d) || [];
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
      .forEach(piggyBankName => this.lineChartData.datasets.push({data: dataPerPiggyName.get(piggyBankName) || [], label: piggyBankName}));
  }

  private descriptionOfPiggyBank(piggyBank: PiggyBank): string {
    return piggyBank.name + ' (' + piggyBank.currency + ')';
  }

  hideAllDataSets(): void {
    this.lineChartData.datasets.forEach(value => value.hidden = true);
  }
}
