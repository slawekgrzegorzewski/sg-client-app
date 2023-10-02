import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {NgEventBus} from 'ng-event-bus';
import {map} from 'rxjs/operators';
import {Refreshable} from '../../general/services/refreshable';
import {LoginService} from '../../general/services/login.service';
import {DomainService} from '../../general/services/domain.service';
import {Apollo, QueryRef} from 'apollo-angular';
import {MortgageInstallment} from '../model/mortgage-installment';
import Decimal from 'decimal.js';
import {SimulateMortgage} from '../../../../types';
import {DatesUtils} from '../../general/utils/dates-utils';
import {DatePipe} from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class MortgageSimulatorService extends Refreshable {

  constructor(
    private apollo: Apollo,
    private datePipe: DatePipe,
    private loginService: LoginService,
    private domainService: DomainService,
    private http: HttpClient,
    eventBus: NgEventBus) {
    super(eventBus);
  }

  private simulateMortgageQueryRef: QueryRef<{ simulateMortgage: MortgageInstallment[] }> | null = null;

  simulateMortgage(
    mortgageAmount: Decimal,
    numberOfInstallments: number,
    overpaymentMonthlyBudget: Decimal,
    overpaymentYearlyBudget: Decimal,
    rate: Decimal,
    repaymentStart: Date,
    wibor: Decimal
  ): Observable<MortgageInstallment[]> {
    this.simulateMortgageQueryRef = this.apollo
      .watchQuery<{ simulateMortgage: MortgageInstallment[] }>({
        query: SimulateMortgage,
        variables: {
          mortgageAmount: mortgageAmount,
          numberOfInstallments: numberOfInstallments,
          overpaymentMonthlyBudget: overpaymentMonthlyBudget,
          overpaymentYearlyBudget: overpaymentYearlyBudget,
          rate: rate,
          repaymentStart: DatesUtils.getDateString(repaymentStart, this.datePipe),
          wibor: wibor
        }
      });
    return this.simulateMortgageQueryRef.valueChanges
      .pipe(
        map(result => result.data && result.data.simulateMortgage && result.data.simulateMortgage.map(installment => new MortgageInstallment(installment)))
      );
  }

  public refreshData(): void {
    this.simulateMortgageQueryRef?.refetch();
  }
}
