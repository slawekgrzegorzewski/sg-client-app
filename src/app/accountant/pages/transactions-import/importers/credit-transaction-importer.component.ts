import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BankTransactionToImport} from '../../../../openbanking/model/nodrigen/bank-transaction-to-import';
import Decimal from 'decimal.js';
import {DatesUtils} from '../../../../general/utils/dates-utils';
import {AffectedBankTransactionsToImportInfo} from '../../../../openbanking/model/nodrigen/affected-bank-transactions-to-import-info';
import {Account} from '../../../model/account';
import {Income} from '../../../model/billings/income';
import {TransactionCreationData} from '../model/transaction-creation-data';
import {TransactionType} from '../../../model/transaction-type';


@Component({
  selector: 'app-credit-transaction-importer',
  template: `
    <ng-container *ngIf="canBeImported()">
      <div (click)="emitCreateIncomeEvent()">
        <b>Dochód</b>
      </div>
    </ng-container>
    <ng-container *ngIf="canBeCashCredit()">
      <div (click)="emitCreateTransactionEvent()">
        <b>Wpłata z konta gotówkowego</b>
      </div>
    </ng-container>
    <ng-container *ngIf="canBeCashCredit() && canBeImported()">
      <div>
        <b>Wpłata z konta gotówkowego i dochód</b>
        <div class="form-group row">
          <label for="income" class="col-4 col-form-label">Dochód</label>
          <div class="col-8">
            <input id="income" name="income" type="number" min=0 class="form-control" #currencyRate="ngModel" [(ngModel)]="income"
                   required/>
          </div>
        </div>
        <div class="form-group row">
          <label for="deposit" class="col-4 col-form-label">Wpłata</label>
          <div class="col-8">
            <input id="deposit" name="deposit" type="number" min=0 class="form-control" #currencyRate="ngModel" [(ngModel)]="deposit"
                   required/>
          </div>
        </div>
      </div>

      <button class="btn btn-sm btn-link" *ngIf="incomeAndTransactionCanBeCreated()" (click)="emitCreateIncomeAndTransactionEvent()">
        stwórz
      </button>
    </ng-container>
  `
})
export class CreditTransactionImporterComponent {
  get transactions(): BankTransactionToImport[] {
    return this._transactions;
  }

  @Input() set transactions(value: BankTransactionToImport[]) {
    this._transactions = value;
    this.prepareCreationCandidates();
  }

  _allAccounts: Account[] = [];
  get allAccounts() {
    return this._allAccounts;
  }

  @Input() set allAccounts(a: Account[]) {
    this._allAccounts = a;
  }

  get deposit(): number {
    return this._deposit;
  }

  set deposit(value: number) {
    this._deposit = value;
    this._income = this.transactions[0].credit - value;
  }

  get income(): number {
    return this._income;
  }

  set income(value: number) {
    this._income = value;
    this._deposit = this.transactions[0].credit - value;
  }

  @Output() onIncomeCreation = new EventEmitter<[Income, Account, AffectedBankTransactionsToImportInfo]>();
  @Output() onTransactionCreation = new EventEmitter<TransactionCreationData>();
  @Output() onIncomeAndTransactionCreation = new EventEmitter<{
    transaction: TransactionCreationData;
    income: [Income, Account, AffectedBankTransactionsToImportInfo]
  }>();

  private _transactions: BankTransactionToImport[] = [];
  private _incomeToCreate: Income | null = null;
  private _transactionToCreate: TransactionCreationData | null = null;
  private _income: number = 0;
  private _deposit: number = 0;


  canBeImported() {
    return this._incomeToCreate !== null;
  }

  canBeCashCredit() {
    return this._transactionToCreate !== null;
  }

  incomeAndTransactionCanBeCreated() {
    return this.canBeImported() && this.canBeCashCredit() && this.income + this.deposit === this.transactions[0].credit;
  }

  private prepareCreationCandidates() {
    this._incomeToCreate = null;

    if (this.transactions.length === 0) {
      return;
    }
    if (!this.transactions[0].isCreditOrDebitTransaction()) {
      return;
    }

    const firstTransaction = this.transactions[0];
    const accountOfFirstTransaction = this.getAccountOfTransaction(firstTransaction)!;

    this._transactionToCreate = null;
    if (this.transactions.length === 1) {
      this._transactionToCreate = new TransactionCreationData(
        this.allAccounts.filter(t => t.bankAccount === null),
        null,
        [accountOfFirstTransaction],
        accountOfFirstTransaction,
        [firstTransaction.creditNodrigenTransactionPublicId],
        TransactionType.TRANSFER_FROM_BANK_TRANSACTIONS,
        new Decimal(firstTransaction.credit),
        firstTransaction.description,
        null
      );
    }

    let amount: Decimal = new Decimal(0);
    let incomeDate = new Date();
    let description = '';

    for (let transaction of this.transactions) {
      if (!transaction.isCreditOrDebitTransaction()) {
        return;
      }
      let account = this.getAccountOfTransaction(transaction)!;
      let otherAccount = this.getOtherAccountOfTransaction(transaction)!;

      if (account.id !== accountOfFirstTransaction.id
        || accountOfFirstTransaction.currency != account.currency
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
      this._incomeToCreate.currency = accountOfFirstTransaction.currency;
      this._incomeToCreate.incomeDate = incomeDate;
    }
  }

  getAccountOfTransaction(transaction: BankTransactionToImport) {
    return transaction.isCredit() ? transaction.destinationAccount : transaction.sourceAccount;
  }

  getOtherAccountOfTransaction(transaction: BankTransactionToImport) {
    return transaction.isCredit() ? transaction.sourceAccount : transaction.destinationAccount;
  }

  emitCreateIncomeEvent() {
    this.onIncomeCreation.emit(this.prepareCreateIncomeEvent());
  }

  private prepareCreateIncomeEvent() {
    const accountOfCreatingIncome = this.getAccountOfTransaction(this.transactions[0])!;
    const affectedBankTransactionsToImportInfo = AffectedBankTransactionsToImportInfo.debitCredit(
      this.transactions.filter(t => t.isDebit()).map(t => t.debitNodrigenTransactionPublicId),
      this.transactions.filter(t => t.isCredit()).map(t => t.creditNodrigenTransactionPublicId)
    );

    const event: [Income, Account, AffectedBankTransactionsToImportInfo] = [
      this._incomeToCreate!,
      accountOfCreatingIncome,
      affectedBankTransactionsToImportInfo
    ];
    return event;
  }

  emitCreateTransactionEvent() {
    this.onTransactionCreation.emit(this._transactionToCreate!);
  }

  emitCreateIncomeAndTransactionEvent() {
    const createIncomeEvent = this.prepareCreateIncomeEvent();
    createIncomeEvent[0].amount = this.income;
    this._transactionToCreate!.amount = new Decimal(this.deposit);
    this.onIncomeAndTransactionCreation.emit({
      transaction: this._transactionToCreate!,
      income: createIncomeEvent
    });
  }
}
