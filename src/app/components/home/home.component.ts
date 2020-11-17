import {Component, OnInit} from '@angular/core';
import {AccountsService} from '../../services/accounts.service';
import {ToastService} from '../../services/toast.service';
import {Account} from '../../model/account';
import {LoginService} from '../../services/login.service';
import {NgEventBus} from 'ng-event-bus';
import {Events} from '../../model/events';

@Component({
  selector: 'app-accounts',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private internalAccounts: Account[];
  selectedAccount: Account;

  get accounts(): Account[] {
    return this.internalAccounts;
  }

  set accounts(value: Account[]) {
    this.internalAccounts = value;
  }

  constructor(private accountsService: AccountsService,
              private toastService: ToastService,
              public loginService: LoginService,
              private eventBus: NgEventBus) {
  }


  ngOnInit(): void {
    this.fetchAccounts();
    this.eventBus.on(Events.TRANSACTIONS_CHANGED).subscribe((message) => this.fetchAccounts());
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
}
