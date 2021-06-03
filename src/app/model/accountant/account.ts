import {Domain} from '../domain';
import {Balance, WithBalance} from './with-balance';
import {Currency} from './currency';

export class Account implements WithBalance {
  public id: number;
  public name: string;
  public currency: string;
  public currentBalance: number;
  public balanceIndex: number;
  public domain: Domain;

  constructor(data?: Partial<Account>) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.name = data.name || '';
    this.currency = data.currency || '';
    this.currentBalance = data.currentBalance || 0;
    this.balanceIndex = data.balanceIndex || 0;
    this.domain = new Domain(data.domain);
  }

  getBalance(): Balance {
    return new Balance(this.currentBalance, this.currency);
  }

  correctCurrencyToString(): void {
    if (this.currency && typeof this.currency === 'object') {
      this.currency = (this.currency as Currency).code;
    }
  }
}
