import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BillingPeriodsService} from '../../services/billing-periods.service';
import {DatePipe} from '@angular/common';
import {SavingsLineChart} from '../../model/charts/SavingsLineChart';
import {PiggyBank} from '../../model/piggy-bank';
import {PiggyBanksLineChart} from '../../model/charts/PiggyBanksLineChart';
import {BaseChartDirective} from 'ng2-charts';
import {ActivatedRoute} from '@angular/router';
import {DomainService} from '../../../general/services/domain.service';
import {Subscription} from 'rxjs';
import {SELECTED_DOMAIN_CHANGED} from '../../../general/utils/event-bus-events';
import {NgEventBus} from 'ng-event-bus';

export const CHARTS_ROUTER_URL = 'charts';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit, OnDestroy {
  private savingsData = new Map<Date, Map<string, number>>();
  private piggyBanksData = new Map<Date, PiggyBank[]>();
  savingsLineChart: SavingsLineChart | null = null;
  piggyBanksLineChart: PiggyBanksLineChart | null = null;

  @ViewChild('savingsChart')
  public savingsChart: BaseChartDirective | null = null;
  @ViewChild('piggyBanksChart')
  public piggyBanksChart: BaseChartDirective | null = null;

  domainSubscription: Subscription | null = null;

  constructor(private billingPeriodsService: BillingPeriodsService,
              private datePipe: DatePipe,
              private route: ActivatedRoute,
              private domainService: DomainService,
              private eventBus: NgEventBus) {
    this.domainService.registerToDomainChangesViaRouterUrl(CHARTS_ROUTER_URL, this.route);
    this.domainSubscription = this.eventBus.on(SELECTED_DOMAIN_CHANGED).subscribe((domain) => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    this.refreshData();
  }

  private refreshData() {
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
            this.piggyBanksChart.chart!.update();
          }
        });
      });
  }

  ngOnDestroy(): void {
    if (this.domainSubscription) {
      this.domainSubscription.unsubscribe();
    }
    this.domainService.deregisterFromDomainChangesViaRouterUrl(CHARTS_ROUTER_URL);
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
    this.piggyBanksChart!.chart!.update();
  }

  private isPiggyBankChartSet() {
    return this.piggyBanksChart && this.piggyBanksChart.chart && this.piggyBanksChart.chart.data && this.piggyBanksChart.chart.data.datasets;
  }
}
