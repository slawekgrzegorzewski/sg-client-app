import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BankTransactionToImport} from '../../../../openbanking/model/nodrigen/bank-transaction-to-import';


@Component({
  selector: 'app-ignore-importer',
  template: `
    <ng-container *ngIf="!showConfirmation && transactionMayBeIgnored()">
      <div (click)="showConfirmation = true">
        <b>Ignoruj tą transakcję</b>
      </div>
    </ng-container>

    <ng-container *ngIf="showConfirmation">
      <div>Na pewno zignorwać tą transakcję</div>
      <button class="btn btn-sm btn-link" (click)="onCancel.emit(); showConfirmation = false;">Nie</button>
      <button class="btn btn-sm btn-link" (click)="onIgnore.emit(transaction!); showConfirmation = false;">Tak</button>
    </ng-container>
  `
})
export class IgnoreImporterComponent {

  @Input() transaction: BankTransactionToImport | null = null;

  @Output() onIgnore = new EventEmitter<BankTransactionToImport>();
  @Output() onCancel = new EventEmitter();

  showConfirmation = false;

  transactionMayBeIgnored() {
    return this.transaction?.isDebit() || this.transaction?.isCredit() || false;
  }
}
