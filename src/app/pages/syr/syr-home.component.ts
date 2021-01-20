import {Component, OnInit} from '@angular/core';

import {Router} from '@angular/router';
import {SyrService} from '../../services/syr/syr.service';
import {Country} from '../../model/syr/country';
import {Observable, of} from 'rxjs';
import {CountrySYR} from '../../model/syr/country-syr';
import {SecretCountriesSYR} from '../../model/syr/secret-countries-syr';
import {CountrySyrLineChart, SyrCell} from '../../model/syr/CountrySyrLineChart';

@Component({
  selector: 'app-syr-home',
  templateUrl: './syr-home.component.html',
  styleUrls: ['./syr-home.component.css']
})
export class SyrHomeComponent implements OnInit {

  private countryInternal: Country;

  get country(): Country {
    return this.countryInternal;
  }

  set country(value: Country) {
    this.countryInternal = value;
    this.refreshView();
  }

  reports: (CountrySYR | SecretCountriesSYR)[];

  selectedCountryData: Map<number, SyrCell[]> = new Map<number, SyrCell[]>();
  availableCountries: Country[] = [];

  countrySyrLineChart: CountrySyrLineChart;

  constructor(private syrService: SyrService, private router: Router) {
  }

  ngOnInit(): void {
    this.getData();
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

  countriesForTypeAhead(): () => Observable<Country[]> {
    const that = this;
    return () => of(that.availableCountries);
  }

  countryIdExtractor(country: Country): number {
    if (!country) {
      return null;
    }
    return country.id;
  }

  countryToString(country: Country): string {
    return country.names.join(', ');
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
