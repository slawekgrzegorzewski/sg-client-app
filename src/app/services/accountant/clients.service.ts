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
  private endpoint = `${environment.serviceUrl}/clients`;

  constructor(private http: HttpClient) {

  }

  currentDomainClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.endpoint).pipe(map((data: Client[]) => (data.map(d => new Client(d)))));
  }

  updateClient(client: Client): Observable<Client> {
    return this.http.patch(this.endpoint, client).pipe(map(d => new Client(d)));
  }

  createClient(client: Client): Observable<Client> {
    return this.http.put(this.endpoint, client).pipe(map(d => new Client(d)));
  }
}
