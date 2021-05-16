import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {HeaderComponent} from './components/general/header/header.component';
import {SettingsComponent} from './pages/settings/settings.component';
import {LoginComponent} from './pages/login/login.component';
import {RegisterComponent} from './pages/register/register.component';
import {LoginService} from './services/login.service';
import {AccountsService} from './services/accountant/accounts.service';
import {AppRoutingModule} from './app-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {httpInterceptorProviders} from './interceptors';
import {AccountantHomeComponent} from './pages/accountant/accountant-home/accountant-home.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {EditAccountComponent} from './components/accountant/accounts/edit-account.component';
import {ToastService} from './services/toast.service';
import {ToastsContainer} from './components/general/toast/toast-container.component';
import {HoverableButtonsComponent} from './components/general/hoverable-buttons.component';
import {DomainAccountsComponent} from './components/accountant/accounts/domain-accounts.component';
import {CreateTransactionsComponent} from './components/accountant/transactions/create-transactions.component';
import {TransactionsService} from './services/accountant/transations.service';
import {LocalizedDatePipe} from './pipe/localized-date-pipe';
import {SettingsService} from './services/accountant/settings.service';
import '@angular/common/locales/global/pl';
import {TransactionsListComponent} from './components/accountant/transactions/transactions-list.component';
import {BillingPeriodsService} from './services/accountant/billing-periods.service';
import {CurrencyPipe, DatePipe, TitleCasePipe} from '@angular/common';
import {BillingElementsComponent} from './components/accountant/billing-periods/billing-elements.component';
import {CreateBillingElementComponent} from './components/accountant/billing-periods/create-billing-element.component';
import {CategoriesComponent} from './components/accountant/billing-periods/categories.component';
import {NgEventBus} from 'ng-event-bus';
import {PiggyBanksService} from './services/accountant/piggy-banks.service';
import {PiggyBanksComponent} from './components/accountant/piggy-banks/piggy-banks.component';
import {HtmlNewLinePipe} from './pipe/html-new-line-pipe';
import {GeneralTypeaheadComponent} from './components/typeaheads/general-typeahead.component';
import {CurrencyTotalsComponent} from './components/accountant/general/currency-totals.component';
import {MultiCurrencyTotalComponent} from './components/accountant/general/multi-currency-total.component';
import {AccountsHistoryComponent} from './pages/accountant/accounts-history/accounts-history.component';
import {GrandTotalComponent} from './components/accountant/grand-total/grand-total.component';
import {AccountantHomeSmallComponent} from './pages/accountant/accountant-home/accountant-home-small.component';
import {BillingSmallComponent} from './pages/accountant/billings/billing-small.component';
import {BrowseBillingElementsComponent} from './components/accountant/billing-periods/browse-billing-elements.component';
import {PiggyBanksSmallComponent} from './pages/accountant/piggy-banks/piggy-banks-small..component';
import {ChartsModule} from 'ng2-charts';
import {ChartsComponent} from './pages/accountant/charts/charts.component';
import {HomeComponent} from './pages/home/home.component';
import {CheckerHomeComponent} from './pages/checker/checker-home/checker-home.component';
import {PageVersionsService} from './services/checker/page-versions.service';
import {SyrHomeComponent} from './pages/syr/syr-home.component';
import {SyrService} from './services/syr/syr.service';
import {SyrAdminComponent} from './pages/syr/syr-admin.component';
import {DomainService} from './services/domain.service';
import {CategoriesService} from './services/accountant/categories.service';
import {DomainsComponent} from './components/general/domain/domains.component';
import {DomainInvitationsComponent} from './components/general/domain/domain-invitations.component';
import {ClientsService} from './services/accountant/clients.service';
import {ClientsComponent} from './components/accountant/clients/clients.component';
import {AccountantSettingsComponent} from './components/accountant/accountant-settings/accountant-settings.component';
import {AccountantSettingsService} from './services/accountant/accountant-settings.service';
import {ServicesService} from './services/accountant/services.service';
import {ServicesComponent} from './components/accountant/services/services.component';
import {PerformedServicesService} from './services/accountant/performed-services.service';
import {PerformedServicesComponent} from './components/accountant/company-log/performed-services.component';
import {DataPickerComponent} from './components/accountant/data-picker/data-picker.component';
import {ClientPaymentComponent} from './components/accountant/company-log/client-payments.component';
import {ClientPaymentsService} from './services/accountant/client-payments.service';
import {PerformedServicePaymentsService} from './services/accountant/performed-service-payments.service';
import {PerformedServiceEditComponent} from './components/accountant/company-log/performed-service-edit.component';
import {ClientPaymentEditComponent} from './components/accountant/company-log/client-payment-edit.component';
import {PaymentSelectionComponent} from './components/accountant/company-log/payment-selection.component';
import {CompanyLogComponent} from './components/accountant/company-log/company-log.component';
import {TimerComponent} from './components/general/timer/timer.component';
import {CubesHomeComponent} from './pages/cubes/home/cubes-home.component';
import {CubeRecordsService} from './services/accountant/cube-records.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SettingsComponent,
    LoginComponent,
    RegisterComponent,
    AccountantHomeComponent,
    EditAccountComponent,
    ToastsContainer,
    HoverableButtonsComponent,
    DomainAccountsComponent,
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
    AccountsHistoryComponent,
    GrandTotalComponent,
    AccountantHomeSmallComponent,
    BillingSmallComponent,
    BrowseBillingElementsComponent,
    PiggyBanksSmallComponent,
    ChartsComponent,
    HomeComponent,
    CheckerHomeComponent,
    SyrHomeComponent,
    SyrAdminComponent,
    DomainsComponent,
    DomainInvitationsComponent,
    ClientsComponent,
    AccountantSettingsComponent,
    ServicesComponent,
    PerformedServicesComponent,
    DataPickerComponent,
    ClientPaymentComponent,
    PerformedServiceEditComponent,
    ClientPaymentEditComponent,
    PaymentSelectionComponent,
    CompanyLogComponent,
    TimerComponent,
    CubesHomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule,
    ChartsModule
  ],
  providers: [
    LoginService,
    httpInterceptorProviders,
    ToastService,
    AccountsService,
    PageVersionsService,
    TransactionsService,
    SettingsService,
    BillingPeriodsService,
    PiggyBanksService,
    SyrService,
    DatePipe,
    TitleCasePipe,
    NgEventBus,
    CurrencyPipe,
    {
      provide: LOCALE_ID,
      useValue: 'pl-PL'
    },
    DomainService,
    CategoriesService,
    ClientsService,
    AccountantSettingsService,
    ServicesService,
    PerformedServicesService,
    ClientPaymentsService,
    PerformedServicePaymentsService,
    CubeRecordsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
