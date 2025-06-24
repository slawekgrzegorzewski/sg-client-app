import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BankTransactionToImport} from '../../../../openbanking/model/go-cardless/bank-transaction-to-import';
import {TransactionUtils} from "./transaction-utils";


@Component({
  selector: 'app-ignore-importer',
  template: `
      <ng-container *ngIf="!showConfirmation && canBeIgnored">
          <div (click)="showConfirmation = true">
              <b>Ignoruj tą transakcję</b>
          </div>
      </ng-container>

      <ng-container *ngIf="showConfirmation">
          <div>Na pewno zignorwać tą transakcję</div>
          <button class="btn btn-sm btn-link" (click)="onCancel.emit(); showConfirmation = false;">Nie</button>
          <button class="btn btn-sm btn-link" (click)="onIgnore.emit(transactions); showConfirmation = false;">Tak
          </button>
      </ng-container>
  `
})
export class IgnoreImporterComponent {

  get transactions(): BankTransactionToImport[] {
    return this._transactions;
  }

  @Input() set transactions(value: BankTransactionToImport[]) {
    this._transactions = value;
    this.canBeIgnored = this.transactions.find(t => !t.isEmpty()) === undefined;
  }

  @Output() onIgnore = new EventEmitter<BankTransactionToImport[]>();
  @Output() onCancel = new EventEmitter();

  showConfirmation = false;
  canBeIgnored = false;
  private _transactions: BankTransactionToImport[] = [];

}
