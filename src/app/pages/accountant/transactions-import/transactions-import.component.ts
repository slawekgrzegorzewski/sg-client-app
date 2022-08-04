import {Component, HostListener, OnInit} from '@angular/core';
import {NodrigenService} from '../../../services/banks/nodrigen.service';
import {BankTransactionToImport} from '../../../model/banks/nodrigen/bank-transaction-to-import';
import {ComparatorBuilder} from '../../../utils/comparator-builder';
import {Expense} from '../../../model/accountant/billings/expense';
import {PiggyBank} from '../../../model/accountant/piggy-bank';
import {Income} from '../../../model/accountant/billings/income';
import {forkJoin, Observable} from 'rxjs';
import {BillingPeriodsService} from '../../../services/accountant/billing-periods.service';
import {PiggyBanksService} from '../../../services/accountant/piggy-banks.service';
import {Account} from '../../../model/accountant/account';
import {TransactionType} from '../../../model/accountant/transaction-type';
import {NgEventBus} from 'ng-event-bus';
import {TRANSACTIONS_TO_IMPORT_CHANGED} from '../../../utils/event-bus-events';
import {AccountsService} from '../../../services/accountant/accounts.service';


export type ImportMode =
  'DEBIT'
  | 'CREDIT'
  | 'TRANSFER'
  | 'MUTUALLY_CANCELLING'
  | 'CASH_WITHDRAWAL'
  | 'TRANSFER_WITH_CONVERSION'
  | 'IGNORE';

@Component({
  selector: 'app-transactions-import',
  templateUrl: './transactions-import.component.html',
  styleUrls: ['./transactions-import.component.css']
})
export class TransactionsImportComponent implements OnInit {

  transactionsToImport: BankTransactionToImport[] = [];
  transactionToImport: BankTransactionToImport | null = null;
  otherTransactionForTransfer: BankTransactionToImport | null = null;
  cashAccounts: Account[] = [];
  private _importMode: ImportMode | null = null;
  get importMode(): ImportMode | null {
    return this._importMode;
  }

  set importMode(value: ImportMode | null) {
    this._importMode = value;
    switch (this.importMode) {
      case 'DEBIT':
        this.elementToCreate = new Expense();
        this.elementToCreate.amount = this.transactionToImport!.debit;
        this.elementToCreate.expenseDate = this.transactionToImport!.timeOfTransaction;
        this.elementToCreate.description = this.transactionToImport!.description;
        break;
      case 'CREDIT':
        this.elementToCreate = new Income();
        this.elementToCreate.amount = this.transactionToImport!.credit;
        this.elementToCreate.incomeDate = this.transactionToImport!.timeOfTransaction;
        this.elementToCreate.description = this.transactionToImport!.description;
        break;
      case 'MUTUALLY_CANCELLING':
        this.otherTransactionForTransfer = this.getOtherTransactionForMutualCancellation(this.transactionToImport);
        break;
      case 'TRANSFER':
        this.otherTransactionForTransfer = this.getOtherTransactionForTransfer(this.transactionToImport);
        if (this.transactionToImport?.creditBankAccountId) {
          const localCopyOfTransactionToImport = this.transactionToImport;
          this.transactionToImport = this.otherTransactionForTransfer;
          this.otherTransactionForTransfer = localCopyOfTransactionToImport;
        }
        this.transactionToCreateType = TransactionType.TRANSFER_FROM_BANK_TRANSACTIONS;
        break;
      case 'TRANSFER_WITH_CONVERSION':
        this.transactionToCreateType = TransactionType.TRANSFER_FROM_BANK_TRANSACTIONS;
        this.otherTransactionForTransfer = this.getOtherTransactionForTransferWithConversion(this.transactionToImport);
        if (this.transactionToImport?.creditBankAccountId) {
          const localCopyOfTransactionToImport = this.transactionToImport;
          this.transactionToImport = this.otherTransactionForTransfer;
          this.otherTransactionForTransfer = localCopyOfTransactionToImport;
        }
        this.conversionRate = (this.otherTransactionForTransfer?.credit || 0) / (this.transactionToImport?.debit || 1);
        break;
      case 'CASH_WITHDRAWAL':
        this.transactionToCreateType = TransactionType.TRANSFER_FROM_BANK_TRANSACTIONS;
        this.accountsService.currentDomainAccounts().subscribe(
          data => this.cashAccounts = data.filter(d => d.bankAccount === null)
        );
        break;
      case 'IGNORE':
        this.elementToCreate = null;
        this.otherTransactionForTransfer = null;
        break;
    }
  }

  elementToCreate: Income | Expense | null = null;
  transactionToCreateType: TransactionType | null = null;
  conversionRate: number | null = null;

  constructor(private accountsService: AccountsService,
              private billingsService: BillingPeriodsService,
              private nodrigenService: NodrigenService,
              private eventBus: NgEventBus,
              private piggyBanksService: PiggyBanksService) {
    this.eventBus.on(TRANSACTIONS_TO_IMPORT_CHANGED).subscribe(md => this.refreshData());
  }

  ngOnInit(): void {
    this.refreshData();
  }


  private refreshData() {
    this.clearImport();
    this.nodrigenService.getNodrigenTransactionsToImport()
      .subscribe(data => this.transactionsToImport =
        data.sort(ComparatorBuilder.comparingByDateDays<BankTransactionToImport>(btti => btti.timeOfTransaction)
          .thenComparing(btti => btti.debit).thenComparing(btti => btti.credit).build()));
  }

  clearImport() {
    this.elementToCreate = null;
    this.transactionToImport = null;
    this.otherTransactionForTransfer = null;
    this.importMode = null;
    this.conversionRate = null;
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case 'Escape':
        this.clearImport();
        break;
    }
  }

  select(transactionToImport: BankTransactionToImport): void {
    this.transactionToImport = transactionToImport;
  }

  transactionMayBeDebit(transaction: BankTransactionToImport | null) {
    return transaction && transaction.sourceAccount !== null && transaction.destinationAccount === null
      && !this.transactionMayBeTransfer(transaction) && !this.transactionMayBeMutuallyCancellation(transaction);
  }

  transactionMayBeCredit(transaction: BankTransactionToImport | null) {
    return transaction && transaction.destinationAccount !== null && transaction.sourceAccount === null
      && !this.transactionMayBeTransfer(transaction) && !this.transactionMayBeMutuallyCancellation(transaction);
  }

  transactionMayBeTransfer(transaction: BankTransactionToImport | null) {
    return this.getOtherTransactionForTransfer(transaction) !== null;
  }

  transactionMayBeTransferWithConversion(transaction: BankTransactionToImport | null) {
    return this.getOtherTransactionForTransferWithConversion(transaction) !== null;
  }

  transactionMayBeMutuallyCancellation(transaction: BankTransactionToImport | null) {
    return this.getOtherTransactionForMutualCancellation(transaction) !== null;
  }

  transactionMayBeIgnored(transaction: BankTransactionToImport | null) {
    return (transaction?.credit || 0) === 0 && (transaction?.debit || 0) === 0;
  }

  private getOtherTransactionForTransfer(transaction: BankTransactionToImport | null): BankTransactionToImport | null {
    let otherTransactionForTransfer = this.findCorrespondingTransaction(transaction);
    if (!transaction || !otherTransactionForTransfer) {
      otherTransactionForTransfer = null;
    } else {
      const correspondingAccounts = this.getCorrespondingAccounts(transaction, otherTransactionForTransfer);
      if (correspondingAccounts[0].id === correspondingAccounts[1].id) {
        otherTransactionForTransfer = null;
      }
    }
    return otherTransactionForTransfer;
  }

  private getOtherTransactionForTransferWithConversion(transaction: BankTransactionToImport | null): BankTransactionToImport | null {
    let otherTransactionForTransfer = this.findCorrespondingTransactionWitConversion(transaction);
    if (!transaction || !otherTransactionForTransfer) {
      otherTransactionForTransfer = null;
    } else {
      const correspondingAccounts = this.getCorrespondingAccounts(transaction, otherTransactionForTransfer);
      if (correspondingAccounts[0].id === correspondingAccounts[1].id) {
        otherTransactionForTransfer = null;
      }
    }
    return otherTransactionForTransfer;
  }

  private getOtherTransactionForMutualCancellation(transaction: BankTransactionToImport | null): BankTransactionToImport | null {
    let otherTransactionForTransfer = this.findCorrespondingTransaction(transaction);
    if (!transaction || !otherTransactionForTransfer) {
      otherTransactionForTransfer = null;
    } else {
      const correspondingAccounts = this.getCorrespondingAccounts(transaction, otherTransactionForTransfer);
      if (correspondingAccounts[0].id !== correspondingAccounts[1].id) {
        otherTransactionForTransfer = null;
      }
    }
    return otherTransactionForTransfer;
  }

  getCorrespondingAccounts(first: BankTransactionToImport, second: BankTransactionToImport): Account [] {
    return first.sourceAccount ? [first.sourceAccount!, second.destinationAccount!] : [second.sourceAccount!, first.destinationAccount!];
  }

  private findCorrespondingTransaction(transaction: BankTransactionToImport | null): BankTransactionToImport | null {

    function findTransactionCandidateForTransfer(bankTransactions: BankTransactionToImport[],
                                                 originalTransaction: BankTransactionToImport,
                                                 originalAmountExtractor: (btti: BankTransactionToImport) => number,
                                                 correspondingAmountExtractor: (btti: BankTransactionToImport) => number,
                                                 originalCurrencyExtractor: (btti: BankTransactionToImport) => string,
                                                 correspondingCurrencyExtractor: (btti: BankTransactionToImport) => string): BankTransactionToImport | null {
      const originalAmount = originalAmountExtractor(originalTransaction);
      const originalCurrency = originalCurrencyExtractor(originalTransaction);
      const correspondingTransaction = bankTransactions.find(tti => {
        return tti.id !== originalTransaction.id && correspondingAmountExtractor(tti) === originalAmount && BankTransactionToImport.compareDates(tti, originalTransaction) === 0
          && correspondingCurrencyExtractor(tti) === originalCurrency;
      });
      return correspondingTransaction || null;
    }

    if (transaction && transaction.sourceAccount !== null && transaction.destinationAccount === null) {
      return findTransactionCandidateForTransfer(this.transactionsToImport, transaction,
        btti => btti.debit, btti => btti.credit,
        btti => btti.sourceAccount?.currency || '', btti => btti.destinationAccount?.currency || '');
    }
    if (transaction && transaction.destinationAccount !== null && transaction.sourceAccount === null) {
      return findTransactionCandidateForTransfer(this.transactionsToImport, transaction,
        btti => btti.credit, btti => btti.debit,
        btti => btti.destinationAccount?.currency || '', btti => btti.sourceAccount?.currency || '');
    }
    return null;
  }

  private findCorrespondingTransactionWitConversion(transaction: BankTransactionToImport | null): BankTransactionToImport | null {

    function findTransactionCandidateForTransfer(bankTransactions: BankTransactionToImport[],
                                                 originalTransaction: BankTransactionToImport,
                                                 originalCurrencyExtractor: (btti: BankTransactionToImport) => string,
                                                 correspondingCurrencyExtractor: (btti: BankTransactionToImport) => string): BankTransactionToImport | null {
      const originalCurrency = originalCurrencyExtractor(originalTransaction);
      const correspondingTransaction = bankTransactions.find(tti => {
        return tti.id !== originalTransaction.id && BankTransactionToImport.compareDates(tti, originalTransaction) === 0
          && correspondingCurrencyExtractor(tti) !== originalCurrency;
      });
      return correspondingTransaction || null;
    }

    if (transaction && transaction.sourceAccount !== null && transaction.destinationAccount === null) {
      return findTransactionCandidateForTransfer(this.transactionsToImport, transaction,
        btti => btti.sourceAccount?.currency || '', btti => btti.destinationAccount?.currency || '');
    }
    if (transaction && transaction.destinationAccount !== null && transaction.sourceAccount === null) {
      return findTransactionCandidateForTransfer(this.transactionsToImport, transaction,
        btti => btti.destinationAccount?.currency || '', btti => btti.sourceAccount?.currency || '');
    }
    return null;
  }

  createElement(
    elementToCreate: Income | Expense | null,
    accountIdForElement: number | null,
    piggyBankToUpdate: PiggyBank | null = null): void {

    if (!elementToCreate || !accountIdForElement) {
      return;
    }

    this.billingsService.createBillingElementWithImportingBankTransaction(elementToCreate, accountIdForElement, this.transactionToImport!)
      .subscribe({
        next: (success) => {
          if (piggyBankToUpdate) {
            this.piggyBanksService.update(piggyBankToUpdate).subscribe({
              next: () => this.refreshData(),
              error: () => this.refreshData()
            });
          } else {
            this.refreshData();
          }
        },
        error: (error) => this.refreshData()
      });
  }

  getAccountForBillingElement(): Account | null {
    if (this.importMode === 'DEBIT') {
      return this.transactionToImport!.sourceAccount || null;
    }
    return this.transactionToImport!.destinationAccount || null;

  }

  mutuallyCancelBothTransactions() {
    if (this.transactionToImport !== null && this.otherTransactionForTransfer !== null) {
      this.nodrigenService.mutuallyCancelTransactions(this.transactionToImport, this.otherTransactionForTransfer).subscribe();
    }
  }

  ignore() {
    if (this.transactionToImport !== null) {
      this.nodrigenService.ignoreTransaction(this.transactionToImport).subscribe();
    }
  }
}
