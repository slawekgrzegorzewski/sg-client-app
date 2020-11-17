import {Component, OnInit, TemplateRef} from '@angular/core';
import {LoginService} from 'src/app/services/login.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Account} from '../model/account';
import {EditAccountComponent, Mode} from './accounts/edit-account.component';
import {ToastService} from '../services/toast.service';
import {AccountsService} from '../services/accounts.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-accounts',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  private isLoggedIn = false;
  userAccounts: Account[];
  otherUsers: string[];
  othersAccounts: Map<string, Account[]>;
  accountBeingDeletedDescription: string;

  constructor(
    private accountsService: AccountsService,
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

  fetchData(): void {
    if (!this.loggedIn()) {
      this.userAccounts = [];
      this.othersAccounts = new Map<string, Account[]>();
      return;
    }

    const userName = this.loginService.getUserName();
    const accounts: Observable<Account[]> = this.loginService.isAdmin() ?
      this.accountsService.allAccounts() : this.accountsService.currentUserAccounts();
    accounts.subscribe(
      data => {
        const accountsFromData = data.map(d => new Account(d));
        this.userAccounts = data.filter(a => a.userName === userName).sort(Account.compareByCurrencyAndName);
        this.othersAccounts = data.filter(a => a.userName !== userName).reduce(
          (map, acc) => map.set(acc.userName, [...map.get(acc.userName) || [], acc]),
          new Map<string, Account[]>()
        );
        this.otherUsers = Array.from(this.othersAccounts.keys());
        for (const user of this.otherUsers) {
          this.otherUsers[user] = (this.otherUsers[user] || []).sort(Account.compareByCurrencyAndName);
        }
      },
      err => {
        this.userAccounts = [];
        this.othersAccounts = new Map<string, Account[]>();
        this.toastService.showWarning('Current data has been cleared out.', 'Can not obtain data!');
      }
    );
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
      that.accountBeingDeletedDescription = a.name + ' - ' + a.userName;
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
}
