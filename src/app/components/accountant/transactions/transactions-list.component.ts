import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TransactionType} from '../../../model/accountant/transaction-type';
import {Account} from '../../../model/accountant/account';
import {Transaction} from '../../../model/accountant/transaction';
import {ComparatorBuilder} from '../../../utils/comparator-builder';
import {MatchingMode, BankTransactionToImport} from '../../../model/banks/nodrigen/bank-transaction-to-import';
import {DatesUtils} from '../../../utils/dates-utils';
import {AccountsService} from '../../../services/accountant/accounts.service';
import {DomainService} from '../../../services/domain.service';

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.css']
})
export class TransactionsListComponent implements OnInit {

  displayingMonthInternal = new Date();
  prevMonthToDisplay: Date | null = null;
  nextMonthToDisplay: Date | null = null;
  transferCreationMode = false;
  creatingTransactionType = TransactionType.CREDIT;
  creatingTransactionAmount: number = 0;
  creatingTransactionFieldDescription: string = '';
  selectedTransaction: Transaction | null = null;
  transactionsInternal: Transaction[] = [];
  displayingTransactions: Transaction[] = [];
  internalAllAccounts: Account[] = [];
  accountsToSelect: Account[] = [];
  @Output() transactionAction = new EventEmitter<any>();
  private internalAccount: Account | null = null;

  constructor(private accountsService: AccountsService,
              private domainService: DomainService) {
    domainService.onCurrentDomainChange.subscribe(domain => this.getAccounts());
  }

  ngOnInit(): void {
    this.getAccounts();
  }

  private getAccounts() {
    this.accountsService.currentDomainAccounts()
      .subscribe(accounts => this.allAccounts = accounts);
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

  get allAccounts(): Account[] {
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

    this.prevMonthToDisplay = new Date(this.displayingMonth.getTime());
    this.prevMonthToDisplay = new Date(this.prevMonthToDisplay.setMonth(this.prevMonthToDisplay.getMonth() - 1));
    this.nextMonthToDisplay = new Date(this.displayingMonth.getTime());
    this.nextMonthToDisplay = new Date(this.nextMonthToDisplay.setMonth(this.nextMonthToDisplay.getMonth() + 1));


    function isFirstTransactionOnTheListForTheMonth(transactions: (Transaction | BankTransactionToImport)[], month: Date) {
      return transactions.length > 0 && TransactionsListComponent.isForTheSameMonth(transactions[0].timeOfTransaction, month);
    }

    if (this.transactions.length == 0) {
      this.prevMonthToDisplay = null;
      this.nextMonthToDisplay = null;
    } else if (isFirstTransactionOnTheListForTheMonth(this.transactions, this.displayingMonth)) {
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
}
