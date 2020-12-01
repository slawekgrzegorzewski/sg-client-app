import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SettingsComponent} from './components/settings/settings.component';
import {LoginComponent} from './pages/login/login.component';
import {RegisterComponent} from './pages/register/register.component';
import {AuthGuardGuard} from './guards/AuthGuard/auth-guard.guard';
import {LoginGuard} from './guards/Login/login.guard';
import {HomeComponent} from './pages/home/home.component';
import {AccountsHistoryComponent} from './pages/accounts-history/accounts-history.component';
import {HomeSmallComponent} from './pages/home/home-small.component';
import {BillingSmallComponent} from './pages/billings/billing-small..component';
import {PiggyBanksSmallComponent} from './pages/piggy-banks/piggy-banks-small..component';

const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full', canActivate: [LoginGuard]},
  {path: 'login', component: LoginComponent, canActivate: [LoginGuard]},
  {path: 'settings', component: SettingsComponent, canActivate: [AuthGuardGuard]},
  {path: 'home', component: HomeComponent, canActivate: [AuthGuardGuard]},
  {path: 'home-small', component: HomeSmallComponent, canActivate: [AuthGuardGuard]},
  {path: 'billing-small', component: BillingSmallComponent, canActivate: [AuthGuardGuard]},
  {path: 'piggy-banks-small', component: PiggyBanksSmallComponent, canActivate: [AuthGuardGuard]},
  {path: 'accounts-history', component: AccountsHistoryComponent, canActivate: [AuthGuardGuard]},
  {path: 'register/:type', component: RegisterComponent, canActivate: [LoginGuard]},
  {path: 'change-password/:type', component: RegisterComponent},
  {path: '**', redirectTo: '/home', pathMatch: 'full', canActivate: [LoginGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
