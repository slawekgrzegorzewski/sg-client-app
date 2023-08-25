import {Domain} from '../../general/model/domain';
import {Balance, WithBalance} from './with-balance';
import {Currency} from './currency';
import {BankAccount} from '../../openbanking/model/bank-account';

export class Account implements WithBalance {
  public id: number;
  public name: string;
  public currency: string;
  public currentBalance: number;
  public creditLimit: number;
  public balanceIndex: number;
  public visible: boolean;
  bankAccount: BankAccount | null;
  public domain: Domain;

  constructor(data?: Partial<Account>) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.name = data.name || '';
    this.currency = data.currency || '';
    this.currentBalance = data.currentBalance || 0;
    this.creditLimit = data.creditLimit || 0;
    this.balanceIndex = data.balanceIndex || 0;
    this.visible = data.visible || false;
    this.bankAccount = data.bankAccount ? new BankAccount(data.bankAccount) : null;
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

  public static areAccountsEqual(a: Account | null, b: Account | null): boolean {
    if (!a || !b) {
      return false;
    }
    return this.areAccountIdsEqual(a.id, b.id);
  }

  public static areAccountIdsEqual(a: number | null, b: number | null): boolean {
    if (!a || !b) {
      return false;
    }
    return a === b;
  }
}
