import {Component, OnDestroy, OnInit} from '@angular/core';

import {ActivatedRoute, Router} from '@angular/router';
import {SyrService} from '../../services/syr/syr.service';
import {Country} from '../../model/syr/country';
import {Observable, of, Subscription} from 'rxjs';
import {DomainService} from '../../services/domain.service';
import {ACCOUNTANT_HOME_ROUTER_URL} from '../accountant/accountant-home/accountant-home.component';

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
              private domainService: DomainService) {
    this.domainService.registerToDomainChangesViaRouterUrl(SYR_ADMIN_ROUTER_URL, this.route);
    this.domainSubscription = this.domainService.currentDomainChangeEvent.subscribe((domain) => {
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

  countriesForTypeAhead(): () => Observable<Country[]> {
    const that = this;
    return () => of(that.allCountries);
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
