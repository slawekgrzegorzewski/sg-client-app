export class Balance {
  balance: number;
  currency: string;

  constructor(balance: number, currency: string) {
    this.balance = balance;
    this.currency = currency;
  }
}

export interface WithBalance {
  getBalance(): Balance;
}
