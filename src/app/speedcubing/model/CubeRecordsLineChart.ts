import {Component, EventEmitter, ViewChild} from '@angular/core';
import {Chart, ChartConfiguration, ChartEvent, ChartType} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';

import {default as Annotation} from 'chartjs-plugin-annotation';

export type ChartMode = 'RAW' | 'MOVING_AVERAGE'

export class CubeRecordsLineChart {

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
      legend: { display: true },
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

  constructor(data: (number | null)[], mode: ChartMode) {
    Chart.register(Annotation);
    switch (mode) {
      case 'RAW':
        this.lineChartData = {datasets: [{data: data || [], label: 'Results'}]};
        break;
      case 'MOVING_AVERAGE':
        this.lineChartData = {datasets: [{data: data || [], label: 'Moving average'}]};
        break;
    }
  }

  hideAllDataSets(): void {
    this.lineChartData.datasets.forEach(value => value.hidden = true);
  }
}
