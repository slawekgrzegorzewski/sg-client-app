import {Component, OnInit, TemplateRef} from '@angular/core';
import {LoginService} from 'src/app/services/login.service';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Account} from "../../model/account";
import {EditAccountComponent, Mode} from "./edit-account.component";
import {ToastService} from "../../services/toast.service";
import {AccountsService} from "../../services/accounts.service";
import {Observable} from "rxjs";

@Component({
  selector: 'accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  private _isLoggedIn = false;
  userAccounts: Account[]
  otherUsers: string[]
  othersAccounts: Map<string, Account[]>
  accountBeingDeletedDescription: string

  constructor(
    private accountsService: AccountsService,
    protected loginService: LoginService,
    private modalService: NgbModal,
    private toastService: ToastService) {
    loginService.authSub.subscribe(data => this._isLoggedIn = data);
  }

  ngOnInit() {
    this._isLoggedIn = this.loginService.isLoggedIn();
    this.fetchData();
  }

  loggedIn() {
    return this._isLoggedIn;
  }

  fetchData() {
    if (!this.loggedIn()) {
      this.userAccounts = [];
      this.othersAccounts = new Map<string, Account[]>();
      return;
    }

    var userName = this.loginService.getUserName();
    let accounts: Observable<Account[]> = this.loginService.isAdmin() ? this.accountsService.allAccounts() : this.accountsService.currentUserAccounts();
    accounts.subscribe(
      data => {
        var accounts = data.map(d => new Account(d));
        this.userAccounts = accounts.filter(a => a.userName === userName).sort(Account.compareByCurrencyAndName);
        this.othersAccounts = accounts.filter(a => a.userName !== userName).reduce(
          (map, acc) => map.set(acc.userName, [...map.get(acc.userName) || [], acc]),
          new Map<string, Account[]>()
        );
        this.otherUsers = Array.from(this.othersAccounts.keys())
        for (let user of this.otherUsers) {
          this.otherUsers[user] = (this.otherUsers[user] || []).sort(Account.compareByCurrencyAndName);
        }
      },
      err => {
        this.userAccounts = [];
        this.othersAccounts = new Map<string, Account[]>();
        this.toastService.showWarning("Current data has been cleared out.", "Can not obtain data!");
      }
    )
  }

  openCreationDialog() {
    let component = this.setupEditDialog();
    component.mode = Mode.CREATE;
    component.entity = null;
  }

  openEditDialog(account: Account) {
    let component = this.setupEditDialog();
    component.mode = Mode.EDIT;
    component.entity = account;
  }

  private setupEditDialog() {
    let ngbModalRef = this.modalService.open(EditAccountComponent, {centered: true});
    let component = ngbModalRef.componentInstance as EditAccountComponent;
    let closeHandler = this.onModalClose(ngbModalRef, this);
    component.closeSubject.subscribe(closeHandler, closeHandler)
    return component;
  }

  onModalClose(ngbModalRef, that) {
    return input => {
      ngbModalRef.close();
      that.fetchData();
    }
  }

  deleteAccount(a: Account) {
    this.accountsService.delete(a).subscribe(
      data => {
        this.userAccounts = this.userAccounts.filter(acc => acc.id !== a.id);
      },
      err => {
        this.toastService.showWarning("'" + this.simpleAccountInfo(a) + "' could not be deleted.", "Can not delete!");
      }
    )
  }

  simpleAccountInfo(a: Account) {
    return a.name + ' - ' + a.currency;
  }

  delete(that, deleteConfirmation: TemplateRef<any>) {
    return (a: Account) => {
      that.accountBeingDeletedDescription = a.name + ' - ' + a.userName
      const m: NgbModal = that.modalService;
      m.open(deleteConfirmation, {centered: true}).result.then(
        result => that.deleteAccount(a),
        reason => {
        }
      )
    }
  }

  rename(that) {
    return (a: Account) => {
      that.openEditDialog(a)
    }
  }

  entries(map: Map<string, Account[]>) {
    return Array.from(map.entries())
  }
}
