import {Component, OnInit} from '@angular/core';
import {LoginService} from 'src/app/services/login.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Account} from '../../../model/accountant/account';
import {Mode} from '../../../components/accountant/accounts/edit-account.component';
import {ToastService} from '../../../services/toast.service';
import {AccountsService} from '../../../services/accountant/accounts.service';
import {Observable} from 'rxjs';
import {PiggyBank} from '../../../model/accountant/piggy-bank';
import {PiggyBanksService} from '../../../services/accountant/piggy-banks.service';
import {Currency} from '../../../model/accountant/currency';
import {BillingPeriodsService} from '../../../services/accountant/billing-periods.service';
import {Category} from '../../../model/accountant/billings/category';

@Component({
  selector: 'app-accounts',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  private isLoggedIn = false;
  userAccounts: Account[];
  otherUsers: number[];
  othersAccounts: Map<number, Account[]>;
  piggyBanks: PiggyBank[];
  allCurrencies: Currency[];
  categories: Category[];

  isEditAccount = false;
  accountToEdit: Account;
  accountToDelete: null;
  mode: Mode = Mode.CREATE;
  showAccountDeletionConfirmation = false;
  accountBeingDeletedDescription: string;

  constructor(
    private accountsService: AccountsService,
    private piggyBanksService: PiggyBanksService,
    public loginService: LoginService,
    private modalService: NgbModal,
    private billingsService: BillingPeriodsService,
    private toastService: ToastService) {
    this.loginService.authSub.subscribe(data => this.isLoggedIn = data);
  }

  ngOnInit(): void {
    this.isLoggedIn = this.loginService.isLoggedIn();
    this.fetchData();
  }

  loggedIn(): boolean {
    return this.isLoggedIn;
  }

  isAdmin(): boolean {
    return this.loginService.isAdmin();
  }

  fetchData(): void {
    if (!this.loggedIn()) {
      this.userAccounts = [];
      this.othersAccounts = new Map<number, Account[]>();
      return;
    }

    this.fetchAccounts();
    this.fetchPiggyBanks();
    this.fetchCurrencies();
    this.fetchCategories();
  }

  private fetchAccounts(): void {
    const userId = this.loginService.getUserId();
    const accounts: Observable<Account[]> = this.loginService.isAdmin() ?
      this.accountsService.allAccounts() : this.accountsService.currentUserAccounts();
    accounts.subscribe(
      data => {
        const accountsFromData = data.map(d => new Account(d));
        this.userAccounts = data.filter(a => a.userId === userId).sort(Account.compareByCurrencyAndName);
        this.othersAccounts = data.filter(a => a.userId !== userId).reduce(
          (map, acc) => map.set(acc.userId, [...map.get(acc.userId) || [], acc]),
          new Map<number, Account[]>()
        );
        this.otherUsers = Array.from(this.othersAccounts.keys());
        for (const user of this.otherUsers) {
          this.othersAccounts[user] = (this.othersAccounts[user] || []).sort(Account.compareByCurrencyAndName);
        }
      },
      err => {
        this.userAccounts = [];
        this.othersAccounts = new Map<number, Account[]>();
        this.toastService.showWarning('Current data has been cleared out.', 'Can not obtain data!');
      }
    );
  }

  private fetchPiggyBanks(): void {
    this.piggyBanksService.getAllPiggyBanks().subscribe(data => {
      this.piggyBanks = data.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  private fetchCurrencies(): void {
    this.accountsService.possibleCurrencies().subscribe(data => {
      this.allCurrencies = data.sort((a, b) => a.code.localeCompare(b.code));
    });
  }

  private fetchCategories(): void {
    this.billingsService.getAllCategories().subscribe(
      data => this.categories = data
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
      that.accountBeingDeletedDescription = account.name + ' - ' + account.userId;
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
    this.billingsService.createCategory(category).subscribe(
      data => this.fetchCategories()
    );
  }

  updateCategory(category: Category): void {
    this.billingsService.updateCategory(category).subscribe(
      data => this.fetchCategories()
    );
  }
}
