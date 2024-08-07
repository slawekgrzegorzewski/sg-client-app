import {Component, OnDestroy, OnInit} from '@angular/core';
import {PageVersionsService} from '../../services/page-versions.service';
import {PageVersion} from '../../model/page-version';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {DomainService} from '../../../general/services/domain.service';
import {SELECTED_DOMAIN_CHANGED} from '../../../general/utils/event-bus-events';
import {NgEventBus} from 'ng-event-bus';

export const CHECKER_HOME_ROUTER_URL = 'checker-home';

@Component({
  selector: 'app-checker-home',
  templateUrl: './checker-home.component.html',
  styleUrls: ['./checker-home.component.css']
})
export class CheckerHomeComponent implements OnInit, OnDestroy {

  versions: PageVersion[] = [];
  selectedVersion: PageVersion | null = null;

  domainSubscription: Subscription | null = null;

  constructor(private pageVersionsService: PageVersionsService,
              private route: ActivatedRoute,
              private domainService: DomainService,
              private eventBus: NgEventBus) {
    this.domainService.registerToDomainChangesViaRouterUrl(CHECKER_HOME_ROUTER_URL, this.route);
    this.domainSubscription = this.eventBus.on(SELECTED_DOMAIN_CHANGED).subscribe((domain) => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    this.refreshData();
  }

  private refreshData() {
    this.pageVersionsService.getAllPageVersions().subscribe(data => {
      this.versions = data.sort((a, b) => a.versionTime.getMilliseconds() - b.versionTime.getMilliseconds());
    });
  }

  ngOnDestroy(): void {
    if (this.domainSubscription) {
      this.domainSubscription.unsubscribe();
    }
    this.domainService.deregisterFromDomainChangesViaRouterUrl(CHECKER_HOME_ROUTER_URL);
  }

  switchSelection(version: PageVersion): void {
    if (this.selectedVersion && this.selectedVersion === version) {
      this.selectedVersion = null;
    } else {
      this.selectedVersion = version;
    }
  }

  shouldShow(version: PageVersion): boolean {
    if (!this.selectedVersion) {
      return false;
    }
    return this.selectedVersion.id === version.id;
  }
}
