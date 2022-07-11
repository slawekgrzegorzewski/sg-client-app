import {Component, OnDestroy, OnInit} from '@angular/core';
import {PageVersionsService} from '../../../services/checker/page-versions.service';
import {PageVersion} from '../../../model/checker/page-version';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {DomainService} from '../../../services/domain.service';
import {ACCOUNTANT_HOME_ROUTER_URL} from '../../accountant/accountant-home/accountant-home.component';
import {SELECTED_DOMAIN_CHANGED} from '../../../app.module';
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
