import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TransactionType} from "../../model/transaction-type";
import {Account} from "../../model/account";
import {TransactionsService} from "../../services/transations.service";

@Component({
  selector: 'create-transaction',
  templateUrl: './create-transactions.component.html',
  styleUrls: ['./create-transactions.component.css']
})
export class CreateTransactionsComponent implements OnInit {

  @Input() account: Account
  @Input() transactionType: TransactionType
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

  constructor(private transactionService: TransactionsService) {
  }

  ngOnInit() {
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

  cancel() {
    this.finishSubject.emit("Cancelled");
  }

  public accountLabel(): string {
    switch (this.transactionType) {
      case TransactionType.CREDIT:
        return "Credited account"
      case TransactionType.DEBIT:
        return "Debited account"
      case TransactionType.TRANSFER:
      default:
        return "";
    }
  }

  createTransaction() {
    switch (this.transactionType) {
      case TransactionType.CREDIT:
        this.credit();
        break;
      case TransactionType.DEBIT:
        this.debit();
        break;
      case TransactionType.TRANSFER:
      default:
        break;
    }
  }
}
