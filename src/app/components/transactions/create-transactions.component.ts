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

  @Input() accounts: Account[]
  @Input() transactionType: TransactionType
  @Output() finishSubject = new EventEmitter<string>();
  toAccount: Account;
  _amount: number;
  set amount(a: number) {
    this._amount = a;
    if (this._amount < 0) this._amount = 0;
  }

  get amount() {
    return this._amount;
  }

  set toAccountId(id: string) {
    let idNumber = Number(id);
    this.toAccount = this.accounts.find(a => a.id === idNumber)
  }

  constructor(private transactionService: TransactionsService) {
  }

  ngOnInit() {
  }

  credit() {
    this.transactionService.credit(this.toAccount, this.amount, 'O lol')
      .subscribe(
        data => this.finishSubject.emit("OK"),
        error => this.finishSubject.emit("Error")
      );
  }

  cancel() {
    this.finishSubject.emit("Cancelled");
  }
}
