import * as Hammer from 'hammerjs';
import {BrowserModule, HAMMER_GESTURE_CONFIG, HammerGestureConfig, HammerModule} from '@angular/platform-browser';
import {Injectable, LOCALE_ID, NgModule} from '@angular/core';

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
import {DomainAccountsComponent} from './components/accountant/accounts/domain-accounts.component';
import {CreateTransactionsComponent} from './components/accountant/transactions/create-transactions.component';
import {TransactionsService} from './services/accountant/transations.service';
import {LocalizedDatePipe} from './pipe/localized-date-pipe';
import {SettingsService} from './services/accountant/settings.service';
import '@angular/common/locales/global/pl';
import {TransactionsListComponent} from './components/accountant/transactions/transactions-list.component';
import {BillingPeriodsService} from './services/accountant/billing-periods.service';
import {CurrencyPipe, DatePipe, DecimalPipe, TitleCasePipe} from '@angular/common';
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
import {BillingSmallComponent} from './pages/accountant/billings/billing-small.component';
import {BrowseBillingElementsComponent} from './components/accountant/billing-periods/browse-billing-elements.component';
import {PiggyBanksSmallComponent} from './pages/accountant/piggy-banks/piggy-banks-small.component';
import {NgChartsModule} from 'ng2-charts';
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
import {CubesHomeComponent} from './pages/cubes/cubes-home.component';
import {CubeRecordsService} from './services/accountant/cube-records.service';
import {HolidayCurrenciesService} from './services/accountant/holiday-currencies.service';
import {HolidayCurrenciesComponent} from './components/accountant/holiday-currencies/holiday-currencies.component';
import {SevenSegComponent} from './components/general/seven-seg/seven-seg.component';
import {SevenSegDigitComponent} from './components/general/seven-seg/seven-seg-digit.component';
import {SevenSegTimerDisplay} from './components/general/seven-seg/seven-seg-timer-display.component';
import {SizeService} from './services/size.service';
import {ApplicationsService} from './services/applications.service';
import {DefaultApplicationComponent} from './components/general/applications/default-application.component';
import {SideComponent} from './components/rubiks-cube/side/side.component';
import {CubeComponent} from './components/rubiks-cube/cube/cube.component';
import {CubeControlsComponent} from './components/rubiks-cube/cube-controls/cube-controls.component';
import {CubeStatisticsComponent} from './pages/cubes/cube-statistics.component';
import {CuberRecordTimeToDatePipe} from './pipe/cuber-record-time-to-date-pipe';
import {NodrigenService} from './services/banks/nodrigen.service';
import {NodrigenComponent} from './components/nodrigen/nodrigen.component';
import {BanksService} from './services/banks/banks.service';
import {TransactionsImportComponent} from './pages/accountant/transactions-import/transactions-import.component';
import {TransactionRowComponent} from './pages/accountant/transactions-import/row/transaction-row.component';

@Injectable()
export class MyHammerConfig extends HammerGestureConfig {
  override overrides = <any> {
    swipe: {direction: Hammer.DIRECTION_ALL},
  };
}

export const APP_LOGIN_STATUS_REQUEST_EVENT = 'app:getlogin';
export const APP_LOGIN_STATUS_EVENT = 'app:login';
export const APP_SIZE_EVENT = 'app:size';
export const APP_GET_SIZE_EVENT = 'app:getsize';
export const DOMAINS_CHANGED = 'domain:change'
export const DATA_REFRESH_REQUEST_EVENT = 'data:refresh';
export const INVITATIONS_CHANGED = 'invitations:changed';
export const NAVIGATION_RESIZE_EVENT = 'navigation:resize';
export const SELECTED_DOMAIN_CHANGED = 'domain:selected:changed';
export const PIGGY_BANKS_CHANGED = 'piggy-bank:changed';
export const BILLING_PERIOD_CHANGED = 'billing-period:changed';
export const ACCOUNTS_CHANGED = 'accounts:changed';
export const TRANSACTIONS_TO_IMPORT_CHANGED = 'transactions-to-import:changed';

export class AppLoginStatus {
  public isLoggedId: boolean = false;
  public defaultDomainId: number | null = null;

  constructor(isLoggedId: boolean, defaultDomainId: number | null) {
    this.isLoggedId = isLoggedId;
    this.defaultDomainId = defaultDomainId;
  }
}

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
    DomainAccountsComponent,
    CreateTransactionsComponent,
    LocalizedDatePipe,
    HtmlNewLinePipe,
    CuberRecordTimeToDatePipe,
    TransactionsListComponent,
    BillingElementsComponent,
    CreateBillingElementComponent,
    CategoriesComponent,
    PiggyBanksComponent,
    GeneralTypeaheadComponent,
    CurrencyTotalsComponent,
    MultiCurrencyTotalComponent,
    AccountsHistoryComponent,
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
    CubesHomeComponent,
    HolidayCurrenciesComponent,
    SevenSegComponent,
    SevenSegDigitComponent,
    SevenSegTimerDisplay,
    DefaultApplicationComponent,
    SideComponent,
    CubeComponent,
    CubeControlsComponent,
    CubeStatisticsComponent,
    NodrigenComponent,
    TransactionsImportComponent,
    TransactionRowComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule,
    HammerModule,
    NgChartsModule
  ],
  providers: [
    LoginService,
    httpInterceptorProviders,
    ToastService,
    AccountsService,
    HolidayCurrenciesService,
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
    DecimalPipe,
    DomainService,
    CategoriesService,
    ClientsService,
    AccountantSettingsService,
    ServicesService,
    PerformedServicesService,
    ClientPaymentsService,
    PerformedServicePaymentsService,
    CubeRecordsService,
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: MyHammerConfig,
    },
    SizeService,
    ApplicationsService,
    NodrigenService,
    BanksService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
