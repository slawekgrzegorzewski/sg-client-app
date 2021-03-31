import {Component, OnInit} from '@angular/core';
import {AccountsService} from '../../../services/accountant/accounts.service';
import {ToastService} from '../../../services/toast.service';
import {Account} from '../../../model/accountant/account';
import {PiggyBanksService} from '../../../services/accountant/piggy-banks.service';
import {PiggyBank} from '../../../model/accountant/piggy-bank';
import {TransactionsService} from '../../../services/accountant/transations.service';
import {BillingPeriodsService} from '../../../services/accountant/billing-periods.service';
import {BillingPeriod, BillingPeriodInfo} from '../../../model/accountant/billings/billing-period';
import {Category} from '../../../model/accountant/billings/category';
import {Income} from '../../../model/accountant/billings/income';
import {Expense} from '../../../model/accountant/billings/expense';
import {Router} from '@angular/router';
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
import {switchMap} from 'rxjs/operators';
import {ClientPayment} from '../../../model/accountant/client-payment';
import {ClientPaymentsService} from '../../../services/accountant/client-payments.service';
import {forkJoin} from 'rxjs';
import {PerformedServicePaymentsService} from '../../../services/accountant/performed-service-payments.service';
import {PerformedServicePayment, PerformedServicePaymentShort} from '../../../model/accountant/performed-service-payment';

@Component({
  selector: 'app-accounts-home',
  templateUrl: './accountant-home.component.html',
  styleUrls: ['./accountant-home.component.css']
})
export class AccountantHomeComponent implements OnInit {

  accounts: Account[];
  piggyBanks: PiggyBank[];
  categories: Category[];

  performedServices: PerformedService[];
  clientPayments: ClientPayment[];

  services: Service[];
  clients: Client[];
  allCurrencies: Currency[];
  billingPeriodInfo: BillingPeriodInfo;
  historicalSavings: Map<Date, Map<string, number>>;
  currentDomainName: string;
  private currentComapnyDate: Date;

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
              private router: Router) {
  }

  ngOnInit(): void {
    if (window.innerWidth < 640) {
      this.router.navigate(['/accountant-home-small']);
    }
    this.refreshData();
    this.categoriesService.currentDomainCategories().subscribe(data => this.categories = data);
  }

  refreshData(): void {
    this.fetchAccounts();
    this.fetchCurrencies();
    this.fetchPiggyBanks();
    this.fetchHistoricalSavings();
    this.currentDomainName = this.domainService.currentDomain?.name || '';
  }

  fetchAccounts(): void {
    this.accountsService.currentDomainAccounts().subscribe(
      data => this.accounts = data.sort(Account.compareByCurrencyAndName),
      error => this.accounts = []
    );
  }

  private fetchCurrencies(): void {
    this.accountsService.possibleCurrencies().subscribe(
      data => this.allCurrencies = data
    );
  }

  fetchBillingPeriod(date: Date): void {
    this.billingsService.billingPeriodFor(date).subscribe(
      data => this.billingPeriodInfo = data,
      error => this.billingPeriodInfo = null
    );
  }

  private fetchPiggyBanks(): void {
    this.piggyBanksService.currentDomainPiggyBanks().subscribe(data => {
      this.piggyBanks = data.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  private fetchHistoricalSavings(): void {
    this.billingsService.getHistoricalSavings(12).subscribe(
      data => this.historicalSavings = data
    );
  }

  fetchCompanyData(date: Date): void {
    this.currentComapnyDate = date;
    forkJoin([
      this.performedServicesService.currentDomainServices(this.currentComapnyDate),
      this.clientPaymentsService.currentDomainClientPayments(this.currentComapnyDate),
      this.servicesService.currentDomainServices(),
      this.clientsService.currentDomainClients()
    ])
      .subscribe(([ps, cp, services, clients]) => {
        this.performedServices = ps;
        this.clientPayments = cp;
        this.services = services;
        this.clients = clients;
      });
  }

  createElement(billingPeriod: BillingPeriod, element: Income | Expense, accountId: number): void {
    this.billingsService.createBillingElement(element, accountId)
      .subscribe(
        success => {
          this.refreshData();
          this.fetchBillingPeriod(billingPeriod.period);
        },
        error => {
          this.refreshData();
          this.fetchBillingPeriod(billingPeriod.period);
        });
  }

  updatePiggyBank(piggyBank: PiggyBank): void {
    this.piggyBanksService.update(piggyBank)
      .subscribe(
        success => this.refreshData(),
        error => this.refreshData()
      );
  }

  finishBillingPeriod(date: Date): void {
    this.billingsService.finishBillingPeriodOf(date).subscribe(
      data => this.fetchBillingPeriod(date)
    );
  }

  createBilling(date: Date): void {
    this.billingsService.createBillingPeriodFor(date).subscribe(
      data => this.fetchBillingPeriod(date)
    );
  }

  createPerformedService(performedService: PerformedService): void {
    this.performedServicesService.createService(performedService)
      .pipe(
        switchMap(value => this.performedServicesService.currentDomainServices(this.currentComapnyDate))
      )
      .subscribe(data => this.performedServices = data);
  }

  updatePerformedService(performedService: PerformedService): void {
    this.performedServicesService.updateService(performedService)
      .pipe(
        switchMap(value => this.performedServicesService.currentDomainServices(this.currentComapnyDate))
      )
      .subscribe(data => this.performedServices = data);
  }

  createClientPayment(clientPayment: ClientPayment): void {
    this.clientPaymentsService.createClientPayment(clientPayment)
      .pipe(
        switchMap(value => this.clientPaymentsService.currentDomainClientPayments(this.currentComapnyDate))
      )
      .subscribe(data => this.clientPayments = data);
  }

  updateClientPayment(clientPayment: ClientPayment): void {
    this.clientPaymentsService.updateClientPayment(clientPayment)
      .pipe(
        switchMap(value => this.clientPaymentsService.currentDomainClientPayments(this.currentComapnyDate))
      )
      .subscribe(data => this.clientPayments = data);
  }

  createPerformedServicePayment(performedServicePayment: PerformedServicePayment): void {
    this.performedServicePaymentsService.createPerformedServicePayments(new PerformedServicePaymentShort(performedServicePayment))
      .subscribe(
        data => this.fetchCompanyData(performedServicePayment.performedService.date),
        error => this.fetchCompanyData(performedServicePayment.performedService.date)
      );
  }
}
