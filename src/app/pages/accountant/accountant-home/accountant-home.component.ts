import {Component, OnDestroy, OnInit} from '@angular/core';
import {AccountsService} from '../../../services/accountant/accounts.service';
import {ToastService} from '../../../services/toast.service';
import {Account} from '../../../model/accountant/account';
import {PiggyBanksService} from '../../../services/accountant/piggy-banks.service';
import {PiggyBank} from '../../../model/accountant/piggy-bank';
import {TransactionsService} from '../../../services/accountant/transations.service';
import {BillingPeriodsService} from '../../../services/accountant/billing-periods.service';
import {BillingPeriodInfo} from '../../../model/accountant/billings/billing-period';
import {Income} from '../../../model/accountant/billings/income';
import {Expense} from '../../../model/accountant/billings/expense';
import {PerformedService} from '../../../model/accountant/performed-service';
import {PerformedServicesService} from '../../../services/accountant/performed-services.service';
import {Service} from '../../../model/accountant/service';
import {ServicesService} from '../../../services/accountant/services.service';
import {Currency} from '../../../model/accountant/currency';
import {Client} from '../../../model/accountant/client';
import {ClientsService} from '../../../services/accountant/clients.service';
import {ClientPayment} from '../../../model/accountant/client-payment';
import {ClientPaymentsService} from '../../../services/accountant/client-payments.service';
import {PerformedServicePaymentsService} from '../../../services/accountant/performed-service-payments.service';
import {PerformedServicePayment} from '../../../model/accountant/performed-service-payment';
import {CompanyLogHelper} from './company-log-helper';
import {BillingPeriodsHelper} from './billing-periods-helper';
import {forkJoin, mergeWith, Observable, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {NgEventBus} from 'ng-event-bus';
import {DatesUtils} from '../../../utils/dates-utils';
import {ActivatedRoute, Router} from '@angular/router';
import {DomainService} from '../../../services/domain.service';
import {
  ACCOUNTS_CHANGED,
  APP_SIZE_EVENT,
  BILLING_PERIOD_CHANGED,
  DATA_REFRESH_REQUEST_EVENT,
  PIGGY_BANKS_CHANGED,
  SELECTED_DOMAIN_CHANGED
} from '../../../app.module';
import {AccountantSettings} from '../../../model/accountant/accountant-settings';
import {AccountantSettingsService} from '../../../services/accountant/accountant-settings.service';
import {ViewMode} from '../../../utils/view-mode';

type MobileEditMode = 'display' | 'create-income' | 'create-expense' | 'create-performed-service';

export const ACCOUNTANT_HOME_ROUTER_URL = 'accountant-home';

@Component({
  selector: 'app-accounts-home',
  templateUrl: './accountant-home.component.html',
  styleUrls: ['./accountant-home.component.css']
})
export class AccountantHomeComponent implements OnInit, OnDestroy {

  viewMode: ViewMode = 'desktop';
  mobileEditMode: MobileEditMode = 'display';

  accounts: Account[] = [];
  piggyBanks: PiggyBank[] = [];

  performedServices: PerformedService[] = [];
  clientPayments: ClientPayment[] = [];

  services: Service[] = [];
  clients: Client[] = [];
  allCurrencies: Currency[] = [];
  historicalSavingDates: Date[] = [];
  historicalSavings: Map<Date, Map<string, number>> = new Map();
  savingsTotal = new Map<string, number>();

  billingPeriodInfo: BillingPeriodInfo | null = null;

  private currentCompanyDate: Date | null = null;
  private billingPeriodsHelper: BillingPeriodsHelper;
  private companyLogHelper: CompanyLogHelper;

  domainSubscription: Subscription | null = null;
  accountantSettings: AccountantSettings | null = null;

  constructor(private accountsService: AccountsService,
              private transactionsService: TransactionsService,
              private piggyBanksService: PiggyBanksService,
              private billingsService: BillingPeriodsService,
              private toastService: ToastService,
              private performedServicesService: PerformedServicesService,
              private clientPaymentsService: ClientPaymentsService,
              private performedServicePaymentsService: PerformedServicePaymentsService,
              private servicesService: ServicesService,
              private clientsService: ClientsService,
              private eventBus: NgEventBus,
              private router: Router,
              private route: ActivatedRoute,
              private domainService: DomainService,
              private accountantSettingsService: AccountantSettingsService) {
    this.billingPeriodsHelper = new BillingPeriodsHelper(accountsService, piggyBanksService, billingsService);
    this.companyLogHelper = new CompanyLogHelper(performedServicePaymentsService, performedServicesService, clientPaymentsService, servicesService, clientsService);
    this.domainService.registerToDomainChangesViaRouterUrl(ACCOUNTANT_HOME_ROUTER_URL, this.route);
    this.domainSubscription = this.eventBus.on(SELECTED_DOMAIN_CHANGED).subscribe((domain) => {
      this.accountantSettingsService.getForDomain().subscribe(data => this.accountantSettings = data);
      this.refreshData();
    });

    this.eventBus.on(ACCOUNTS_CHANGED)
      .pipe(
        mergeWith(this.eventBus.on(PIGGY_BANKS_CHANGED)),
        mergeWith(this.eventBus.on(BILLING_PERIOD_CHANGED)),
        debounceTime(200),
      ).subscribe({
      next: md => {
        this.refreshData();
      }
    });
  }

  ngOnInit(): void {
    this.onResize();
    this.accountantSettingsService.getForDomain().subscribe(data => this.accountantSettings = data);
    this.refreshData();
    this.eventBus.on(DATA_REFRESH_REQUEST_EVENT).subscribe(() => {
      this.refreshData();
      this.fetchCompanyData(this.currentCompanyDate || new Date());
    });
    this.eventBus.on(APP_SIZE_EVENT).subscribe(() => {
      this.onResize();
    });
  }

  ngOnDestroy(): void {
    if (this.domainSubscription) {
      this.domainSubscription.unsubscribe();
    }
    this.domainService.deregisterFromDomainChangesViaRouterUrl(ACCOUNTANT_HOME_ROUTER_URL);
  }

  private onResize(): void {
    if (window.innerWidth < 640) {
      this.viewMode = 'mobile';
    } else {
      this.viewMode = 'desktop';
    }
  }

  refreshData(date: Date | null = null): void {
    if (!date) {
      date = this.billingPeriodInfo?.result?.period || null;
    }
    forkJoin([
      this.billingPeriodsHelper.fetchData(date),
      this.accountsService.currencies()
    ]).subscribe((
      [[accounts, piggyBanks, historicalSavings, billingPeriodInfo], currencies]
        : [readonly [Account[], PiggyBank[], Map<Date, Map<string, number>>, BillingPeriodInfo | null], Currency[]]) => {
      this.accounts = accounts;
      this.piggyBanks = piggyBanks;
      this.calculateSavingsTotal();
      this.historicalSavings = historicalSavings;
      this.historicalSavingDates = DatesUtils.getMapWithDatesKeysSorted(this.historicalSavings);
      this.billingPeriodInfo = billingPeriodInfo;
      this.allCurrencies = currencies;
    });
  }

  private calculateSavingsTotal(): void {
    this.savingsTotal.clear();
    this.piggyBanks.filter(pg => pg.savings).forEach(
      pg => {
        let totalForCurrency = this.savingsTotal.get(pg.currency) || 0;
        totalForCurrency += pg.balance;
        this.savingsTotal.set(pg.currency, totalForCurrency);
      }
    );
  }

  fetchCompanyData(date: Date): void {
    this.currentCompanyDate = date;
    this.companyLogHelper.fetchCompanyData(date)
      .subscribe(([ps, cp, services, clients]) => this.setCompanyLogData(ps, cp, services, clients));
  }

  private setCompanyLogData(performedServices?: PerformedService[], clientPayments?: ClientPayment[], services?: Service[], clients?: Client[]) {
    if (performedServices) {
      this.performedServices = performedServices;
    }
    if (clientPayments) {
      this.clientPayments = clientPayments;
    }
    if (services) {
      this.services = services;
    }
    if (clients) {
      this.clients = clients;
    }
  }

  createBillingPeriod(date: Date): void {
    this.billingsService.createBillingPeriodFor(date).subscribe(
      data => this.refreshData(date)
    );
  }

  createBillingPeriodElement(
    elementToCreate: Income | Expense | null,
    accountIdForElement: number | null,
    piggyBankToUpdate: PiggyBank | null = null): void {
    if (this.viewMode === 'mobile') {
      this.mobileEditMode = 'display';
    }
    if (!elementToCreate || !accountIdForElement) {
      return;
    }
    const requests: Observable<any>[] = [
      this.billingsService.createBillingElement(elementToCreate, accountIdForElement)
    ];
    if (piggyBankToUpdate) {
      requests.push(this.piggyBanksService.update(piggyBankToUpdate));
    }
    forkJoin(requests)
      .subscribe(
        (success: any) => this.refreshData(),
        (error: any) => this.refreshData());
  }

  finishBillingPeriod(date: Date): void {
    this.billingsService.finishBillingPeriodOf(date).subscribe(
      data => this.refreshData(date)
    );
  }

  updatePiggyBank(piggyBank: PiggyBank): void {
    this.piggyBanksService.update(piggyBank)
      .subscribe(
        success => this.refreshData(),
        error => this.refreshData()
      );
  }

  createPerformedService(performedService: PerformedService): void {
    this.companyLogHelper.createPerformedServiceAndFetchData(performedService, this.currentCompanyDate)
      .subscribe(data => this.performedServices = data);
  }

  updatePerformedService(performedService: PerformedService): void {
    this.companyLogHelper.updatePerformedService(performedService, this.currentCompanyDate)
      .subscribe(data => this.performedServices = data);
  }

  createPerformedServicePayment(performedServicePayment: PerformedServicePayment): void {
    this.companyLogHelper.createPerformedServicePayment(performedServicePayment, this.currentCompanyDate)
      .subscribe((performedServices) => this.fetchCompanyData(this.currentCompanyDate || new Date()));
  }

  createClientPayment(clientPayment: ClientPayment): void {
    this.companyLogHelper.createClientPayment(clientPayment, this.currentCompanyDate)
      .subscribe(data => this.clientPayments = data);
  }

  updateClientPayment(clientPayment: ClientPayment): void {
    this.companyLogHelper.updateClientPayment(clientPayment, this.currentCompanyDate)
      .subscribe(data => this.clientPayments = data);
  }

  addIncome(): void {
    this.mobileEditMode = 'create-income';
  }

  addExpense(): void {
    this.mobileEditMode = 'create-expense';
  }
}
