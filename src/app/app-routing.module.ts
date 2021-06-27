import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SettingsComponent} from './pages/settings/settings.component';
import {LoginComponent} from './pages/login/login.component';
import {RegisterComponent} from './pages/register/register.component';
import {AuthGuardGuard} from './guards/AuthGuard/auth-guard.guard';
import {LoginGuard} from './guards/Login/login.guard';
import {AccountantHomeComponent} from './pages/accountant/accountant-home/accountant-home.component';
import {AccountsHistoryComponent} from './pages/accountant/accounts-history/accounts-history.component';
import {AccountantHomeSmallComponent} from './pages/accountant/accountant-home/accountant-home-small.component';
import {BillingSmallComponent} from './pages/accountant/billings/billing-small.component';
import {PiggyBanksSmallComponent} from './pages/accountant/piggy-banks/piggy-banks-small..component';
import {ChartsComponent} from './pages/accountant/charts/charts.component';
import {CheckerHomeComponent} from './pages/checker/checker-home/checker-home.component';
import {SyrHomeComponent} from './pages/syr/syr-home.component';
import {SyrAdminComponent} from './pages/syr/syr-admin.component';
import {CubesHomeComponent} from './pages/cubes/home/cubes-home.component';
import {HolidayCurrencies} from './model/accountant/holiday-currencies';
import {HolidayCurrenciesComponent} from './components/accountant/holiday-currencies/holiday-currencies.component';

const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent, canActivate: [LoginGuard]},
  {path: 'settings', component: SettingsComponent, canActivate: [AuthGuardGuard]},
  {path: 'accountant-home', component: AccountantHomeComponent, canActivate: [AuthGuardGuard]},
  {path: 'accountant-home-small', component: AccountantHomeSmallComponent, canActivate: [AuthGuardGuard]},
  {path: 'holiday-currencies', component: HolidayCurrenciesComponent, canActivate: [AuthGuardGuard]},
  {path: 'billing-small', component: BillingSmallComponent, canActivate: [AuthGuardGuard]},
  {path: 'piggy-banks-small', component: PiggyBanksSmallComponent, canActivate: [AuthGuardGuard]},
  {path: 'charts', component: ChartsComponent, canActivate: [AuthGuardGuard]},
  {path: 'accounts-history', component: AccountsHistoryComponent, canActivate: [AuthGuardGuard]},
  {path: 'register/:type', component: RegisterComponent, canActivate: [LoginGuard]},
  {path: 'change-password/:type', component: RegisterComponent},

  {path: 'checker-home', component: CheckerHomeComponent, canActivate: [AuthGuardGuard]},

  {path: 'syr-home', component: SyrHomeComponent, canActivate: [AuthGuardGuard]},
  {path: 'syr-admin', component: SyrAdminComponent, canActivate: [AuthGuardGuard]},

  {path: 'cubes-home', component: CubesHomeComponent, canActivate: [AuthGuardGuard]},

  {path: '**', redirectTo: '/home', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
