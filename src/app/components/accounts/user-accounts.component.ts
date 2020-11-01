import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Account} from '../../model/account';
import {Button} from '../gui/hoverable-buttons.component';

@Component({
  selector: 'app-user-accounts',
  templateUrl: './user-accounts.component.html',
  styleUrls: ['./user-accounts.component.css']
})
export class UserAccountsComponent implements OnInit {
  @Input() showTitle = true;
  @Input() userName: string;
  @Input() buttons: Button<Account>[];
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

  simpleAccountInfo(a: Account): string {
    return a.name + ' - ' + a.currentBalance + ' ' + a.currency;
  }

  private selectAccount(): void {
    if (!this.accounts || this.accounts.length === 0 || !this.selectedAccount) {
      this.selectedAccount = null;
    }
    if (this.selectedAccount) {
      this.selectedAccount = this.accounts.find(a => a.id === this.selectedAccount.id);
    }
    if (!this.selectedAccount && this.accounts && this.accounts.length > 0) {
      this.selectedAccount = this.accounts[0];
      this.selectionChanged.emit(this.selectedAccount);
    }
  }

  private recalculateSubtotals(): void {
    this.totalBalancesPerCurrency = (this.accounts || [])
      .reduce(
        (map, acc) => map.set(acc.currency, (map.get(acc.currency) || 0) + acc.currentBalance),
        new Map<string, number>()
      );
  }

  firstEntry(): [string, number] {
    return Array.from(this.totalBalancesPerCurrency.entries())[0];
  }

  restOfEntries(): [string, number][] {
    return Array.from(this.totalBalancesPerCurrency.entries()).slice(1);
  }

  setOverAccount(value: Account, accountRow: HTMLTableRowElement): void {
    this.overElement = value;
    if (value) {
      const adjustment = (accountRow.offsetHeight - this.utilBox.nativeElement.offsetHeight) / 2;
      this.utilBoxTop = accountRow.getBoundingClientRect().top + adjustment;
      this.utilBoxLeft = accountRow.getBoundingClientRect().left + accountRow.clientWidth - this.utilBox.nativeElement.offsetWidth;
      this.utilBoxVisibility = 'visible';
    } else {
      this.utilBoxVisibility = 'hidden';
    }
  }

  buttonClicked(): Account {
    const acc = this.overElement;
    this.setOverAccount(null, null);
    return acc;
  }
}
