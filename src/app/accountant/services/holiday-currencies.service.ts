import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {HolidayCurrencies} from '../model/holiday-currencies';

@Injectable({
  providedIn: 'root'
})
export class HolidayCurrenciesService {

  private readonly endpoint = `${environment.serviceUrl}/holiday-currencies`;

  constructor(private http: HttpClient) {
  }

  currentDomain(): Observable<HolidayCurrencies> {
    return this.http.get<HolidayCurrencies>(`${this.endpoint}`).pipe(map((data: HolidayCurrencies) => new HolidayCurrencies(data)));
  }

  create(holidayCurrencies: HolidayCurrencies): Observable<HolidayCurrencies> {
    return this.http.put<HolidayCurrencies>(this.endpoint, holidayCurrencies)
      .pipe(map(a => new HolidayCurrencies(a)));
  }

  update(holidayCurrencies: HolidayCurrencies): Observable<string> {
    return this.http.patch(this.endpoint, holidayCurrencies, {responseType: 'text'});
  }
}
