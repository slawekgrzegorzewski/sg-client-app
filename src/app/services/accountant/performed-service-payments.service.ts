import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {PerformedService} from '../../model/accountant/performed-service';
import {PerformedServicePayment} from '../../model/accountant/performed-service-payment';

@Injectable({
  providedIn: 'root'
})
export class PerformedServicePaymentsService {

  private readonly endpoint = `${environment.serviceUrl}/performed-service-payments`;

  constructor(private http: HttpClient) {
  }

  currentDomainPerformedServicePayments(): Observable<PerformedServicePayment[]> {
    return this.http.get<PerformedService[]>(this.endpoint).pipe(map(data => (data.map(d => new PerformedServicePayment(d)))));
  }

  updatePerformedServicePayments(payment: PerformedServicePayment): Observable<PerformedServicePayment> {
    return this.http.patch(this.endpoint, payment).pipe(map(d => new PerformedServicePayment(d)));
  }

  createPerformedServicePayments(payment: PerformedServicePayment): Observable<PerformedServicePayment> {
    return this.http.put(this.endpoint, payment).pipe(map(d => new PerformedServicePayment(d)));
  }
}
