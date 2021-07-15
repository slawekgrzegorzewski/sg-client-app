import {Component, OnInit} from '@angular/core';
import {AccountsService} from '../../../services/accountant/accounts.service';
import {ToastService} from '../../../services/toast.service';
import {Account} from '../../../model/accountant/account';
import {LoginService} from '../../../services/login.service';
import {TransactionsService} from '../../../services/accountant/transations.service';
import {Transaction} from '../../../model/accountant/transaction';
import {take} from 'rxjs/operators';
import {DomainService} from '../../../services/domain.service';
import {ComparatorBuilder} from '../../../../utils/comparator-builder';

@Component({
  selector: 'app-accounts-history',
  templateUrl: './accounts-history.component.html',
  styleUrls: ['./accounts-history.component.css']
})
export class AccountsHistoryComponent implements OnInit {

  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  allTransactions: Transaction[] = [];
  transactionsOfSelectedAccount: Transaction[] = [];
  currentDomainName: string = '';

  private static areAccountsEqual(a: Account | null, b: Account | null): boolean {
    if (!a || !b) {
      return false;
    }
    return a.id === b.id;
  }

  constructor(private accountsService: AccountsService,
              private transactionsService: TransactionsService,
              private toastService: ToastService,
              private domainService: DomainService) {
  }

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.fetchAccounts();
    this.fetchTransactions();
    this.currentDomainName = this.domainService.currentDomain?.name || '';
  }

  fetchAccounts(): void {
    this.accountsService.currentDomainAccounts().subscribe(
      data => this.accounts = data.sort(
        ComparatorBuilder.comparing<Account>(a => a.currency).thenComparing(a => a.name).build()
      ),
      error => this.accounts = []
    );
  }

  fetchTransactions(): void {
    this.transactionsService.domainTransactions().subscribe(
      data => {
        this.allTransactions = data;
        this.transactionsOfSelectedAccount = this.filterTransactionsForSelectedAccount();
      },
      error => {
        this.toastService.showWarning('Could not obtain transactions information.');
        this.allTransactions = [];
        this.transactionsOfSelectedAccount = [];
      }
    );
  }

  private filterTransactionsForSelectedAccount(): Transaction[] {
    if (!this.selectedAccount) {
      return [];
    }
    if (!this.allTransactions) {
      return [];
    }
    return this.allTransactions
      .filter(t => this.isTransactionRelatedToSelectedAccount(t))
      .sort((a, b) => a.timeOfTransaction.getTime() - b.timeOfTransaction.getTime());
  }

  private isTransactionRelatedToSelectedAccount(t: Transaction): boolean {
    return AccountsHistoryComponent.areAccountsEqual(t.source, this.selectedAccount)
      || AccountsHistoryComponent.areAccountsEqual(t.destination, this.selectedAccount);
  }

  selectAccount(account: Account | null): void {
    this.selectedAccount = account;
    this.transactionsOfSelectedAccount = this.filterTransactionsForSelectedAccount();
  }
}
