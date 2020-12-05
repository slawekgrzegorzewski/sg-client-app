import {Component, OnInit} from '@angular/core';
import {LoginService} from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  userObject = {
    uname: '',
    upass: '',
    authcode: null
  };
  message: string = null;

  constructor(private loginService: LoginService) {
  }

  ngOnInit(): void {
  }

  loginUser(): void {
    if (this.userObject.uname && this.userObject.authcode && this.userObject.authcode) {
      this.loginService.authenticate(this.userObject).subscribe(
        data => {
          if (data.status !== 200) {
            this.message = 'ok:' + data.body;
          }
        },
        error => {
          this.message = 'not ok:' + JSON.stringify(error);
        });
    }
  }

}
