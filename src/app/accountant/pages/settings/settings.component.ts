import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LoginService} from 'src/app/general/services/login.service';
import {NgbModal, NgbNav, NgbNavItem} from '@ng-bootstrap/ng-bootstrap';
import {Account} from '../../model/account';
import {ToastService} from '../../../general/services/toast.service';
import {AccountsService} from '../../services/accounts.service';
import {forkJoin, Observable, Subscription} from 'rxjs';
import {PiggyBank} from '../../model/piggy-bank';
import {PiggyBanksService} from '../../services/piggy-banks.service';
import {Currency} from '../../model/currency';
import {BillingPeriodsService} from '../../services/billing-periods.service';
import {Category} from '../../model/billings/category';
import {CategoriesService} from '../../services/categories.service';
import {DomainService} from '../../../general/services/domain.service';
import {DetailedDomain, Domain} from '../../../general/model/domain';
import {Client} from '../../model/client';
import {ClientsService} from '../../services/clients.service';
import {AccountantSettingsService} from '../../services/accountant-settings.service';
import {AccountantSettings} from '../../model/accountant-settings';
import {Service} from '../../model/service';
import {ServicesService} from '../../services/services.service';
import {ComparatorBuilder} from '../../../general/utils/comparator-builder';
import {ActivatedRoute} from '@angular/router';
import {BanksService} from '../../../openbanking/services/banks.service';
import {BankAccount} from '../../../openbanking/model/bank-account';
import {$e} from 'codelyzer/angular/styles/chars';
import {NgEventBus} from 'ng-event-bus';
import {keyframes} from '@angular/animations';
import {ACCOUNTANT_SETTINGS_CHANGED, SELECTED_DOMAIN_CHANGED} from '../../../general/utils/event-bus-events';

export const SETTINGS_ROUTER_URL = 'settings';

@Component({
  selector: 'app-accounts',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {

  bankAccountsAvailableToAssign: BankAccount[] = [];
  otherDomains: Domain[] = [];
  isEditAccount = false;
  accountToEdit: Account | null = null;
  accountToDelete: Account | null = null;
  showAccountDeletionConfirmation = false;
  accountBeingDeletedDescription = '';
  piggyBanks: PiggyBank[] = [];
  allCurrencies: Currency[] = [];
  categories: Category[] = [];
  clients: Client[] = [];
  services: Service[] = [];
  userDomains: DetailedDomain[] = [];
  public accountantSettings: AccountantSettings | null = null;

  private domainSubscription: Subscription;
  @ViewChild('nav')
  nav: NgbNav | null = null;
  @ViewChild('bankAccess')
  bankAccessNavItem: NgbNavItem | null = null;

  constructor(
    private accountsService: AccountsService,
    private accountantSettingsService: AccountantSettingsService,
    private banksService: BanksService,
    private categoriesService: CategoriesService,
    private clientsService: ClientsService,
    private servicesService: ServicesService,
    private domainService: DomainService,
    private eventBus: NgEventBus,
    private piggyBanksService: PiggyBanksService,
    public loginService: LoginService,
    private modalService: NgbModal,
    private billingsService: BillingPeriodsService,
    private toastService: ToastService,
    private route: ActivatedRoute) {

    this.domainService.registerToDomainChangesViaRouterUrl(SETTINGS_ROUTER_URL, this.route);
    this.domainSubscription = this.eventBus.on(SELECTED_DOMAIN_CHANGED).subscribe((domain) => {
      this.accountantSettingsService.getForDomain().subscribe(data => this.accountantSettings = data);
    });
    this.eventBus.on(ACCOUNTANT_SETTINGS_CHANGED).subscribe((metaData) => {
      this.accountantSettingsService.getForDomain().subscribe(data => this.accountantSettings = data);
    });
    this.domainService.getOtherDomains().subscribe(domains => this.otherDomains = domains);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams.hasOwnProperty('ref')) {
        setTimeout(() => this.nav?.select(this.bankAccessNavItem?.id), 500);
      } else {
        this.fetchData();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.domainSubscription) {
      this.domainSubscription.unsubscribe();
    }
    this.domainService.deregisterFromDomainChangesViaRouterUrl(SETTINGS_ROUTER_URL);
  }

  currentUserLogin(): string {
    return this.loginService.getUserName();
  }

  isAdmin(): boolean {
    return this.loginService.containsRole('ACCOUNTANT_ADMIN');
  }

  fetchData(): void {
    this.fetchAccounts();
    this.fetchPiggyBanks();
    this.fetchCurrencies();
    this.fetchCategories();
    this.fetchClients();
    this.fetchServices();
    this.fetchDomains();
    this.accountantSettingsService.getForDomain().subscribe(data => this.accountantSettings = data);
  }

  private fetchAccounts(): void {
    this.banksService.getBankAccountsNotAssignedToAnyAccount().subscribe({
      next: (bankAccounts) => {
        this.bankAccountsAvailableToAssign = bankAccounts;
      },
      error: err => {
        this.bankAccountsAvailableToAssign = [];
        this.toastService.showWarning('Current data has been cleared out.', 'Can not obtain data!');
      }
    });
  }

  private fetchPiggyBanks(): void {
    this.piggyBanksService.currentDomainPiggyBanks().subscribe(data => {
      this.piggyBanks = data.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  private fetchCurrencies(): void {
    this.accountsService.currencies().subscribe(data => {
      this.allCurrencies = data.sort((a, b) => a.code.localeCompare(b.code));
    });
  }

  private fetchCategories(): void {
    this.categoriesService.currentDomainCategories().subscribe(
      data => this.categories = data
    );
  }

  private fetchClients(): void {
    this.clientsService.currentDomainClients().subscribe(
      data => this.clients = data
    );
  }

  private fetchServices(): void {
    this.servicesService.currentDomainServices().subscribe(
      data => this.services = data
    );
  }

  private fetchDomains(): void {
    this.domainService.getAllDomains().subscribe(
      data => this.userDomains = data
    );
  }

  edit(a: Account): void {
    this.editAccount(a);
  }

  changeAccountVisibility(account: Account): void {
    account.visible = !account.visible;
    this.accountsService.update(account).subscribe(a => {
    });
  }

  assignBankAccountToAnAccount($event: [Account, BankAccount]) {
    this.callAndCloseEditAndFetchData(this.banksService.assignBankAccountToAnAccount($event[0], $event[1]));
  }

  editAccount(account: Account): void {
    this.accountToEdit = account;
    this.isEditAccount = true;
  }

  createAccount(): void {
    this.accountToEdit = null;
    this.isEditAccount = true;
  }

  deleteAccount(account: Account): void {
    this.accountToDelete = account;
    this.accountBeingDeletedDescription = account.name;
    this.showAccountDeletionConfirmation = true;
  }

  saveAccount(account: Account): void {
    if (this.accountToEdit) {
      this.accountToEdit.name = account.name;
      this.callAndCloseEditAndFetchData(this.accountsService.update(this.accountToEdit));
    } else {
      this.callAndCloseEditAndFetchData(this.accountsService.create(new Account(account)));
    }
  }

  deleteAccountMethod(): void {
    if (this.accountToDelete) {
      this.callAndCloseEditAndFetchData(this.accountsService.delete(this.accountToDelete));
    }
  }

  private callAndCloseEditAndFetchData(result: Observable<any>): void {
    result.subscribe(
      data => {
        this.closeEdit();
        this.fetchData();
      },
      error => {
        this.closeEdit();
        this.fetchData();
      }
    );
  }

  closeEdit(): void {
    this.isEditAccount = false;
    this.showAccountDeletionConfirmation = false;
    this.accountToEdit = null;
    this.accountToDelete = null;
    this.accountBeingDeletedDescription = '';
    this.fetchData();
  }

  simpleAccountInfo(a: Account): string {
    return a.name + ' - ' + a.currency;
  }

  entries(map: Map<string, Account[]>): [string, Account[]][] {
    return Array.from(map.entries());
  }

  createPiggyBank(piggyBank: PiggyBank): void {
    this.piggyBanksService.create(piggyBank).subscribe(
      data => this.fetchPiggyBanks(),
      error => this.toastService.showWarning('Błąd w czasie tworzenia skarbonki')
    );
  }

  updatePiggyBank(piggyBank: PiggyBank): void {
    this.piggyBanksService.update(piggyBank).subscribe(
      data => {
      },
      error => this.toastService.showWarning('Błąd w czasie aktualizowania skarbonki')
    );
  }

  createCategory(category: Category): void {
    this.categoriesService.createCategory(category)
      .subscribe(data => this.fetchCategories());
  }

  updateCategory(category: Category): void {
    this.categoriesService.updateCategory(category)
      .subscribe(data => this.fetchCategories());
  }

  createClient(client: Client): void {
    this.clientsService.createClient(client).subscribe(
      data => this.fetchClients()
    );
  }

  updateClient(client: Client): void {
    this.clientsService.updateClient(client).subscribe(
      data => this.fetchClients()
    );
  }

  createService(service: Service): void {
    this.servicesService.createService(service).subscribe(
      data => this.fetchServices()
    );
  }

  updateService(service: Service): void {
    this.servicesService.updateService(service).subscribe(
      data => this.fetchServices()
    );
  }

  createDomain(domain: DetailedDomain): void {
    this.domainService.create(domain.name).subscribe(data => this.fetchDomains());
  }

  updateDomain(domain: DetailedDomain): void {
    this.domainService.update(domain.toSimpleDomain()).subscribe(
      data => this.userDomains = [...this.userDomains.filter(d => d.id !== data.id), data]
    );
  }

  changeDomainUserAccess(data: { domain: DetailedDomain; user: string }): void {
    let newDomain: Observable<DetailedDomain>;
    if (data.domain.usersAccessLevel.get(data.user) === 'ADMIN') {
      newDomain = this.domainService.makeUserMember(data.domain.id, data.user);
    } else {
      newDomain = this.domainService.makeUserAdmin(data.domain.id, data.user);
    }
    newDomain.subscribe(
      changedDomain => this.refreshDomains(changedDomain),
      error => this.toastService.showWarning(error.error, 'W czasie zmiany uprawnień domeny wystąpił błąd')
    );
  }

  removeUserFromDomain(data: { domain: DetailedDomain; user: string }): void {
    this.domainService.removeUserFromDomain(data.domain.id, data.user).subscribe(
      changedDomain => this.refreshDomains(changedDomain),
      error => this.toastService.showWarning(error.error, 'W czasie zmiany uprawnień domeny wystąpił błąd')
    );
  }

  private refreshDomains(changedDomain: DetailedDomain): void {
    if (changedDomain.usersAccessLevel.size === 0) {
      this.userDomains = this.userDomains.filter(d => d.id !== changedDomain.id);
    } else {
      this.userDomains = [...this.userDomains.filter(d => d.id !== changedDomain.id), changedDomain];
    }
  }

  inviteUserToDomain(data: { domain: DetailedDomain; user: string }): void {
    this.domainService.inviteUserToDomain(data.domain.id, data.user).subscribe(
      changedDomain => {
      },
      error => this.toastService.showWarning(error.error, 'W czasie tworzenia zaproszenia wystąpił błąd')
    );
  }

  leaveDomain(data: { domain: DetailedDomain; user: string }): void {
    this.domainService.removeUserFromDomain(data.domain.id, data.user).subscribe(
      changedDomain => this.refreshDomains(changedDomain),
      error => this.toastService.showWarning(error.error, 'W czasie zmiany uprawnień domeny wystąpił błąd')
    );
  }
}
