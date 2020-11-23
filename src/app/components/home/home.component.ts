import {Component, OnInit} from '@angular/core';
import {AccountsService} from '../../services/accounts.service';
import {ToastService} from '../../services/toast.service';
import {Account} from '../../model/account';
import {LoginService} from '../../services/login.service';
import {NgEventBus} from 'ng-event-bus';
import {Events} from '../../model/events';
import {PiggyBanksService} from '../../services/piggy-banks.service';
import {PiggyBank} from '../../model/piggy-bank';
import {TransactionsService} from '../../services/transations.service';
import {Transaction} from '../../model/transaction';
import {Currency} from '../../model/currency';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-accounts',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  accounts: Account[];
  selectedAccount: Account;
  showTransactions = false;
  allTransactions: Transaction[];
  transactionsOfSelectedAccount: Transaction[];
  piggyBanks: PiggyBank[];

  accountCurrencyExtractor = (acc: Account) => acc.currency;
  accountBalanceExtractor = (acc: Account) => acc.currentBalance;
  piggyBankCurrencyExtractor = (pg: PiggyBank) => pg.currency;
  piggyBankBalanceExtractor = (pg: PiggyBank) => pg.balance;

  constructor(private accountsService: AccountsService,
              private transactionsService: TransactionsService,
              private piggyBanksService: PiggyBanksService,
              private toastService: ToastService,
              public loginService: LoginService,
              private eventBus: NgEventBus) {
  }


  ngOnInit(): void {
    this.refreshData();
    this.accountsService.possibleCurrencies()
      .pipe(map(data => data.sort((a, b) => a.code.localeCompare(b.code))));
    this.eventBus.on(Events.TRANSACTIONS_CHANGED).subscribe((message) => this.fetchAccounts());
    this.eventBus.on(Events.PIGGY_BANK_CHANGED).subscribe((message) => this.fetchPiggyBanks());
  }

  refreshData(): void {
    this.fetchAccounts();
    this.fetchTransactions();
    this.fetchPiggyBanks();
  }

  fetchAccounts(): void {
    this.accounts = [];
    this.selectAccount(null);
    this.accountsService.currentUserAccounts().subscribe(
      data => {
        this.accounts = data.sort(Account.compareByCurrencyAndName);
      }
    );
  }

  fetchTransactions(): void {
    this.transactionsService.userTransactions().subscribe(
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
    return this.areAccountsEqual(t.source, this.selectedAccount) || this.areAccountsEqual(t.destination, this.selectedAccount);
  }

  private areAccountsEqual(a: Account, b: Account): boolean {
    if (!a || !b) {
      return false;
    }
    return a.id === b.id;
  }

  private fetchPiggyBanks(): void {
    this.piggyBanksService.getAllPiggyBanks().subscribe(data => {
      this.piggyBanks = data.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  selectAccount(account: Account): void {
    this.selectedAccount = account;
    this.filterTransactionsForSelectedAccount();
  }
}
