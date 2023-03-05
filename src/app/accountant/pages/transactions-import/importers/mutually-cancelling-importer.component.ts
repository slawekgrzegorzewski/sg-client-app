import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BankTransactionToImport} from '../../../../openbanking/model/nodrigen/bank-transaction-to-import';
import {TransactionUtils} from './transaction-utils';


@Component({
  selector: 'app-mutually-cancelling-importer',
  template: `
    <div *ngIf="!showConfirmation && canBeMutuallyCancelled"
         (click)="showConfirmation = true">
      <b>Transakcje znoszące się</b>
    </div>

    <ng-container *ngIf="showConfirmation">
      <div style="padding-left: 20px">
        <button class="btn btn-sm btn-link" (click)="onCancel.emit(); showConfirmation = false">Cofnij</button>
        <button class="btn btn-sm btn-link"
                (click)="onMutuallyCancel.emit([this.transactions[0]!, this.transactions[1]!]); showConfirmation = false">
          Anuluj wzajemnie
        </button>
      </div>
    </ng-container>
  `
})
export class MutuallyCancellingImporterComponent {

  get transactions(): BankTransactionToImport[] {
    return this._transactions;
  }

  @Input() set transactions(value: BankTransactionToImport[]) {
    this._transactions = value;
    this.canBeMutuallyCancelled = this.transactions.length === 2 && TransactionUtils.findTransactionCandidateForTransfer(
      [this.transactions[1]],
      this.transactions[0],
      tti => {
        const debit = this.transactions[0]!.isDebit() && tti.isCredit() && this.transactions[0]!.debit === tti.credit && this.transactions[0]!.sourceAccount?.currency === tti.destinationAccount!.currency;
        const credit = this.transactions[0]!.isCredit() && tti.isDebit() && this.transactions[0]!.credit === tti.debit && this.transactions[0]!.destinationAccount?.currency === tti.sourceAccount!.currency;
        return debit || credit;
      }
    ) === null;
  }

  @Output() onMutuallyCancel = new EventEmitter<[BankTransactionToImport, BankTransactionToImport]>();
  @Output() onCancel = new EventEmitter();

  showConfirmation = false;
  canBeMutuallyCancelled = false;
  private _transactions: BankTransactionToImport[] = [];

}
