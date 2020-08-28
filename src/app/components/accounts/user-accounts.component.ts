import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Account} from "../../model/account";
import {Button} from "../gui/hoverable-buttons.component";

@Component({
  selector: 'user-accounts',
  templateUrl: './user-accounts.component.html',
  styleUrls: ['./user-accounts.component.css']
})
export class UserAccountsComponent implements OnInit {
  @Input() showTitle: boolean = true
  @Input() userName: string
  @Input() buttons: Button<Account>[];
  @Input() selectedAccount: Account;
  @Output() selectionChanged = new EventEmitter<Account>();

  private _accounts: Account[];

  @Input() set accounts(value: Account[]) {
    this._accounts = (value || []).sort(Account.compareByCurrencyAndName);
    this.recalculateSubtotals();
  }

  get accounts(): Account[] {
    return this._accounts;
  }

  totalBalancesPerCurrency: Map<string, number> = new Map<string, number>()

  @ViewChild('utilBox') utilBox: ElementRef;
  overElement: Account;
  utilBoxTop: number;
  utilBoxLeft: number;
  utilBoxVisibility: string = 'hidden';

  constructor() {
  }

  ngOnInit() {
  }

  simpleAccountInfo(a: Account) {
    return a.name + ' - ' + a.currentBalance + ' ' + a.currency;
  }

  private recalculateSubtotals() {
    this.totalBalancesPerCurrency = (this.accounts || [])
      .reduce(
        (map, acc) => map.set(acc.currency, (map.get(acc.currency) || 0) + acc.currentBalance),
        new Map<string, number>()
      )
  }

  firstEntry() {
    let next = Array.from(this.totalBalancesPerCurrency.entries())[0];
    return next;
  }

  restOfEntries() {
    let next = Array.from(this.totalBalancesPerCurrency.entries()).slice(1);
    return next;
  }

  setOverAccount(value: Account, accountRow: HTMLTableRowElement) {
    this.overElement = value;
    if (value) {
      var adjustment = (accountRow.offsetHeight - this.utilBox.nativeElement.offsetHeight) / 2;
      this.utilBoxTop = accountRow.getBoundingClientRect().top + adjustment;
      this.utilBoxLeft = accountRow.getBoundingClientRect().left + accountRow.clientWidth - this.utilBox.nativeElement.offsetWidth;
      this.utilBoxVisibility = 'visible'
    } else {
      this.utilBoxVisibility = 'hidden'
    }
  }

  buttonClicked() {
    let acc = this.overElement;
    this.setOverAccount(null, null);
    return acc;
  }
}
