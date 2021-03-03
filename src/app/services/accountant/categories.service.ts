import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {Category} from '../../model/accountant/billings/category';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private readonly endpoint = `${environment.serviceUrl}/categories`;

  constructor(private http: HttpClient) {
  }

  currentDomainCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.endpoint).pipe(map(data => (data.map(d => new Category(d)))));
  }

  updateCategory(category: Category): Observable<Category> {
    return this.http.patch(this.endpoint, category).pipe(map(d => new Category(d)));
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.put(this.endpoint, category).pipe(map(d => new Category(d)));
  }
}
