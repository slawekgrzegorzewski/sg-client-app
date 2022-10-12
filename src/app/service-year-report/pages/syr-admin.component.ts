import {Component, OnDestroy, OnInit} from '@angular/core';

import {ActivatedRoute, Router} from '@angular/router';
import {SyrService} from '../services/syr.service';
import {Country} from '../model/country';
import {Subscription} from 'rxjs';
import {DomainService} from '../../general/services/domain.service';
import {SELECTED_DOMAIN_CHANGED} from '../../general/utils/event-bus-events';
import {NgEventBus} from 'ng-event-bus';

export const SYR_ADMIN_ROUTER_URL = 'syr-admin';

@Component({
  selector: 'app-syr-admin',
  templateUrl: './syr-admin.component.html',
  styleUrls: ['./syr-admin.component.css']
})
export class SyrAdminComponent implements OnInit, OnDestroy {

  countriesToMatch: { name: string; country: number }[] = [];
  allCountries: Country[] = [];
  fileToImport: File | null = null;

  domainSubscription: Subscription | null = null;

  constructor(private syrService: SyrService, private router: Router,
              private route: ActivatedRoute,
              private domainService: DomainService,
              private eventBus: NgEventBus) {
    this.domainService.registerToDomainChangesViaRouterUrl(SYR_ADMIN_ROUTER_URL, this.route);
    this.domainSubscription = this.eventBus.on(SELECTED_DOMAIN_CHANGED).subscribe((domain) => {
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.domainSubscription) {
      this.domainSubscription.unsubscribe();
    }
    this.domainService.deregisterFromDomainChangesViaRouterUrl(SYR_ADMIN_ROUTER_URL);
  }

  fileChange(event: Event): void {
    if (event.target) {
      const fileList = (event.target as HTMLInputElement).files;
      if (fileList && fileList.length > 0) {
        this.fileToImport = fileList[0];
        this.import([]);
      }
    }
  }

  countriesForTypeAhead(): () => Country[] {
    const that = this;
    return () => that.allCountries;
  }

  importSYR(): void {
    this.import(this.countriesToMatch);
  }

  private import(newCountriesMatch: { name: string; country: number }[]): void {
    if (!this.fileToImport) {
      return;
    }
    this.syrService.import(this.fileToImport, newCountriesMatch).subscribe(
      result => {
        if (result.notMatchedCountries) {
          this.countriesToMatch = [];
          result.notMatchedCountries.forEach(c => this.countriesToMatch.push({name: c, country: -1}));
          this.allCountries = result.knownCountries;
        } else {
          this.countriesToMatch = [];
          this.allCountries = [];
          this.fileToImport = null;
        }
      });
  }
}
