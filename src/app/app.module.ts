import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {HeaderComponent} from './components/header/header.component';
import {AccountsComponent} from './components/accounts/accounts.component';
import {LoginComponent} from './components/login/login.component';
import {RegisterComponent} from './components/register/register.component';
import {LoginService} from "./services/login.service";
import {AccountsService} from "./services/accounts.service";
import {AppRoutingModule} from "./app-routing.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {httpInterceptorProviders} from "./interceptors";
import {HomeComponent} from "./components/home/home.component";
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {EditAccountComponent} from "./components/accounts/edit-account.component";
import {ToastService} from "./services/toast.service";
import {ToastsContainer} from "./components/toast/toast-container.component";
import {HoverableButtonsComponent} from "./components/gui/hoverable-buttons.component";
import {UserAccountsComponent} from "./components/accounts/user-accounts.component";
import {CreateTransactionsComponent} from "./components/transactions/create-transactions.component";
import {TransactionsService} from "./services/transations.service";
import {LocalizedDatePipe} from "./pipe/localized-date-pipe";
import {SettingsService} from "./services/settingss.service";
import '@angular/common/locales/global/pl';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    AccountsComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    EditAccountComponent,
    ToastsContainer,
    HoverableButtonsComponent,
    UserAccountsComponent,
    CreateTransactionsComponent,
    LocalizedDatePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule
  ],
  providers: [
    LoginService,
    httpInterceptorProviders,
    ToastService,
    AccountsService,
    TransactionsService,
    SettingsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
