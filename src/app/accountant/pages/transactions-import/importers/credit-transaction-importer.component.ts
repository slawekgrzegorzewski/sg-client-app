import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BankTransactionToImport} from '../../../../openbanking/model/nodrigen/bank-transaction-to-import';
import Decimal from 'decimal.js';
import {DatesUtils} from '../../../../general/utils/dates-utils';
import {AffectedBankTransactionsToImportInfo} from '../../../../openbanking/model/nodrigen/affected-bank-transactions-to-import-info';
import {Account} from '../../../model/account';
import {TransactionCreationData} from '../model/transaction-creation-data';
import {Income} from '../../../model/billings/income';


@Component({
  selector: 'app-credit-transaction-importer',
  template: `
    <ng-container *ngIf="canBeImported()">
      <div (click)="emitCreateEvent()">
        <b>Dochód</b>
      </div>
      <ng-container *ngIf="isAlignmentPossible()">
        <b>Dochód wyrównany transakcją:</b>
        <div style="padding-left: 20px">
          <app-transactions-row *ngFor="let alignmentCandidate of candidatesToAlignment"
                                [transactionToImport]="alignmentCandidate"
                                (click)="aligningTransaction = alignmentCandidate; emitCreateEvent();">

          </app-transactions-row>
        </div>
      </ng-container>
    </ng-container>
  `
})
export class CreditTransactionImporterComponent implements OnInit {

  @Input() transaction: BankTransactionToImport | null = null;
  @Input() allTransactions: BankTransactionToImport[] = [];
  @Input() allAccounts: Account[] = [];

  @Output() onIncomeCreation = new EventEmitter<[Income, Account, AffectedBankTransactionsToImportInfo]>();
  @Output() onTransactionCreation = new EventEmitter<TransactionCreationData>();

  aligningTransaction: (BankTransactionToImport | null) = null;
  candidatesToAlignment: (BankTransactionToImport | null)[] = [];

  ngOnInit(): void {
    this.candidatesToAlignment = this.allTransactions.filter(t =>
      t.isDebit()
      && t.sourceAccount?.currency === this.transaction?.destinationAccount?.currency
      && t.debit < (this.transaction?.credit || 0)
    );
  }

  canBeImported() {
    return this.transaction?.isCredit() || false;
  }

  isAlignmentPossible(): boolean {
    return (this.candidatesToAlignment?.length || 0) > 0;
  }

  emitCreateEvent() {
    const transactionToImport = this.transaction!;

    const income = new Income();
    income.amount = new Decimal(transactionToImport.credit).minus(new Decimal(this.aligningTransaction?.debit || 0)).toNumber();
    income.incomeDate = DatesUtils.min(transactionToImport.timeOfTransaction, this.aligningTransaction?.timeOfTransaction || null);
    income.description = transactionToImport.description + (this.aligningTransaction ? '\n' + this.aligningTransaction.description : '');

    const affectedBankTransactionsToImportInfo = AffectedBankTransactionsToImportInfo.credit([transactionToImport.creditNodrigenTransactionId]);
    if (this.aligningTransaction) {
      affectedBankTransactionsToImportInfo.debitTransactions = [this.aligningTransaction.debitNodrigenTransactionId];
    }

    this.onIncomeCreation.emit([
      income,
      transactionToImport.destinationAccount!,
      affectedBankTransactionsToImportInfo
    ]);
  }

}
