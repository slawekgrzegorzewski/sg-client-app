import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router'
import {LoginServiceService} from 'src/app/services/login-service/login-service.service';

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

  constructor(private _loginService: LoginServiceService, private _router: Router) {
  }

  ngOnInit() {
  }

  loginUser() {
    this._loginService.loginAuth(this.userObject).subscribe((data) => {
      this.message = data.body
      if (data.status === 200) {
        this._loginService.updateAuthStatus(true);
      }
    })
  }

}
