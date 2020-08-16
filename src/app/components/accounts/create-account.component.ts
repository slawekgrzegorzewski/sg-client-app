import {Component, Inject, LOCALE_ID, OnInit} from '@angular/core';
import {LoginServiceService} from 'src/app/services/login-service/login-service.service';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Subject} from "rxjs";
import {ToastService} from "../../services/toast/toast-service";
import {Currency} from "../../model/currency";

@Component({
  selector: 'account-creator',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit {
  private _isLoggedIn = false;
  closeSubject = new Subject<any>();
  currencies: Currency[]
  newAccount: {
    name: string,
    currency: string
  }

  constructor(private _loginService: LoginServiceService,
              private _http: HttpClient,
              private _toastService: ToastService,
              @Inject(LOCALE_ID) private defaultLocale: string) {
    _loginService.authSub.subscribe(data => this._isLoggedIn = data);
    this.clearNewAccount();
    this.loadCurrencies();
  }

  private loadCurrencies() {
    this._http.get<Currency[]>(environment.serviceUrl + "/currency/all/" + this.getUsersLocale()).subscribe(
      data => {
        this.currencies = data.sort((a, b) => a.code.localeCompare(b.code));
      },
      err => {
        this.currencies = [];
        this._toastService.showWarning("Creating new account is not possible.", "Can not obtain available currencies!");
      }
    )
  }

  private getUsersLocale(): string {
    if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
      return this.defaultLocale;
    }
    const wn = window.navigator as any;
    let lang = wn.languages ? wn.languages[0] : this.defaultLocale;
    lang = lang || wn.language || wn.browserLanguage || wn.userLanguage;
    return lang;
  }

  private clearNewAccount() {
    this.newAccount = {name: '', currency: ''}
  }

  private mapToTransferObject() {
    return {name: this.newAccount.name, currency: this.newAccount.currency}
  }

  ngOnInit() {
    this._isLoggedIn = this._loginService.isLoggedIn();
  }

  loggedIn() {
    return this._isLoggedIn;
  }

  createAccount() {
    var accountToCreate = this.mapToTransferObject();
    this.clearNewAccount();
    this._http.post(environment.serviceUrl + "/accounts/add", accountToCreate).subscribe(
      data => this.confirm(),
      error => {
        this.cancel();
        this._toastService.showWarning("Can not create account.");
      }
    )
  }

  confirm() {
    this.closeSubject.next("ok");
  }

  cancel() {
    this.closeSubject.next("cancel");
  }
}
