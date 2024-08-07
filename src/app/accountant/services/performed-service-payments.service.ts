import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {PerformedService} from '../model/performed-service';
import {
  PerformedServicePayment,
  PerformedServicePaymentDTO,
  PerformedServicePaymentShort
} from '../model/performed-service-payment';
import {DatePipe} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PerformedServicePaymentsService {

  private readonly endpoint = `${environment.serviceUrl}/performed-service-payments`;

  constructor(private http: HttpClient, private datePipe: DatePipe) {
  }

  currentDomainPerformedServicePayments(date: Date): Observable<PerformedServicePayment[]> {
    const dateString = this.datePipe.transform(date, 'yyyy-MM');
    return this.http.get<PerformedServicePaymentDTO[]>(`${this.endpoint}/${dateString}`)
      .pipe(map((data: PerformedServicePaymentDTO[]) => (data.map(d => new PerformedServicePayment(d)))));
  }

  updatePerformedServicePayments(payment: PerformedServicePaymentShort): Observable<PerformedServicePayment> {
    return this.http.patch(this.endpoint, payment).pipe(map(d => new PerformedServicePayment(d)));
  }

  createPerformedServicePayments(payment: PerformedServicePaymentShort): Observable<PerformedServicePayment> {
    return this.http.put(this.endpoint, payment).pipe(map(d => new PerformedServicePayment(d)));
  }
}
