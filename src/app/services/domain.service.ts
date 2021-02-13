import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {Domain} from '../model/domain';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DomainService {
  serviceUrl: string;

  constructor(
    private http: HttpClient
  ) {
    this.serviceUrl = environment.serviceUrl;
  }

  getAllDomains(): Observable<Domain[]> {
    return this.http.get<Domain[]>(this.serviceUrl + '/domains', {responseType: 'json'})
      .pipe(map(r => r.map(r1 => new Domain(r1))));
  }
}
