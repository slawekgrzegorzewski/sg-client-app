import {AccountsService} from '../../../services/accountant/accounts.service';
import {CategoriesService} from '../../../services/accountant/categories.service';
import {PiggyBanksService} from '../../../services/accountant/piggy-banks.service';
import {BillingPeriodsService} from '../../../services/accountant/billing-periods.service';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ComparatorBuilder} from '../../../../utils/comparator-builder';
import {Account} from '../../../model/accountant/account';
import {PiggyBank} from '../../../model/accountant/piggy-bank';
import {BillingPeriodInfo} from '../../../model/accountant/billings/billing-period';

export class BillingPeriodsHelper {
  private readonly ACCOUNTS_BY_CURRENCY_AND_NAME = ComparatorBuilder.comparing<Account>(a => a.currency)
    .thenComparing(a => a.name)
    .build();

  constructor(
    private accountsService: AccountsService,
    private categoriesService: CategoriesService,
    private piggyBanksService: PiggyBanksService,
    private billingsService: BillingPeriodsService,
  ) {
  }

  fetchData(date?: Date | null): Observable<readonly [Account[], PiggyBank[], Map<Date, Map<string, number>>, BillingPeriodInfo | null]> {
    const accounts = this.accountsService.currentDomainAccounts().pipe(
      map(accounts => accounts.filter(a => a.visible)),
      map(accounts => accounts.sort(this.ACCOUNTS_BY_CURRENCY_AND_NAME))
    );
    const piggyBanks = this.piggyBanksService.currentDomainPiggyBanks().pipe(
      map(data => data.sort((a, b) => a.name.localeCompare(b.name)))
    );
    const historicalSavings = this.billingsService.getHistoricalSavings(12);
    return forkJoin([
      accounts,
      piggyBanks,
      historicalSavings,
      this.fetchBillingPeriod(date)
    ]);
  }

  fetchBillingPeriod(date?: Date | null): Observable<BillingPeriodInfo> {
    return (date ? this.billingsService.billingPeriodFor(date) : this.billingsService.currentBillingPeriod());
  }
}
