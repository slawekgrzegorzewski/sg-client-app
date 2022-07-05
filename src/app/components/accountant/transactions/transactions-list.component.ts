import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TransactionType} from '../../../model/accountant/transaction-type';
import {Account} from '../../../model/accountant/account';
import {Transaction} from '../../../model/accountant/transaction';
import {ComparatorBuilder} from '../../../utils/comparator-builder';
import {MatchingMode, NodrigenTransactionToImport} from '../../../model/banks/nodrigen/nodrigen-transaction-to-import';
import {DatesUtils} from '../../../utils/dates-utils';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.css']
})
export class TransactionsListComponent {

  displayingMonthInternal = new Date();
  prevMonthToDisplay: Date | null = null;
  nextMonthToDisplay: Date | null = null;
  transferCreationMode = false;
  creatingTransactionType = TransactionType.CREDIT;
  creatingTransactionAmount: number = 0;
  creatingTransactionFieldDescription: string = '';
  selectedTransaction: Transaction | null = null;
  selectedTransactionToImport: NodrigenTransactionToImport | null = null;
  transactionsInternal: Transaction[] = [];
  transactionsToImportInternal: NodrigenTransactionToImport[] = [];
  displayingTransactions: Transaction[] = [];
  displayingTransactionsToImport: NodrigenTransactionToImport[] = [];
  internalAllAccounts: Account[] = [];
  accountsToSelect: Account[] = [];
  @Output() transactionAction = new EventEmitter<any>();
  @Output() matchTransactions = new EventEmitter<[number, number, MatchingMode]>();
  private internalAccount: Account | null = null;
  matchingCandidates: Transaction[] = [];
  selectedMatchingCandidate: Transaction | null = null;

  constructor() {
  }

  get displayingMonth(): Date {
    return this.displayingMonthInternal;
  }

  set displayingMonth(value: Date) {
    this.displayingMonthInternal = value;
    this.filterDisplayingTransactions();
  }

  get transactions(): Transaction[] {
    return this.transactionsInternal;
  }

  @Input() set transactions(value: Transaction[]) {
    this.transactionsInternal = value.sort(ComparatorBuilder.comparingByDateDays<Transaction>(t => t.timeOfTransaction).build());
    this.filterDisplayingTransactions();
  }

  get transactionsToImport(): NodrigenTransactionToImport[] {
    return this.transactionsToImportInternal;
  }

  @Input() set transactionsToImport(value: NodrigenTransactionToImport[]) {
    this.transactionsToImportInternal = value.sort(ComparatorBuilder.comparingByDateDays<NodrigenTransactionToImport>(t => t.timeOfTransaction).build());
    this.filterDisplayingTransactions();
  }

  @Input() get allAccounts(): Account[] {
    return this.internalAllAccounts;
  }

  set allAccounts(value: Account[]) {
    this.internalAllAccounts = value;
    this.accountsToSelect = this.filterAccountsOtherThanSelectedOne();
    this.displayingMonth = new Date();
  }

  @Input() get account(): Account | null {
    return this.internalAccount;
  }

  set account(value: Account | null) {
    this.internalAccount = value;
    this.accountsToSelect = this.filterAccountsOtherThanSelectedOne();
    this.displayingMonth = new Date();
  }

  openPredefinedTransferCreationDialog(transaction: Transaction): void {
    this.creatingTransactionType = TransactionType.TRANSFER_PREDEFINED;
    this.creatingTransactionAmount = transaction.credit;
    this.creatingTransactionFieldDescription = 'Transfer of \'' + transaction.description + '\'';
    this.transferCreationMode = true;
  }

  openIncomeCreationDialog(): void {
    this.creatingTransactionType = TransactionType.CREDIT;
    this.creatingTransactionAmount = 0;
    this.creatingTransactionFieldDescription = '';
    this.transferCreationMode = true;
  }

  openExpenseCreationDialog(): void {
    this.creatingTransactionType = TransactionType.DEBIT;
    this.creatingTransactionAmount = 0;
    this.creatingTransactionFieldDescription = '';
    this.transferCreationMode = true;
  }

  openTransferCreationDialog(): void {
    this.creatingTransactionType = TransactionType.TRANSFER;
    this.creatingTransactionAmount = 0;
    this.creatingTransactionFieldDescription = '';
    this.transferCreationMode = true;
  }

  editCompleted(input: any): void {
    this.transferCreationMode = false;
    if (input === 'OK') {
      this.transactionAction.emit();
    }
  }

  private filterAccountsOtherThanSelectedOne(): Account[] {
    if (!this.internalAllAccounts) {
      return [];
    }
    return this.internalAllAccounts.filter(account => !this.internalAccount || account.id !== this.internalAccount.id);
  }

  public goBackInHistory(): void {
    if (this.prevMonthToDisplay) {
      this.displayingMonth = this.prevMonthToDisplay;
    }
  }

  public goForwardInHistory(): void {
    if (this.nextMonthToDisplay) {
      this.displayingMonth = this.nextMonthToDisplay;
    }
  }

  private filterDisplayingTransactions(): void {
    this.displayingTransactions = this.transactions
      .filter(t => TransactionsListComponent.isForTheSameMonth(t.timeOfTransaction, this.displayingMonth));
    this.displayingTransactionsToImport = this.transactionsToImport
      .filter(t => TransactionsListComponent.isForTheSameMonth(t.timeOfTransaction, this.displayingMonth));

    this.prevMonthToDisplay = new Date(this.displayingMonth.getTime());
    this.prevMonthToDisplay = new Date(this.prevMonthToDisplay.setMonth(this.prevMonthToDisplay.getMonth() - 1));
    this.nextMonthToDisplay = new Date(this.displayingMonth.getTime());
    this.nextMonthToDisplay = new Date(this.nextMonthToDisplay.setMonth(this.nextMonthToDisplay.getMonth() + 1));

    if (this.transactions.length == 0 && this.transactionsToImport.length == 0) {
      this.prevMonthToDisplay = null;
      this.nextMonthToDisplay = null;
    } else if (TransactionsListComponent.isForTheSameMonth(this.transactions[0].timeOfTransaction, this.displayingMonth)) {
      this.prevMonthToDisplay = null;
    }
    if (TransactionsListComponent.isForTheSameMonth(new Date(), this.displayingMonth)) {
      this.nextMonthToDisplay = null;
    }
  }

  private static isForTheSameMonth(date: Date, other: Date) {
    return ComparatorBuilder.comparingByYearMonth<Date>(d => d).build()(date, other) == 0;
  }

  showActionRow(transaction: Transaction): boolean {
    return this.selectedTransaction !== null
      && this.selectedTransaction.id === transaction.id
      && this.account !== null
      && this.selectedTransaction.destination.id === this.account.id;
  }

  selectTransaction(transaction: Transaction | undefined): void {
    if (!transaction) {
      this.selectedTransaction = null;
    } else if (this.selectedTransaction && this.selectedTransaction.id === transaction.id) {
      this.selectedTransaction = null;
    } else {
      this.selectedTransaction = transaction;
    }
  }

  selectMatchingCandidate(transaction: Transaction): void {
    if (this.selectedMatchingCandidate && this.selectedMatchingCandidate.id === transaction.id) {
      this.selectedMatchingCandidate = null;
    } else {
      this.selectedMatchingCandidate = transaction;
    }
  }

  selectTransactionToImport(transactionToImport: NodrigenTransactionToImport): void {
    if (this.selectedTransactionToImport && this.selectedTransactionToImport.id === transactionToImport.id) {
      this.selectedTransactionToImport = null;
    } else {
      this.selectedTransactionToImport = transactionToImport;

      this.matchingCandidates =
        this.displayingTransactions
          .filter(transaction => {
            return DatesUtils.compareDatesOnly(transaction.timeOfTransaction, transactionToImport.timeOfTransaction) == 0;
          })
          .filter(transaction => {
            if (transactionToImport.credit == 0 && transaction.credit === 0) {
              return transactionToImport.debit === transaction.debit;
            }
            if (transactionToImport.debit == 0 && transaction.debit === 0) {
              return transactionToImport.credit === transaction.credit;
            }
            return false;
          });
      if (this.matchingCandidates.length > 0) {
        this.selectMatchingCandidate(this.matchingCandidates[0]);
      }

    }
  }

  matchAsCredit() {
    this.matchTransactions.emit([this.selectedTransactionToImport!.creditNodrigenTransactionId, this.selectedMatchingCandidate!.id, MatchingMode.CREDIT]);
    this.selectTransactionToImport(this.selectedTransactionToImport!);
    this.selectMatchingCandidate(this.selectedMatchingCandidate!);
    this.matchingCandidates = [];
  }

  matchAsDebit() {
    this.matchTransactions.emit([this.selectedTransactionToImport!.debitNodrigenTransactionId, this.selectedMatchingCandidate!.id, MatchingMode.DEBIT]);
    this.selectTransactionToImport(this.selectedTransactionToImport!);
    this.selectMatchingCandidate(this.selectedMatchingCandidate!);
    this.matchingCandidates = [];
  }

  matchInternalTransfer() {
    this.matchTransactions.emit([this.selectedTransactionToImport!.debitNodrigenTransactionId, this.selectedMatchingCandidate!.id, MatchingMode.BOTH]);
    this.selectTransactionToImport(this.selectedTransactionToImport!);
    this.selectMatchingCandidate(this.selectedMatchingCandidate!);
    this.matchingCandidates = [];
  }
}
