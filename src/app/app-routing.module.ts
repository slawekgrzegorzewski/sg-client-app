import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SettingsComponent} from './pages/accountant/settings/settings.component';
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

const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full', canActivate: [LoginGuard]},
  {path: 'login', component: LoginComponent, canActivate: [LoginGuard]},
  {path: 'settings', component: SettingsComponent, canActivate: [AuthGuardGuard]},
  {path: 'accountant-home', component: AccountantHomeComponent, canActivate: [AuthGuardGuard]},
  {path: 'accountant-home-small', component: AccountantHomeSmallComponent, canActivate: [AuthGuardGuard]},
  {path: 'billing-small', component: BillingSmallComponent, canActivate: [AuthGuardGuard]},
  {path: 'piggy-banks-small', component: PiggyBanksSmallComponent, canActivate: [AuthGuardGuard]},
  {path: 'charts', component: ChartsComponent, canActivate: [AuthGuardGuard]},
  {path: 'accounts-history', component: AccountsHistoryComponent, canActivate: [AuthGuardGuard]},
  {path: 'register/:type', component: RegisterComponent, canActivate: [LoginGuard]},
  {path: 'change-password/:type', component: RegisterComponent},

  {path: 'checker-home', component: CheckerHomeComponent},

  {path: '**', redirectTo: '/home', pathMatch: 'full', canActivate: [LoginGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
