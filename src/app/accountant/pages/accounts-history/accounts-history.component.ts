import {Component, OnDestroy, OnInit} from '@angular/core';
import {AccountsService} from '../../services/accounts.service';
import {ToastService} from '../../../general/services/toast.service';
import {Account} from '../../model/account';
import {TransactionsService} from '../../services/transations.service';
import {Transaction} from '../../model/transaction';
import {ComparatorBuilder} from '../../../general/utils/comparator-builder';
import {ActivatedRoute, Router} from '@angular/router';
import {DomainService} from '../../../general/services/domain.service';
import {Subscription} from 'rxjs';
import {SELECTED_DOMAIN_CHANGED} from '../../../general/utils/event-bus-events';
import {NgEventBus} from 'ng-event-bus';


export const ACCOUNTANT_HISTORY_ROUTER_URL = 'accounts-history';

@Component({
  selector: 'app-accounts-history',
  templateUrl: './accounts-history.component.html',
  styleUrls: ['./accounts-history.component.css']
})
export class AccountsHistoryComponent implements OnInit, OnDestroy {

  selectedAccount: Account | null = null;
  allTransactions: Transaction[] = [];

  transactionsOfSelectedAccount: Transaction[] = [];

  domainSubscription: Subscription | null = null;

  constructor(private accountsService: AccountsService,
              private transactionsService: TransactionsService,
              private toastService: ToastService,
              private router: Router,
              private route: ActivatedRoute,
              private domainService: DomainService,
              private eventBus: NgEventBus) {
    this.domainService.registerToDomainChangesViaRouterUrl(ACCOUNTANT_HISTORY_ROUTER_URL, this.route);
    this.domainSubscription = this.eventBus.on(SELECTED_DOMAIN_CHANGED).subscribe((domain) => {
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
    this.fetchTransactions();
  }

  fetchTransactions(): void {
    this.transactionsService.domainTransactions().subscribe(
      (transactions) => {
        this.allTransactions = transactions;
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
      .filter(t => this.isTransactionRelatedToSelectedAccount(t.source, t.destination))
      .sort((a, b) => a.timeOfTransaction.getTime() - b.timeOfTransaction.getTime());
  }

  private isTransactionRelatedToSelectedAccount(source: any, destiantion: any): boolean {
    return Account.areAccountsEqual(source, this.selectedAccount)
      || Account.areAccountsEqual(destiantion, this.selectedAccount);
  }

  selectAccount(account: Account | null): void {
    this.selectedAccount = account;
    this.transactionsOfSelectedAccount = this.filterTransactionsForSelectedAccount();
  }
}
