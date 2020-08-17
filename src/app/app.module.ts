import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {HeaderComponent} from './components/header/header.component';
import {AccountsComponent} from './components/accounts/accounts.component';
import {LoginComponent} from './components/login/login.component';
import {RegisterComponent} from './components/register/register.component';
import {LoginServiceService} from "./services/login-service/login-service.service";
import {AppRoutingModule} from "./app-routing.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {httpInterceptorProviders} from "./interceptors";
import {HomeComponent} from "./components/home/home.component";
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CreateAccountComponent} from "./components/accounts/create-account.component";
import {ToastService} from "./services/toast/toast-service";
import {ToastsContainer} from "./components/toast/toast-container.component";
import {HoverableButtonsComponent} from "./components/gui/hoverable-buttons.component";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    AccountsComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    CreateAccountComponent,
    ToastsContainer,
    HoverableButtonsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule
  ],
  providers: [LoginServiceService, httpInterceptorProviders, ToastService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
