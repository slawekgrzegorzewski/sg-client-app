import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BankTransactionToImport} from '../../../../openbanking/model/nodrigen/bank-transaction-to-import';
import Decimal from 'decimal.js';
import {Account} from '../../../model/account';
import {TransactionCreationData} from '../model/transaction-creation-data';
import {TransactionType} from '../../../model/transaction-type';
import {TransactionUtils} from './transaction-utils';


@Component({
  selector: 'app-transfer-importer',
  template: `
    <ng-container>
      <div *ngIf="transactionMayBeTransfer()"
           (click)="createTransfer(this.otherTransactionForTransfer!)">
        <b>Przekaz wewnętrzny</b>
      </div>
      <div *ngIf="transactionMayBeTransferWithConversion()"
           (click)="createTransfer(this.otherTransactionForTransferWitConversion!, decimal(this.otherTransactionForTransferWitConversion!.credit).div(decimal(this.transaction!.debit)))">
        <b>Przekaz wewnętrzny z wymianą walut</b>
      </div>
      <div *ngIf="transactionMayBeSingleTransferWithConversion()" (click)="createSingleTransfer()">
        <b>Przekaz wewnętrzny z wymianą walut</b>
      </div>
    </ng-container>
  `
})
export class TransferImporterComponent implements OnInit {

  @Input() transaction: BankTransactionToImport | null = null;
  @Input() allTransactions: BankTransactionToImport[] = [];
  @Input() allAccounts: Account[] = [];

  @Output() onTransactionCreation = new EventEmitter<TransactionCreationData>();

  otherTransactionForTransfer: BankTransactionToImport | null = null;
  otherTransactionForTransferWitConversion: BankTransactionToImport | null = null;

  ngOnInit(): void {
    const transactionToImport = this.transaction!;
    this.otherTransactionForTransfer = TransactionUtils.findTransactionCandidateForTransfer(
      this.allTransactions,
      transactionToImport,
      tti => tti.isCredit()
        && BankTransactionToImport.compareDates(tti, transactionToImport) === 0
        && tti.credit === transactionToImport.debit
        && (tti.destinationAccount?.currency || '') === (transactionToImport.sourceAccount?.currency || '')
    );
    this.otherTransactionForTransferWitConversion = TransactionUtils.findTransactionCandidateForTransfer(
      this.allTransactions,
      transactionToImport,
      tti => tti.isCredit()
        && BankTransactionToImport.compareDates(tti, transactionToImport) === 0
        && (tti.destinationAccount?.currency || '') !== (transactionToImport.sourceAccount?.currency || ''));
  }

  transactionMayBeTransfer() {
    return this.transaction?.isDebit() && this.otherTransactionForTransfer !== null;
  }

  transactionMayBeTransferWithConversion() {
    return this.transaction?.isDebit() && this.otherTransactionForTransferWitConversion !== null;
  }

  transactionMayBeSingleTransferWithConversion() {
    return this.transaction?.sourceAccount
      && this.transaction?.destinationAccount
      && this.transaction.sourceAccount.currency !== this.transaction.destinationAccount.currency;
  }

  decimal(value: number): Decimal {
    return new Decimal(value);
  }

  createTransfer(otherTransactionForTransfer: BankTransactionToImport, conversionRate = new Decimal(1)) {
    this.onTransactionCreation.emit(new TransactionCreationData(
      [this.transaction!.sourceAccount!],
      this.transaction!.sourceAccount!,
      [otherTransactionForTransfer!.destinationAccount!],
      otherTransactionForTransfer!.destinationAccount!,
      [otherTransactionForTransfer!.creditNodrigenTransactionId, this.transaction!.debitNodrigenTransactionId],
      TransactionType.TRANSFER_FROM_BANK_TRANSACTIONS,
      new Decimal(this.transaction!.debit),
      this.transaction!.description,
      conversionRate
    ));
  }

  createSingleTransfer() {
    this.onTransactionCreation.emit(new TransactionCreationData(
      [this.transaction!.sourceAccount!],
      this.transaction!.sourceAccount!,
      [this.transaction!.destinationAccount!],
      this.transaction!.destinationAccount!,
      [this.transaction!.debitNodrigenTransactionId, this.transaction!.creditNodrigenTransactionId],
      TransactionType.TRANSFER_FROM_BANK_TRANSACTIONS,
      new Decimal(this.transaction!.debit),
      this.transaction!.description,
      new Decimal((this.transaction!.credit || 0) / (this.transaction!.debit || 1))
    ));
  }
}
