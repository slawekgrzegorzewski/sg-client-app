import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
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
  private sourceAccounts$: Account[] = [];

  get sourceAccounts(): Account[] {
    return this.sourceAccounts$;
  }

  @Input() set sourceAccounts(value: Account[]) {
    this.sourceAccounts$ = value;
    this.sourceAccountsToDisplay = this.excludeAccount(this.sourceAccounts, this.destinationAccount);
  }

  sourceAccountsToDisplay: Account[] = [];

  private sourceAccount$: Account | null = null;

  get sourceAccount(): Account | null {
    return this.sourceAccount$;
  }

  @Input() set sourceAccount(value: Account | null) {
    this.sourceAccount$ = value;
    this.destinationAccountsToDisplay = this.excludeAccount(this.destinationAccounts, this.sourceAccount);
  }

  get sourceAccountId(): string | null {
    return this.sourceAccount$?.id.toString() || null;
  }

  set sourceAccountId(value: string | null) {
    this.sourceAccount = this.sourceAccounts.find(account => account.id === (value ? +value : -1)) || null;
  }

  private destinationAccounts$: Account[] = [];

  get destinationAccounts(): Account[] {
    return this.destinationAccounts$;
  }

  @Input() set destinationAccounts(value: Account[]) {
    this.destinationAccounts$ = value;
    this.destinationAccountsToDisplay = this.excludeAccount(this.destinationAccounts, this.sourceAccount);
  }

  destinationAccountsToDisplay: Account[] = [];

  private destinationAccount$: Account | null = null;

  get destinationAccount(): Account | null {
    return this.destinationAccount$;
  }

  @Input() set destinationAccount(value: Account | null) {
    this.destinationAccount$ = value;
    this.sourceAccountsToDisplay = this.excludeAccount(this.sourceAccounts, this.destinationAccount);
  }

  get destinationAccountId(): string | null {
    return this.destinationAccount$?.id.toString() || null;
  }

  set destinationAccountId(value: string | null) {
    this.destinationAccount = this.destinationAccounts.find(account => account.id === (value ? +value : -1)) || null;
  }

  private transactionType$: TransactionType = TransactionType.CREDIT;

  get transactionType(): TransactionType {
    return this.transactionType$;
  }

  @Input() set transactionType(value: TransactionType) {
    this.transactionType$ = value;
    this.sourceAccountsToDisplay = this.excludeAccount(this.sourceAccounts, this.destinationAccount);
    this.destinationAccountsToDisplay = this.excludeAccount(this.destinationAccounts, this.sourceAccount);
  }

  private conversionRate$: number | null = null;

  get conversionRate(): number | null {
    return this.conversionRate$;
  }

  @Input() set conversionRate(value: number | null) {
    this.conversionRate$ = value;
    this.calculateTargetAmount();
  }

  @Output() finishSubject = new EventEmitter<string>();

  amount$: number = 0;

  set amount(a: number) {
    this.amount$ = a;
    if (this.amount$ < 0) {
      this.amount$ = 0;
    }
    this.calculateTargetAmount();
  }

  @Input() get amount(): number {
    return this.amount$;
  }

  @Input() description: string = '';

  @Input() involvedBankTransactions: number[] = [];

  rate$: number = 1;

  set rate(value: number) {
    if (this.conversionRate) {
      return;
    }
    this.rate$ = value;
    this.calculateTargetAmount();
  }

  get rate(): number {
    if (this.conversionRate) {
      return this.conversionRate;
    }
    return this.rate$;
  }

  targetAmount: number = 0;

  private calculateTargetAmount(): void {
    if (this.isTransferWithConversion()) {
      if (this.rate) {
        this.targetAmount = CurrencyCalculator.round(this.amount * this.rate);
      }
    } else {
      this.targetAmount = this.amount;
    }

  }

  @ViewChild('amountReadonly') amountReadonly: NgModel | null = null;
  @ViewChild('transferAmount') transferAmount: NgModel | null = null;
  @ViewChild('transferDescription') transferDescription: NgModel | null = null;

  constructor(private transactionService: TransactionsService) {
  }

  ngOnInit(): void {
  }

  private excludeAccount(sourceAccounts: Account[], accountToExclude: Account | null): Account[] {
    return (sourceAccounts || []).filter(a => !accountToExclude || a.id !== accountToExclude.id);
  }

  credit(): void {
    if (this.sourceAccount) {
      this.transactionService.credit(this.sourceAccount, this.amount, this.description)
        .subscribe(
          data => this.finishSubject.emit('OK'),
          error => this.finishSubject.emit('Error')
        );
    }
  }

  debit(): void {
    if (this.sourceAccount) {
      this.transactionService.debit(this.sourceAccount, this.amount, this.description)
        .subscribe(
          data => this.finishSubject.emit('OK'),
          error => this.finishSubject.emit('Error')
        );
    }
  }

  transfer(): void {
    if (this.sourceAccount && this.destinationAccount) {
      this.transactionService.transfer(this.sourceAccount, this.destinationAccount, this.amount, this.description)
        .subscribe(
          data => this.finishSubject.emit('OK'),
          error => this.finishSubject.emit('Error')
        );
    }
  }

  transferWithBankTransactions(): void {
    if (this.sourceAccount && this.destinationAccount) {
      this.transactionService.transferWithBankTransactions(this.sourceAccount, this.destinationAccount, this.amount, this.description, this.involvedBankTransactions)
        .subscribe({
          next: data => this.finishSubject.emit('OK'),
          error: error => this.finishSubject.emit('Error')
        });
    }
  }

  transferWithConversion(): void {
    if (this.sourceAccount && this.destinationAccount) {
      this.transactionService.transferWithConversion(this.sourceAccount, this.destinationAccount, this.amount, this.targetAmount, this.description, this.rate)
        .subscribe({
          next: data => this.finishSubject.emit('OK'),
          error: error => this.finishSubject.emit('Error')
        });
    }
  }

  transferWithConversionWithBankTransactions(): void {
    if (this.sourceAccount && this.destinationAccount) {
      this.transactionService.transferWithConversionWithBankTransactions(this.sourceAccount, this.destinationAccount, this.amount, this.targetAmount, this.description, this.rate, this.involvedBankTransactions)
        .subscribe({
          next: data => this.finishSubject.emit('OK'),
          error: error => this.finishSubject.emit('Error')
        });
    }
  }

  cancel(): void {
    this.finishSubject.emit('Cancelled');
  }

  public isIncome(): boolean {
    return this.transactionType === TransactionType.CREDIT;
  }

  public isTransfer(): boolean {
    return this.transactionType === TransactionType.TRANSFER
      || this.transactionType === TransactionType.TRANSFER_PREDEFINED
      || this.transactionType === TransactionType.TRANSFER_FROM_BANK_TRANSACTIONS;
  }

  public isTransferWithConversion(): boolean {
    if (!this.sourceAccount) {
      return false;
    }
    return this.destinationAccount !== null && this.destinationAccount.currency !== this.sourceAccount.currency;
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
      case TransactionType.TRANSFER_FROM_BANK_TRANSACTIONS:
        this.isTransferWithConversion() ? this.transferWithConversionWithBankTransactions() : this.transferWithBankTransactions();
        break;
      default:
        break;
    }
  }

  isAmountReadonly(): boolean {
    return this.transactionType === TransactionType.TRANSFER_PREDEFINED || this.transactionType === TransactionType.TRANSFER_FROM_BANK_TRANSACTIONS;
  }

  isTransferNotAllowed(): boolean {
    const transferAmount = this.transferAmount || this.amountReadonly;
    return [
      transferAmount?.errors?.['required'],
      transferAmount?.value < 0,
      !this.isIncome() && transferAmount?.value > (this.sourceAccount?.currentBalance || 0),
      this.transferDescription?.errors?.['required'],
      (this.isTransfer() || this.isTransferWithConversion()) && !this.destinationAccount,
      this.isTransferWithConversion() && !this.targetAmount
    ].some(b => b);
  }

  conversionDescription() {
    let description = this.sourceAccount!.currency;
    if (this.isTransferWithConversion()) {
      description += ` -> ${this.targetAmount || 'XXX'}`;
      if (this.destinationAccount) {
        description += ' ' + this.destinationAccount.currency;
      }
    }
    return description;
  }
}
