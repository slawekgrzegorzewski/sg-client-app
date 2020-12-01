import {Component, OnInit} from '@angular/core';
import {BillingPeriodsService} from '../../services/billing-periods.service';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, Label} from 'ng2-charts';
import {DatePipe} from '@angular/common';
import * as pluginAnnotations from 'chartjs-plugin-annotation';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {
  showChart = false;
  private data: Map<Date, Map<string, number>>;
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
        },
        {
          id: 'y-axis-1',
          position: 'right',
          gridLines: {
            color: 'rgba(255,0,0,0.3)',
          },
          ticks: {
            fontColor: 'red',
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

  constructor(private billingPeriodsService: BillingPeriodsService,
              private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.billingPeriodsService.getHistoricalSavings(200).subscribe(
      data => {
        this.showChart = false;
        this.lineChartData = [];
        this.lineChartLabels = [];
        this.data = data;
        let dates: Date[] = [];
        for (const key of data.keys()) {
          dates.push(key);
        }
        dates = dates.sort(this.compareDates);
        const dataPerCurrency = new Map<string, number[]>();
        dates.forEach(d => {
          this.lineChartLabels.push(this.datePipe.transform(d, 'yyyy-MM'));
          const dateData = data.get(d);
          for (const currency of dateData.keys()) {
            const values = dataPerCurrency.get(currency) || [];
            values.push(dateData.get(currency));
            dataPerCurrency.set(currency, values);
          }
        });
        for (const currency of dataPerCurrency.keys()) {
          this.lineChartData.push({data: dataPerCurrency.get(currency), label: currency});
        }
        this.showChart = true;
      }
    );
  }

  private compareDates(first: Date, second: Date): number {
    if (first > second) {
      return 1;
    }
    if (first < second) {
      return -1;
    }
    return 0;
  }

  chartHovered($event: { event: MouseEvent; active: {}[] }) {

  }

  chartClicked($event: { event?: MouseEvent; active?: {}[] }) {

  }
}
