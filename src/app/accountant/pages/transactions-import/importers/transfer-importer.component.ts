import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BankTransactionToImport} from '../../../../openbanking/model/nodrigen/bank-transaction-to-import';
import Decimal from 'decimal.js';
import {TransactionCreationData} from '../model/transaction-creation-data';
import {TransactionType} from '../../../model/transaction-type';
import {TransactionUtils} from './transaction-utils';


@Component({
  selector: 'app-transfer-importer',
  template: `
    <ng-container>
      <div *ngIf="transactionMayBeTransfer()"
           (click)="createTransfer(this._otherTransactionForTransfer!)">
        <b>Przekaz wewnętrzny</b>
      </div>
      <div *ngIf="transactionMayBeTransferWithConversion()"
           (click)="createTransferWithConversion()">
        <b>Przekaz wewnętrzny z wymianą walut</b>
      </div>
      <div *ngIf="transactionMayBeSingleTransferWithConversion()"
           (click)="createTransferFromSingleTransactionWithConversion()">
        <b>Przekaz wewnętrzny z wymianą walut</b>
      </div>
    </ng-container>
  `
})
export class TransferImporterComponent {

  get transactions(): BankTransactionToImport[] {
    return this._transactions;
  }

  @Input() set transactions(value: BankTransactionToImport[]) {
    this._transactions = value;
    this.prepareTransferParties();
  }

  @Output() onTransactionCreation = new EventEmitter<TransactionCreationData>();

  _transaction: BankTransactionToImport | null = null;
  _otherTransactionForTransfer: BankTransactionToImport | null = null;
  _otherTransactionForTransferWithConversion: BankTransactionToImport | null = null;
  private _transactions: BankTransactionToImport[] = [];

  private prepareTransferParties() {
    this._transaction = null;
    this._otherTransactionForTransfer = null;
    this._otherTransactionForTransferWithConversion = null;

    if (this.transactions.length === 1
      && this.transactions[0].sourceAccount
      && this.transactions[0].destinationAccount
      && this.transactions[0].sourceAccount.currency !== this.transactions[0].destinationAccount.currency) {
      this._transaction = this.transactions[0];
      return;
    }

    if (this.transactions.length !== 2) return;

    this._transaction = this.transactions[0].isDebit() ? this.transactions[0] : this.transactions[1];
    const otherTransaction = this.transactions[0].isDebit() ? this.transactions[1] : this.transactions[0];

    this._otherTransactionForTransfer = TransactionUtils.findTransactionCandidateForTransfer(
      [otherTransaction],
      this._transaction!,
      tti => tti.isCredit()
        && BankTransactionToImport.compareDates(tti, this._transaction!) === 0
        && tti.credit === this._transaction!.debit
        && (tti.destinationAccount?.currency || '') === (this._transaction!.sourceAccount?.currency || '')
    );

    this._otherTransactionForTransferWithConversion = TransactionUtils.findTransactionCandidateForTransfer(
      [otherTransaction],
      this._transaction!,
      tti => tti.isCredit()
        && BankTransactionToImport.compareDates(tti, this._transaction!) === 0
        && (tti.destinationAccount?.currency || '') !== (this._transaction!.sourceAccount?.currency || ''));
  }

  transactionMayBeTransfer() {
    return this._transaction !== null && this._otherTransactionForTransfer !== null;
  }

  transactionMayBeTransferWithConversion() {
    return this._transaction !== null && this._otherTransactionForTransferWithConversion !== null;
  }

  transactionMayBeSingleTransferWithConversion() {
    return this._transaction !== null && this._otherTransactionForTransferWithConversion === null;
  }

  createTransfer(destinationTransactionForTransfer: BankTransactionToImport) {
    this.onTransactionCreation.emit(
      this.prepareTransactionCreationData(
        this._transaction!,
        destinationTransactionForTransfer,
        new Decimal(1)));
  }

  createTransferWithConversion() {
    this.onTransactionCreation.emit(
      this.prepareTransactionCreationData(
        this._transaction!,
        this._otherTransactionForTransferWithConversion!,
        new Decimal(this._otherTransactionForTransferWithConversion!.credit).dividedBy(new Decimal(this._transaction!.debit))));
  }

  createTransferFromSingleTransactionWithConversion() {
    this.onTransactionCreation.emit(
      this.prepareTransactionCreationData(
        this._transaction!,
        this._transaction!,
        new Decimal((this._transaction!.credit || 0)).dividedBy(new Decimal(this._transaction!.debit || 1))));
  }

  private prepareTransactionCreationData(sourceBankTransactionForTransfer: BankTransactionToImport, destinationTransactionForTransfer: BankTransactionToImport, conversionRate: Decimal) {
    return new TransactionCreationData(
      [sourceBankTransactionForTransfer.sourceAccount!],
      sourceBankTransactionForTransfer.sourceAccount!,
      [destinationTransactionForTransfer.destinationAccount!],
      destinationTransactionForTransfer.destinationAccount!,
      [sourceBankTransactionForTransfer.debitNodrigenTransactionId, destinationTransactionForTransfer.creditNodrigenTransactionId],
      TransactionType.TRANSFER_FROM_BANK_TRANSACTIONS,
      new Decimal(sourceBankTransactionForTransfer.debit),
      sourceBankTransactionForTransfer.description,
      conversionRate
    );
  }
}
