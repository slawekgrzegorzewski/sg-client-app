import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Account} from '../../../model/accountant/account';
import {Button} from '../../general/hoverable-buttons.component';
import {ComparatorBuilder} from '../../../../utils/comparator-builder';

@Component({
  selector: 'app-domain-accounts',
  templateUrl: './domain-accounts.component.html',
  styleUrls: ['./domain-accounts.component.css']
})
export class DomainAccountsComponent implements OnInit {
  @Input() showTitle = true;
  @Input() domain: string | null = null;
  @Input() buttons: Button<Account>[] = [];
  @Input() selectable = true;
  @Output() selectionChanged = new EventEmitter<Account | null>();

  private internalAccounts: Account[] = [];
  selectedAccount: Account | null = null;

  @Input() set accounts(value: Account[]) {
    this.internalAccounts = value.sort(
      ComparatorBuilder.comparing<Account>(a => a.currency).thenComparing(a => a.name).build()
    );
    this.selectAccount();
    this.recalculateSubtotals();
  }

  get accounts(): Account[] {
    return this.internalAccounts;
  }

  totalBalancesPerCurrency: Map<string, number> = new Map<string, number>();

  @ViewChild('utilBox') utilBox: ElementRef | null = null;
  overElement: Account | null = null;
  utilBoxTop: number = 0;
  utilBoxLeft: number = 0;
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
        this.selectedAccount = this.accounts.find(a => a.id === this.selectedAccount?.id) || null;
      } else {
        this.selectedAccount = this.accounts[0];
      }
    } else {
      this.selectedAccount = null;
    }
    this.selectionChanged.emit(this.selectedAccount);
  }

  setOverAccount(selectionInfo?: { account: Account, row: HTMLTableRowElement }): void {
    if (!selectionInfo) {
      this.overElement = null;
      this.utilBoxVisibility = 'hidden';
    } else {
      this.overElement = selectionInfo.account;
      const adjustment = (selectionInfo.row.offsetHeight - this.utilBox?.nativeElement.offsetHeight) / 2;
      this.utilBoxTop = selectionInfo.row.getBoundingClientRect().top + adjustment;
      this.utilBoxLeft = selectionInfo.row.getBoundingClientRect().left + selectionInfo.row.clientWidth;
      this.utilBoxVisibility = 'visible';
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
    const acc = this.overElement!;
    this.setOverAccount();
    return acc;
  }
}
