import {BankTransactionToImport} from '../../../../openbanking/model/go-cardless/bank-transaction-to-import';
import {Account} from '../../../model/account';

export class TransactionUtils {


  public static findTransactionCandidateForTransfer(bankTransactions: BankTransactionToImport[],
                                                    originalTransaction: BankTransactionToImport,
                                                    additionalComparator: (tti: BankTransactionToImport) => boolean): BankTransactionToImport | null {

    let correspondingTransaction: BankTransactionToImport | null = bankTransactions.find(tti => {
      return tti.id !== originalTransaction.id && additionalComparator(tti);
    }) || null;

    if (correspondingTransaction) {
      const sourceAccount: Account = correspondingTransaction.isDebit() ? correspondingTransaction.sourceAccount! : originalTransaction.sourceAccount!;
      const destinationAccount: Account = correspondingTransaction.isDebit() ? originalTransaction.destinationAccount! : correspondingTransaction.destinationAccount!;
      if (sourceAccount?.id === destinationAccount?.id) {
        correspondingTransaction = null;
      }
    }
    return correspondingTransaction;
  }
}
