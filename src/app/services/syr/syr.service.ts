import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {SettingsService} from '../accountant/settings.service';
import {Observable} from 'rxjs';
import {SyrCreationResult} from '../../model/syr/syr-creation-result';
import {map} from 'rxjs/operators';
import {CountrySYR} from '../../model/syr/country-syr';
import {SecretCountriesSYR} from '../../model/syr/secret-countries-syr';

@Injectable({
  providedIn: 'root'
})
export class SyrService {

  private readonly endpoint = `${environment.serviceUrl}/syr`;

  constructor(private http: HttpClient,
              private settingsService: SettingsService,
              @Inject(LOCALE_ID) private defaultLocale: string) {

  }

  public import(file: File, newCountriesMatch: { name: string; country: number }[]): Observable<SyrCreationResult> {
    const formData: FormData = new FormData();
    formData.append('uploadFile', file);
    formData.append('newCountriesMatch', JSON.stringify(newCountriesMatch));
    return this.http.post(this.endpoint, formData, {responseType: 'json'}).pipe(map(r => new SyrCreationResult(r)));
  }

  public getAll(): Observable<(CountrySYR | SecretCountriesSYR) []> {
    return this.http.get<(CountrySYR | SecretCountriesSYR) []>(this.endpoint, {responseType: 'json'})
      .pipe(
        map((r: (CountrySYR | SecretCountriesSYR)[]) => r.map(r1 => CountrySYR.isInstanceOf(r1)
          ? new CountrySYR(r1)
          : new SecretCountriesSYR(r1))));
  }

}
