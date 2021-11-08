import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SettingsComponent} from './pages/settings/settings.component';
import {LoginComponent} from './pages/login/login.component';
import {RegisterComponent} from './pages/register/register.component';
import {UserLoggedInGuard} from './guards/AuthGuard/user-logged-in-guard.service';
import {UserNotLoggedInGuard} from './guards/Login/user-not-logged-in-guard.service';
import {ACCOUNTANT_HOME_ROUTER_URL, AccountantHomeComponent} from './pages/accountant/accountant-home/accountant-home.component';
import {ACCOUNTANT_HISTORY_ROUTER_URL, AccountsHistoryComponent} from './pages/accountant/accounts-history/accounts-history.component';
import {BILLING_SMALL_ROUTER_URL, BillingSmallComponent} from './pages/accountant/billings/billing-small.component';
import {PIGGY_BANKS_SMALL_ROUTER_URL, PiggyBanksSmallComponent} from './pages/accountant/piggy-banks/piggy-banks-small.component';
import {CHARTS_ROUTER_URL, ChartsComponent} from './pages/accountant/charts/charts.component';
import {CHECKER_HOME_ROUTER_URL, CheckerHomeComponent} from './pages/checker/checker-home/checker-home.component';
import {SYR_HOME_ROUTER_URL, SyrHomeComponent} from './pages/syr/syr-home.component';
import {SYR_ADMIN_ROUTER_URL, SyrAdminComponent} from './pages/syr/syr-admin.component';
import {CUBES_HOME_ROUTER_URL, CubesHomeComponent} from './pages/cubes/cubes-home.component';
import {
  HOLIDAY_CURRENCIES_ROUTER_URL,
  HolidayCurrenciesComponent
} from './components/accountant/holiday-currencies/holiday-currencies.component';
import {DefaultApplicationComponent} from './components/general/applications/default-application.component';
import {CUBES_STATISTICS_ROUTER_URL, CubeStatisticsComponent} from './pages/cubes/cube-statistics.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent, canActivate: [UserNotLoggedInGuard]},
  {path: 'register/:type', component: RegisterComponent, canActivate: [UserNotLoggedInGuard]},

  {path: 'change-password/:type', component: RegisterComponent, canActivate: [UserLoggedInGuard]},
  {path: 'settings', component: SettingsComponent, canActivate: [UserLoggedInGuard]},

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

  {path: '**', component: DefaultApplicationComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
