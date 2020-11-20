import {Component, OnInit} from '@angular/core';
import {AccountsService} from '../../services/accounts.service';
import {ToastService} from '../../services/toast.service';
import {Account} from '../../model/account';
import {LoginService} from '../../services/login.service';
import {NgEventBus} from 'ng-event-bus';
import {Events} from '../../model/events';
import {PiggyBanksService} from '../../services/piggy-banks.service';
import {PiggyBank} from '../../model/piggy-bank';

@Component({
  selector: 'app-accounts',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private internalAccounts: Account[];

  get accounts(): Account[] {
    return this.internalAccounts;
  }

  set accounts(value: Account[]) {
    this.internalAccounts = value;
  }

  piggyBanks: PiggyBank[];
  selectedAccount: Account;
  showTransactions = false;

  private accountsTotal: Map<string, number> = new Map<string, number>();
  piggyBanksTotal: Map<string, number> = new Map<string, number>();

  accountCurrencyExtractor = (acc: Account) => acc.currency;
  accountBalanceExtractor = (acc: Account) => acc.currentBalance;
  piggyBankCurrencyExtractor = (pg: PiggyBank) => pg.currency;
  piggyBankBalanceExtractor = (pg: PiggyBank) => pg.balance;

  constructor(private accountsService: AccountsService,
              private piggyBanksService: PiggyBanksService,
              private toastService: ToastService,
              public loginService: LoginService,
              private eventBus: NgEventBus) {
  }


  ngOnInit(): void {
    this.fetchAccounts();
    this.fetchPiggyBanks();
    this.eventBus.on(Events.TRANSACTIONS_CHANGED).subscribe((message) => this.fetchAccounts());
    this.eventBus.on(Events.PIGGY_BANK_CHANGED).subscribe((message) => this.fetchPiggyBanks());
  }

  fetchAccounts(): void {
    this.accountsService.currentUserAccounts().subscribe(
      data => this.accounts = data.sort(Account.compareByCurrencyAndName),
      error => {
        this.toastService.showWarning('Could not obtain accounts information, retrying');
        this.accounts = [];
        setTimeout(() => this.fetchAccounts(), 100);
      }
    );
  }

  private fetchPiggyBanks(): void {
    this.piggyBanksService.getAllPiggyBanks().subscribe(data => this.piggyBanks = data);
  }
}
