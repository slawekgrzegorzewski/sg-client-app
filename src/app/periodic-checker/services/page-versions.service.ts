import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {PageVersion, PageVersionDTO} from '../model/page-version';
import {SettingsService} from '../../accountant/services/settings.service';

@Injectable({
  providedIn: 'root'
})
export class PageVersionsService {

  private readonly endpoint = `${environment.serviceUrl}/page-version`;

  constructor(private http: HttpClient,
              private settingsService: SettingsService,
              @Inject(LOCALE_ID) private defaultLocale: string) {
  }

  public getAllPageVersions(): Observable<PageVersion[]> {
    return this.http.get<PageVersionDTO[]>(this.endpoint)
      .pipe(map((data: PageVersionDTO[]) => data.map(d => new PageVersion(d))));
  }

}
