import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {PerformedService} from '../../model/accountant/performed-service';
import {DatePipe} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PerformedServicesService {

  private readonly endpoint = `${environment.serviceUrl}/performed-services`;

  constructor(private http: HttpClient, private datePipe: DatePipe) {
  }

  currentDomainServices(date: Date): Observable<PerformedService[]> {
    const dateString = this.datePipe.transform(date, 'yyyy-MM');
    return this.http.get<PerformedService[]>(`${this.endpoint}/${dateString}`)
      .pipe(map((data: []) => (data.map(d => new PerformedService(d)))));
  }

  updateService(service: PerformedService): Observable<PerformedService> {
    return this.http.patch(this.endpoint, service).pipe(map(d => new PerformedService(d)));
  }

  createService(service: PerformedService): Observable<PerformedService> {
    return this.http.put(this.endpoint, service).pipe(map(d => new PerformedService(d)));
  }
}
