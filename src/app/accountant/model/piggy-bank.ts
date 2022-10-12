import {Domain} from '../../general/model/domain';
import {Balance, WithBalance} from './with-balance';
import {ForTypeahead} from './for-typeahead';
import {CurrencyPipe} from '@angular/common';
import {Currency} from './currency';

export class PiggyBank implements WithBalance, ForTypeahead {
  public id: number;
  public name: string;
  public description: string;
  public balance: number;
  public currency: string;
  public savings: boolean;
  public monthlyTopUp: number;
  public userId: number;
  public domain: Domain;

  constructor(private currencyPipe: CurrencyPipe, data?: Partial<PiggyBank>) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.name = data.name || '';
    this.description = data.description || '';
    this.balance = data.balance || 0;
    this.currency = data.currency || '';
    this.savings = data.savings || false;
    this.monthlyTopUp = data.monthlyTopUp || 0;
    this.userId = data.userId || 0;
    this.domain = new Domain(data.domain);
  }

  getBalance(): Balance {
    return new Balance(this.balance, this.currency);
  }

  getTypeaheadId(): string {
    return String(this.id);
  }

  getTypeaheadDescription(): string {
    return this.name + ' ' + this.currencyPipe.transform(this.balance, this.currency);
  }

  correctCurrencyToString(): void {
    if (this.currency && typeof this.currency === 'object') {
      this.currency = (this.currency as Currency).code;
    }
  }
}
