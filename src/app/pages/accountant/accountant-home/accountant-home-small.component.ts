import {Component, OnInit} from '@angular/core';
import {AccountsService} from '../../../services/accountant/accounts.service';
import {Account} from '../../../model/accountant/account';
import {PiggyBanksService} from '../../../services/accountant/piggy-banks.service';
import {PiggyBank} from '../../../model/accountant/piggy-bank';
import {BillingPeriodsService} from '../../../services/accountant/billing-periods.service';
import {Router} from '@angular/router';
import {Category} from '../../../model/accountant/billings/category';
import {BillingPeriod, BillingPeriodInfo} from '../../../model/accountant/billings/billing-period';
import {Expense} from '../../../model/accountant/billings/expense';
import {Income} from '../../../model/accountant/billings/income';
import {CategoriesService} from '../../../services/accountant/categories.service';
import {DomainService} from '../../../services/domain.service';
import {forkJoin, Observable} from 'rxjs';
import {LoginService} from '../../../services/login.service';
import {Service} from '../../../model/accountant/service';
import {Client} from '../../../model/accountant/client';
import {PerformedService} from '../../../model/accountant/performed-service';
import {ClientPayment} from '../../../model/accountant/client-payment';
import {CompanyLogHelper} from './company-log-helper';
import {PerformedServicesService} from '../../../services/accountant/performed-services.service';
import {ClientPaymentsService} from '../../../services/accountant/client-payments.service';
import {PerformedServicePaymentsService} from '../../../services/accountant/performed-service-payments.service';
import {ServicesService} from '../../../services/accountant/services.service';
import {ClientsService} from '../../../services/accountant/clients.service';
import {BillingPeriodsHelper} from './billing-periods-helper';
import {Currency} from '../../../model/accountant/currency';
import {ComparatorBuilder} from '../../../../utils/comparator-builder';

type EditMode = 'DISPLAY' | 'CREATE_INCOME' | 'CREATE_EXPENSE' | 'CREATE_PERFORMED_SERVICE';

@Component({
  selector: 'app-accounts-home-small',
  templateUrl: './accountant-home-small.component.html',
  styleUrls: ['./accountant-home-small.component.css']
})
export class AccountantHomeSmallComponent implements OnInit {
  private readonly CLIENT_PAYMENT_BY_DATE_DESC_AND_CLIENT_NAME = ComparatorBuilder
    .comparingByDate<ClientPayment>(cp => cp.date).desc()
    .thenComparing(cp => cp.client.name).build();
  public readonly DISPLAY = 'DISPLAY';
  public readonly CREATE_INCOME = 'CREATE_INCOME';
  public readonly CREATE_EXPENSE = 'CREATE_EXPENSE';

  accounts: Account[] = [];
  piggyBanks: PiggyBank[] = [];
  historicalSavings = new Map<Date, Map<string, number>>();
  categories: Category[] = [];
  billingPeriod: BillingPeriod | null = null;
  mode: EditMode = this.DISPLAY;
  currentDomainName: string | null = null;

  services: Service[] = [];
  clients: Client[] = [];
  allCurrencies: Currency[] = [];
  performedServices: PerformedService[] = [];
  clientPayments: ClientPayment[] = [];
  displayingPerformedServicesDate = new Date();

  private billingPeriodsHelper: BillingPeriodsHelper;
  private companyLogHelper: CompanyLogHelper;

  constructor(private domainService: DomainService,
              private accountsService: AccountsService,
              private categoriesService: CategoriesService,
              private piggyBanksService: PiggyBanksService,
              private billingsService: BillingPeriodsService,
              public loginService: LoginService,
              private performedServicesService: PerformedServicesService,
              private clientPaymentsService: ClientPaymentsService,
              private performedServicePaymentsService: PerformedServicePaymentsService,
              private servicesService: ServicesService,
              private clientsService: ClientsService,
              private router: Router) {
    this.billingPeriodsHelper = new BillingPeriodsHelper(accountsService, categoriesService, piggyBanksService, billingsService);
    this.companyLogHelper = new CompanyLogHelper(performedServicePaymentsService, performedServicesService, clientPaymentsService, servicesService, clientsService);
  }

  ngOnInit(): void {
    if (window.innerWidth >= 640) {
      this.router.navigate(['/accountant-home']);
    }
    this.refreshData();
    this.categoriesService.currentDomainCategories().subscribe(data => this.categories = data);
  }


  refreshData(): void {
    const isCompany = this.loginService.accountantSettings?.company;
    const requests: Observable<any>[] = [
      this.accountsService.possibleCurrencies()
    ];
    if (isCompany) {
      requests.push(this.companyLogHelper.fetchCompanyData(this.displayingPerformedServicesDate));
    } else {
      requests.push(this.billingPeriodsHelper.fetchData());
    }
    forkJoin(requests).subscribe(result => {
      this.allCurrencies = result[0];
      if (isCompany) {
        let [performedServices, clientPayments, services, clients]: [PerformedService[], ClientPayment[], Service[], Client[]] = result[1];
        this.setCompanyLogData(performedServices, clientPayments, services, clients);
      } else {
        let [accounts, piggyBanks, historicalSavings, billingPeriodInfo]
          : [Account[], PiggyBank[], Map<Date, Map<string, number>>, BillingPeriodInfo | null] = result[1];
        this.setBillingPeriodData(accounts, piggyBanks, historicalSavings, billingPeriodInfo?.result || null);
      }
    });
    this.currentDomainName = this.domainService.currentDomain?.name || null;
  }

  private setBillingPeriodData(accounts: Account[], piggyBanks: PiggyBank[], historicalSavings: Map<Date, Map<string, number>>, billingPeriod: BillingPeriod | null) {
    this.accounts = accounts;
    this.piggyBanks = piggyBanks;
    this.historicalSavings = historicalSavings;
    this.billingPeriod = billingPeriod;
  }

  addIncome(): void {
    this.mode = this.CREATE_INCOME;
  }

  addExpense(): void {
    this.mode = this.CREATE_EXPENSE;
  }

  createElement(elementToCreate: Income | Expense | null, accountIdForElement: number | null, piggyBankToUpdate: PiggyBank | null): void {
    if (!elementToCreate || !accountIdForElement) {
      return;
    }
    const requests: Observable<any>[] = [
      this.billingsService.createBillingElement(elementToCreate, accountIdForElement)
    ];
    if (piggyBankToUpdate) {
      requests.push(this.piggyBanksService.update(piggyBankToUpdate));
    }
    forkJoin(requests).subscribe(success => this.refreshData(), error => this.refreshData());
    this.mode = this.DISPLAY;
  }

  createPerformedService(performedService: PerformedService) {
    this.companyLogHelper.createPerformedServiceAndFetchData(performedService, this.displayingPerformedServicesDate)
      .subscribe(performedServices => this.setCompanyLogData(performedServices));
  }

  moveToDay(to: Date) {
    this.displayingPerformedServicesDate = to;
    this.refreshData();
  }

  private setCompanyLogData(ps?: PerformedService[], cp?: ClientPayment[], services?: Service[], clients?: Client[]) {
    if (ps) {
      this.performedServices = ps;
    }
    if (cp) {
      this.clientPayments = cp.sort(this.CLIENT_PAYMENT_BY_DATE_DESC_AND_CLIENT_NAME);
    }
    if (services) {
      this.services = services;
    }
    if (clients) {
      this.clients = clients;
    }
  }

}
