import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TransactionType} from '../../model/transaction-type';
import {Account} from '../../model/account';
import {TransactionsService} from '../../services/transations.service';
import {CurrencyCalculator} from '../../../utils/currency-calculator';
import {NgModel} from '@angular/forms';

@Component({
  selector: 'app-create-transaction',
  templateUrl: './create-transactions.component.html',
  styleUrls: ['./create-transactions.component.css']
})
export class CreateTransactionsComponent implements OnInit {

  private internalAccount: Account;

  get account(): Account {
    return this.internalAccount;
  }

  @Input() set account(value: Account) {
    this.internalAccount = value;
    this.targetAccounts = this.filterTargetAccounts(this.targetAccounts);
  }

  private internalTargetAccounts: Account[];

  get targetAccounts(): Account[] {
    return this.internalTargetAccounts;
  }

  @Input() set targetAccounts(value: Account[]) {
    this.internalTargetAccounts = this.filterTargetAccounts(value);
  }

  set targetAccountId(id: string) {
    const idNumber = Number(id);
    this.targetAccount = this.targetAccounts.find(a => a.id === idNumber);
  }

  targetAccount: Account;

  private internalTransactionType: TransactionType;

  get transactionType(): TransactionType {
    return this.internalTransactionType;
  }

  @Input() set transactionType(value: TransactionType) {
    this.internalTransactionType = value;
    this.targetAccounts = this.filterTargetAccounts(this.targetAccounts);
  }

  @Output() finishSubject = new EventEmitter<string>();
  internalAmount: number;

  set amount(a: number) {
    this.internalAmount = a;
    if (this.internalAmount < 0) {
      this.internalAmount = 0;
    }
    this.calculateTargetAmount();
  }

  get amount(): number {
    return this.internalAmount;
  }

  description: string;

  internalRate: number;

  set rate(value: number) {
    this.internalRate = value;
    this.calculateTargetAmount();
  }

  get rate(): number {
    return this.internalRate;
  }

  targetAmount: number;

  private calculateTargetAmount(): void {
    if (this.isTransferWithConversion()) {
      if (this.internalRate) {
        this.targetAmount = CurrencyCalculator.round(this.amount * this.internalRate);
      }
    } else {
      this.targetAmount = this.amount;
    }

  }

  constructor(private transactionService: TransactionsService) {
  }

  ngOnInit(): void {
  }

  private filterTargetAccounts(value: Account[]): Account[] {
    return (value || []).filter(a => !this.account || a.id !== this.account.id);
  }

  credit(): void {
    this.transactionService.credit(this.account, this.amount, this.description)
      .subscribe(
        data => this.finishSubject.emit('OK'),
        error => this.finishSubject.emit('Error')
      );
  }

  debit(): void {
    this.transactionService.debit(this.account, this.amount, this.description)
      .subscribe(
        data => this.finishSubject.emit('OK'),
        error => this.finishSubject.emit('Error')
      );
  }

  transfer(): void {
    this.transactionService.transfer(this.account, this.targetAccount, this.amount, this.description)
      .subscribe(
        data => this.finishSubject.emit('OK'),
        error => this.finishSubject.emit('Error')
      );
  }

  transferWithConversion(): void {
    this.transactionService.transferWithConversion(
      this.account, this.targetAccount, this.amount,
      this.targetAmount, this.description, this.rate)
      .subscribe(
        data => this.finishSubject.emit('OK'),
        error => this.finishSubject.emit('Error')
      );
  }

  cancel(): void {
    this.finishSubject.emit('Cancelled');
  }

  public isIncome(): boolean {
    return this.transactionType === TransactionType.CREDIT;
  }

  public isTransfer(): boolean {
    return this.transactionType === TransactionType.TRANSFER || this.transactionType === TransactionType.TRANSFER_PREDEFINED;
  }

  public isTransferWithConversion(): boolean {
    return this.targetAccount && this.targetAccount.currency !== this.account.currency;
  }

  public accountLabel(): string {
    switch (this.transactionType) {
      case TransactionType.CREDIT:
        return 'Credited account';
      case TransactionType.DEBIT:
        return 'Debited account';
      case TransactionType.TRANSFER:
      case TransactionType.TRANSFER_PREDEFINED:
        return 'From';
      default:
        return '';
    }
  }

  public createTransaction(): void {
    switch (this.transactionType) {
      case TransactionType.CREDIT:
        this.credit();
        break;
      case TransactionType.DEBIT:
        this.debit();
        break;
      case TransactionType.TRANSFER:
      case TransactionType.TRANSFER_PREDEFINED:
        this.isTransferWithConversion() ? this.transferWithConversion() : this.transfer();
        break;
      default:
        break;
    }
  }

  isPredefined(): boolean {
    return this.transactionType === TransactionType.TRANSFER_PREDEFINED;
  }

  isTransferNotAllowed(transferAmount: NgModel, transferDescription: NgModel): boolean {
    const req1 = transferAmount?.errors?.required;
    const req2 = transferAmount?.value < 0;
    const req3 = !this.isIncome() && transferAmount?.value > this.account.currentBalance;
    const req4 = transferDescription?.errors?.required;
    const req5 = (this.isTransfer() || this.isTransferWithConversion()) && !this.targetAccount;
    const req6 = this.isTransferWithConversion() && !this.targetAmount;
    return [req1, req2, req3, req4, req5, req6].some(b => b);
  }
}
