import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {NgEventBus} from 'ng-event-bus';
import {ActivatedRoute} from '@angular/router';
import {DomainService} from '../../../general/services/domain.service';
import {SELECTED_DOMAIN_CHANGED} from '../../../general/utils/event-bus-events';
import {MortgageInstallment} from '../../model/mortgage-installment';
import {MortgageSimulatorService} from '../../services/mortgage-simulator.service';
import Decimal from 'decimal.js';

export const MORTGAGE_SIMULATOR_ROUTER_URL = 'mortgage-simulator';

type MortgageSimulationParams = {
  mortgageAmount: Decimal;
  numberOfInstallments: number;
  overpaymentMonthlyBudget: Decimal;
  overpaymentYearlyBudget: Decimal;
  rate: Decimal;
  repaymentStart: Date;
  wibor: Decimal;
}

type MortgageSimulationParamsStorage = {
  selectedConfiguration: string;
  configurations: Map<string, MortgageSimulationParams>;
};

const EMPTY_MORTGAGE_SIMULATOR_PARAMS: MortgageSimulationParams = {
  mortgageAmount: new Decimal(0),
  numberOfInstallments: 0,
  overpaymentMonthlyBudget: new Decimal(0),
  overpaymentYearlyBudget: new Decimal(0),
  rate: new Decimal(0),
  repaymentStart: new Date(),
  wibor: new Decimal(0)
};

@Component({
  selector: 'app-accounts-home',
  templateUrl: './mortgage-simulator.component.html',
  styleUrls: ['./mortgage-simulator.component.css']
})
export class MortgageSimulatorComponent implements OnInit, OnDestroy {

  private _selectedConfiguration: string = 'default';
  public paramsConfigs: string[] = ['default'];
  private _mortgageAmount: Decimal = new Decimal(0);
  private _numberOfInstallments: number = 0;
  private _overpaymentMonthlyBudget: Decimal = new Decimal(0);
  private _overpaymentYearlyBudget: Decimal = new Decimal(0);
  private _rate: Decimal = new Decimal(0);
  private _repaymentStart: Date = new Date();

  private _wibor: Decimal = new Decimal(0);
  domainSubscription: Subscription | null = null;
  fetchSubscription: Subscription | null = null;
  mortgageInstallments: MortgageInstallment[] = [];
  currency = 'PLN';
  installmentsSum: Decimal = new Decimal(0);
  repaidCapitalSum: Decimal = new Decimal(0);
  paidInterestSum: Decimal = new Decimal(0);
  overpaymentSum: Decimal = new Decimal(0);

  constructor(
    private eventBus: NgEventBus,
    private route: ActivatedRoute,
    private domainService: DomainService,
    private mortgageSimulatorService: MortgageSimulatorService) {
    this.domainService.registerToDomainChangesViaRouterUrl(MORTGAGE_SIMULATOR_ROUTER_URL, this.route);
    this.domainSubscription = this.eventBus.on(SELECTED_DOMAIN_CHANGED).subscribe((domain) => {
    });
    this.readParams();
  }

  ngOnInit(): void {
    this.fetchData();
  }

  private fetchData() {
    this.fetchSubscription?.unsubscribe();
    this.fetchSubscription = this.mortgageSimulatorService.simulateMortgage(
      this.mortgageAmount,
      this.numberOfInstallments,
      this.overpaymentMonthlyBudget,
      this.overpaymentYearlyBudget,
      this.rate,
      this.repaymentStart,
      this.wibor
    ).subscribe(data => {
      this.mortgageInstallments = data;

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
    this.domainService.deregisterFromDomainChangesViaRouterUrl(MORTGAGE_SIMULATOR_ROUTER_URL);
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
    const paramsStorage: MortgageSimulationParamsStorage = localStorage.getItem('mortgage-simulator-params')
      ? JSON.parse(localStorage.getItem('mortgage-simulator-params')!, this.reviver)
      : {selectedConfiguration: 'default', configurations: new Map([['default', EMPTY_MORTGAGE_SIMULATOR_PARAMS]])};
    this.paramsConfigs = Array.from(paramsStorage.configurations.keys());
    return paramsStorage;
  }

  private readParams(paramsStorage: MortgageSimulationParamsStorage = this.getParamsStorage()) {
    const params = paramsStorage.configurations.get(paramsStorage.selectedConfiguration)!;

    this.paramsConfigs = Array.from(paramsStorage.configurations.keys());
    this._selectedConfiguration = paramsStorage.selectedConfiguration;
    this._mortgageAmount = params.mortgageAmount;
    this._numberOfInstallments = params.numberOfInstallments;
    this._overpaymentMonthlyBudget = params.overpaymentMonthlyBudget;
    this._overpaymentYearlyBudget = params.overpaymentYearlyBudget;
    this._rate = params.rate;
    this._repaymentStart = new Date(params.repaymentStart);
    this._wibor = params.wibor;
  }

  private writeParams(paramsStorage: MortgageSimulationParamsStorage = this.getParamsStorage()) {
    paramsStorage.configurations.set(paramsStorage.selectedConfiguration, {
      mortgageAmount: this.mortgageAmount,
      numberOfInstallments: this.numberOfInstallments,
      overpaymentMonthlyBudget: this.overpaymentMonthlyBudget,
      overpaymentYearlyBudget: this.overpaymentYearlyBudget,
      rate: this.rate,
      repaymentStart: this.repaymentStart,
      wibor: this.wibor
    });
    localStorage.setItem(
      'mortgage-simulator-params',
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

  get mortgageAmount(): Decimal {
    return this._mortgageAmount;
  }

  set mortgageAmount(value: Decimal) {
    this._mortgageAmount = value;
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
