import {Component, OnInit} from '@angular/core';
import {LoginService} from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  userObject = {
    uname: "",
    upass: "",
    authcode: null
  }
  message: string = null

  constructor(private _loginService: LoginService) {
  }

  ngOnInit() {
  }

  loginUser() {
    this._loginService.authenticate(this.userObject).subscribe(
      data => {
        if (data.status !== 200) {
          this.message = data.body;
        }
      },
      error => {
        this.message = JSON.stringify(error.error);
      })
  }

}
