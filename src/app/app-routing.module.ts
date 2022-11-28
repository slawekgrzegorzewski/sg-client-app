import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SETTINGS_ROUTER_URL, SettingsComponent} from './accountant/pages/settings/settings.component';
import {LoginComponent} from './general/model/login/login.component';
import {RegisterComponent} from './general/model/register/register.component';
import {UserLoggedInGuard} from './general/guards/user-logged-in-guard.service';
import {UserNotLoggedInGuard} from './general/guards/user-not-logged-in-guard.service';
import {ACCOUNTANT_HOME_ROUTER_URL, AccountantHomeComponent} from './accountant/pages/accountant-home/accountant-home.component';
import {ACCOUNTANT_HISTORY_ROUTER_URL, AccountsHistoryComponent} from './accountant/pages/accounts-history/accounts-history.component';
import {BILLING_SMALL_ROUTER_URL, BillingSmallComponent} from './accountant/pages/billings/billing-small.component';
import {PIGGY_BANKS_SMALL_ROUTER_URL, PiggyBanksSmallComponent} from './accountant/pages/piggy-banks/piggy-banks-small.component';
import {CHARTS_ROUTER_URL, ChartsComponent} from './accountant/pages/charts/charts.component';
import {CHECKER_HOME_ROUTER_URL, CheckerHomeComponent} from './periodic-checker/pages/checker-home/checker-home.component';
import {SYR_HOME_ROUTER_URL, SyrHomeComponent} from './service-year-report/pages/syr-home.component';
import {SYR_ADMIN_ROUTER_URL, SyrAdminComponent} from './service-year-report/pages/syr-admin.component';
import {CUBES_HOME_ROUTER_URL, CubesHomeComponent} from './speedcubing/pages/cubes-home.component';
import {
  HOLIDAY_CURRENCIES_ROUTER_URL,
  HolidayCurrenciesComponent
} from './accountant/components/holiday-currencies/holiday-currencies.component';
import {DefaultApplicationComponent} from './general/components/applications/default-application.component';
import {CUBES_STATISTICS_ROUTER_URL, CubeStatisticsComponent} from './speedcubing/pages/cube-statistics.component';
import {IntellectualPropertyComponent, IP_HOME_ROUTER_URL} from './ip/components/intellectual-property.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent, canActivate: [UserNotLoggedInGuard]},
  {path: 'register/:type', component: RegisterComponent, canActivate: [UserNotLoggedInGuard]},

  {path: 'change-password/:type', component: RegisterComponent, canActivate: [UserLoggedInGuard]},

  {path: '', redirectTo: `/`, pathMatch: 'full'},

  {path: SETTINGS_ROUTER_URL, redirectTo: `/${SETTINGS_ROUTER_URL}/`, pathMatch: 'full'},
  {path: `${SETTINGS_ROUTER_URL}/:domainId`, component: SettingsComponent, canActivate: [UserLoggedInGuard]},

  {path: ACCOUNTANT_HOME_ROUTER_URL, redirectTo: `/${ACCOUNTANT_HOME_ROUTER_URL}/`, pathMatch: 'full'},
  {path: `${ACCOUNTANT_HOME_ROUTER_URL}/:domainId`, component: AccountantHomeComponent, canActivate: [UserLoggedInGuard]},

  {path: ACCOUNTANT_HISTORY_ROUTER_URL, redirectTo: `/${ACCOUNTANT_HISTORY_ROUTER_URL}/`, pathMatch: 'full'},
  {path: `${ACCOUNTANT_HISTORY_ROUTER_URL}/:domainId`, component: AccountsHistoryComponent, canActivate: [UserLoggedInGuard]},

  {path: BILLING_SMALL_ROUTER_URL, redirectTo: `/${BILLING_SMALL_ROUTER_URL}/`, pathMatch: 'full'},
  {path: `${BILLING_SMALL_ROUTER_URL}/:domainId`, component: BillingSmallComponent, canActivate: [UserLoggedInGuard]},

  {path: PIGGY_BANKS_SMALL_ROUTER_URL, redirectTo: `/${PIGGY_BANKS_SMALL_ROUTER_URL}/`, pathMatch: 'full'},
  {path: `${PIGGY_BANKS_SMALL_ROUTER_URL}/:domainId`, component: PiggyBanksSmallComponent, canActivate: [UserLoggedInGuard]},

  {path: CHARTS_ROUTER_URL, redirectTo: `/${CHARTS_ROUTER_URL}/`, pathMatch: 'full'},
  {path: `${CHARTS_ROUTER_URL}/:domainId`, component: ChartsComponent, canActivate: [UserLoggedInGuard]},

  {path: CHECKER_HOME_ROUTER_URL, redirectTo: `/${CHECKER_HOME_ROUTER_URL}/`, pathMatch: 'full'},
  {path: `${CHECKER_HOME_ROUTER_URL}/:domainId`, component: CheckerHomeComponent, canActivate: [UserLoggedInGuard]},

  {path: SYR_HOME_ROUTER_URL, redirectTo: `/${SYR_HOME_ROUTER_URL}/`, pathMatch: 'full'},
  {path: `${SYR_HOME_ROUTER_URL}/:domainId`, component: SyrHomeComponent, canActivate: [UserLoggedInGuard]},

  {path: SYR_ADMIN_ROUTER_URL, redirectTo: `/${SYR_ADMIN_ROUTER_URL}/`, pathMatch: 'full'},
  {path: `${SYR_ADMIN_ROUTER_URL}/:domainId`, component: SyrAdminComponent, canActivate: [UserLoggedInGuard]},

  {path: CUBES_HOME_ROUTER_URL, redirectTo: `/${CUBES_HOME_ROUTER_URL}/`, pathMatch: 'full'},
  {path: `${CUBES_HOME_ROUTER_URL}/:domainId`, component: CubesHomeComponent, canActivate: [UserLoggedInGuard]},

  {path: CUBES_STATISTICS_ROUTER_URL, redirectTo: `/${CUBES_STATISTICS_ROUTER_URL}/`, pathMatch: 'full'},
  {path: `${CUBES_STATISTICS_ROUTER_URL}/:domainId`, component: CubeStatisticsComponent, canActivate: [UserLoggedInGuard]},

  {path: HOLIDAY_CURRENCIES_ROUTER_URL, redirectTo: `/${HOLIDAY_CURRENCIES_ROUTER_URL}/`, pathMatch: 'full'},
  {path: `${HOLIDAY_CURRENCIES_ROUTER_URL}/:domainId`, component: HolidayCurrenciesComponent, canActivate: [UserLoggedInGuard]},

  {path: IP_HOME_ROUTER_URL, redirectTo: `/${IP_HOME_ROUTER_URL}/`, pathMatch: 'full'},
  {path: `${IP_HOME_ROUTER_URL}/:domainId`, component: IntellectualPropertyComponent, canActivate: [UserLoggedInGuard]},

  {path: '**', component: DefaultApplicationComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
