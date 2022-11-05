import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BankTransactionToImport} from '../../../../openbanking/model/nodrigen/bank-transaction-to-import';
import {Expense} from '../../../model/billings/expense';
import Decimal from 'decimal.js';
import {DatesUtils} from '../../../../general/utils/dates-utils';
import {AffectedBankTransactionsToImportInfo} from '../../../../openbanking/model/nodrigen/affected-bank-transactions-to-import-info';
import {Account} from '../../../model/account';
import {TransactionCreationData} from '../model/transaction-creation-data';
import {TransactionType} from '../../../model/transaction-type';


@Component({
  selector: 'app-debit-transaction-importer',
  template: `
    <ng-container *ngIf="canBeImported()">
      <div (click)="createDebit()">
        <b>Wydatek</b>
      </div>
      <div (click)="createCashWithdrawal()">
        <b>Wypłata gotówkowa</b>
      </div>
      <ng-container *ngIf="isAlignmentPossible()">
        <b>Wydatek wyrównany transakcją:</b>
        <div style="padding-left: 20px">
          <app-transactions-row *ngFor="let alignmentCandidate of candidatesToAlignment"
                                [transactionToImport]="alignmentCandidate"
                                (click)="aligningTransaction = alignmentCandidate; createDebit();">
          </app-transactions-row>
        </div>
      </ng-container>
    </ng-container>
  `
})
export class DebitTransactionImporterComponent implements OnInit {

  @Input() allAccounts: Account[] = [];
  @Input() allTransactions: BankTransactionToImport[] = [];
  @Input() transaction: BankTransactionToImport | null = null;

  @Output() onExpenseCreation = new EventEmitter<[Expense, Account, AffectedBankTransactionsToImportInfo]>();
  @Output() onTransactionCreation = new EventEmitter<TransactionCreationData>();

  candidatesToAlignment: (BankTransactionToImport | null)[] = [];
  aligningTransaction: (BankTransactionToImport | null) = null;

  ngOnInit(): void {
    this.candidatesToAlignment = this.allTransactions.filter(t =>
      t.isCredit()
      && t.destinationAccount?.currency === this.transaction?.sourceAccount?.currency
      && t.credit < (this.transaction?.debit || 0)
    );
  }

  canBeImported() {
    return this.transaction?.isDebit() || false;
  }

  isAlignmentPossible(): boolean {
    return (this.candidatesToAlignment?.length || 0) > 0;
  }

  createDebit() {
    const transactionToImport = this.transaction!;

    const expense = new Expense();
    expense.amount = new Decimal(transactionToImport.debit).minus(new Decimal(this.aligningTransaction?.credit || 0)).toNumber();
    expense.expenseDate = DatesUtils.min(transactionToImport.timeOfTransaction, this.aligningTransaction?.timeOfTransaction || null);
    expense.description = transactionToImport.description + (this.aligningTransaction ? this.aligningTransaction.description + '\n' : '');

    const affectedBankTransactionsToImportInfo = AffectedBankTransactionsToImportInfo.debit([transactionToImport.debitNodrigenTransactionId]);
    if (this.aligningTransaction) {
      affectedBankTransactionsToImportInfo.creditTransactions = [this.aligningTransaction.creditNodrigenTransactionId];
    }

    this.onExpenseCreation.emit([
      expense,
      transactionToImport.sourceAccount!,
      affectedBankTransactionsToImportInfo
    ]);
  }

  createCashWithdrawal() {
    const sourceAccount = this.allAccounts.find(account => account.id === this.transaction!.sourceAccount!.id)!;
    const cashAccounts = this.allAccounts.filter(t => t.bankAccount === null);
    const transactionCreationData = new TransactionCreationData(
      [sourceAccount],
      sourceAccount,
      cashAccounts,
      null,
      [this.transaction!.debitNodrigenTransactionId],
      TransactionType.TRANSFER_FROM_BANK_TRANSACTIONS,
      new Decimal(this.transaction!.debit),
      this.transaction!.description,
      new Decimal(1)
    );
    this.onTransactionCreation.emit(transactionCreationData);
  }

}
