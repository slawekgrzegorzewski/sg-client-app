import {Account} from '../../../model/account';
import {TransactionType} from '../../../model/transaction-type';
import Decimal from 'decimal.js';

export class TransactionCreationData {
  constructor(
    public sourceAccounts: Account[],
    public sourceAccount: Account | null,
    public destinationAccounts: Account[],
    public destinationAccount: Account | null,
    public involvedBankTransactions: number[],
    public transactionType: TransactionType,
    public amount: Decimal,
    public description: string,
    public conversionRate: Decimal | null
  ) {
  }

}
