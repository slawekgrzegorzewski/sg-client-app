import {Component, OnInit} from '@angular/core';
import {LoginServiceService} from 'src/app/services/login-service/login-service.service';
import {HttpClient} from "@angular/common/http";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {environment} from "../../../environments/environment";
import {AccountData} from "../../model/account";
import {CreateAccountComponent} from "./create-account.component";
import {ToastService} from "../../services/toast/toast-service";

@Component({
  selector: 'accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  private _isLoggedIn = false;
  message = ""
  data: AccountData[]

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
      this.data = [];
      return;
    }
    this._http.get<AccountData[]>(environment.serviceUrl + "/accounts/all").subscribe(
      data => {
        this.data = data;
      },
      err => {
        this.data = [];
        this._toastService.showWarning("Current data has been cleared out.", "Can not obtain data!");
      }
    )
  }

  open() {
    let ngbModalRef = this.modalService.open(CreateAccountComponent, {centered: true});
    ngbModalRef.componentInstance.closeSubject.subscribe(
      this.onModalClose(ngbModalRef, this),
      this.onModalClose(ngbModalRef, this),
      this.onModalClose(ngbModalRef, this)
    )
  }

  onModalClose(ngbModalRef, that) {
    return input => {
      ngbModalRef.close();
      that.fetchData();
    }
  }
}
