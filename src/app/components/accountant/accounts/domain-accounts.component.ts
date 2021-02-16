import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Account} from '../../../model/accountant/account';
import {Button} from '../../general/hoverable-buttons.component';

@Component({
  selector: 'app-domain-accounts',
  templateUrl: './domain-accounts.component.html',
  styleUrls: ['./domain-accounts.component.css']
})
export class DomainAccountsComponent implements OnInit {
  @Input() showTitle = true;
  @Input() domain: string;
  @Input() buttons: Button<Account>[];
  @Input() selectable = true;
  @Output() selectionChanged = new EventEmitter<Account>();

  private internalAccounts: Account[];
  selectedAccount: Account;

  @Input() set accounts(value: Account[]) {
    this.internalAccounts = (value || []).sort(Account.compareByCurrencyAndName);
    this.selectAccount();
    this.recalculateSubtotals();
  }

  get accounts(): Account[] {
    return this.internalAccounts;
  }

  totalBalancesPerCurrency: Map<string, number> = new Map<string, number>();

  @ViewChild('utilBox') utilBox: ElementRef;
  overElement: Account;
  utilBoxTop: number;
  utilBoxLeft: number;
  utilBoxVisibility = 'hidden';

  constructor() {
  }

  ngOnInit(): void {
  }

  private recalculateSubtotals(): void {
    this.totalBalancesPerCurrency = (this.accounts || [])
      .reduce(
        (map, acc) => map.set(acc.currency, (map.get(acc.currency) || 0) + acc.currentBalance),
        new Map<string, number>()
      );
  }

  simpleAccountInfo(a: Account): string {
    return a.name + ' - ' + a.currentBalance + ' ' + a.currency;
  }

  private selectAccount(): void {
    if (!this.selectable) {
      return;
    }
    if (this.accounts && this.accounts.length > 0) {
      if (this.selectedAccount) {
        this.selectedAccount = this.accounts.find(a => a.id === this.selectedAccount.id);
      } else {
        this.selectedAccount = this.accounts[0];
      }
    } else {
      this.selectedAccount = null;
    }
    this.selectionChanged.emit(this.selectedAccount);
  }

  setOverAccount(value: Account, accountRow: HTMLTableRowElement): void {
    this.overElement = value;
    if (value) {
      const adjustment = (accountRow.offsetHeight - this.utilBox.nativeElement.offsetHeight) / 2;
      this.utilBoxTop = accountRow.getBoundingClientRect().top + adjustment;
      this.utilBoxLeft = accountRow.getBoundingClientRect().left + accountRow.clientWidth;
      this.utilBoxVisibility = 'visible';
    } else {
      this.utilBoxVisibility = 'hidden';
    }
  }

  select(account: Account): void {
    if (!this.selectable) {
      return;
    }
    this.selectedAccount = account;
    this.selectionChanged.emit(account);
  }

  buttonClicked(): Account {
    const acc = this.overElement;
    this.setOverAccount(null, null);
    return acc;
  }
}
