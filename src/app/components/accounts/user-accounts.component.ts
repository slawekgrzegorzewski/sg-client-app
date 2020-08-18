import {Component, Input, OnInit} from '@angular/core';
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

  private _accounts: Account[];
  @Input() set accounts(value: Account[]) {
    this._accounts = value;
    this.totalBalancesPerCurrency = (this.accounts || [])
      .reduce(
        (map, acc) => map.set(acc.currency, (map.get(acc.currency) || 0) + acc.currentBalance),
        new Map<string, number>()
      )
  }

  get accounts(): Account[] {
    return this._accounts;
  }

  totalBalancesPerCurrency: Map<string, number>
  _overElement: Account;
  get overElement(): Account {
    return this._overElement;
  }

  set overElement(value: Account) {
    this._overElement = value;
  }
  a(value: Account) {
    this._overElement = value;
  }


  constructor() {
  }

  ngOnInit() {
  }

  simpleAccountInfo(a: Account) {
    return a.name + ' - ' + a.currentBalance + ' ' + a.currency;
  }

  firstEntry() {
    let next = Array.from(this.totalBalancesPerCurrency.entries())[0];
    return next;
  }

  restOfEntries() {
    let next = Array.from(this.totalBalancesPerCurrency.entries()).slice(1);
    return next;
  }
}
