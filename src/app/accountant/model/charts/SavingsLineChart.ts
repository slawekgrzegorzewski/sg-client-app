import {Component, ViewChild} from '@angular/core';
import {Chart, ChartConfiguration, ChartEvent, ChartType} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';

import {default as Annotation} from 'chartjs-plugin-annotation';
import {DatePipe} from '@angular/common';
import {ComparatorBuilder} from '../../../general/utils/comparator-builder';

export class SavingsLineChart {

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

  constructor(data: Map<Date, Map<string, number>>, datePipe: DatePipe) {

    Chart.register(Annotation);

    let dates: Date[] = [];
    for (const key of data.keys()) {
      dates.push(key);
    }
    dates = dates.sort(ComparatorBuilder.comparingByDateDays<Date>(date => date).build());
    const dataPerCurrency = new Map<string, (number | null)[]>();
    dates.forEach(d => {
      let dateLabel = datePipe.transform(d, 'yyyy-MM') || '';
      const dateData = data.get(d) || new Map<string, number>();
      for (const currency of dateData.keys()) {
        const values = dataPerCurrency.get(currency) || [];
        values.push(dateData.get(currency) || null);
        dataPerCurrency.set(currency, values);
      }
    });
    for (const currency of dataPerCurrency.keys()) {
      this.lineChartData.datasets.push({data: dataPerCurrency.get(currency) || [], label: 'Oszczędności (' + currency + ')'});
    }
  }
}
