import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Client} from '../../model/accountant/client';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  serviceUrl: string;

  constructor(private http: HttpClient) {
    this.serviceUrl = environment.serviceUrl;
  }

  currentDomainClients(): Observable<Client[]> {
    return this.http.get<Client[]>(environment.serviceUrl + '/clients').pipe(map(data => (data.map(d => new Client(d)))));
  }

  updateClient(client: Client): Observable<Client> {
    return this.http.patch(environment.serviceUrl + '/clients', client)
      .pipe(map(d => new Client(d)));
  }

  createClient(client: Client): Observable<Client> {
    return this.http.put(environment.serviceUrl + '/clients', client)
      .pipe(map(d => new Client(d)));
  }
}
