import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BankTransactionToImport} from '../../../../openbanking/model/nodrigen/bank-transaction-to-import';
import Decimal from 'decimal.js';
import {DatesUtils} from '../../../../general/utils/dates-utils';
import {AffectedBankTransactionsToImportInfo} from '../../../../openbanking/model/nodrigen/affected-bank-transactions-to-import-info';
import {Account} from '../../../model/account';
import {Income} from '../../../model/billings/income';


@Component({
  selector: 'app-credit-transaction-importer',
  template: `
    <ng-container *ngIf="canBeImported()">
      <div (click)="emitCreateEvent()">
        <b>Dochód</b>
      </div>
    </ng-container>
  `
})
export class CreditTransactionImporterComponent {

  get transactions(): BankTransactionToImport[] {
    return this._transactions;
  }

  @Input() set transactions(value: BankTransactionToImport[]) {
    this._transactions = value;
    this.createIncome();
  }

  @Input() allAccounts: Account[] = [];

  @Output() onIncomeCreation = new EventEmitter<[Income, Account, AffectedBankTransactionsToImportInfo]>();

  private _transactions: BankTransactionToImport[] = [];
  private _incomeToCreate: Income | null = null;

  canBeImported() {
    return this._incomeToCreate !== null;
  }

  private createIncome() {
    this._incomeToCreate = null;

    if (this.transactions.length === 0) {
      return;
    }
    if (!this.transactions[0].isCreditOrDebitTransaction()) {
      return;
    }

    const accountOfCreatingIncome = this.getAccountOfTransaction(this.transactions[0])!;

    let amount: Decimal = new Decimal(0);
    let incomeDate = new Date();
    let description = '';

    for (let transaction of this.transactions) {
      if (!transaction.isCreditOrDebitTransaction()) {
        return;
      }
      let account = this.getAccountOfTransaction(transaction)!;
      let otherAccount = this.getOtherAccountOfTransaction(transaction)!;

      if (account.id !== accountOfCreatingIncome.id
        || accountOfCreatingIncome.currency != account.currency
        || otherAccount !== null) {
        return;
      }
      if (transaction.isCredit()) {
        amount = amount.plus(new Decimal(transaction.credit));
      } else {
        amount = amount.minus(new Decimal(transaction.debit));
      }
      incomeDate = DatesUtils.min(incomeDate, transaction.timeOfTransaction);
      description += (description === '' ? '' : '\n') + transaction.description;
    }
    if (amount.gt(new Decimal(0))) {
      this._incomeToCreate = new Income();
      this._incomeToCreate.description = description;
      this._incomeToCreate.amount = amount.toNumber();
      this._incomeToCreate.currency = accountOfCreatingIncome.currency;
      this._incomeToCreate.incomeDate = incomeDate;
    }
  }

  getAccountOfTransaction(transaction: BankTransactionToImport) {
    return transaction.isCredit() ? transaction.destinationAccount : transaction.sourceAccount;
  }

  getOtherAccountOfTransaction(transaction: BankTransactionToImport) {
    return transaction.isCredit() ? transaction.sourceAccount : transaction.destinationAccount;
  }

  emitCreateEvent() {
    const accountOfCreatingIncome = this.getAccountOfTransaction(this.transactions[0])!;
    const affectedBankTransactionsToImportInfo = AffectedBankTransactionsToImportInfo.debitCredit(
      this.transactions.filter(t => t.isDebit()).map(t => t.debitNodrigenTransactionId),
      this.transactions.filter(t => t.isCredit()).map(t => t.creditNodrigenTransactionId)
    );

    this.onIncomeCreation.emit([
      this._incomeToCreate!,
      accountOfCreatingIncome,
      affectedBankTransactionsToImportInfo
    ]);
  }
}
