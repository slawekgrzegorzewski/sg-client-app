import {Component, OnDestroy, OnInit} from '@angular/core';
import {PiggyBank} from '../../model/piggy-bank';
import {BillingPeriod, BillingPeriodInfo} from '../../model/billings/billing-period';
import {AccountsService} from '../../services/accounts.service';
import {PiggyBanksService} from '../../services/piggy-banks.service';
import {BillingPeriodsService} from '../../services/billing-periods.service';
import {Income} from '../../model/billings/income';
import {Expense} from '../../model/billings/expense';
import {DomainService} from '../../../general/services/domain.service';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {SELECTED_DOMAIN_CHANGED} from '../../../general/utils/event-bus-events';
import {NgEventBus} from 'ng-event-bus';

export const BILLING_SMALL_ROUTER_URL = 'billing-small';

@Component({
  selector: 'app-billing-small',
  templateUrl: './billing-small.component.html',
  styleUrls: ['./billing-small.component.css']
})
export class BillingSmallComponent implements OnInit, OnDestroy {

  piggyBanks: PiggyBank[] = [];
  billingPeriodInfo: BillingPeriodInfo | null = null;

  domainSubscription: Subscription | null = null;

  constructor(private accountsService: AccountsService,
              private piggyBanksService: PiggyBanksService,
              private billingsService: BillingPeriodsService,
              private domainService: DomainService,
              private route: ActivatedRoute,
              private eventBus: NgEventBus
  ) {
    this.domainService.registerToDomainChangesViaRouterUrl(BILLING_SMALL_ROUTER_URL, this.route);
    this.domainSubscription = this.eventBus.on(SELECTED_DOMAIN_CHANGED).subscribe((domain) => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    this.refreshData();
  }

  ngOnDestroy(): void {
    if (this.domainSubscription) {
      this.domainSubscription.unsubscribe();
    }
    this.domainService.deregisterFromDomainChangesViaRouterUrl(BILLING_SMALL_ROUTER_URL);
  }

  refreshData(): void {
    this.fetchPiggyBanks();
  }

  fetchBillingPeriod(date: Date): void {
    this.billingsService.billingPeriodFor(date).subscribe(
      data => this.billingPeriodInfo = data,
      error => this.billingPeriodInfo = null
    );
  }

  private fetchPiggyBanks(): void {
    this.piggyBanksService.currentDomainPiggyBanks().subscribe(data => {
      this.piggyBanks = data.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  createElement(billingPeriod: BillingPeriod, element: Income | Expense, accountId: number): void {
    this.billingsService.createBillingElement(element, accountId)
      .subscribe(
        success => {
          this.refreshData();
          this.fetchBillingPeriod(billingPeriod.period);
        },
        error => {
          this.refreshData();
          this.fetchBillingPeriod(billingPeriod.period);
        });
  }

  updatePiggyBank(piggyBank: PiggyBank): void {
    this.piggyBanksService.update(piggyBank)
      .subscribe(
        success => this.refreshData(),
        error => this.refreshData()
      );
  }

  finishBillingPeriod(date: Date): void {
    this.billingsService.finishBillingPeriodOf(date).subscribe(
      data => this.fetchBillingPeriod(date)
    );
  }

  createBilling(date: Date): void {
    this.billingsService.createBillingPeriodFor(date).subscribe(
      data => this.fetchBillingPeriod(date)
    );
  }

}
