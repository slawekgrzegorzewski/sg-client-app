import {PerformedService} from '../../../model/accountant/performed-service';
import {map, switchMap} from 'rxjs/operators';
import {EMPTY, forkJoin, Observable} from 'rxjs';
import {ClientPayment} from '../../../model/accountant/client-payment';
import {PerformedServicePayment, PerformedServicePaymentShort} from '../../../model/accountant/performed-service-payment';
import {PerformedServicesService} from '../../../services/accountant/performed-services.service';
import {ClientPaymentsService} from '../../../services/accountant/client-payments.service';
import {ServicesService} from '../../../services/accountant/services.service';
import {ClientsService} from '../../../services/accountant/clients.service';
import {Service} from '../../../model/accountant/service';
import {Client} from '../../../model/accountant/client';
import {PerformedServicePaymentsService} from '../../../services/accountant/performed-service-payments.service';

export class CompanyLogHelper {
  constructor(
    private performedServicePaymentsService: PerformedServicePaymentsService,
    private performedServicesService: PerformedServicesService,
    private clientPaymentsService: ClientPaymentsService,
    private servicesService: ServicesService,
    private clientsService: ClientsService
  ) {

  }

  fetchCompanyData(dateOfPerformedServices: Date, dateOfClientPayments: Date = dateOfPerformedServices): Observable<readonly [PerformedService[], ClientPayment[], Service[], Client[]]> {
    return forkJoin([
      this.performedServicesService.currentDomainServices(dateOfPerformedServices),
      this.clientPaymentsService.currentDomainClientPayments(dateOfClientPayments)
        .pipe(map(clientPayments => this.filterClientPaymentByDate(clientPayments, dateOfClientPayments))),
      this.servicesService.currentDomainServices(),
      this.clientsService.currentDomainClients()
    ]);
  }

  private filterClientPaymentByDate(clientPayments1: ClientPayment[], date: Date): ClientPayment[] {
    const currentMonth = new Date().getMonth();
    return (clientPayments1 || []).filter(cp => {
      const clientPaymentMonth = cp.date.getMonth();
      const displayingMonth = date.getMonth();
      return displayingMonth === currentMonth
        || clientPaymentMonth === displayingMonth
        || cp.serviceRelations.find(sr => sr.date.getMonth() === displayingMonth);
    });
  }

  createPerformedServiceAndFetchData(performedService: PerformedService, date: Date | null): Observable<PerformedService[]> {
    return this.performedServicesService.createService(performedService)
      .pipe(
        switchMap(value => date ? this.performedServicesService.currentDomainServices(date) : EMPTY)
      );
  }

  updatePerformedService(performedService: PerformedService, date: Date | null): Observable<PerformedService[]> {
    return this.performedServicesService.updateService(performedService)
      .pipe(
        switchMap(value => date
          ? this.performedServicesService.currentDomainServices(date)
          : EMPTY)
      );
  }

  createClientPayment(clientPayment: ClientPayment, date: Date | null): Observable<ClientPayment[]> {
    return this.clientPaymentsService.createClientPayment(clientPayment)
      .pipe(
        switchMap(value => date ? this.clientPaymentsService.currentDomainClientPayments(date) : EMPTY),
        map(clientPayments => date ? this.filterClientPaymentByDate(clientPayments, date) : clientPayments)
      );
  }

  updateClientPayment(clientPayment: ClientPayment, date: Date | null): Observable<ClientPayment[]> {
    return this.clientPaymentsService.updateClientPayment(clientPayment)
      .pipe(
        switchMap(value => date ? this.clientPaymentsService.currentDomainClientPayments(date) : EMPTY),
        map(clientPayments => date ? this.filterClientPaymentByDate(clientPayments, date) : clientPayments)
      );
  }

  createPerformedServicePayment(performedServicePayment: PerformedServicePayment, date: Date | null) : Observable<PerformedService[]> {
    return this.performedServicePaymentsService.createPerformedServicePayments(new PerformedServicePaymentShort(performedServicePayment))
      .pipe(
        switchMap(psp => date ? this.performedServicesService.currentDomainServices(date) : EMPTY)
      );
  }
}
