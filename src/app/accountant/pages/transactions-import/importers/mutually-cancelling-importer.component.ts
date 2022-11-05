import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BankTransactionToImport} from '../../../../openbanking/model/nodrigen/bank-transaction-to-import';
import {TransactionUtils} from './transaction-utils';


@Component({
  selector: 'app-mutually-cancelling-importer',
  template: `

    <div *ngIf="!showConfirmation && transactionMayBeMutuallyCancellation()"
         (click)="showConfirmation = true">
      <b>Transakcje znoszące się</b>
    </div>

    <ng-container *ngIf="showConfirmation">
      <div style="padding-left: 20px">
        <app-transactions-row [transactionToImport]="otherTransaction"></app-transactions-row>
        <button class="btn btn-sm btn-link" (click)="onCancel.emit(); showConfirmation = false">Cofnij</button>
        <button class="btn btn-sm btn-link"
                (click)="onMutuallyCancel.emit([this.transaction!, this.otherTransaction!]); showConfirmation = false">Anuluj wzajemnie
        </button>
      </div>
    </ng-container>
  `
})
export class MutuallyCancellingImporterComponent implements OnInit {

  @Input() transaction: BankTransactionToImport | null = null;
  @Input() allTransactions: BankTransactionToImport[] = [];
  otherTransaction: BankTransactionToImport | null = null;

  @Output() onMutuallyCancel = new EventEmitter<[BankTransactionToImport, BankTransactionToImport]>();
  @Output() onCancel = new EventEmitter();

  showConfirmation = false;

  ngOnInit(): void {

    const transactionToImport = this.transaction!;
    this.otherTransaction = TransactionUtils.findTransactionCandidateForTransfer(
      this.allTransactions,
      transactionToImport,
      tti => {
        const debit = transactionToImport.isDebit() && tti.isCredit() && transactionToImport.debit === tti.credit && transactionToImport.sourceAccount?.currency === tti.destinationAccount!.currency;
        const credit = transactionToImport.isCredit() && tti.isDebit() && transactionToImport.credit === tti.debit && transactionToImport.destinationAccount?.currency === tti.sourceAccount!.currency;
        return debit || credit;
      }
    );
  }

  transactionMayBeMutuallyCancellation() {
    return this.otherTransaction !== null;
  }
}
