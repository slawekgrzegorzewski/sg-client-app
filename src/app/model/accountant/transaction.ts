import {Account} from './account';

export class Transaction {
  public id: number;
  public description: string;
  public source: Account;
  public destination: Account;
  public debit: number;
  public credit: number;
  public timeOfTransaction: Date;

  constructor(data?: any) {
    this.id = data && data.id;
    this.description = data && data.description || '';
    this.source = data && new Account(data.source) || null;
    this.destination = data && new Account(data.destination) || null;
    this.debit = data && data.debit || 0;
    this.credit = data && data.credit || 0;
    this.timeOfTransaction = data && new Date(data.timeOfTransaction) || null;
  }
}
