import {Component, OnDestroy, OnInit} from '@angular/core';
import {AccountsService} from '../../../services/accountant/accounts.service';
import {ToastService} from '../../../services/toast.service';
import {Account} from '../../../model/accountant/account';
import {TransactionsService} from '../../../services/accountant/transations.service';
import {Transaction} from '../../../model/accountant/transaction';
import {ComparatorBuilder} from '../../../utils/comparator-builder';
import {ActivatedRoute, Router} from '@angular/router';
import {DomainService} from '../../../services/domain.service';
import {Subscription} from 'rxjs';

export const ACCOUNTANT_HISTORY_ROUTER_URL = 'accounts-history';

@Component({
  selector: 'app-accounts-history',
  templateUrl: './accounts-history.component.html',
  styleUrls: ['./accounts-history.component.css']
})
export class AccountsHistoryComponent implements OnInit, OnDestroy {

  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  allTransactions: Transaction[] = [];
  transactionsOfSelectedAccount: Transaction[] = [];

  domainSubscription: Subscription | null = null;

  private static areAccountsEqual(a: Account | null, b: Account | null): boolean {
    if (!a || !b) {
      return false;
    }
    return a.id === b.id;
  }

  constructor(private accountsService: AccountsService,
              private transactionsService: TransactionsService,
              private toastService: ToastService,
              private router: Router,
              private route: ActivatedRoute,
              private domainService: DomainService) {
    this.domainService.registerToDomainChangesViaRouterUrl(ACCOUNTANT_HISTORY_ROUTER_URL, this.route);
    this.domainSubscription = this.domainService.onCurrentDomainChange.subscribe((domain) => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    this.refreshData();
  }

  ngOnDestroy(): void {
    if (this.domainSubscription) {
      this.domainSubscription.unsubscribe();
    }
    this.domainService.deregisterFromDomainChangesViaRouterUrl(ACCOUNTANT_HISTORY_ROUTER_URL);
  }

  refreshData(): void {
    this.fetchAccounts();
    this.fetchTransactions();
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
