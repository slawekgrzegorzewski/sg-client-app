import {Account} from './account';

export type TransactionDTO = Omit<Partial<Transaction>, 'source' | 'desitnation' | 'timeOfTransaction'>
  & {
  source?: Partial<Account>,
  destination?: Partial<Account>,
  timeOfTransaction?: string
}

export class Transaction {
  public id: number;
  public description: string;
  public source: Account;
  public destination: Account;
  public debit: number;
  public credit: number;
  public timeOfTransaction: Date;

  constructor(data?: TransactionDTO) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.description = data.description || '';
    this.source = new Account(data.source);
    this.destination = new Account(data.destination);
    this.debit = data.debit || 0;
    this.credit = data.credit || 0;
    this.timeOfTransaction = data.timeOfTransaction && new Date(data.timeOfTransaction) || new Date();
  }

  public isCredit(): boolean {
    return this.credit > 0 && this.debit == 0;
  }

  public isDebit(): boolean {
    return this.credit == 0 && this.debit > 0;
  }

  public isInternalTransfer(): boolean {
    return this.credit > 0 && this.debit > 0;
  }
}
