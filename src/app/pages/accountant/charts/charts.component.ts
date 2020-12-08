import {Component, OnInit, ViewChild} from '@angular/core';
import {BillingPeriodsService} from '../../../services/accountant/billing-periods.service';
import {DatePipe} from '@angular/common';
import {SavingsLineChart} from '../../../model/charts/SavingsLineChart';
import {PiggyBank} from '../../../model/piggy-bank';
import {PiggyBanksLineChart} from '../../../model/charts/PiggyBanksLineChart';
import {BaseChartDirective} from 'ng2-charts';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {
  private savingsData: Map<Date, Map<string, number>>;
  private piggyBanksData: Map<Date, PiggyBank[]>;
  savingsLineChart: SavingsLineChart;
  piggyBanksLineChart: PiggyBanksLineChart;

  @ViewChild('savingsChart')
  public savingsChart: BaseChartDirective;
  @ViewChild('piggyBanksChart')
  public piggyBanksChart: BaseChartDirective;

  constructor(private billingPeriodsService: BillingPeriodsService,
              private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.billingPeriodsService.getHistoricalSavings(200).subscribe(
      data => {
        this.savingsData = data;
        this.savingsLineChart = new SavingsLineChart(data, this.datePipe);
      }
    );
    this.billingPeriodsService.getHistoricalPiggyBanks(200).subscribe(
      data => {
        this.piggyBanksData = data;
        this.piggyBanksLineChart = new PiggyBanksLineChart(data, this.datePipe);
        this.piggyBanksLineChart.updateChart.subscribe(d => this.piggyBanksChart.chart.update());
      }
    );
  }

  hideAllPiggyBanksDataSets(): void {
    this.piggyBanksChart.chart.data.datasets.forEach(value => {
      value.hidden = true;
    });
    this.piggyBanksChart.chart.update();
  }

  showAllPiggyBanksDataSets(): void {
    this.piggyBanksChart.chart.data.datasets.forEach(value => {
      value.hidden = false;
    });
    this.piggyBanksChart.chart.update();
  }
}
