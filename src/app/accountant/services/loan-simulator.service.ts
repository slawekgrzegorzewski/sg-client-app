import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {NgEventBus} from 'ng-event-bus';
import {map} from 'rxjs/operators';
import {Refreshable} from '../../general/services/refreshable';
import {LoginService} from '../../general/services/login.service';
import {DomainService} from '../../general/services/domain.service';
import {Apollo, QueryRef} from 'apollo-angular';
import {LoanInstallment} from '../model/loan-installment';
import Decimal from 'decimal.js';
import {SimulateLoan} from '../../../../types';
import {DatesUtils} from '../../general/utils/dates-utils';
import {DatePipe} from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class LoanSimulatorService extends Refreshable {

  constructor(
    private apollo: Apollo,
    private datePipe: DatePipe,
    private loginService: LoginService,
    private domainService: DomainService,
    private http: HttpClient,
    eventBus: NgEventBus) {
    super(eventBus);
  }

  private simulateLoanQueryRef: QueryRef<{ simulateLoan: LoanInstallment[] }> | null = null;

  simulateLoan(
    loanAmount: Decimal,
    numberOfInstallments: number,
    overpaymentMonthlyBudget: Decimal,
    overpaymentYearlyBudget: Decimal,
    rate: Decimal,
    repaymentStart: Date,
    wibor: Decimal
  ): Observable<LoanInstallment[]> {
    this.simulateLoanQueryRef = this.apollo
      .watchQuery<{ simulateLoan: LoanInstallment[] }>({
        query: SimulateLoan,
        variables: {
          loanAmount: loanAmount,
          numberOfInstallments: numberOfInstallments,
          overpaymentMonthlyBudget: overpaymentMonthlyBudget,
          overpaymentYearlyBudget: overpaymentYearlyBudget,
          rate: rate,
          repaymentStart: DatesUtils.getDateString(repaymentStart, this.datePipe),
          wibor: wibor
        }
      });
    return this.simulateLoanQueryRef.valueChanges
      .pipe(
        map(result => result.data && result.data.simulateLoan && result.data.simulateLoan.map(installment => new LoanInstallment(installment)))
      );
  }

  public refreshData(): void {
    this.simulateLoanQueryRef?.refetch();
  }
}
