import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Service} from '../model/service';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {

  private readonly endpoint = `${environment.serviceUrl}/services`;

  constructor(private http: HttpClient) {
  }

  currentDomainServices(): Observable<Service[]> {
    return this.http.get<Service[]>(this.endpoint).pipe(map((data: Service[]) => (data.map(d => new Service(d)))));
  }

  updateService(service: Service): Observable<Service> {
    return this.http.patch(this.endpoint, service).pipe(map(d => new Service(d)));
  }

  createService(service: Service): Observable<Service> {
    return this.http.put(this.endpoint, service).pipe(map(d => new Service(d)));
  }
}
