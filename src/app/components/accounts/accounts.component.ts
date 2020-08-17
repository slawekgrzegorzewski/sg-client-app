import {Component, OnInit, TemplateRef} from '@angular/core';
import {LoginServiceService} from 'src/app/services/login-service/login-service.service';
import {HttpClient} from "@angular/common/http";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {environment} from "../../../environments/environment";
import {Account} from "../../model/account";
import {CreateAccountComponent} from "./create-account.component";
import {ToastService} from "../../services/toast/toast-service";

@Component({
  selector: 'accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  private _isLoggedIn = false;
  userAccounts: Account[]
  othersAccounts: Account[]
  accountBeingDeletedDescription: string

  constructor(private _loginService: LoginServiceService, private _http: HttpClient, private modalService: NgbModal, private _toastService: ToastService) {
    _loginService.authSub.subscribe(data => this._isLoggedIn = data);
  }

  ngOnInit() {
    this._isLoggedIn = this._loginService.isLoggedIn();
    this.fetchData();
  }

  loggedIn() {
    return this._isLoggedIn;
  }

  fetchData() {
    if (!this.loggedIn()) {
      this.userAccounts = [];
      this.othersAccounts = [];
      return;
    }

    var userName = this._loginService.getUserName();
    this._http.get<Account[]>(environment.serviceUrl + "/accounts").subscribe(
      data => {
        var accounts = data.map(d => new Account(d));
        this.userAccounts = accounts.filter(a => a.userName === userName);
        this.othersAccounts = accounts.filter(a => a.userName !== userName);
      },
      err => {
        this.userAccounts = [];
        this.othersAccounts = [];
        this._toastService.showWarning("Current data has been cleared out.", "Can not obtain data!");
      }
    )
  }

  open() {
    let ngbModalRef = this.modalService.open(CreateAccountComponent, {centered: true});
    let closeHandler = this.onModalClose(ngbModalRef, this);
    ngbModalRef.componentInstance.closeSubject.subscribe(closeHandler, closeHandler, closeHandler)
  }

  onModalClose(ngbModalRef, that) {
    return input => {
      ngbModalRef.close();
      that.fetchData();
    }
  }

  deleteAccount(a: Account) {
    this._http.delete(environment.serviceUrl + "/accounts/" + a.id, {responseType: 'text'}).subscribe(
      data => {
        this.userAccounts = this.userAccounts.filter(acc => acc.id !== a.id);
      },
      err => {
        this._toastService.showWarning("'" + this.simpleAccountInfo(a) + "' could not be deleted.", "Can not delete!");
      }
    )
  }

  simpleAccountInfo(a: Account) {
    return a.name + ' - ' + a.currency;
  }

  othersUserAccountInfo(a: Account) {
    return a.name + ' - ' + a.currency + ' for user ' + a.userName;
  }

  delete(that, deleteConfirmation: TemplateRef<any>) {
    return (a: Account) => {

      that.accountBeingDeletedDescription = that.othersUserAccountInfo(a)
      const m: NgbModal = that.modalService;
      m.open(deleteConfirmation, {centered: true}).result.then(
        result => that.deleteAccount(a),
        reason => {
        }
      )
    }

  }

}
