import {Component, OnInit} from '@angular/core';
import {AccountsService} from '../../../services/accountant/accounts.service';
import {ToastService} from '../../../services/toast.service';
import {Account} from '../../../model/accountant/account';
import {PiggyBanksService} from '../../../services/accountant/piggy-banks.service';
import {PiggyBank} from '../../../model/accountant/piggy-bank';
import {TransactionsService} from '../../../services/accountant/transations.service';
import {BillingPeriodsService} from '../../../services/accountant/billing-periods.service';
import {BillingPeriodInfo} from '../../../model/accountant/billings/billing-period';
import {Category} from '../../../model/accountant/billings/category';
import {Income} from '../../../model/accountant/billings/income';
import {Expense} from '../../../model/accountant/billings/expense';
import {CategoriesService} from '../../../services/accountant/categories.service';
import {DomainService} from '../../../services/domain.service';
import {LoginService} from '../../../services/login.service';
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
import {forkJoin, Observable} from 'rxjs';
import {NgEventBus} from 'ng-event-bus';

export type ViewMode = 'desktop' | 'mobile';
type MobileEditMode = 'display' | 'create-income' | 'create-expense' | 'create-performed-service';

@Component({
  selector: 'app-accounts-home',
  templateUrl: './accountant-home.component.html',
  styleUrls: ['./accountant-home.component.css']
})
export class AccountantHomeComponent implements OnInit {

  currentDomainName: string | null = null;

  viewMode: ViewMode = 'desktop';
  mobileEditMode: MobileEditMode = 'display';

  accounts: Account[] = [];
  piggyBanks: PiggyBank[] = [];
  categories: Category[] = [];

  performedServices: PerformedService[] = [];
  clientPayments: ClientPayment[] = [];

  services: Service[] = [];
  clients: Client[] = [];
  allCurrencies: Currency[] = [];
  historicalSavings: Map<Date, Map<string, number>> = new Map();

  billingPeriodInfo: BillingPeriodInfo | null = null;

  private currentCompanyDate: Date | null = null;
  private billingPeriodsHelper: BillingPeriodsHelper;
  private companyLogHelper: CompanyLogHelper;

  constructor(private accountsService: AccountsService,
              private transactionsService: TransactionsService,
              private piggyBanksService: PiggyBanksService,
              private billingsService: BillingPeriodsService,
              private categoriesService: CategoriesService,
              private toastService: ToastService,
              private domainService: DomainService,
              public loginService: LoginService,
              private performedServicesService: PerformedServicesService,
              private clientPaymentsService: ClientPaymentsService,
              private performedServicePaymentsService: PerformedServicePaymentsService,
              private servicesService: ServicesService,
              private clientsService: ClientsService,
              private eventBus: NgEventBus) {
    this.billingPeriodsHelper = new BillingPeriodsHelper(accountsService, categoriesService, piggyBanksService, billingsService);
    this.companyLogHelper = new CompanyLogHelper(performedServicePaymentsService, performedServicesService, clientPaymentsService, servicesService, clientsService);
  }

  ngOnInit(): void {
    this.onResize();
    this.refreshData();
    this.categoriesService.currentDomainCategories().subscribe(data => this.categories = data);
    this.eventBus.on('data:refresh').subscribe(() => {
      this.refreshData();
      this.fetchCompanyData(this.currentCompanyDate || new Date());
    });
    this.eventBus.on('app:resize').subscribe(() => {
      this.onResize();
    });
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
      this.accountsService.possibleCurrencies()
    ]).subscribe(([[accounts, piggyBanks, historicalSavings, billingPeriodInfo], currencies]) => {
      this.accounts = accounts;
      this.piggyBanks = piggyBanks;
      this.historicalSavings = historicalSavings;
      this.billingPeriodInfo = billingPeriodInfo;
      this.allCurrencies = currencies;
    });
    this.currentDomainName = this.domainService.currentDomain?.name || '';
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
        success => this.refreshData(),
        error => this.refreshData());
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
