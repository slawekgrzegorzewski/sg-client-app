import {Component, OnDestroy, OnInit} from '@angular/core';

import {ActivatedRoute, Router} from '@angular/router';
import {SyrService} from '../../services/syr/syr.service';
import {Country} from '../../model/syr/country';
import {Subscription} from 'rxjs';
import {CountrySYR} from '../../model/syr/country-syr';
import {SecretCountriesSYR} from '../../model/syr/secret-countries-syr';
import {CountrySyrLineChart, SyrCell} from '../../model/syr/CountrySyrLineChart';
import {DomainService} from '../../services/domain.service';
import {SELECTED_DOMAIN_CHANGED} from '../../utils/event-bus-events';
import {NgEventBus} from 'ng-event-bus';

export const SYR_HOME_ROUTER_URL = 'syr-home';

@Component({
  selector: 'app-syr-home',
  templateUrl: './syr-home.component.html',
  styleUrls: ['./syr-home.component.css']
})
export class SyrHomeComponent implements OnInit, OnDestroy {

  private countryInternal: Country | null = null;

  get country(): Country | null {
    return this.countryInternal;
  }

  set country(value: Country | null) {
    this.countryInternal = value;
    this.refreshView();
  }

  reports: (CountrySYR | SecretCountriesSYR)[] = [];

  selectedCountryData: Map<number, SyrCell[]> = new Map<number, SyrCell[]>();
  availableCountries: Country[] = [];

  countrySyrLineChart: CountrySyrLineChart | null = null;

  domainSubscription: Subscription | null = null;

  constructor(private syrService: SyrService, private router: Router,
              private route: ActivatedRoute,
              private domainService: DomainService,
              private eventBus: NgEventBus) {
    this.domainService.registerToDomainChangesViaRouterUrl(SYR_HOME_ROUTER_URL, this.route);
    this.domainSubscription = this.eventBus.on(SELECTED_DOMAIN_CHANGED).subscribe((domain) => {
      this.getData();
    });
  }

  ngOnInit(): void {
    this.getData();
  }

  ngOnDestroy(): void {
    if (this.domainSubscription) {
      this.domainSubscription.unsubscribe();
    }
    this.domainService.deregisterFromDomainChangesViaRouterUrl(SYR_HOME_ROUTER_URL);
  }

  getData(): void {
    this.syrService.getAll()
      .subscribe(value => {
        this.reports = value;
        this.selectedCountryData = new Map<number, SyrCell[]>();
        this.refreshView();
      });
  }


  private refreshView(): void {

    this.reports.filter(r => r instanceof CountrySYR)
      .map(r => r as CountrySYR)
      .filter(r => this.country && this.country.id === r.country.id)
      .sort((a, b) => a.year - b.year)
      .forEach(r => this.selectedCountryData.set(r.year, this.getSyrCells(r)));
    this.availableCountries = this.reports
      .filter(r => r instanceof CountrySYR)
      .map(r => r as CountrySYR)
      .map(cSYR => cSYR.country);
    if (this.country) {
      const data: Map<string, Map<number, SyrCell[]>> = new Map<string, Map<number, SyrCell[]>>();
      data.set(this.country.names[0], this.selectedCountryData);
      this.countrySyrLineChart = new CountrySyrLineChart(data);
    }
  }

  getSyrCells(r: CountrySYR): SyrCell[] {
    return [
      new SyrCell('Najwyższa liczba głosicieli', r.peak),
      new SyrCell('Przeciętna liczba głosicieli', r.average),
      new SyrCell('Przeciętna liczba pionierów pomocniczych', r.averageAuxiliaryPioneers),
      new SyrCell('Przeciętna liczba studiów biblijnych', r.averageBibleStudies),
      new SyrCell('Przeciętna liczba pionierów stałych', r.averagePioneers),
      new SyrCell('Przeciętna liczba głosicieli w roku poprzednim', r.averagePreviousYear),
      new SyrCell('Liczba chrztów', r.baptized),
      new SyrCell('Liczba obecnych na pamiątce', r.memorialAttendance),
      new SyrCell('Liczba zborów', r.numberOfCongregations),
      new SyrCell('Procentowy wzrost', r.percentIncrease),
      new SyrCell('Liczba osób na jednego głosiciela', r.ratio1PublisherTo),
      new SyrCell('Liczba godzin w służbie', r.totalHours)
    ];
  }

}
