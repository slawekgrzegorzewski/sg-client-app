import {Component, OnDestroy, OnInit} from '@angular/core';
import {LoginService} from 'src/app/services/login.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Account} from '../../model/accountant/account';
import {ToastService} from '../../services/toast.service';
import {AccountsService} from '../../services/accountant/accounts.service';
import {Observable, Subscription} from 'rxjs';
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
import {ComparatorBuilder} from '../../utils/comparator-builder';
import {Button} from '../../components/general/hoverable-buttons.component';

@Component({
  selector: 'app-accounts',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {

  accountsInCurrentDomain: Account[] = [];
  otherDomainsAccounts = new Map<string, Account[]>();
  isEditAccount = false;
  accountToEdit: Account | null = null;
  accountToDelete: Account | null = null;
  showAccountDeletionConfirmation = false;
  accountBeingDeletedDescription = '';
  currentDomainName = '';
  piggyBanks: PiggyBank[] = [];
  allCurrencies: Currency[] = [];
  categories: Category[] = [];
  clients: Client[] = [];
  services: Service[] = [];
  userDomains: DetailedDomain[] = [];
  buttons = [
    new Button({name: 'usuń', action: this.deleteAccount(this)}),
    new Button({name: 'zmień nazwę', action: this.rename(this)}),
    new Button({name: 'pokaż', action: this.showAccount(this), show: (account: Account | null) => account && !account.visible || false}),
    new Button({name: 'ukryj', action: this.hideAccount(this), show: (account: Account | null) => account && account.visible || false})
  ];
  public accountantSettings: AccountantSettings | null = null;
  private domainSubscription: Subscription;

  constructor(
    private accountsService: AccountsService,
    private accountantSettingsService: AccountantSettingsService,
    private categoriesService: CategoriesService,
    private clientsService: ClientsService,
    private servicesService: ServicesService,
    private domainService: DomainService,
    private piggyBanksService: PiggyBanksService,
    public loginService: LoginService,
    private modalService: NgbModal,
    private billingsService: BillingPeriodsService,
    private toastService: ToastService) {
    this.domainSubscription = this.domainService.onCurrentDomainChange.subscribe((domain) => {
      this.accountantSettingsService.getForDomain().subscribe(data => this.accountantSettings = data);
    });
  }

  ngOnInit(): void {
    this.fetchData();
  }

  ngOnDestroy(): void {
    if (this.domainSubscription) {
      this.domainSubscription.unsubscribe();
    }
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
    this.currentDomainName = this.domainService.currentDomain?.name || '';
    this.fetchDomains();
    this.accountantSettingsService.getForDomain().subscribe(data => this.accountantSettings = data);
  }

  private fetchAccounts(): void {
    const currentDomain = this.domainService.currentDomainId;
    const accounts: Observable<Account[]> = this.loginService.containsRole('ACCOUNTANT_ADMIN') ?
      this.accountsService.allAccounts() : this.accountsService.currentDomainAccounts();
    accounts.subscribe(
      data => {
        const accountsFromData = data.map(d => new Account(d));
        this.accountsInCurrentDomain = data.filter(a => a.domain.id === currentDomain).sort(
          ComparatorBuilder.comparing<Account>(a => a.currency).thenComparing(a => a.name).build()
        );
        this.otherDomainsAccounts = data.filter(a => a.domain.id !== currentDomain).reduce(
          (map, acc) => map.set(acc.domain.name, [...map.get(acc.domain.name) || [], acc]),
          new Map<string, Account[]>()
        );
        for (const domainName of this.otherDomainsAccounts.keys()) {
          const domains = (this.otherDomainsAccounts.get(domainName) || [])
            .sort(ComparatorBuilder.comparing<Account>(a => a.currency).thenComparing(a => a.name).build());
          this.otherDomainsAccounts.set(domainName, domains);
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
    this.domainService.getAllDomains().subscribe(
      data => this.userDomains = data
    );
  }

  rename(that: SettingsComponent): (a: Account) => void {
    return (a: Account) => {
      that.editAccount(a);
    };
  }

  showAccount(that: SettingsComponent): (a: Account) => void {
    return (a: Account) => {
      a.visible = true;
      this.accountsService.update(a).subscribe(a => {
      });
    };
  }

  hideAccount(that: SettingsComponent): (a: Account) => void {
    return (a: Account) => {
      a.visible = false;
      this.accountsService.update(a).subscribe(a => {
      });
    };
  }

  editAccount(account: Account): void {
    this.accountToEdit = account;
    this.isEditAccount = true;
  }

  createAccount(): void {
    this.accountToEdit = null;
    this.isEditAccount = true;
  }

  deleteAccount(that: SettingsComponent): (account: Account) => void {
    return (account: Account) => {
      that.accountToDelete = account;
      that.accountBeingDeletedDescription = account.name;
      this.showAccountDeletionConfirmation = true;
    };
  }

  saveAccount(account: Account): void {
    if (this.accountToEdit) {
      this.accountToEdit.name = account.name;
      this.callAccountsService(this.accountsService.update(this.accountToEdit));
    } else {
      this.callAccountsService(this.accountsService.create(new Account(account)));
    }
  }

  deleteAccountMethod(): void {
    if (this.accountToDelete) {
      this.callAccountsService(this.accountsService.delete(this.accountToDelete));
    }
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

  updateIsCompany(settings: AccountantSettings): void {
    this.accountantSettingsService.setIsCompany(settings.company).subscribe(data => {
    });
  }
}
