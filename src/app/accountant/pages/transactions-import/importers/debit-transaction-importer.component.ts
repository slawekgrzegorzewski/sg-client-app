import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BankTransactionToImport} from '../../../../openbanking/model/nodrigen/bank-transaction-to-import';
import {Expense} from '../../../model/billings/expense';
import Decimal from 'decimal.js';
import {DatesUtils} from '../../../../general/utils/dates-utils';
import {
  AffectedBankTransactionsToImportInfo
} from '../../../../openbanking/model/nodrigen/affected-bank-transactions-to-import-info';
import {Account} from '../../../model/account';
import {TransactionCreationData} from '../model/transaction-creation-data';
import {TransactionType} from '../../../model/transaction-type';


@Component({
  selector: 'app-debit-transaction-importer',
  template: `
    <div *ngIf="canBeImported()" (click)="createDebit()">
      <b>Wydatek</b>
    </div>
    <div *ngIf="transactions.length === 1 && transactions[0].isDebit()" (click)="createCashWithdrawal()">
      <b>Wypłata gotówkowa</b>
    </div>
    <div *ngIf="transactions.length === 1 && transactions[0].isDebit()" (click)="createCashWithdrawalWithConversion()">
      <b>Wypłata gotówkowa z wymianą walut</b>
    </div>
  `
})
export class DebitTransactionImporterComponent {

  get transactions(): BankTransactionToImport[] {
    return this._transactions;
  }

  @Input() set transactions(value: BankTransactionToImport[]) {
    this._transactions = value;
    this.createExpense();
  }

  @Input() allAccounts: Account[] = [];

  @Output() onExpenseCreation = new EventEmitter<[Expense, Account, AffectedBankTransactionsToImportInfo]>();
  @Output() onTransactionCreation = new EventEmitter<TransactionCreationData>();

  private _transactions: BankTransactionToImport[] = [];
  private _expenseToCreate: Expense | null = null;

  canBeImported() {
    return this._expenseToCreate !== null;
  }

  private createExpense() {
    this._expenseToCreate = null;

    if (this.transactions.length === 0) {
      return;
    }
    if (!this.transactions[0].isCreditOrDebitTransaction()) {
      return;
    }

    const accountOfCreatingExpense = this.getAccountOfTransaction(this.transactions[0])!;

    let amount: Decimal = new Decimal(0);
    let expenseDate = new Date();
    let description = '';

    for (let transaction of this.transactions) {
      if (!transaction.isCreditOrDebitTransaction()) {
        return;
      }
      let account = this.getAccountOfTransaction(transaction)!;
      let otherAccount = this.getOtherAccountOfTransaction(transaction)!;

      if (account.id !== accountOfCreatingExpense.id
        || accountOfCreatingExpense.currency != account.currency
        || otherAccount !== null) {
        return;
      }
      if (transaction.isDebit()) {
        amount = amount.plus(new Decimal(transaction.debit));
      } else {
        amount = amount.minus(new Decimal(transaction.credit));
      }
      expenseDate = DatesUtils.min(expenseDate, transaction.timeOfTransaction);
      description += (description === '' ? '' : '\n') + transaction.description;
    }
    if (amount.gt(new Decimal(0))) {
      this._expenseToCreate = new Expense();
      this._expenseToCreate.description = description;
      this._expenseToCreate.amount = amount.toNumber();
      this._expenseToCreate.currency = accountOfCreatingExpense.currency;
      this._expenseToCreate.expenseDate = expenseDate;
    }
  }

  createDebit() {
    const accountOfCreatingExpense = this.getAccountOfTransaction(this.transactions[0])!;
    const affectedBankTransactionsToImportInfo = AffectedBankTransactionsToImportInfo.debitCredit(
      this.transactions.filter(t => t.isDebit()).map(t => t.debitNodrigenTransactionId),
      this.transactions.filter(t => t.isCredit()).map(t => t.creditNodrigenTransactionId)
    );
    this.onExpenseCreation.emit([
      this._expenseToCreate!,
      accountOfCreatingExpense,
      affectedBankTransactionsToImportInfo
    ]);
  }

  createCashWithdrawal() {
    this.prepareCashWithdrawal(new Decimal(1),);
  }

  createCashWithdrawalWithConversion() {
    this.prepareCashWithdrawal(null);
  }

  private prepareCashWithdrawal(exchangeRate: Decimal | null) {
    const bankTransactionToImport = this.transactions[0]!;
    const sourceAccount = this.allAccounts.find(account =>
      account.id === bankTransactionToImport!.sourceAccount!.id)!;
    const cashAccounts = this.allAccounts.filter(t => t.bankAccount === null);
    const transactionCreationData = new TransactionCreationData(
      [sourceAccount],
      sourceAccount,
      cashAccounts,
      null,
      [bankTransactionToImport.debitNodrigenTransactionId],
      TransactionType.TRANSFER_FROM_BANK_TRANSACTIONS,
      new Decimal(bankTransactionToImport.debit),
      bankTransactionToImport.description,
      exchangeRate
    );
    this.onTransactionCreation.emit(transactionCreationData);
  }

  getAccountOfTransaction(transaction: BankTransactionToImport) {
    return transaction.isCredit() ? transaction.destinationAccount : transaction.sourceAccount;
  }

  getOtherAccountOfTransaction(transaction: BankTransactionToImport) {
    return transaction.isCredit() ? transaction.sourceAccount : transaction.destinationAccount;
  }
}
