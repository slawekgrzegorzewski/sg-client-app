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
    <div *ngIf="canBeImported()">
      <b>Wydatek</b>
      <ul>
        <li *ngFor="let expense of expensesToCreate">
          {{expense.amount | currency: expense.currency }} -
          <input #toSplit type="number" [max]="expense.amount" step="0.01">
          <button class="btn btn-sm btn-link" *ngIf="isSplitAmountCorrect(expense, toSplit.value)"
                  (click)="split(expense, toSplit.value);toSplit.value='';">
            podziel
          </button>
          <span *ngIf="!isSplitAmountCorrect(expense, toSplit.value)" style="color: #aaaaaa">podziel</span>
        </li>
      </ul>
      <button class="btn btn-sm btn-link" (click)="createDebit()">
        stwórz
      </button>
    </div>
    <div *ngIf="transactions.length === 1 && transactions[0].isDebit()" (click)="createCashWithdrawal()">
      <b>Wypłata gotówkowa</b>
    </div>
    <div *ngIf="transactions.length === 1 && transactions[0].isDebit()"
         (click)="createCashWithdrawalWithConversion()">
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

  @Output() onExpensesCreation = new EventEmitter<[Expense[], Account, AffectedBankTransactionsToImportInfo]>();
  @Output() onTransactionCreation = new EventEmitter<TransactionCreationData>();

  private _transactions: BankTransactionToImport[] = [];
  expensesToCreate: Expense[] = [];

  canBeImported() {
    return this.expensesToCreate.length > 0;
  }

  private createExpense() {
    this.expensesToCreate = [];

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
      const newExpense = new Expense();
      newExpense.description = description;
      newExpense.amount = amount.toNumber();
      newExpense.currency = accountOfCreatingExpense.currency;
      newExpense.expenseDate = expenseDate;
      this.expensesToCreate.push(newExpense);
    }
  }

  createDebit() {
    const accountOfCreatingExpense = this.getAccountOfTransaction(this.transactions[0])!;
    const affectedBankTransactionsToImportInfo = AffectedBankTransactionsToImportInfo.debitCredit(
      this.transactions.filter(t => t.isDebit()).map(t => t.debitNodrigenTransactionId),
      this.transactions.filter(t => t.isCredit()).map(t => t.creditNodrigenTransactionId)
    );
    this.onExpensesCreation.emit([
      this.expensesToCreate!,
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

  split(expense: Expense, value: string) {
    if (!this.isSplitAmountCorrect(expense, value)) {
      return;
    }

    const currentExpenseAmount = new Decimal(expense.amount);
    const newExpenseAmount = new Decimal(value);
    expense.amount = currentExpenseAmount.minus(newExpenseAmount).toNumber();

    const newExpense = new Expense();
    newExpense.description = expense.description;
    newExpense.amount = newExpenseAmount.toNumber();
    newExpense.currency = expense.currency;
    newExpense.expenseDate = expense.expenseDate;
    this.expensesToCreate.push(newExpense);
  }

  isSplitAmountCorrect(expense: Expense, value: string) {
    const newExpenseAmount = Number(value);
    return newExpenseAmount > 0 && newExpenseAmount <= expense.amount;

  }
}
