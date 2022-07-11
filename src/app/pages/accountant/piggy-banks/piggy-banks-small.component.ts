import {Component, OnDestroy, OnInit} from '@angular/core';
import {PiggyBank} from '../../../model/accountant/piggy-bank';
import {PiggyBanksService} from '../../../services/accountant/piggy-banks.service';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {DomainService} from '../../../services/domain.service';
import {SELECTED_DOMAIN_CHANGED} from '../../../app.module';
import {NgEventBus} from 'ng-event-bus';

export const PIGGY_BANKS_SMALL_ROUTER_URL = 'piggy-banks-small';

@Component({
  selector: 'app-piggy-banks-small',
  templateUrl: './piggy-banks-small.component.html',
  styleUrls: ['./piggy-banks-small.component.css']
})
export class PiggyBanksSmallComponent implements OnInit, OnDestroy {

  piggyBanks: PiggyBank[] = [];

  domainSubscription: Subscription | null = null;

  constructor(private piggyBanksService: PiggyBanksService,
              private route: ActivatedRoute,
              private domainService: DomainService,
              private eventBus: NgEventBus
  ) {
    this.domainService.registerToDomainChangesViaRouterUrl(PIGGY_BANKS_SMALL_ROUTER_URL, this.route);
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
    this.domainService.deregisterFromDomainChangesViaRouterUrl(PIGGY_BANKS_SMALL_ROUTER_URL);
  }

  refreshData(): void {
    this.fetchPiggyBanks();
  }

  private fetchPiggyBanks(): void {
    this.piggyBanksService.currentDomainPiggyBanks().subscribe(data => {
      this.piggyBanks = data.sort((a, b) => a.name.localeCompare(b.name));
    });
  }


  updatePiggyBank(piggyBank: PiggyBank): void {
    this.piggyBanksService.update(piggyBank)
      .subscribe(
        success => this.refreshData(),
        error => this.refreshData()
      );
  }

}
