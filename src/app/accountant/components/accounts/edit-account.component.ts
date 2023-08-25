import {Component, Input, OnInit, Output} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {Currency} from '../../model/currency';
import {Account} from '../../model/account';

@Component({
  selector: 'app-account-creator',
  templateUrl: './edit-account.component.html',
  styleUrls: ['./edit-account.component.css']
})
export class EditAccountComponent implements OnInit {

  creditLimitIncorrect = false;

  @Input() currencies: Currency[] = [];

  private _entity: Account | null = null;

  @Input() set entity(account: Account | null) {
    this._entity = account ? account : new Account({});
  }

  get entity(): Account | null {
    return this._entity;
  }

  get creditLimit(): number {
    if (this.entity) {
      return this.entity.creditLimit;
    } else {
      return 0;
    }
  }

  set creditLimit(value: number) {
    if (this.entity) {
      this.entity.creditLimit = value;
        this.creditLimitIncorrect = this.creditLimit < 0 || (this.entity.currentBalance < 0 && this.entity.currentBalance + this.entity.creditLimit < 0);
    }
  }

  get currency(): Currency | null {
    if (this.entity) {
      const currencyToFind = this.entity.currency;
      return this.currencies.find(c => c.code === currencyToFind) || null;
    } else {
      return null;
    }
  }

  set currency(value: Currency | null) {
    if (this.entity) {
      this.entity.currency = value?.code || '';
    }
  }

  @Output() saveSubject = new Subject<Account>();
  @Output() cancelSubject = new Subject<string>();

  constructor() {
    this.entity = null;
  }

  ngOnInit(): void {
  }

  saveAccount(): void {
    this.saveSubject.next(this.entity!);
    this.entity = null;
  }

  cancel(): void {
    this.cancelSubject.next('cancel');
  }

  isEditMode(): boolean {
    return this.entity !== null && this.entity.id > 0;
  }

  currenciesForTypeAhead(): () => Currency[] {
    const that = this;
    return () => that.currencies;
  }
}
