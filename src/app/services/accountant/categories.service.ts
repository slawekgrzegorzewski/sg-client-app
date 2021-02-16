import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {SettingsService} from './settings.service';
import {DatePipe} from '@angular/common';
import {Category} from '../../model/accountant/billings/category';
import {map} from 'rxjs/operators';
import {DomainService} from '../domain.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  serviceUrl: string;

  constructor(private http: HttpClient,
              private settingsService: SettingsService,
              private domainService: DomainService,
              private datePipe: DatePipe,
              @Inject(LOCALE_ID) private defaultLocale: string) {
    this.serviceUrl = environment.serviceUrl;
  }

  currentDomainCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(environment.serviceUrl + '/categories/' + this.domainService.currentDomainId)
      .pipe(map(data => (data.map(d => new Category(d)))));
  }

  updateCategory(category: Category): Observable<Category> {
    return this.putCategory(category);
  }

  createCategory(category: Category): Observable<Category> {
    return this.putCategory(category);
  }

  private putCategory(category: Category): Observable<Category> {
    category.domain = this.domainService.currentDomain;
    return this.http.put(environment.serviceUrl + '/categories', category)
      .pipe(map(d => new Category(d)));
  }
}
