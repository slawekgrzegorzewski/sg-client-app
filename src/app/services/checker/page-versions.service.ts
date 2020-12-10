import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {PageVersion} from '../../model/checker/page-version';
import {SettingsService} from '../accountant/settings.service';

@Injectable({
  providedIn: 'root'
})
export class PageVersionsService {
  serviceUrl: string;

  constructor(private http: HttpClient,
              private settingsService: SettingsService,
              @Inject(LOCALE_ID) private defaultLocale: string) {
    this.serviceUrl = environment.serviceUrl;
  }

  public getAllPageVersions(): Observable<PageVersion[]> {
    return this.http.get<PageVersion[]>(environment.serviceUrl + '/page-version')
      .pipe(map(data => data.map(d => new PageVersion(d))));
  }

}
