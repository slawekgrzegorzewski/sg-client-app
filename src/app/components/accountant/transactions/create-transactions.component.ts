import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TransactionType} from '../../../model/accountant/transaction-type';
import {Account} from '../../../model/accountant/account';
import {TransactionsService} from '../../../services/accountant/transations.service';
import {CurrencyCalculator} from '../../../utils/currency-calculator';
import {NgModel} from '@angular/forms';

@Component({
  selector: 'app-create-transaction',
  templateUrl: './create-transactions.component.html',
  styleUrls: ['./create-transactions.component.css']
})
export class CreateTransactionsComponent implements OnInit {

  private internalAccount: Account | null = null;

  get account(): Account | null {
    return this.internalAccount;
  }

  @Input() set account(value: Account | null) {
    this.internalAccount = value;
    this.targetAccounts = this.filterTargetAccounts(this.targetAccounts);
  }

  private internalTargetAccounts: Account[] = [];

  get targetAccounts(): Account[] {
    return this.internalTargetAccounts;
  }

  @Input() set targetAccounts(value: Account[]) {
    this.internalTargetAccounts = this.filterTargetAccounts(value);
  }

  targetAccount: Account | null = null;

  set targetAccountId(id: string) {
    const idNumber = Number(id);
    this.targetAccount = this.targetAccounts.find(a => a.id === idNumber) || null;
  }

  private internalTransactionType: TransactionType = TransactionType.CREDIT;

  get transactionType(): TransactionType {
    return this.internalTransactionType;
  }

  @Input() set transactionType(value: TransactionType) {
    this.internalTransactionType = value;
    this.targetAccounts = this.filterTargetAccounts(this.targetAccounts);
  }

  @Output() finishSubject = new EventEmitter<string>();

  internalAmount: number = 0;

  set amount(a: number) {
    this.internalAmount = a;
    if (this.internalAmount < 0) {
      this.internalAmount = 0;
    }
    this.calculateTargetAmount();
  }

  @Input() get amount(): number {
    return this.internalAmount;
  }

  @Input() description: string = '';

  internalRate: number = 1;

  set rate(value: number) {
    this.internalRate = value;
    this.calculateTargetAmount();
  }

  get rate(): number {
    return this.internalRate;
  }

  targetAmount: number = 0;

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
    if (this.account) {
      this.transactionService.credit(this.account, this.amount, this.description)
        .subscribe(
          data => this.finishSubject.emit('OK'),
          error => this.finishSubject.emit('Error')
        );
    }
  }

  debit(): void {
    if (this.account) {
      this.transactionService.debit(this.account, this.amount, this.description)
        .subscribe(
          data => this.finishSubject.emit('OK'),
          error => this.finishSubject.emit('Error')
        );
    }
  }

  transfer(): void {
    if (this.account && this.targetAccount) {
      this.transactionService.transfer(this.account, this.targetAccount, this.amount, this.description)
        .subscribe(
          data => this.finishSubject.emit('OK'),
          error => this.finishSubject.emit('Error')
        );
    }
  }

  transferWithConversion(): void {
    if (this.account && this.targetAccount) {
      this.transactionService.transferWithConversion(this.account, this.targetAccount, this.amount, this.targetAmount, this.description, this.rate)
        .subscribe(
          data => this.finishSubject.emit('OK'),
          error => this.finishSubject.emit('Error')
        );
    }
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
    if (!this.account) {
      return false;
    }
    return this.targetAccount !== null && this.targetAccount.currency !== this.account.currency;
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
    return [
      transferAmount?.errors?.['required'],
      transferAmount?.value < 0,
      !this.isIncome() && transferAmount?.value > (this.account?.currentBalance || 0),
      transferDescription?.errors?.['required'],
      (this.isTransfer() || this.isTransferWithConversion()) && !this.targetAccount,
      this.isTransferWithConversion() && !this.targetAmount
    ].some(b => b);
  }
}
