import {Component, OnInit, TemplateRef} from '@angular/core';
import {LoginService} from 'src/app/services/login.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Account} from '../../model/account';
import {EditAccountComponent, Mode} from '../accounts/edit-account.component';
import {ToastService} from '../../services/toast.service';
import {AccountsService} from '../../services/accounts.service';
import {Observable} from 'rxjs';
import {PiggyBank} from '../../model/piggy-bank';
import {PiggyBanksService} from '../../services/piggy-banks.service';
import {Currency} from '../../model/currency';

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
  accountBeingDeletedDescription: string;
  piggyBanks: PiggyBank[];
  allCurrencies: Currency[];

  constructor(
    private accountsService: AccountsService,
    private piggyBanksService: PiggyBanksService,
    private loginService: LoginService,
    private modalService: NgbModal,
    private toastService: ToastService) {
    loginService.authSub.subscribe(data => this.isLoggedIn = data);
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

  openCreationDialog(): void {
    const component = this.setupEditDialog();
    component.mode = Mode.CREATE;
    component.entity = null;
  }

  openEditDialog(account: Account): void {
    const component = this.setupEditDialog();
    component.mode = Mode.EDIT;
    component.entity = account;
  }

  private setupEditDialog(): EditAccountComponent {
    const ngbModalRef = this.modalService.open(EditAccountComponent, {centered: true});
    const component = ngbModalRef.componentInstance as EditAccountComponent;
    const closeHandler = this.onModalClose(ngbModalRef, this);
    component.closeSubject.subscribe(closeHandler, closeHandler);
    return component;
  }

  onModalClose(ngbModalRef, that): (input) => void {
    return input => {
      ngbModalRef.close();
      that.fetchData();
    };
  }

  deleteAccount(a: Account): void {
    this.accountsService.delete(a).subscribe(
      data => {
        this.userAccounts = this.userAccounts.filter(acc => acc.id !== a.id);
      },
      err => {
        this.toastService.showWarning('\'' + this.simpleAccountInfo(a) + '\' could not be deleted.', 'Can not delete!');
      }
    );
  }

  simpleAccountInfo(a: Account): string {
    return a.name + ' - ' + a.currency;
  }

  delete(that, deleteConfirmation: TemplateRef<any>): (a: Account) => void {
    return (a: Account) => {
      that.accountBeingDeletedDescription = a.name + ' - ' + a.userId;
      const m: NgbModal = that.modalService;
      m.open(deleteConfirmation, {centered: true}).result.then(
        result => that.deleteAccount(a),
        reason => {
        }
      );
    };
  }

  rename(that): (a: Account) => void {
    return (a: Account) => {
      that.openEditDialog(a);
    };
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
}
