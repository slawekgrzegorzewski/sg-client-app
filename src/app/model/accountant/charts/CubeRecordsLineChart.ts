import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, Label} from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import {EventEmitter} from '@angular/core';
import {CubeRecord} from '../../cubes/cube-record';
import {ComparatorBuilder} from '../../../../utils/comparator-builder';

export class CubeRecordsLineChart {

  public updateChart = new EventEmitter<any>();
  public lineChartData: ChartDataSets[];
  public lineChartLabels: Label[];
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: screen.width < 600 ? 0.5 : 1.5,
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
      position: 'bottom',
      align: 'start',
      onClick: (event, legendItem) => {
        const hidden = this.lineChartData[legendItem.datasetIndex].hidden;
        this.lineChartData[legendItem.datasetIndex].hidden = !hidden;
        this.updateChart.emit();
      }
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

  constructor(data: CubeRecord[]) {
    const records = data.sort(
      ComparatorBuilder.comparingByDate<CubeRecord>(cr => cr?.recordTime || new Date(0)).build()
    ).map(d => d.time);
    this.lineChartData = [{data: records, label: 'Results'}];
    this.lineChartLabels = records.map(r => '');
  }

  hideAllDataSets(): void {
    this.lineChartData.forEach(value => value.hidden = true);
  }
}
