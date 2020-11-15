import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SettingsComponent} from './components/accounts/settings.component';
import {LoginComponent} from './components/login/login.component';
import {RegisterComponent} from './components/register/register.component';
import {AuthGuardGuard} from './guards/AuthGuard/auth-guard.guard';
import {LoginGuard} from './guards/Login/login.guard';
import {HomeComponent} from './components/home/home.component';

const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full', canActivate: [LoginGuard]},
  {path: 'login', component: LoginComponent, canActivate: [LoginGuard]},
  {path: 'settings', component: SettingsComponent, canActivate: [AuthGuardGuard]},
  {path: 'home', component: HomeComponent, canActivate: [AuthGuardGuard]},
  {path: 'register', component: RegisterComponent, canActivate: [LoginGuard]},
  {path: '**', redirectTo: '/login', pathMatch: 'full', canActivate: [LoginGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
