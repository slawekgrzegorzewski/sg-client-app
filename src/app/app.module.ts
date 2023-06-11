import {BrowserModule, HAMMER_GESTURE_CONFIG, HammerModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';

import {AppComponent} from './general/components/app/app.component';
import {HeaderComponent} from './general/components/header/header.component';
import {SettingsComponent} from './accountant/pages/settings/settings.component';
import {LoginComponent} from './general/model/login/login.component';
import {RegisterComponent} from './general/model/register/register.component';
import {LoginService} from './general/services/login.service';
import {AccountsService} from './accountant/services/accounts.service';
import {AppRoutingModule} from './app-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {httpInterceptorProviders} from './general/interceptors';
import {AccountantHomeComponent} from './accountant/pages/accountant-home/accountant-home.component';
import {NgbAccordionModule, NgbDateAdapter, NgbDateNativeAdapter, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {EditAccountComponent} from './accountant/components/accounts/edit-account.component';
import {ToastService} from './general/services/toast.service';
import {ToastsContainer} from './general/components/toast/toast-container.component';
import {DomainAccountsComponent} from './accountant/components/accounts/domain-accounts.component';
import {CreateTransactionsComponent} from './accountant/components/transactions/create-transactions.component';
import {TransactionsService} from './accountant/services/transations.service';
import {LocalizedDatePipe} from './general/pipes/localized-date-pipe';
import {SettingsService} from './accountant/services/settings.service';
import '@angular/common/locales/global/pl';
import {TransactionsListComponent} from './accountant/components/transactions/transactions-list.component';
import {BillingPeriodsService} from './accountant/services/billing-periods.service';
import {CurrencyPipe, DatePipe, DecimalPipe, TitleCasePipe} from '@angular/common';
import {BillingElementsComponent} from './accountant/components/billing-periods/billing-elements.component';
import {CreateBillingElementComponent} from './accountant/components/billing-periods/create-billing-element.component';
import {CategoriesComponent} from './accountant/components/billing-periods/categories.component';
import {NgEventBus} from 'ng-event-bus';
import {PiggyBanksService} from './accountant/services/piggy-banks.service';
import {PiggyBanksComponent} from './accountant/components/piggy-banks/piggy-banks.component';
import {HtmlNewLinePipe} from './general/pipes/html-new-line-pipe';
import {GeneralTypeaheadComponent} from './general/components/typeaheads/general-typeahead.component';
import {CurrencyTotalsComponent} from './general/components/currencies/currency-totals.component';
import {MultiCurrencyTotalComponent} from './general/components/currencies/multi-currency-total.component';
import {AccountsHistoryComponent} from './accountant/pages/accounts-history/accounts-history.component';
import {BillingSmallComponent} from './accountant/pages/billings/billing-small.component';
import {BrowseBillingElementsComponent} from './accountant/components/billing-periods/browse-billing-elements.component';
import {PiggyBanksSmallComponent} from './accountant/pages/piggy-banks/piggy-banks-small.component';
import {NgChartsModule} from 'ng2-charts';
import {ChartsComponent} from './accountant/pages/charts/charts.component';
import {HomeComponent} from './general/model/home/home.component';
import {CheckerHomeComponent} from './periodic-checker/pages/checker-home/checker-home.component';
import {PageVersionsService} from './periodic-checker/services/page-versions.service';
import {SyrHomeComponent} from './service-year-report/pages/syr-home.component';
import {SyrService} from './service-year-report/services/syr.service';
import {SyrAdminComponent} from './service-year-report/pages/syr-admin.component';
import {DomainService} from './general/services/domain.service';
import {CategoriesService} from './accountant/services/categories.service';
import {DomainsComponent} from './general/components/domain/domains.component';
import {DomainInvitationsComponent} from './general/components/domain/domain-invitations.component';
import {ClientsService} from './accountant/services/clients.service';
import {ClientsComponent} from './accountant/components/clients/clients.component';
import {AccountantSettingsComponent} from './accountant/components/accountant-settings/accountant-settings.component';
import {AccountantSettingsService} from './accountant/services/accountant-settings.service';
import {ServicesService} from './accountant/services/services.service';
import {ServicesComponent} from './accountant/components/services/services.component';
import {PerformedServicesService} from './accountant/services/performed-services.service';
import {PerformedServicesComponent} from './accountant/components/company-log/performed-services.component';
import {ClientPaymentComponent} from './accountant/components/company-log/client-payments.component';
import {ClientPaymentsService} from './accountant/services/client-payments.service';
import {PerformedServicePaymentsService} from './accountant/services/performed-service-payments.service';
import {PerformedServiceEditComponent} from './accountant/components/company-log/performed-service-edit.component';
import {ClientPaymentEditComponent} from './accountant/components/company-log/client-payment-edit.component';
import {PaymentSelectionComponent} from './accountant/components/company-log/payment-selection.component';
import {CompanyLogComponent} from './accountant/components/company-log/company-log.component';
import {TimerComponent} from './general/components/timer/timer.component';
import {CubesHomeComponent} from './speedcubing/pages/cubes-home.component';
import {HolidayCurrenciesService} from './accountant/services/holiday-currencies.service';
import {HolidayCurrenciesComponent} from './accountant/components/holiday-currencies/holiday-currencies.component';
import {SevenSegComponent} from './general/components/seven-seg/seven-seg.component';
import {SevenSegDigitComponent} from './general/components/seven-seg/seven-seg-digit.component';
import {SevenSegTimerDisplay} from './general/components/seven-seg/seven-seg-timer-display.component';
import {SizeService} from './general/services/size.service';
import {ApplicationsService} from './general/services/applications.service';
import {DefaultApplicationComponent} from './general/components/applications/default-application.component';
import {SideComponent} from './speedcubing/components/side/side.component';
import {CubeComponent} from './speedcubing/components/cube/cube.component';
import {CubeControlsComponent} from './speedcubing/components/cube-controls/cube-controls.component';
import {CubeStatisticsComponent} from './speedcubing/pages/cube-statistics.component';
import {CuberRecordTimeToDatePipe} from './speedcubing/pipes/cuber-record-time-to-date-pipe';
import {NodrigenService} from './openbanking/services/nodrigen.service';
import {NodrigenComponent} from './openbanking/components/nodrigen/nodrigen.component';
import {BanksService} from './openbanking/services/banks.service';
import {TransactionsImportComponent} from './accountant/pages/transactions-import/transactions-import.component';
import {TransactionRowComponent} from './accountant/pages/transactions-import/row/transaction-row.component';
import {MyHammerConfig} from './general/services/my-hammer-config.service';
import {DebitTransactionImporterComponent} from './accountant/pages/transactions-import/importers/debit-transaction-importer.component';
import {CreditTransactionImporterComponent} from './accountant/pages/transactions-import/importers/credit-transaction-importer.component';
import {TransferImporterComponent} from './accountant/pages/transactions-import/importers/transfer-importer.component';
import {IgnoreImporterComponent} from './accountant/pages/transactions-import/importers/ignore-importer.component';
import {MutuallyCancellingImporterComponent} from './accountant/pages/transactions-import/importers/mutually-cancelling-importer.component';
import {UploaderComponent} from './general/components/uploader/uploader.component';
import {IntellectualPropertyComponent} from './ip/components/intellectual-property.component';
import {CubeRecordsService} from './speedcubing/services/cube-records.service';
import {TimeRecordsComponent} from './ip/components/time-records.component';
import {TimeRecordEditorComponent} from './ip/components/utils/time-record-editor.component';
import {IntellectualPropertyTaskEditorModalComponent} from './ip/components/utils/intellectual-property-task-editor-modal.component';
import {IntellectualPropertyEditorModalComponent} from './ip/components/utils/intellectual-property-editor-modal.component';
import {IntellectualPropertyTaskDetailsModalComponent} from './ip/components/utils/intellectual-property-task-details-modal.component';
import {UploaderModalComponent} from './general/components/uploader/uploader-modal.component';
import {IPRReportsComponent} from './ip/components/ipr-reports.component';
import {GraphQLModule} from './graphql.module';
import {NgxLoadingModule} from 'ngx-loading';
import {MortgageSimulatorComponent} from './accountant/pages/mortgage-simulator/mortgage-simulator.component';
import {MortgageSimulatorService} from './accountant/services/mortgage-simulator.service';
import {IPSettingsComponent} from './ip/components/ip-settings.component';
import {TimeRecordCategoryEditorComponent} from './ip/components/utils/time-record-category-editor.component';

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
    TransactionRowComponent,
    DebitTransactionImporterComponent,
    CreditTransactionImporterComponent,
    TransferImporterComponent,
    IgnoreImporterComponent,
    MutuallyCancellingImporterComponent,
    UploaderComponent,
    IntellectualPropertyComponent,
    TimeRecordsComponent,
    TimeRecordEditorComponent,
    IntellectualPropertyTaskEditorModalComponent,
    IntellectualPropertyEditorModalComponent,
    IntellectualPropertyTaskDetailsModalComponent,
    UploaderModalComponent,
    IPRReportsComponent,
    IPSettingsComponent,
    TimeRecordCategoryEditorComponent,
    MortgageSimulatorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule,
    NgbAccordionModule,
    HammerModule,
    NgChartsModule,
    GraphQLModule,
    NgxLoadingModule.forRoot({})
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
    BanksService,
    AccountantSettingsService,
    MortgageSimulatorService,
    {provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
