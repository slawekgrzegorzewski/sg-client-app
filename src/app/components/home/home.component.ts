import {Component, OnInit} from '@angular/core';
import {LoginServiceService} from 'src/app/services/login-service/login-service.service';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private _isLoggedIn = false;
  message = ""

  constructor(private _loginService: LoginServiceService, private _http: HttpClient) {
    _loginService.authSub.subscribe(data => this._isLoggedIn = data);
  }

  ngOnInit() {
    this._isLoggedIn = this._loginService.isLoggedIn();
    this.fetchData();
  }

  loggedIn() {
    return this._isLoggedIn;
  }

  fetchData() {
    this._http.get("http://localhost:8080/accounts/all").subscribe(
      data => {
        console.log(data);
        setTimeout(() => this.fetchData(), 2000);
      },
      err => {
        console.log(err);
        setTimeout(() => this.fetchData(), 2000);
      }
    )
  }
}
