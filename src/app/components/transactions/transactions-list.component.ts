import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {TransactionType} from '../../model/transaction-type';
import {Account} from '../../model/account';
import {Transaction} from '../../model/transaction';
import {CreateTransactionsComponent} from './create-transactions.component';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {TransactionsService} from '../../services/transations.service';
import {ToastService} from '../../services/toast.service';

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.css']
})
export class TransactionsListComponent {

  constructor(private transactionsService: TransactionsService,
              private modalService: NgbModal,
              private toastService: ToastService) {
  }

  @ViewChild('utilBox') utilBox: ElementRef;
  utilBoxTop: number;
  utilBoxLeft: number;
  utilBoxVisibility = 'hidden';

  private overTransaction: Transaction;

  private internalAccount: Account;
  internalAllAccounts: Account[];
  accountsToSelect: Account[];

  @Input() get allAccounts(): Account[] {
    return this.internalAllAccounts;
  }

  set allAccounts(value: Account[]) {
    this.internalAllAccounts = value;
    this.accountsToSelect = this.filterAccountsOtherThanSelectedOne();
  }

  @Input()
  get account(): Account {
    return this.internalAccount;
  }

  set account(value: Account) {
    this.internalAccount = value;
    this.fetchTransactions();
    this.transactionsOfSelectedAccount = this.filterTransactionsForSelectedAccount();
    this.accountsToSelect = this.filterAccountsOtherThanSelectedOne();
  }

  private internalTransactions: Transaction[];

  get transactions(): Transaction[] {
    return this.internalTransactions;
  }

  set transactions(t: Transaction[]) {
    this.internalTransactions = t;
    this.transactionsOfSelectedAccount = this.filterTransactionsForSelectedAccount();
  }

  public transactionsOfSelectedAccount: Transaction[];

  @Output() transactionAction = new EventEmitter<any>();

  private fetchTransactions(): void {
    this.transactionsService.allUsersTransactions().subscribe(
      data => this.transactions = data.map(t => new Transaction(t)),
      error => {
        this.toastService.showWarning('Could not obtain transactions information, retrying');
        this.transactions = [];
        setTimeout(() => this.fetchTransactions(), 100);
      }
    );
  }

  private filterAccountsOtherThanSelectedOne(): Account[] {
    if (!this.internalAllAccounts) {
      return [];
    }
    return this.internalAllAccounts.filter(account => this.internalAccount === undefined || account.id !== this.internalAccount.id);
  }

  private filterTransactionsForSelectedAccount(): Transaction[] {
    if (!this.account) {
      return [];
    }
    if (!this.transactions) {
      return [];
    }
    return this.transactions
      .filter(t => this.isTransactionRelatedToSelectedAccount(t))
      .sort((a, b) => a.timeOfTransaction.getTime() - b.timeOfTransaction.getTime());
  }

  private isTransactionRelatedToSelectedAccount(t: Transaction): boolean {
    return this.areAccountsEqual(t.source, this.account) || this.areAccountsEqual(t.destination, this.account);
  }

  private areAccountsEqual(a: Account, b: Account): boolean {
    if (!a || !b) {
      return false;
    }
    return a.id === b.id;
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

  openPredefinedTransferCreationDialog(transaction: Transaction): void {
    const component = this.setupEditDialog();
    component.transactionType = TransactionType.TRANSFER_PREDEFINED;
    component.account = this.account;
    component.targetAccounts = this.accountsToSelect;
    component.amount = transaction.credit;
    component.description = 'Transfer of \'' + transaction.description + '\'';
  }

  buttonClicked(): Transaction {
    const transaction = this.overTransaction;
    this.setOverTransaction(null, null);
    return transaction;
  }

  openIncomeCreationDialog(): void {
    const component = this.setupEditDialog();
    component.transactionType = TransactionType.CREDIT;
    component.account = this.account;
  }

  openOutcomeCreationDialog(): void {
    const component = this.setupEditDialog();
    component.transactionType = TransactionType.DEBIT;
    component.account = this.account;
  }

  openTransferCreationDialog(): void {
    const component = this.setupEditDialog();
    component.transactionType = TransactionType.TRANSFER;
    component.account = this.account;
    component.targetAccounts = this.accountsToSelect;
  }

  private setupEditDialog(): CreateTransactionsComponent {
    const ngbModalRef: NgbModalRef = this.modalService.open(CreateTransactionsComponent, {centered: true});
    const component = ngbModalRef.componentInstance as CreateTransactionsComponent;
    const closeHandler = this.onModalClose(ngbModalRef, this);
    component.finishSubject.subscribe(closeHandler, closeHandler);
    return component;
  }

  onModalClose(ngbModalRef: NgbModalRef, that: TransactionsListComponent): (input: any) => void {
    return input => {
      ngbModalRef.close();
      if (input === 'OK') {
        that.transactionAction.emit();
        // this.fetchTransactions();
      }
    };
  }

}
