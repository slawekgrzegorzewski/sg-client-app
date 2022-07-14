import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Account} from '../../../model/accountant/account';
import {Button} from '../../general/hoverable-buttons.component';
import {ComparatorBuilder} from '../../../utils/comparator-builder';
import {BankAccount} from '../../../model/banks/bank-account';
import {AccountsService} from '../../../services/accountant/accounts.service';
import {Domain} from '../../../model/domain';
import {DomainService} from '../../../services/domain.service';
import {NgEventBus} from 'ng-event-bus';
import {ACCOUNTS_CHANGED, SELECTED_DOMAIN_CHANGED} from '../../../app.module';

@Component({
  selector: 'app-domain-accounts',
  templateUrl: './domain-accounts.component.html',
  styleUrls: ['./domain-accounts.component.css']
})
export class DomainAccountsComponent implements OnInit {

  private _domain: Domain | null = null;
  get domain(): Domain | null {
    return this._domain;
  }

  @Input() set domain(value: Domain | null) {
    this._domain = value;
    this.getAccountsForDomain();
  }

  @Input() buttons: Button<Account>[] = [];
  @Input() adminMode = false;
  @Input() bankAccountsAvailableToAssign: BankAccount[] = [];
  @Output() selectionChanged = new EventEmitter<Account | null>();
  @Input() showTitle = true;

  @Output() deleteAccountEvent = new EventEmitter<Account>();
  @Output() renameAccountEvent = new EventEmitter<Account>();
  @Output() changeAccountVisibilityEvent = new EventEmitter<Account>();
  @Output() bankAccountAssignedEvent = new EventEmitter<[Account, BankAccount]>();

  private internalAccounts: Account[] = [];
  selectedAccount: Account | null = null;
  private _selectedBankAccount: BankAccount | null = null;
  get selectedBankAccount(): BankAccount | null {
    return this._selectedBankAccount;
  }

  set selectedBankAccount(value: BankAccount | null) {
    this._selectedBankAccount = value;
    if (this.selectedAccount !== null && this.selectedAccount.bankAccount === null && this.selectedBankAccount !== null) {
      this.bankAccountAssignedEvent.emit([this.selectedAccount, this.selectedBankAccount]);
    }
  }

  set accounts(value: Account[]) {
    this.internalAccounts = (value || []).sort(
      ComparatorBuilder.comparing<Account>(a => a.currency).thenComparing(a => a.name).build()
    );
    this.selectAccount();
    this.recalculateSubtotals();
  }

  get accounts(): Account[] {
    return this.internalAccounts;
  }

  totalBalancesPerCurrency: Map<string, number> = new Map<string, number>();

  constructor(private accountsService: AccountsService,
              private domainService: DomainService,
              private eventBus: NgEventBus) {
    this.eventBus.on(SELECTED_DOMAIN_CHANGED).subscribe(domain => {
      if (this.domain === null) {
        this.getAccountsForDomain();
      }
    });
    this.eventBus.on(ACCOUNTS_CHANGED).subscribe(
      value => this.getAccountsForDomain()
    )
  }

  ngOnInit(): void {
    this.getAccountsForDomain();
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

  select(account: Account): void {
    this.selectedAccount = account;
    this.selectionChanged.emit(account);
  }

  private getAccountsForDomain() {
    const domainsGetter = this.domain === null ? this.accountsService.currentDomainAccounts() : this.accountsService.allAccounts();
    domainsGetter.subscribe(
      accounts => this.accounts = accounts.filter(a => a.domain.id === this.domain?.id || this.domainService.currentDomainId)
    );
  }
}
