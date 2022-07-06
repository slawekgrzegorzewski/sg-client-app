import {Domain} from '../../domain';
import {BankAccount} from '../bank-account';
import {SimplePerformedServicePayment} from '../../accountant/simple-performed-service-payment';

export enum MatchingMode {
  CREDIT = 'CREDIT', DEBIT = 'DEBIT', BOTH = 'BOTH'
}

export class NodrigenTransactionToImport {
  id: number;
  domain: Domain;
  conversionRate: number;
  credit: number;
  debit: number;
  description: string;
  timeOfTransaction: Date;
  destinationId: number;
  sourceId: number;
  creditBankAccountId: number;
  debitBankAccountId: number;
  creditNodrigenTransactionId: number;
  debitNodrigenTransactionId: number;

  constructor(data?: Partial<NodrigenTransactionToImport>) {
    if (!data) {
      data = {};
    }
    this.id = data.id || 0;
    this.domain = new Domain(data.domain);
    this.conversionRate = data.conversionRate || 0;
    this.credit = data.credit || 0;
    this.debit = data.debit || 0;
    this.description = data.description || '';
    this.timeOfTransaction = data.timeOfTransaction && new Date(data.timeOfTransaction) || new Date();
    this.destinationId = data.destinationId || 0;
    this.sourceId = data.sourceId || 0;
    this.creditBankAccountId = data.creditBankAccountId || 0;
    this.debitBankAccountId = data.debitBankAccountId || 0;
    this.creditNodrigenTransactionId = data.creditNodrigenTransactionId || 0;
    this.debitNodrigenTransactionId = data.debitNodrigenTransactionId || 0;
  }

  public isCredit(): boolean {
    return this.credit > 0 && this.debit == 0;
  }

  public isDebit(): boolean {
    return this.credit == 0 && this.debit > 0;
  }

  public isCreditOrDebitTransaction() {
    return this.isDebit() !== this.isCredit();
  }

  public isInternalTransfer(): boolean {
    return this.credit > 0 && this.debit > 0;
  }
}
