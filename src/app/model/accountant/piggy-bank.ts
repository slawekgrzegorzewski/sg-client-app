import {Domain} from '../domain';
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

  constructor(private currencyPipe: CurrencyPipe, data?: any) {
    this.id = data && data.id;
    this.name = data && data.name || '';
    this.description = data && data.description || '';
    this.balance = data && data.balance || 0;
    this.currency = data && data.currency || '';
    this.savings = data && data.savings || false;
    this.monthlyTopUp = data && data.monthlyTopUp || 0;
    this.userId = data && data.userId || 0;
    this.domain = data && new Domain(data.domain) || null;
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
