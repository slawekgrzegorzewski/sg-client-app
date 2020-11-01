import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {merge, Observable, Subject} from "rxjs";
import {ToastService} from "../../services/toast.service";
import {Currency} from "../../model/currency";
import {debounceTime, distinctUntilChanged, filter, map} from "rxjs/operators";
import {NgbTypeahead} from "@ng-bootstrap/ng-bootstrap";
import {Account} from "../../model/account";
import {AccountsService} from "../../services/accounts.service";

export enum Mode {EDIT, CREATE}

@Component({
  selector: 'account-creator',
  templateUrl: './edit-account.component.html',
  styleUrls: ['./edit-account.component.css']
})
export class EditAccountComponent implements OnInit {
  @Input() mode: Mode = Mode.CREATE;

  _enitty: Account;

  @Input() set entity(account: Account) {
    this._enitty = account;
    this.newAccount = {name: '', currency: ''}
    this.newAccount.name = account?.name || ''
    this.newAccount.currency = account?.currency || ''
    this.setCurrencyObject();
  }

  get entity() {
    return this._enitty;
  }

  closeSubject = new Subject<any>();
  currencies: Currency[]
  newAccount: {
    name: string,
    currency: string
  }

  _currencyObject: Currency = null;
  set currencyObject(currency: Currency) {
    if (this.mode === Mode.CREATE)
      this.newAccount.currency = currency.code;
    this.setCurrencyObject();
  }

  get currencyObject() {
    return this._currencyObject;
  }

  constructor(private accountsService: AccountsService, private _toastService: ToastService) {
    this.entity = null;
  }

  ngOnInit() {
    this.loadCurrencies();
  }

  private loadCurrencies() {
    this.accountsService.possibleCurrencies().subscribe(
      data => {
        this.currencies = data.map(d => Currency.fromData(d)).sort((a, b) => a.code.localeCompare(b.code));
        this.setCurrencyObject();
      },
      err => {
        this.currencies = [];
        this._toastService.showWarning("Creating new account is not possible.", "Can not obtain available currencies!");
      }
    )
  }

  createAccount() {
    this.entity = new Account(this.newAccount);
    this.accountsService.create(this.entity).subscribe(
      data => {
        this.confirm();
        this.entity = null;
      },
      error => {
        this.cancel();
        this._toastService.showWarning("Can not perform operation.");
        this.entity = null;
      }
    )
  }

  updateAccount() {
    this.entity.name = this.newAccount.name;
    this.accountsService.update(this.entity).subscribe(
      data => {
        this.confirm();
        this.entity = null;
      },
      error => {
        this.cancel();
        this._toastService.showWarning("Can not perform operation.");
        this.entity = null;
      }
    )
  }

  confirm() {
    this.closeSubject.next("ok");
  }

  cancel() {
    this.closeSubject.next("cancel");
  }

  isEditMode() {
    return this.mode === Mode.EDIT
  }

  private setCurrencyObject() {
    if (this.newAccount?.currency) {
      this._currencyObject = this.currencies.find(c => c.code === this.newAccount.currency)
    } else {
      this._currencyObject = null;
    }
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