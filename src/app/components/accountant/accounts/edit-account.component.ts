import {Component, Input, OnInit, Output} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {Currency} from '../../../model/accountant/currency';
import {Account} from '../../../model/accountant/account';

export enum Mode {EDIT, CREATE}

@Component({
  selector: 'app-account-creator',
  templateUrl: './edit-account.component.html',
  styleUrls: ['./edit-account.component.css']
})
export class EditAccountComponent implements OnInit {

  @Input() mode: Mode = Mode.CREATE;
  @Input() currencies: Currency[] = [];

  internalEntity: Account | null = null;

  @Input() set entity(account: Account | null) {
    this.internalEntity = account;
    this.newAccount = {name: '', currency: ''};
    this.newAccount.name = account?.name || '';
    this.newAccount.currency = account?.currency || '';
  }

  get entity(): Account | null {
    return this.internalEntity;
  }

  @Output() createSubject = new Subject<Account>();
  @Output() updateSubject = new Subject<Account>();
  @Output() cancelSubject = new Subject<string>();

  newAccount: { name: string, currency: string } | null = null;

  constructor() {
    this.entity = null;
  }

  ngOnInit(): void {
  }

  createAccount(): void {
    if (this.newAccount) {
      this.entity = new Account(this.newAccount);
      this.entity.correctCurrencyToString();
      this.createSubject.next(this.entity);
      this.entity = null;
    }
  }

  updateAccount(): void {
    if (this.newAccount && this.entity) {
      this.entity.name = this.newAccount.name;
      this.entity.correctCurrencyToString();
      this.updateSubject.next(this.entity);
      this.entity = null;
    }
  }

  cancel(): void {
    this.cancelSubject.next('cancel');
  }

  isEditMode(): boolean {
    return this.mode === Mode.EDIT;
  }

  currenciesForTypeAhead(): () => Observable<Currency[]> {
    const that = this;
    return () => of(that.currencies);
  }
}
