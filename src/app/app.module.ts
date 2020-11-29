import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {HeaderComponent} from './pages/header/header.component';
import {SettingsComponent} from './components/settings.component';
import {LoginComponent} from './pages/login/login.component';
import {RegisterComponent} from './pages/register/register.component';
import {LoginService} from './services/login.service';
import {AccountsService} from './services/accounts.service';
import {AppRoutingModule} from './app-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {httpInterceptorProviders} from './interceptors';
import {HomeComponent} from './pages/home/home.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {EditAccountComponent} from './components/accounts/edit-account.component';
import {ToastService} from './services/toast.service';
import {ToastsContainer} from './components/toast/toast-container.component';
import {HoverableButtonsComponent} from './components/general/hoverable-buttons.component';
import {UserAccountsComponent} from './components/accounts/user-accounts.component';
import {CreateTransactionsComponent} from './components/transactions/create-transactions.component';
import {TransactionsService} from './services/transations.service';
import {LocalizedDatePipe} from './pipe/localized-date-pipe';
import {SettingsService} from './services/settings.service';
import '@angular/common/locales/global/pl';
import {TransactionsListComponent} from './components/transactions/transactions-list.component';
import {BillingPeriodsService} from './services/billing-periods.service';
import {CurrencyPipe, DatePipe, TitleCasePipe} from '@angular/common';
import {BillingElementsComponent} from './components/billing-periods/billing-elements.component';
import {CreateBillingElementComponent} from './components/billing-periods/create-billing-element.component';
import {CategoriesComponent} from './components/billing-periods/categories.component';
import {NgEventBus} from 'ng-event-bus';
import {PiggyBanksService} from './services/piggy-banks.service';
import {PiggyBanksComponent} from './components/piggy-banks/piggy-banks.component';
import {HtmlNewLinePipe} from './pipe/html-new-line-pipe';
import {GeneralTypeaheadComponent} from './components/typeaheads/general-typeahead.component';
import {CurrencyTotalsComponent} from './components/general/currency-totals.component';
import {MultiCurrencyTotalComponent} from './components/general/multi-currency-total.component';
import {AccountsHistoryComponent} from './pages/accounts-history/accounts-history.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SettingsComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    EditAccountComponent,
    ToastsContainer,
    HoverableButtonsComponent,
    UserAccountsComponent,
    CreateTransactionsComponent,
    LocalizedDatePipe,
    HtmlNewLinePipe,
    TransactionsListComponent,
    BillingElementsComponent,
    CreateBillingElementComponent,
    CategoriesComponent,
    PiggyBanksComponent,
    GeneralTypeaheadComponent,
    CurrencyTotalsComponent,
    MultiCurrencyTotalComponent,
    AccountsHistoryComponent
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
    SettingsService,
    BillingPeriodsService,
    PiggyBanksService,
    DatePipe,
    TitleCasePipe,
    NgEventBus,
    CurrencyPipe,
    {
      provide: LOCALE_ID,
      useValue: 'pl-PL'
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
