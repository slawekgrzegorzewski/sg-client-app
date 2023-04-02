import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {Category} from '../model/billings/category';
import {map, share, tap} from 'rxjs/operators';
import {Refreshable} from '../../general/services/refreshable';
import {NgEventBus} from 'ng-event-bus';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService extends Refreshable {

  private readonly endpoint = `${environment.serviceUrl}/categories`;
  domainCategories: Observable<Category[]> | null = null;

  constructor(private http: HttpClient, eventBus: NgEventBus) {
    super(eventBus);
  }

  currentDomainCategories(): Observable<Category[]> {
    if (!this.domainCategories) {
      this.domainCategories = this.http.get<Category[]>(this.endpoint)
        .pipe(
          share(),
          map((data: Category[]) => (data.map(d => new Category(d))))
        );
    }
    return this.domainCategories;
  }

  updateCategory(category: Category): Observable<Category> {
    return this.http.patch(this.endpoint, category).pipe(
      map(d => new Category(d)),
      tap(d => this.refreshIP())
    );
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.put(this.endpoint, category).pipe(
      tap(d => this.refreshIP()),
      map(d => new Category(d))
    );
  }

  protected refreshIP(): void {
    this.domainCategories = null;
  }
}
