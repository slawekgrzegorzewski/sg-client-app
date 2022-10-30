import {Component, HostListener, OnInit} from '@angular/core';
import {NodrigenService} from '../../../openbanking/services/nodrigen.service';
import {BankTransactionToImport} from '../../../openbanking/model/nodrigen/bank-transaction-to-import';
import {ComparatorBuilder} from '../../../general/utils/comparator-builder';
import {Expense} from '../../model/billings/expense';
import {PiggyBank} from '../../model/piggy-bank';
import {Income} from '../../model/billings/income';
import {BillingPeriodsService} from '../../services/billing-periods.service';
import {PiggyBanksService} from '../../services/piggy-banks.service';
import {Account} from '../../model/account';
import {TransactionType} from '../../model/transaction-type';
import {NgEventBus} from 'ng-event-bus';
import {TRANSACTIONS_TO_IMPORT_CHANGED} from '../../../general/utils/event-bus-events';
import {AccountsService} from '../../services/accounts.service';
import Decimal from 'decimal.js';
import {DatesUtils} from '../../../general/utils/dates-utils';


export type ImportMode =
  'DEBIT'
  | 'CREDIT'
  | 'TRANSFER'
  | 'MUTUALLY_CANCELLING'
  | 'CASH_WITHDRAWAL'
  | 'TRANSFER_WITH_CONVERSION'
  | 'SINGLE_TRANSFER_WITH_CONVERSION'
  | 'IGNORE';

@Component({
  selector: 'app-transactions-import',
  templateUrl: './transactions-import.component.html',
  styleUrls: ['./transactions-import.component.css']
})
export class TransactionsImportComponent implements OnInit {

  transactionsToImport: BankTransactionToImport[] = [];
  _transactionToImport: BankTransactionToImport | null = null;
  set transactionToImport(value: BankTransactionToImport | null) {
    this._transactionToImport = value;
    this.candidatesToAlignment = [];
    if (this.transactionMayBeDebit(value)) {
      this.prepareAlignmentCandidates('DEBIT');
    } else if (this.transactionMayBeCredit(value)) {
      this.prepareAlignmentCandidates('CREDIT');
    }
  }

  get transactionToImport(): BankTransactionToImport | null {
    return this._transactionToImport;
  }

  alignmentTransaction: BankTransactionToImport | null = null;
  candidatesToAlignment: (BankTransactionToImport | null)[] = [];
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
        this.elementToCreate.amount = new Decimal(this.transactionToImport!.debit).minus(new Decimal(this.alignmentTransaction?.credit || 0)).toNumber();
        this.elementToCreate.expenseDate = DatesUtils.min(this.transactionToImport!.timeOfTransaction, this.alignmentTransaction?.timeOfTransaction || null);
        this.elementToCreate.description = this.transactionToImport!.description + (this.alignmentTransaction ? this.alignmentTransaction.description + '\n' : '');
        break;
      case 'CREDIT':
        this.elementToCreate = new Income();
        this.elementToCreate.amount = new Decimal(this.transactionToImport!.credit).minus(new Decimal(this.alignmentTransaction?.debit || 0)).toNumber();
        this.elementToCreate.incomeDate = DatesUtils.min(this.transactionToImport!.timeOfTransaction, this.alignmentTransaction?.timeOfTransaction || null);
        this.elementToCreate.description = this.transactionToImport!.description + (this.alignmentTransaction ? this.alignmentTransaction.description + '\n' : '');
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
      case 'SINGLE_TRANSFER_WITH_CONVERSION':
        this.transactionToCreateType = TransactionType.TRANSFER_FROM_BANK_TRANSACTIONS;
        let t = this.transactionToImport;
        this.transactionToImport = new BankTransactionToImport({
          id: t?.id,
          domain: t?.domain,
          conversionRate: t?.conversionRate,
          debit: t?.debit,
          description: t?.description,
          timeOfTransaction: t?.timeOfTransaction,
          sourceAccount: t?.sourceAccount,
          debitBankAccountId: t?.debitBankAccountId,
          debitNodrigenTransactionId: t?.debitNodrigenTransactionId,
          nodrigenTransactionId: t?.nodrigenTransactionId
        });
        this.otherTransactionForTransfer = new BankTransactionToImport({
          id: t?.id,
          domain: t?.domain,
          conversionRate: t?.conversionRate,
          credit: t?.credit,
          description: t?.description,
          timeOfTransaction: t?.timeOfTransaction,
          destinationAccount: t?.destinationAccount,
          creditBankAccountId: t?.creditBankAccountId,
          creditNodrigenTransactionId: t?.creditNodrigenTransactionId,
          nodrigenTransactionId: t?.nodrigenTransactionId
        });
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

  transactionMayBeSingleTransferWithConversion(transaction: BankTransactionToImport | null) {
    return transaction?.sourceAccount && transaction?.destinationAccount &&
      transaction?.sourceAccount.currency !== transaction?.destinationAccount.currency;
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
      if (correspondingAccounts[0].id === correspondingAccounts[1]?.id) {
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

    this.billingsService.createBillingElementWithImportingBankTransaction(elementToCreate, accountIdForElement, this.transactionToImport!, this.alignmentTransaction)
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

  prepareAlignmentCandidates(importMode: ImportMode): void {
    switch (importMode) {
      case 'CREDIT':
        this.candidatesToAlignment = this.transactionsToImport.filter(t =>
          t.isDebit() && t.debit < (this.transactionToImport?.credit || 0)
        );
        if (this.candidatesToAlignment.length === 0) {
          this.importMode = 'CREDIT';
        }
        break;
      case 'DEBIT':
        this.candidatesToAlignment = this.transactionsToImport.filter(t =>
          t.isCredit() && t.credit < (this.transactionToImport?.debit || 0)
        );
        if (this.candidatesToAlignment.length === 0) {
          this.importMode = 'DEBIT';
        }
        break;
      default:
        throw new Error('Wrong mode');
    }
  }

  isAlignmentPossible(): boolean {
    return (this.candidatesToAlignment?.length || 0) > 0;
  }
}
