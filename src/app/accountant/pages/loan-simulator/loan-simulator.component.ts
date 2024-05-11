import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {NgEventBus} from 'ng-event-bus';
import {ActivatedRoute} from '@angular/router';
import {DomainService} from '../../../general/services/domain.service';
import {SELECTED_DOMAIN_CHANGED} from '../../../general/utils/event-bus-events';
import {LoanInstallment} from '../../model/loan-installment';
import {LoanSimulatorService} from '../../services/loan-simulator.service';
import Decimal from 'decimal.js';

type ViewMode = 'CONFIG' | 'INFO' | 'SOURCE';
export const LOAN_SIMULATOR_ROUTER_URL = 'loan-simulator';

type LoanSimulationParams = {
  loanAmount: Decimal;
  numberOfInstallments: number;
  overpaymentMonthlyBudget: Decimal;
  overpaymentYearlyBudget: Decimal;
  rate: Decimal;
  repaymentStart: Date;
  wibor: Decimal;
}

type LoanSimulationParamsStorage = {
  selectedConfiguration: string;
  configurations: Map<string, LoanSimulationParams>;
};

const EMPTY_LOAN_SIMULATOR_PARAMS: LoanSimulationParams = {
  loanAmount: new Decimal(0),
  numberOfInstallments: 0,
  overpaymentMonthlyBudget: new Decimal(0),
  overpaymentYearlyBudget: new Decimal(0),
  rate: new Decimal(0),
  repaymentStart: new Date(),
  wibor: new Decimal(0)
};

const loanSimulatorParamsLocalStorageKey = 'loan-simulator-params';

@Component({
  selector: 'app-accounts-home',
  templateUrl: './loan-simulator.component.html',
  styleUrls: ['./loan-simulator.component.css']
})
export class LoanSimulatorComponent implements OnInit, OnDestroy {

  viewMode: ViewMode = 'CONFIG';
  private _selectedConfiguration: string = 'default';
  public paramsConfigs: string[] = ['default'];
  private _loanAmount: Decimal = new Decimal(0);
  private _numberOfInstallments: number = 0;
  private _overpaymentMonthlyBudget: Decimal = new Decimal(0);
  private _overpaymentYearlyBudget: Decimal = new Decimal(0);
  private _rate: Decimal = new Decimal(0);
  private _repaymentStart: Date = new Date();
  private _wibor: Decimal = new Decimal(0);

  domainSubscription: Subscription | null = null;
  fetchSubscription: Subscription | null = null;
  loanInstallments: LoanInstallment[] = [];
  currency = 'PLN';
  installmentsSum: Decimal = new Decimal(0);
  repaidCapitalSum: Decimal = new Decimal(0);
  paidInterestSum: Decimal = new Decimal(0);
  overpaymentSum: Decimal = new Decimal(0);

  constructor(
    private eventBus: NgEventBus,
    private route: ActivatedRoute,
    private domainService: DomainService,
    private loanSimulatorService: LoanSimulatorService) {
    this.domainService.registerToDomainChangesViaRouterUrl(LOAN_SIMULATOR_ROUTER_URL, this.route);
    this.domainSubscription = this.eventBus.on(SELECTED_DOMAIN_CHANGED).subscribe((domain) => {
    });
    this.readParams();
  }

  ngOnInit(): void {
    this.fetchData();
  }

  private fetchData() {
    this.fetchSubscription?.unsubscribe();
    this.fetchSubscription = this.loanSimulatorService.simulateLoan(
      this.loanAmount,
      this.numberOfInstallments,
      this.overpaymentMonthlyBudget,
      this.overpaymentYearlyBudget,
      this.rate,
      this.repaymentStart,
      this.wibor
    ).subscribe(data => {
      this.loanInstallments = data;

      this.installmentsSum = new Decimal(0);
      this.repaidCapitalSum = new Decimal(0);
      this.paidInterestSum = new Decimal(0);
      this.overpaymentSum = new Decimal(0);

      data.forEach(installment => {
        this.installmentsSum = this.installmentsSum.add(installment.installment);
        this.repaidCapitalSum = this.repaidCapitalSum.add(installment.repaidCapital);
        this.paidInterestSum = this.paidInterestSum.add(installment.paidInterest);
        this.overpaymentSum = this.overpaymentSum.add(installment.overpayment);
      });
    });
  }

  ngOnDestroy(): void {
    if (this.domainSubscription) {
      this.domainSubscription.unsubscribe();
    }
    this.domainService.deregisterFromDomainChangesViaRouterUrl(LOAN_SIMULATOR_ROUTER_URL);
  }

  paramsChanged() {
    this.writeParams();
    this.fetchData();
  }

  copyConfiguration() {
    const paramsStorage = this.getParamsStorage();
    const newKey = paramsStorage.selectedConfiguration + ' - copy';
    paramsStorage.configurations.set(newKey, paramsStorage.configurations.get(paramsStorage.selectedConfiguration)!);
    this.writeParams(paramsStorage);
    this.selectedParamsConfig = newKey;
  }

  private getParamsStorage() {
    const paramsStorage: LoanSimulationParamsStorage = localStorage.getItem(loanSimulatorParamsLocalStorageKey)
      ? JSON.parse(localStorage.getItem(loanSimulatorParamsLocalStorageKey)!, this.reviver)
      : {selectedConfiguration: 'default', configurations: new Map([['default', EMPTY_LOAN_SIMULATOR_PARAMS]])};
    this.paramsConfigs = Array.from(paramsStorage.configurations.keys());
    return paramsStorage;
  }

  private readParams(paramsStorage: LoanSimulationParamsStorage = this.getParamsStorage()) {
    const params = paramsStorage.configurations.get(paramsStorage.selectedConfiguration)!;

    this.paramsConfigs = Array.from(paramsStorage.configurations.keys());
    this._selectedConfiguration = paramsStorage.selectedConfiguration;
    this._loanAmount = params.loanAmount;
    this._numberOfInstallments = params.numberOfInstallments;
    this._overpaymentMonthlyBudget = params.overpaymentMonthlyBudget;
    this._overpaymentYearlyBudget = params.overpaymentYearlyBudget;
    this._rate = params.rate;
    this._repaymentStart = new Date(params.repaymentStart);
    this._wibor = params.wibor;
  }

  private writeParams(paramsStorage: LoanSimulationParamsStorage = this.getParamsStorage()) {
    paramsStorage.configurations.set(paramsStorage.selectedConfiguration, {
      loanAmount: this.loanAmount,
      numberOfInstallments: this.numberOfInstallments,
      overpaymentMonthlyBudget: this.overpaymentMonthlyBudget,
      overpaymentYearlyBudget: this.overpaymentYearlyBudget,
      rate: this.rate,
      repaymentStart: this.repaymentStart,
      wibor: this.wibor,
    });
    localStorage.setItem(
      loanSimulatorParamsLocalStorageKey,
      JSON.stringify(paramsStorage, this.replacer)
    );
  }

  get selectedParamsConfig(): string {
    return this._selectedConfiguration;
  }

  set selectedParamsConfig(value: string) {
    this._selectedConfiguration = value;
    const paramsStorage = this.getParamsStorage();
    paramsStorage.selectedConfiguration = value;
    this.readParams(paramsStorage);
    this.writeParams(paramsStorage);
    this.paramsChanged();
  }

  get selectedParamsConfigName(): string {
    return this._selectedConfiguration;
  }

  set selectedParamsConfigName(value: string) {
    const paramsStorage = this.getParamsStorage();
    const params = paramsStorage.configurations.get(paramsStorage.selectedConfiguration)!;
    paramsStorage.configurations.delete(paramsStorage.selectedConfiguration);
    paramsStorage.selectedConfiguration = value;
    paramsStorage.configurations.set(paramsStorage.selectedConfiguration, params);
    this.writeParams(paramsStorage);
    this.paramsConfigs = Array.from(paramsStorage.configurations.keys());
    this._selectedConfiguration = value;
  }

  get configurationSource(): string {
    return JSON.stringify(this.getParamsStorage(), this.replacer, 2);
  }

  set configurationSource(value: string) {
    localStorage.setItem(loanSimulatorParamsLocalStorageKey, JSON.stringify(JSON.parse(value, this.reviver), this.replacer));
    this.readParams();
    this.fetchData();
  }
  get loanAmount(): Decimal {
    return this._loanAmount;
  }

  set loanAmount(value: Decimal) {
    this._loanAmount = value;
    this.paramsChanged();
  }

  get numberOfInstallments(): number {
    return this._numberOfInstallments;
  }

  set numberOfInstallments(value: number) {
    this._numberOfInstallments = value;
    this.paramsChanged();
  }

  get overpaymentMonthlyBudget(): Decimal {
    return this._overpaymentMonthlyBudget;
  }

  set overpaymentMonthlyBudget(value: Decimal) {
    this._overpaymentMonthlyBudget = value;
    this.paramsChanged();
  }

  get overpaymentYearlyBudget(): Decimal {
    return this._overpaymentYearlyBudget;
  }

  set overpaymentYearlyBudget(value: Decimal) {
    this._overpaymentYearlyBudget = value;
    this.paramsChanged();
  }

  get rate(): Decimal {
    return this._rate;
  }

  set rate(value: Decimal) {
    this._rate = value;
    this.paramsChanged();
  }

  get repaymentStart(): Date {
    return this._repaymentStart;
  }

  set repaymentStart(value: Date) {
    this._repaymentStart = value;
    this.paramsChanged();
  }

  get wibor(): Decimal {
    return this._wibor;
  }

  set wibor(value: Decimal) {
    this._wibor = value;
    this.paramsChanged();
  }

  replacer = function(key: any, value: any) {
    if (value instanceof Map) {
      return {
        dataType: 'Map',
        value: Array.from(value.entries()), // or with spread: value: [...value]
      };
    } else {
      return value;
    }
  };

  reviver = function(key: any, value: any) {
    if (typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  };
}
