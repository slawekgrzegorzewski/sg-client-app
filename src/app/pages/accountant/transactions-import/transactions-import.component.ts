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
import {TRANSACTIONS_TO_IMPORT_CHANGED} from '../../../app.module';


export type ImportMode = 'DEBIT' | 'CREDIT' | 'TRANSFER' | 'MUTUALLY_CANCELLING';

@Component({
  selector: 'app-transactions-import',
  templateUrl: './transactions-import.component.html',
  styleUrls: ['./transactions-import.component.css']
})
export class TransactionsImportComponent implements OnInit {

  transactionsToImport: BankTransactionToImport[] = [];
  transactionToImport: BankTransactionToImport | null = null;
  otherTransactionForTransfer: BankTransactionToImport | null = null;
  private _importMode: ImportMode | null = null;
  get importMode(): ImportMode | null {
    return this._importMode;
  }

  set importMode(value: ImportMode | null) {
    this._importMode = value;
    if (this.importMode === 'DEBIT') {
      this.elementToCreate = new Expense();
      this.elementToCreate.amount = this.transactionToImport!.debit;
      this.elementToCreate.expenseDate = this.transactionToImport!.timeOfTransaction;
      this.elementToCreate.description = this.transactionToImport!.description;
    } else if (this.importMode === 'CREDIT') {
      this.elementToCreate = new Income();
      this.elementToCreate.amount = this.transactionToImport!.credit;
      this.elementToCreate.incomeDate = this.transactionToImport!.timeOfTransaction;
      this.elementToCreate.description = this.transactionToImport!.description;
    } else if (this.importMode === 'MUTUALLY_CANCELLING') {
      this.otherTransactionForTransfer = this.getOtherTransactionForMutualCancellation(this.transactionToImport);
    } else if (this.importMode === 'TRANSFER') {
      this.otherTransactionForTransfer = this.getOtherTransactionForTransfer(this.transactionToImport);
      if (this.transactionToImport?.creditBankAccountId) {
        const localCopyOfTransactionToImport = this.transactionToImport;
        this.transactionToImport = this.otherTransactionForTransfer;
        this.otherTransactionForTransfer = localCopyOfTransactionToImport;
      }
      this.transactionToCreateType = TransactionType.TRANSFER_FROM_BANK_TRANSACTIONS;
    }
  }

  elementToCreate: Income | Expense | null = null;
  transactionToCreateType: TransactionType | null = null;

  constructor(private billingsService: BillingPeriodsService,
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

  transactionMayBeMutuallyCancellation(transaction: BankTransactionToImport | null) {
    return this.getOtherTransactionForMutualCancellation(transaction) !== null;
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
                                                 correspondingAmountExtractor: (btti: BankTransactionToImport) => number): BankTransactionToImport | null {
      const originalAmount = originalAmountExtractor(originalTransaction);
      const correspondingTransaction = bankTransactions.find(tti => {
        return correspondingAmountExtractor(tti) === originalAmount && BankTransactionToImport.compareDates(tti, originalTransaction) === 0;
      });
      return correspondingTransaction || null;
    }

    if (transaction && transaction.sourceAccount !== null && transaction.destinationAccount === null) {
      return findTransactionCandidateForTransfer(this.transactionsToImport, transaction, btti => btti.debit, btti => btti.credit);
    }
    if (transaction && transaction.destinationAccount !== null && transaction.sourceAccount === null) {
      return findTransactionCandidateForTransfer(this.transactionsToImport, transaction, btti => btti.credit, btti => btti.debit);
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

    const requests: Observable<any>[] = [
      this.billingsService.createBillingElementWithImportingBankTransaction(elementToCreate, accountIdForElement, this.transactionToImport!)
    ];
    if (piggyBankToUpdate) {
      requests.push(this.piggyBanksService.update(piggyBankToUpdate));
    }
    forkJoin(requests)
      .subscribe({
        next: (success) => this.refreshData(),
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
}
