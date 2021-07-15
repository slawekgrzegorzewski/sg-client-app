import {Component, OnInit, ViewChild} from '@angular/core';
import {BillingPeriodsService} from '../../../services/accountant/billing-periods.service';
import {DatePipe} from '@angular/common';
import {SavingsLineChart} from '../../../model/accountant/charts/SavingsLineChart';
import {PiggyBank} from '../../../model/accountant/piggy-bank';
import {PiggyBanksLineChart} from '../../../model/accountant/charts/PiggyBanksLineChart';
import {BaseChartDirective} from 'ng2-charts';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {
  private savingsData = new Map<Date, Map<string, number>>();
  private piggyBanksData = new Map<Date, PiggyBank[]>();
  savingsLineChart: SavingsLineChart | null = null;
  piggyBanksLineChart: PiggyBanksLineChart | null = null;

  @ViewChild('savingsChart')
  public savingsChart: BaseChartDirective | null = null;
  @ViewChild('piggyBanksChart')
  public piggyBanksChart: BaseChartDirective | null = null;

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
        this.piggyBanksLineChart.updateChart.subscribe(d => {
          if (this.piggyBanksChart) {
            this.piggyBanksChart.chart.update();
          }
        });
      });
  }

  hideAllPiggyBanksDataSets(): void {
    if (!this.isPiggyBankChartSet()) {
      return;
    }
    this.piggyBanksChart!.chart!.data!.datasets!.forEach(value => {
      value.hidden = true;
    });
    this.piggyBanksChart!.chart!.update();
  }

  showAllPiggyBanksDataSets(): void {
    if (!this.isPiggyBankChartSet()) {
      return;
    }
    this.piggyBanksChart!.chart!.data!.datasets!.forEach(value => {
      value.hidden = false;
    });
    this.piggyBanksChart!.chart.update();
  }

  private isPiggyBankChartSet() {
    return this.piggyBanksChart && this.piggyBanksChart.chart && this.piggyBanksChart.chart.data && this.piggyBanksChart.chart.data.datasets;
  }
}
