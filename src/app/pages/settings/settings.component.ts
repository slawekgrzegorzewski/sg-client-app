import {Component, OnInit} from '@angular/core';
import {LoginService} from 'src/app/services/login.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Account} from '../../model/accountant/account';
import {Mode} from '../../components/accountant/accounts/edit-account.component';
import {ToastService} from '../../services/toast.service';
import {AccountsService} from '../../services/accountant/accounts.service';
import {Observable} from 'rxjs';
import {PiggyBank} from '../../model/accountant/piggy-bank';
import {PiggyBanksService} from '../../services/accountant/piggy-banks.service';
import {Currency} from '../../model/accountant/currency';
import {BillingPeriodsService} from '../../services/accountant/billing-periods.service';
import {Category} from '../../model/accountant/billings/category';
import {CategoriesService} from '../../services/accountant/categories.service';
import {DomainService} from '../../services/domain.service';
import {DetailedDomain} from '../../model/domain';
import {Client} from '../../model/accountant/client';
import {ClientsService} from '../../services/accountant/clients.service';
import {AccountantSettingsService} from '../../services/accountant/accountant-settings.service';
import {AccountantSettings} from '../../model/accountant/accountant-settings';
import {Service} from '../../model/accountant/service';
import {ServicesService} from '../../services/accountant/services.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  private isLoggedIn = false;
  mode: Mode = Mode.CREATE;
  accountsInCurrentDomain: Account[];
  otherDomainsAccounts: Map<string, Account[]>;
  isEditAccount = false;
  accountToEdit: Account;
  accountToDelete: null;
  showAccountDeletionConfirmation = false;
  accountBeingDeletedDescription: string;
  currentDomainName: string;
  piggyBanks: PiggyBank[];
  allCurrencies: Currency[];
  categories: Category[];
  clients: Client[];
  services: Service[];
  userDomains: DetailedDomain[];


  constructor(
    private accountsService: AccountsService,
    private accountantSettingsService: AccountantSettingsService,
    private categoriesService: CategoriesService,
    private clientsService: ClientsService,
    private servicesService: ServicesService,
    private domainsService: DomainService,
    private piggyBanksService: PiggyBanksService,
    public loginService: LoginService,
    private modalService: NgbModal,
    private billingsService: BillingPeriodsService,
    private toastService: ToastService) {
    this.loginService.loginSubject.subscribe(data => this.isLoggedIn = data);
  }

  ngOnInit(): void {
    this.isLoggedIn = this.loginService.isLoggedIn();
    this.fetchData();
  }

  loggedIn(): boolean {
    return this.isLoggedIn;
  }

  currentUserLogin(): string {
    return this.loginService.getUserName();
  }

  isAdmin(): boolean {
    return this.loginService.isAdmin();
  }

  fetchData(): void {
    if (!this.loggedIn()) {
      this.accountsInCurrentDomain = [];
      this.otherDomainsAccounts = new Map<string, Account[]>();
      return;
    }

    this.fetchAccounts();
    this.fetchPiggyBanks();
    this.fetchCurrencies();
    this.fetchCategories();
    this.fetchClients();
    this.fetchServices();
    this.currentDomainName = this.domainsService.currentDomain?.name || '';
    this.fetchDomains();
  }

  private fetchAccounts(): void {
    const currentDomain = this.loginService.currentDomainId;
    const accounts: Observable<Account[]> = this.loginService.isAdmin() ?
      this.accountsService.allAccounts() : this.accountsService.currentDomainAccounts();
    accounts.subscribe(
      data => {
        const accountsFromData = data.map(d => new Account(d));
        this.accountsInCurrentDomain = data.filter(a => a.domain.id === currentDomain).sort(Account.compareByCurrencyAndName);
        this.otherDomainsAccounts = data.filter(a => a.domain.id !== currentDomain).reduce(
          (map, acc) => map.set(acc.domain.name, [...map.get(acc.domain.name) || [], acc]),
          new Map<string, Account[]>()
        );
        for (const domainName of this.otherDomainsAccounts.keys()) {
          this.otherDomainsAccounts[domainName] = (this.otherDomainsAccounts[domainName] || []).sort(Account.compareByCurrencyAndName);
        }
      },
      err => {
        this.accountsInCurrentDomain = [];
        this.otherDomainsAccounts = new Map<string, Account[]>();
        this.toastService.showWarning('Current data has been cleared out.', 'Can not obtain data!');
      }
    );
  }

  private fetchPiggyBanks(): void {
    this.piggyBanksService.currentDomainPiggyBanks().subscribe(data => {
      this.piggyBanks = data.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  private fetchCurrencies(): void {
    this.accountsService.possibleCurrencies().subscribe(data => {
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
    this.domainsService.getAllDomains().subscribe(
      data => this.userDomains = data
    );
  }

  rename(that): (a: Account) => void {
    return (a: Account) => {
      that.editAccount(a);
    };
  }

  editAccount(account: Account): void {
    this.mode = Mode.EDIT;
    this.accountToEdit = account;
    this.isEditAccount = true;
  }

  createAccount(): void {
    this.mode = Mode.CREATE;
    this.accountToEdit = null;
    this.isEditAccount = true;
  }

  deleteAccount(that): (account: Account) => void {
    return (account: Account) => {
      that.accountToDelete = account;
      that.accountBeingDeletedDescription = account.name;
      this.showAccountDeletionConfirmation = true;
    };
  }

  createAccountMethod(account: Account): void {
    this.callAccountsService(this.accountsService.create(account));
  }

  updateAccountMethod(account: Account): void {
    this.callAccountsService(this.accountsService.update(account));
  }

  deleteAccountMethod(): void {
    this.callAccountsService(this.accountsService.delete(this.accountToDelete));
  }

  private callAccountsService(result: Observable<any>): void {
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
      data => this.fetchPiggyBanks()
    );
  }

  updatePiggyBank(piggyBank: PiggyBank): void {
    this.piggyBanksService.update(piggyBank).subscribe();
  }

  createCategory(category: Category): void {
    this.categoriesService.createCategory(category).subscribe(
      data => this.fetchCategories()
    );
  }

  updateCategory(category: Category): void {
    this.categoriesService.updateCategory(category).subscribe(
      data => this.fetchCategories()
    );
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
    this.domainsService.create(domain.name).subscribe(data => this.fetchDomains());
  }

  updateDomain(domain: DetailedDomain): void {
    this.domainsService.update(domain.toSimpleDomain()).subscribe(
      data => this.userDomains = [...this.userDomains.filter(d => d.id !== data.id), data]
    );
  }

  changeDomainUserAccess(data: { domain: DetailedDomain; user: string }): void {
    let newDomain: Observable<DetailedDomain> = null;
    if (data.domain.usersAccessLevel.get(data.user) === 'ADMIN') {
      newDomain = this.domainsService.makeUserMember(data.domain.id, data.user);
    } else {
      newDomain = this.domainsService.makeUserAdmin(data.domain.id, data.user);
    }
    newDomain.subscribe(
      changedDomain => this.refreshDomains(changedDomain),
      error => this.toastService.showWarning(error.error, 'W czasie zmiany uprawnień domeny wystąpił błąd')
    );
  }

  removeUserFromDomain(data: { domain: DetailedDomain; user: string }): void {
    this.domainsService.removeUserFromDomain(data.domain.id, data.user).subscribe(
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
    this.domainsService.inviteUserToDomain(data.domain.id, data.user).subscribe(
      changedDomain => {
      },
      error => this.toastService.showWarning(error.error, 'W czasie tworzenia zaproszenia wystąpił błąd')
    );
  }

  leaveDomain(data: { domain: DetailedDomain; user: string }): void {
    this.domainsService.removeUserFromDomain(data.domain.id, data.user).subscribe(
      changedDomain => this.refreshDomains(changedDomain),
      error => this.toastService.showWarning(error.error, 'W czasie zmiany uprawnień domeny wystąpił błąd')
    );
  }

  updateIsCompany(settings: AccountantSettings): void {
    this.accountantSettingsService.setIsCompany(settings.company).subscribe(data => {
      this.loginService.accountantSettings = data;
    });
  }
}
