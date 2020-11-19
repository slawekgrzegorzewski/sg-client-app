import {Component, Input, OnInit} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {ToastService} from '../../services/toast.service';
import {Currency} from '../../model/currency';
import {Account} from '../../model/account';
import {AccountsService} from '../../services/accounts.service';
import {map} from 'rxjs/operators';

export enum Mode {EDIT, CREATE}

@Component({
  selector: 'app-account-creator',
  templateUrl: './edit-account.component.html',
  styleUrls: ['./edit-account.component.css']
})
export class EditAccountComponent implements OnInit {
  @Input() mode: Mode = Mode.CREATE;

  internalEntity: Account;

  @Input() set entity(account: Account) {
    this.internalEntity = account;
    this.newAccount = {name: '', currency: ''};
    this.newAccount.name = account?.name || '';
    this.newAccount.currency = account?.currency || '';
  }

  get entity(): Account {
    return this.internalEntity;
  }

  closeSubject = new Subject<any>();
  currencies: Currency[];
  newAccount: {
    name: string,
    currency: string
  };

  constructor(private accountsService: AccountsService, private toastService: ToastService) {
    this.entity = null;
  }

  ngOnInit(): void {
  }

  createAccount(): void {
    this.entity = new Account(this.newAccount);
    this.accountsService.create(this.entity).subscribe(
      data => {
        this.confirm();
        this.entity = null;
      },
      error => {
        this.cancel();
        this.toastService.showWarning('Can not perform operation.');
        this.entity = null;
      }
    );
  }

  updateAccount(): void {
    this.entity.name = this.newAccount.name;
    this.accountsService.update(this.entity).subscribe(
      data => {
        this.confirm();
        this.entity = null;
      },
      error => {
        this.cancel();
        this.toastService.showWarning('Can not perform operation.');
        this.entity = null;
      }
    );
  }

  confirm(): void {
    this.closeSubject.next('ok');
  }

  cancel(): void {
    this.closeSubject.next('cancel');
  }

  isEditMode(): boolean {
    return this.mode === Mode.EDIT;
  }

  currenciesForTypeAhead(): () => Observable<Currency[]> {
    const that = this;
    return () => that.accountsService.possibleCurrencies()
      .pipe(map(data => data.sort((a, b) => a.code.localeCompare(b.code))));
  }

  currencyIdExtractor(currency: Currency): string {
    if (!currency) {
      return null;
    }
    return currency.code;
  }

  currencyToString(currency: Currency): string {
    return currency.description();
  }
}
