import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AccountsService} from "../../services/accounts.service";
import {ToastService} from "../../services/toast.service";
import {Account} from "../../model/account";
import {LoginService} from "../../services/login.service";
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {CreateTransactionsComponent} from "../transactions/create-transactions.component";
import {TransactionType} from "../../model/transaction-type";
import {Transaction} from "../../model/transaction";
import {TransactionsService} from "../../services/transations.service";

@Component({
  selector: 'accounts',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private _accounts: Account[]

  @ViewChild('utilBox') utilBox: ElementRef;
  private overTransaction: Transaction;
  utilBoxTop: number;
  utilBoxLeft: number;
  utilBoxVisibility: string = 'hidden';

  get accounts(): Account[] {
    return this._accounts;
  }

  set accounts(value: Account[]) {
    this._accounts = value;
    this.selectedAccount = (this.accounts == null || this.accounts.length === 0) ? null : this.accounts[0];
  }

  private _selectedAccount: Account;
  get selectedAccount(): Account {
    return this._selectedAccount;
  }

  set selectedAccount(value: Account) {
    this._selectedAccount = value;
    this.transactionsOfSelectedAccount = this.filterTransactionsForSelectedAccount();
  }

  private _transactions: Transaction[]

  get transactions() {
    return this._transactions;
  }

  set transactions(t: Transaction[]) {
    this._transactions = t;
    this.transactionsOfSelectedAccount = this.filterTransactionsForSelectedAccount();
  }

  public transactionsOfSelectedAccount: Transaction[];

  private filterTransactionsForSelectedAccount(): Transaction[] {
    if (!this.selectedAccount) return [];
    if (!this.transactions) return [];
    return this.transactions
      .filter(t => this.isTransactionRelatedToSelectedAccount(t))
      .sort((a, b) => a.timeOfTransaction.getTime() - b.timeOfTransaction.getTime())
  }

  private isTransactionRelatedToSelectedAccount(t: Transaction) {
    return this.areAccountsEqual(t.source, this.selectedAccount) || this.areAccountsEqual(t.destination, this.selectedAccount);
  }

  private areAccountsEqual(a: Account, b: Account) {
    if (!a || !b) return false;
    return a.id === b.id;
  }

  constructor(private accountsService: AccountsService,
              private transactionsService: TransactionsService,
              private toastService: ToastService,
              public loginService: LoginService,
              private modalService: NgbModal) {
  }

  ngOnInit() {
    this.fetchAccounts();
    this.fetchTransactions();
  }

  private fetchAccounts() {
    this.accountsService.currentUserAccounts().subscribe(
      data => this.accounts = data.map(a => new Account(a)).sort(Account.compareByCurrencyAndName),
      error => {
        this.toastService.showWarning("Could not obtain accounts information, retrying");
        this.accounts = [];
        setTimeout(() => this.fetchAccounts(), 100);
      }
    )
  }

  private fetchTransactions() {
    this.transactionsService.allUsersTransactions().subscribe(
      data => this.transactions = data.map(t => new Transaction(t)),
      error => {
        this.toastService.showWarning("Could not obtain transactions information, retrying");
        this.transactions = [];
        setTimeout(() => this.fetchTransactions(), 100);
      }
    )
  }

  openIncomeCreationDialog() {
    let component = this.setupEditDialog();
    component.transactionType = TransactionType.CREDIT;
    component.account = this.selectedAccount;
  }

  openOutcomeCreationDialog() {
    let component = this.setupEditDialog();
    component.transactionType = TransactionType.DEBIT;
    component.account = this.selectedAccount;
  }

  openTransferCreationDialog() {
    let component = this.setupEditDialog();
    component.transactionType = TransactionType.TRANSFER;
    component.account = this.selectedAccount;
    component.targetAccounts = this.accounts;
  }

  openPredefinedTransferCreationDialog(transaction: Transaction) {
    let component = this.setupEditDialog();
    component.transactionType = TransactionType.TRANSFER_PREDEFINED;
    component.account = this.selectedAccount;
    component.targetAccounts = this.accounts;
    component.amount = transaction.credit;
    component.description = 'Transfer of \'' + transaction.description + "\'";
  }

  private setupEditDialog(): CreateTransactionsComponent {
    let ngbModalRef: NgbModalRef = this.modalService.open(CreateTransactionsComponent, {centered: true});
    let component = ngbModalRef.componentInstance as CreateTransactionsComponent;
    let closeHandler = this.onModalClose(ngbModalRef, this);
    component.finishSubject.subscribe(closeHandler, closeHandler)
    return component;
  }

  onModalClose(ngbModalRef: NgbModalRef, that: HomeComponent) {
    return input => {
      ngbModalRef.close();
      if (input === "OK") {
        that.fetchAccounts();
        this.fetchTransactions();
      }
    }
  }

  setOverTransaction(value: Transaction, transactionRow: HTMLTableRowElement) {
    this.overTransaction = value;
    if (value && value.destination?.id === this.selectedAccount.id) {
      var adjustment = (transactionRow.offsetHeight - this.utilBox.nativeElement.offsetHeight) / 2;
      this.utilBoxTop = transactionRow.getBoundingClientRect().top + adjustment;
      this.utilBoxLeft = transactionRow.getBoundingClientRect().left + transactionRow.clientWidth - this.utilBox.nativeElement.offsetWidth;
      this.utilBoxVisibility = 'visible'
    } else {
      this.utilBoxVisibility = 'hidden'
    }
  }

  buttonClicked(): Transaction {
    let transaction = this.overTransaction;
    this.setOverTransaction(null, null);
    return transaction;
  }
}
