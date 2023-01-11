import {Component, EventEmitter, ViewChild} from '@angular/core';
import {Chart, ChartConfiguration, ChartEvent, ChartType} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';

import {default as Annotation} from 'chartjs-plugin-annotation';
import {ChartOptions} from 'chart.js/dist/types';

export type ChartMode = 'RAW' | 'MOVING_AVERAGE'

export class CubeRecordsLineChart {

  public updateChart = new EventEmitter<any>();

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    datasets: [],
    labels: []
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      x: {
        ticks: {
          display: true
        }
      }
    }
  };

  constructor(data: (number | null)[], mode: ChartMode) {
    switch (mode) {
      case 'RAW':
        this.lineChartData = {
          datasets: [
            {
              data: data || [],
              label: 'Results',
              cubicInterpolationMode: 'monotone'
            }
          ],
          labels: data.map(d => ''),
        };
        break;
      case 'MOVING_AVERAGE':
        this.lineChartData = {
          datasets: [
            {
              data: data || [],
              label: 'Moving average',
              cubicInterpolationMode: 'monotone'
            }
          ],
          labels: data.map(d => ''),
        };
        break;
    }
  }

  hideAllDataSets(): void {
    this.lineChartData.datasets.forEach(value => value.hidden = true);
  }
}
