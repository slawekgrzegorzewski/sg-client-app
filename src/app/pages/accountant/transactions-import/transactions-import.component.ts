import {Component, OnInit} from '@angular/core';
import {NodrigenService} from '../../../services/banks/nodrigen.service';
import {BankTransactionToImport} from '../../../model/banks/nodrigen/bank-transaction-to-import';
import {ComparatorBuilder} from '../../../utils/comparator-builder';
import {Expense} from '../../../model/accountant/billings/expense';
import {PiggyBank} from '../../../model/accountant/piggy-bank';
import {Income} from '../../../model/accountant/billings/income';
import {forkJoin, Observable} from 'rxjs';
import {BillingPeriodsService} from '../../../services/accountant/billing-periods.service';
import {PiggyBanksService} from '../../../services/accountant/piggy-banks.service';
import {Account} from '../../../model/accountant/account';
import {DatesUtils} from '../../../utils/dates-utils';


export type ImportMode = 'DEBIT' | 'CREDIT' | 'TRANSFER' | 'MUTUALLY_CANCELLING';

@Component({
  selector: 'app-transactions-import',
  templateUrl: './transactions-import.component.html',
  styleUrls: ['./transactions-import.component.css']
})
export class TransactionsImportComponent implements OnInit {

  transactionsToImport: BankTransactionToImport[] = [];
  transactionToImport: BankTransactionToImport | null = null;
  otherTransactionForTransfer: BankTransactionToImport | null = null;
  private _importMode: ImportMode | null = null;
  get importMode(): ImportMode | null {
    return this._importMode;
  }

  set importMode(value: ImportMode | null) {
    this._importMode = value;
    if (this.importMode === 'DEBIT') {
      this.elementToCreate = new Expense();
      this.elementToCreate.amount = this.transactionToImport!.debit;
      this.elementToCreate.expenseDate = this.transactionToImport!.timeOfTransaction;
      this.elementToCreate.description = this.transactionToImport!.description;
    } else if (this.importMode === 'CREDIT') {
      this.elementToCreate = new Income();
      this.elementToCreate.amount = this.transactionToImport!.credit;
      this.elementToCreate.incomeDate = this.transactionToImport!.timeOfTransaction;
      this.elementToCreate.description = this.transactionToImport!.description;
    }
  }

  elementToCreate: Income | Expense | null = null;

  constructor(private billingsService: BillingPeriodsService,
              private nodrigenService: NodrigenService,
              private piggyBanksService: PiggyBanksService) {
  }

  ngOnInit(): void {
    this.refreshData();
  }


  private refreshData() {
    this.elementToCreate = null;
    this.importMode = null;
    this.transactionToImport = null;
    this.nodrigenService.getNodrigenTransactionsToImport()
      .subscribe(data => this.transactionsToImport =
        data.sort(ComparatorBuilder.comparingByDateDays<BankTransactionToImport>(btti => btti.timeOfTransaction)
          .thenComparing(btti => btti.debit).thenComparing(btti => btti.credit).build()));
  }

  select(transactionToImport: BankTransactionToImport): void {
    this.transactionToImport = transactionToImport;
  }

  transactionMayBeDebit(transaction: BankTransactionToImport | null) {
    return transaction && transaction.sourceAccount !== null && transaction.destinationAccount === null
      && !this.transactionMayBeTransfer(transaction);
  }

  transactionMayBeCredit(transaction: BankTransactionToImport | null) {
    return transaction && transaction.destinationAccount !== null && transaction.sourceAccount === null
      && !this.transactionMayBeTransfer(transaction);
  }

  transactionMayBeTransfer(transaction: BankTransactionToImport | null) {
    if (transaction && transaction.sourceAccount !== null && transaction.destinationAccount === null) {
      this.otherTransactionForTransfer = this.findTransactionCandidateForTransfer(
        btti => btti.credit, transaction.debit, transaction.timeOfTransaction);
    }
    if (transaction && transaction.destinationAccount !== null && transaction.sourceAccount === null) {
      this.otherTransactionForTransfer = this.findTransactionCandidateForTransfer(
        btti => btti.debit, transaction.credit, transaction.timeOfTransaction);
    }
    return this.otherTransactionForTransfer !== null;
  }

  findTransactionCandidateForTransfer(amountExtractor: (btti: BankTransactionToImport) => number,
                                      amount: number,
                                      date: Date): BankTransactionToImport | null {
    return this.transactionsToImport
      .find(tti => amountExtractor(tti) === amount && DatesUtils.compareDatesOnly(tti.timeOfTransaction, date) === 0) || null;
  }

  createElement(
    elementToCreate: Income | Expense | null,
    accountIdForElement: number | null,
    piggyBankToUpdate: PiggyBank | null = null): void {

    if (!elementToCreate || !accountIdForElement) {
      return;
    }

    const requests: Observable<any>[] = [
      this.billingsService.createBillingElementWithImportingBankTransaction(elementToCreate, accountIdForElement, this.transactionToImport!)
    ];
    if (piggyBankToUpdate) {
      requests.push(this.piggyBanksService.update(piggyBankToUpdate));
    }
    forkJoin(requests)
      .subscribe({
        next: (success: any) => this.refreshData(),
        error: (error: any) => this.refreshData()
      });
  }

  getAccountForBillingElement(): Account | null {
    if (this.importMode === 'DEBIT') {
      return this.transactionToImport!.sourceAccount || null;
    }
    return this.transactionToImport!.destinationAccount || null;

  }

  cancelMutualCancellation() {
    this.transactionToImport = null;
    this.otherTransactionForTransfer = null;
    this.importMode = null;
  }

  mutuallyCancelBothTransactions() {
    if (this.transactionToImport !== null && this.otherTransactionForTransfer !== null) {
      this.nodrigenService.mutuallyCancelTransactions(this.transactionToImport, this.otherTransactionForTransfer).subscribe(
        data => this.cancelMutualCancellation()
      );
    }
  }
}
