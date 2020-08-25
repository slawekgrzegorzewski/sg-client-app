import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TransactionType} from "../../model/transaction-type";
import {Account} from "../../model/account";
import {TransactionsService} from "../../services/transations.service";
import {CurrencyCalculator} from "../../../utils/currency-calculator";

@Component({
  selector: 'create-transaction',
  templateUrl: './create-transactions.component.html',
  styleUrls: ['./create-transactions.component.css']
})
export class CreateTransactionsComponent implements OnInit {

  private _account: Account
  get account(): Account {
    return this._account;
  }

  @Input() set account(value: Account) {
    this._account = value;
    this.targetAccounts = this.filterTargetAccounts(this.targetAccounts);
  }

  private _targetAccounts: Account[]
  get targetAccounts(): Account[] {
    return this._targetAccounts;
  }

  @Input() set targetAccounts(value: Account[]) {
    this._targetAccounts = this.filterTargetAccounts(value);
  }

  set targetAccountId(id: string) {
    let idNumber = Number(id);
    this.targetAccount = this.targetAccounts.find(a => a.id === idNumber)
  }

  targetAccount: Account;

  private _transactionType: TransactionType
  get transactionType(): TransactionType {
    return this._transactionType;
  }

  @Input() set transactionType(value: TransactionType) {
    this._transactionType = value;
    this.targetAccounts = this.filterTargetAccounts(this.targetAccounts);
  }

  @Output() finishSubject = new EventEmitter<string>();
  _amount: number;
  set amount(a: number) {
    this._amount = a;
    if (this._amount < 0) this._amount = 0;
  }

  get amount() {
    return this._amount;
  }

  description: string;

  _rate: number;
  set rate(value: number) {
    this._rate = value;
    this.targetAmount = CurrencyCalculator.round(this.amount * this._rate);
  };

  get rate() {
    return this._rate;
  }

  targetAmount: number;

  constructor(private transactionService: TransactionsService) {
  }

  ngOnInit() {
  }

  private filterTargetAccounts(value: Account[]) {
    return (value || []).filter(a => !this.account || a.id !== this.account.id)
      .filter(a => this.isTransferWithConversion() || !this.account || a.currency === this.account.currency);
  }

  credit() {
    this.transactionService.credit(this.account, this.amount, this.description)
      .subscribe(
        data => this.finishSubject.emit("OK"),
        error => this.finishSubject.emit("Error")
      );
  }

  debit() {
    this.transactionService.debit(this.account, this.amount, this.description)
      .subscribe(
        data => this.finishSubject.emit("OK"),
        error => this.finishSubject.emit("Error")
      );
  }

  transfer() {
    this.transactionService.transfer(this.account, this.targetAccount, this.amount, this.description)
      .subscribe(
        data => this.finishSubject.emit("OK"),
        error => this.finishSubject.emit("Error")
      );
  }

  transferWithConversion() {
    this.transactionService.transferWithConversion(this.account, this.targetAccount, this.amount, this.targetAmount, this.description, this.rate)
      .subscribe(
        data => this.finishSubject.emit("OK"),
        error => this.finishSubject.emit("Error")
      );
  }

  cancel() {
    this.finishSubject.emit("Cancelled");
  }

  public isIncome(): boolean {
    return this._transactionType === TransactionType.CREDIT;
  }

  public isTransfer(): boolean {
    return this._transactionType === TransactionType.TRANSFER;
  }

  public isTransferWithConversion(): boolean {
    return this._transactionType === TransactionType.TRANSFER_WITH_CONVERSION;
  }

  public accountLabel(): string {
    switch (this._transactionType) {
      case TransactionType.CREDIT:
        return "Credited account"
      case TransactionType.DEBIT:
        return "Debited account"
      case TransactionType.TRANSFER:
      case TransactionType.TRANSFER_WITH_CONVERSION:
        return "From";
      default:
        return "";
    }
  }

  public createTransaction() {
    switch (this._transactionType) {
      case TransactionType.CREDIT:
        this.credit();
        break;
      case TransactionType.DEBIT:
        this.debit();
        break;
      case TransactionType.TRANSFER:
        this.transfer();
        break;
      case TransactionType.TRANSFER_WITH_CONVERSION:
        this.transferWithConversion();
        break;
      default:
        break;
    }
  }
}
