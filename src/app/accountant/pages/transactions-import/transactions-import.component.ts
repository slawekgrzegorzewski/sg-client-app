import {Component, HostListener, OnInit} from '@angular/core';
import {NodrigenService} from '../../../openbanking/services/nodrigen.service';
import {BankTransactionToImport} from '../../../openbanking/model/nodrigen/bank-transaction-to-import';
import {ComparatorBuilder} from '../../../general/utils/comparator-builder';
import {Expense} from '../../model/billings/expense';
import {PiggyBank} from '../../model/piggy-bank';
import {Income} from '../../model/billings/income';
import {BillingPeriodsService} from '../../services/billing-periods.service';
import {PiggyBanksService} from '../../services/piggy-banks.service';
import {Account} from '../../model/account';
import {NgEventBus} from 'ng-event-bus';
import {TRANSACTIONS_TO_IMPORT_CHANGED} from '../../../general/utils/event-bus-events';
import {AccountsService} from '../../services/accounts.service';
import {forkJoin} from 'rxjs';
import {AffectedBankTransactionsToImportInfo} from '../../../openbanking/model/nodrigen/affected-bank-transactions-to-import-info';
import {BillingElementType} from '../../components/billing-periods/create-billing-element.component';
import {TransactionCreationData} from './model/transaction-creation-data';


export type ImportMode =
  'DEBIT'
  | 'CREDIT'
  | 'TRANSFER'
  | 'MUTUALLY_CANCELLING'
  | 'CASH_WITHDRAWAL'
  | 'TRANSFER_WITH_CONVERSION'
  | 'SINGLE_TRANSFER_WITH_CONVERSION'
  | 'IGNORE';

@Component({
  selector: 'app-transactions-import',
  templateUrl: './transactions-import.component.html',
  styleUrls: ['./transactions-import.component.css']
})
export class TransactionsImportComponent implements OnInit {

  allAccounts: Account[] = [];
  transactions: BankTransactionToImport[] = [];
  selectedTransactions: BankTransactionToImport[] = [];

  billingElementToCreate: Income | Expense | null = null;
  accountOfBillingElementToCreate: Account | null = null;
  billingElementToCreateType: BillingElementType | null = null;
  private affectedBankTransactionsInfo: AffectedBankTransactionsToImportInfo | null = null;

  transactionCreationData: TransactionCreationData | null = null;

  constructor(private accountsService: AccountsService,
              private billingsService: BillingPeriodsService,
              private nodrigenService: NodrigenService,
              private piggyBanksService: PiggyBanksService,
              private eventBus: NgEventBus) {
    this.eventBus.on(TRANSACTIONS_TO_IMPORT_CHANGED).subscribe(md => this.refreshData());
  }

  ngOnInit(): void {
    this.refreshData();
  }

  private refreshData() {
    this.showListOfTransactions();
    forkJoin([this.accountsService.currentDomainAccounts(), this.nodrigenService.getNodrigenTransactionsToImport()])
      .subscribe(([accounts, bankTransactionsToImport]: [Account[], BankTransactionToImport[]]) => {
        this.allAccounts = accounts;
        this.transactions = bankTransactionsToImport.sort(ComparatorBuilder.comparingByDateDays<BankTransactionToImport>(btti => btti.timeOfTransaction)
          .thenComparing(btti => btti.debit).thenComparing(btti => btti.credit).build());
      });
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case 'Escape':
        if (!this.shouldShowListOfImportOptions()) {
          this.showOptionsOfImporting();
        } else if (this.shouldShowListOfImportOptions()) {
          this.showListOfTransactions();
        }
        break;
    }
  }

  shouldShowListOfImportOptions() {
    return this.selectedTransactions.length > 0 && !this.billingElementToCreate && !this.transactionCreationData;
  }

  showListOfTransactions() {
    this.showOptionsOfImporting();
    this.selectedTransactions = [];
  }

  showOptionsOfImporting() {
    this.billingElementToCreate = null;
    this.accountOfBillingElementToCreate = null;
    this.billingElementToCreateType = null;
    this.affectedBankTransactionsInfo = null;
    this.transactionCreationData = null;
  }

  showBillingElementCreation(billingElementToCreate: Expense | Income, account: Account, affectedBankTransactionsInfo: AffectedBankTransactionsToImportInfo) {
    this.billingElementToCreate = billingElementToCreate;
    this.accountOfBillingElementToCreate = account;
    this.billingElementToCreateType = billingElementToCreate instanceof Expense ? 'expense' : 'income';
    this.affectedBankTransactionsInfo = affectedBankTransactionsInfo;
  }

  showTransactionCreation(transactionCreationData: TransactionCreationData) {
    this.transactionCreationData = transactionCreationData;
  }

  createElement(
    elementToCreate: Income | Expense | null,
    accountIdForElement: number | null,
    piggyBankToUpdate: PiggyBank | null = null): void {

    if (!elementToCreate || !accountIdForElement) {
      this.showOptionsOfImporting();
      return;
    }

    this.billingsService.createBillingElementWithImportingBankTransaction(elementToCreate, accountIdForElement, this.affectedBankTransactionsInfo!)
      .subscribe({
        next: (success) => {
          if (piggyBankToUpdate) {
            this.piggyBanksService.update(piggyBankToUpdate).subscribe({
              next: () => this.refreshData(),
              error: () => this.refreshData()
            });
          } else {
            this.refreshData();
          }
        },
        error: (error) => this.refreshData()
      });
  }

  mutuallyCancelBothTransactions(first: BankTransactionToImport, second: BankTransactionToImport) {
    this.nodrigenService.mutuallyCancelTransactions(first, second).subscribe();
  }

  ignore(transactions: BankTransactionToImport[]) {
    this.nodrigenService.ignoreTransactions(transactions).subscribe();
  }

  isTransactionSelected(transaction: BankTransactionToImport) {
    return this.selectedTransactions.includes(transaction);
  }

  selectTransaction(transaction: BankTransactionToImport) {
    this.selectedTransactions = [...this.selectedTransactions, transaction];
  }

  unselectTransaction(transaction: BankTransactionToImport) {
    this.selectedTransactions = this.selectedTransactions.filter(t => t.id !== transaction.id);
  }

  changeSelectionOfTransaction(transaction: BankTransactionToImport) {
    if (this.isTransactionSelected(transaction)) {
      this.unselectTransaction(transaction);
    } else {
      this.selectTransaction(transaction);
    }

  }
}
