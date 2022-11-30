import {Injectable} from '@angular/core';
import {LoginService} from './login.service';
import {ActivationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {ACCOUNTANT_HOME_ROUTER_URL} from '../../accountant/pages/accountant-home/accountant-home.component';
import {ACCOUNTANT_HISTORY_ROUTER_URL} from '../../accountant/pages/accounts-history/accounts-history.component';
import {HOLIDAY_CURRENCIES_ROUTER_URL} from '../../accountant/components/holiday-currencies/holiday-currencies.component';
import {BILLING_SMALL_ROUTER_URL} from '../../accountant/pages/billings/billing-small.component';
import {PIGGY_BANKS_SMALL_ROUTER_URL} from '../../accountant/pages/piggy-banks/piggy-banks-small.component';
import {CHARTS_ROUTER_URL} from '../../accountant/pages/charts/charts.component';
import {CHECKER_HOME_ROUTER_URL} from '../../periodic-checker/pages/checker-home/checker-home.component';
import {SYR_HOME_ROUTER_URL} from '../../service-year-report/pages/syr-home.component';
import {SYR_ADMIN_ROUTER_URL} from '../../service-year-report/pages/syr-admin.component';
import {CUBES_HOME_ROUTER_URL} from '../../speedcubing/pages/cubes-home.component';
import {CUBES_STATISTICS_ROUTER_URL} from '../../speedcubing/pages/cube-statistics.component';
import {SETTINGS_ROUTER_URL} from '../../accountant/pages/settings/settings.component';
import {IP_HOME_ROUTER_URL} from '../../ip/components/intellectual-property.component';
import {TIME_RECORDS_ROUTER_URL} from '../../ip/components/time-records.component';

export const ACCOUNTANT_APP = 'Accountant';
export const CHECKER_APP = 'Checker';
export const SYR_APP = 'SYR';
export const CUBES_APP = 'Cubes';
export const IPR_APP = 'Intellectual property report';

export class ApplicationConfig {
  routerUrls: string[] = [];

  constructor(routerUrls: string[]) {
    this.routerUrls = routerUrls;
  }
}

export const APPLICATIONS_CONFIG = new Map<string, ApplicationConfig>([
  [ACCOUNTANT_APP, new ApplicationConfig([ACCOUNTANT_HOME_ROUTER_URL, ACCOUNTANT_HISTORY_ROUTER_URL, HOLIDAY_CURRENCIES_ROUTER_URL,
    BILLING_SMALL_ROUTER_URL, PIGGY_BANKS_SMALL_ROUTER_URL, CHARTS_ROUTER_URL, SETTINGS_ROUTER_URL])],
  [CHECKER_APP, new ApplicationConfig([CHECKER_HOME_ROUTER_URL])],
  [SYR_APP, new ApplicationConfig([SYR_HOME_ROUTER_URL, SYR_ADMIN_ROUTER_URL])],
  [CUBES_APP, new ApplicationConfig([CUBES_HOME_ROUTER_URL, CUBES_STATISTICS_ROUTER_URL])],
  [IPR_APP, new ApplicationConfig([IP_HOME_ROUTER_URL, TIME_RECORDS_ROUTER_URL])],
]);

@Injectable({
  providedIn: 'root'
})
export class ApplicationsService {

  availableApps: string[] = [];

  selectedAppInternal: string | null = null;

  get selectedApp(): string | null {
    return this.selectedAppInternal;
  }

  set selectedApp(value: string | null) {
    this.selectedAppInternal = value;
    if (!value) {
      return;
    }
    const appConfig = APPLICATIONS_CONFIG.get(value);
    if (this.availableApps.includes(value) && appConfig) {
      this.router.navigate([appConfig.routerUrls[0]]);
    }
  }

  constructor(
    public loginService: LoginService,
    private router: Router
  ) {
    this.availableApps = this.loginService.getAvailableApps();
    this.selectApp();
    this.router.events
      .pipe(filter(event => event instanceof ActivationEnd))
      .subscribe(value => {
        this.selectApp();
      });
  }

  private selectApp() {
    if (this.availableApps && this.availableApps.length > 0) {
      const path = this.router.url.substr(1);
      let applicationFromPath: string | null = null;
      for (let availableApp of this.availableApps) {
        const config = APPLICATIONS_CONFIG.get(availableApp);
        if (!config) {
          continue;
        }
        const application = config.routerUrls.find(url => path.startsWith(url));
        if (application !== undefined) {
          applicationFromPath = availableApp;
          break;
        }
      }
      if (applicationFromPath) {
        this.selectedAppInternal = applicationFromPath;
      } else {
        this.selectedApp = null;
      }
    }
  }

  isAccountant(): boolean {
    return this.selectedApp !== null && this.selectedApp === ACCOUNTANT_APP;
  }

  isChecker(): boolean {
    return this.selectedApp !== null && this.selectedApp === CHECKER_APP;
  }

  isSYR(): boolean {
    return this.selectedApp !== null && this.selectedApp === SYR_APP;
  }

  isSYRAdmin(): boolean {
    return this.isSYR() && this.loginService.containsRole('SYR_ADMIN');
  }

  isCubesApp(): boolean {
    return this.selectedApp !== null && this.selectedApp === CUBES_APP;
  }

  isIntellectualProperty() {
    return this.selectedApp !== null && this.selectedApp === IPR_APP;
  }

  selectFirstAvailableApp(): void {
    this.selectedApp = this.availableApps.length > 0 ? this.availableApps[0] : null;
  }
}
