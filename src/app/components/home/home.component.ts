import {Component, OnInit} from '@angular/core';
import {LoginServiceService} from 'src/app/services/login-service/login-service.service';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'accounts',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private _isLoggedIn = false;
  message = "Hello :)"

  constructor(private _loginService: LoginServiceService, private _http: HttpClient) {
    _loginService.authSub.subscribe(data => this._isLoggedIn = data);
  }

  ngOnInit() {
    this._isLoggedIn = this._loginService.isLoggedIn();
  }

  loggedIn() {
    return this._isLoggedIn;
  }
}
