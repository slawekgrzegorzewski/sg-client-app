import {Domain} from '../../../general/model/domain';
import {BankAccount} from '../bank-account';
import {SimplePerformedServicePayment} from '../../../accountant/model/simple-performed-service-payment';
import {Account} from '../../../accountant/model/account';
import {DatesUtils} from '../../../general/utils/dates-utils';

export enum MatchingMode {
  CREDIT = 'CREDIT', DEBIT = 'DEBIT', BOTH = 'BOTH'
}

export class BankTransactionToImport {
  id: number;
  domain: Domain;
  conversionRate: number;
  credit: number;
  debit: number;
  description: string;
  timeOfTransaction: Date;
  destinationAccount: Account | null;
  sourceAccount: Account | null;
  creditBankAccountPublicId: string;
  debitBankAccountPublicId: string;
  creditGoCardlessTransactionPublicId: string;
  debitGoCardlessTransactionPublicId: string;
  goCardlessTransactionPublicId: string;

  constructor(data?: Partial<BankTransactionToImport>) {
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
    this.destinationAccount = data.destinationAccount && new Account(data.destinationAccount) || null;
    this.sourceAccount = data.sourceAccount && new Account(data.sourceAccount) || null;
    this.creditBankAccountPublicId = data.creditBankAccountPublicId || '';
    this.debitBankAccountPublicId = data.debitBankAccountPublicId || '';
    this.creditGoCardlessTransactionPublicId = data.creditGoCardlessTransactionPublicId || '';
    this.debitGoCardlessTransactionPublicId = data.debitGoCardlessTransactionPublicId || '';
    this.goCardlessTransactionPublicId = data.goCardlessTransactionPublicId	 || '';
  }

  public isCredit(): boolean {
    return this.credit > 0 && this.debit == 0;
  }

  public isDebit(): boolean {
    return this.credit == 0 && this.debit > 0;
  }

  public isEmpty(): boolean {
    return this.credit == 0 && this.debit == 0;
  }

  public isCreditOrDebitTransaction() {
    return this.isDebit() !== this.isCredit();
  }

  public isInternalTransfer(): boolean {
    return this.credit > 0 && this.debit > 0;
  }

  public static compareDates(first: BankTransactionToImport, second: BankTransactionToImport): number {
    return DatesUtils.compareDatesOnly(first.timeOfTransaction, second.timeOfTransaction);
  }
}
