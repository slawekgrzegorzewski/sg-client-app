import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {TransactionType} from '../../../model/accountant/transaction-type';
import {Account} from '../../../model/accountant/account';
import {Transaction} from '../../../model/accountant/transaction';
import {CreateTransactionsComponent} from './create-transactions.component';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.css']
})
export class TransactionsListComponent {

  transferCreationMode = false;
  creatingTransactionType: TransactionType;
  creatingTransactionAmount: number;
  creatingTransactionFieldDescription: string;

  @ViewChild('utilBox') utilBox: ElementRef;
  utilBoxTop: number;
  utilBoxLeft: number;
  utilBoxVisibility = 'hidden';


  @Input() transactions: Transaction[];
  private overTransaction: Transaction;

  internalAllAccounts: Account[];
  accountsToSelect: Account[];

  @Input() get allAccounts(): Account[] {
    return this.internalAllAccounts;
  }

  set allAccounts(value: Account[]) {
    this.internalAllAccounts = value;
    this.accountsToSelect = this.filterAccountsOtherThanSelectedOne();
  }

  private internalAccount: Account;

  @Input()
  get account(): Account {
    return this.internalAccount;
  }

  set account(value: Account) {
    this.internalAccount = value;
    this.accountsToSelect = this.filterAccountsOtherThanSelectedOne();
  }

  @Output() transactionAction = new EventEmitter<any>();

  constructor(private modalService: NgbModal) {
  }

  private filterAccountsOtherThanSelectedOne(): Account[] {
    if (!this.internalAllAccounts) {
      return [];
    }
    return this.internalAllAccounts.filter(account => !this.internalAccount || account.id !== this.internalAccount.id);
  }

  setOverTransaction(value: Transaction, transactionRow: HTMLTableRowElement): void {
    this.overTransaction = value;
    if (value && value.destination?.id === this.account.id) {
      const adjustment = (transactionRow.offsetHeight - this.utilBox.nativeElement.offsetHeight) / 2;
      this.utilBoxTop = transactionRow.getBoundingClientRect().top + adjustment;
      this.utilBoxLeft = transactionRow.getBoundingClientRect().left + transactionRow.clientWidth - this.utilBox.nativeElement.offsetWidth;
      this.utilBoxVisibility = 'visible';
    } else {
      this.utilBoxVisibility = 'hidden';
    }
  }

  buttonClicked(): Transaction {
    const transaction = this.overTransaction;
    this.setOverTransaction(null, null);
    return transaction;
  }

  openPredefinedTransferCreationDialog(transaction: Transaction): void {
    this.creatingTransactionType = TransactionType.TRANSFER_PREDEFINED;
    this.creatingTransactionAmount = transaction.credit;
    this.creatingTransactionFieldDescription = 'Transfer of \'' + transaction.description + '\'';
    this.transferCreationMode = true;
  }

  openIncomeCreationDialog(): void {
    this.creatingTransactionType  = TransactionType.CREDIT;
    this.creatingTransactionAmount = null;
    this.creatingTransactionFieldDescription = '';
    this.transferCreationMode = true;
  }

  openExpenseCreationDialog(): void {
    this.creatingTransactionType  = TransactionType.DEBIT;
    this.creatingTransactionAmount = null;
    this.creatingTransactionFieldDescription = '';
    this.transferCreationMode = true;
  }

  openTransferCreationDialog(): void {
    this.creatingTransactionType  = TransactionType.TRANSFER;
    this.creatingTransactionAmount = null;
    this.creatingTransactionFieldDescription = '';
    this.transferCreationMode = true;
  }

  editCompleted(input: any): void {
    this.transferCreationMode = false;
    if (input === 'OK') {
      this.transactionAction.emit();
    }
  }
}
