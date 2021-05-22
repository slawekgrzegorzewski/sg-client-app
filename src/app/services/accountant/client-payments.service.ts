import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ClientPayment} from '../../model/accountant/client-payment';
import {DatePipe} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ClientPaymentsService {

  private readonly endpoint = `${environment.serviceUrl}/client-payments`;

  constructor(private http: HttpClient, private datePipe: DatePipe) {
  }

  currentDomainClientPayments(date: Date): Observable<ClientPayment[]> {
    const dateString = this.datePipe.transform(date, 'yyyy-MM');
    return this.http.get<ClientPayment[]>(`${this.endpoint}/${dateString}`).pipe(map((data: []) => (data.map(d => new ClientPayment(d)))));
  }

  updateClientPayment(clientPayment: ClientPayment): Observable<ClientPayment> {
    return this.http.patch(this.endpoint, clientPayment).pipe(map(d => new ClientPayment(d)));
  }

  createClientPayment(clientPayment: ClientPayment): Observable<ClientPayment> {
    return this.http.put(this.endpoint, clientPayment).pipe(map(d => new ClientPayment(d)));
  }
}
