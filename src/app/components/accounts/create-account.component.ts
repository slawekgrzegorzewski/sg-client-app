import {Component, Inject, LOCALE_ID, OnInit, ViewChild} from '@angular/core';
import {LoginServiceService} from 'src/app/services/login-service/login-service.service';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {merge, Observable, Subject} from "rxjs";
import {ToastService} from "../../services/toast/toast-service";
import {Currency} from "../../model/currency";
import {debounceTime, distinctUntilChanged, filter, map} from "rxjs/operators";
import {NgbTypeahead} from "@ng-bootstrap/ng-bootstrap";
import {Account} from "../../model/account";

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

  set currencyObject(currency: Currency) {
    this.newAccount.currency = currency.code;
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
        this.currencies = data.map(d => Currency.fromData(d)).sort((a, b) => a.code.localeCompare(b.code));
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

  ngOnInit() {
    this._isLoggedIn = this._loginService.isLoggedIn();
  }

  loggedIn() {
    return this._isLoggedIn;
  }

  createAccount() {
    let account = new Account(this.newAccount);
    this.clearNewAccount();
    this._http.put(environment.serviceUrl + "/accounts", account).subscribe(
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

  @ViewChild('accountsTypeAhead', {static: true}) accountsTypeAhead: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.accountsTypeAhead.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.currencies
        : this.currencies.filter(c => c.description().toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
  }
  formatter = (currency: Currency) => currency === null ? '' : currency.description();
}
