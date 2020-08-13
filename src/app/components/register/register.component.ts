import {Component, OnInit} from '@angular/core';
import {LoginServiceService} from 'src/app/services/login-service/login-service.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  message: string = null
  qrUrl: string = null
  confirmPass: string = ""

  userObject = {
    uname: "",
    upass: "",
    secretFor2FA: ""
  }

  constructor(private _loginService: LoginServiceService, private _router: Router) {
  }

  ngOnInit() {
  }

  registerUser() {
    if (this.userObject.uname.trim() !== "" && this.userObject.upass.trim() !== "" && (this.userObject.upass.trim() === this.confirmPass)) {
      this._loginService.registerUser(this.userObject).subscribe(this.registrationResult(this), this.error(this));
    } else {
      this.message = "Typed password does not match"
    }
  }

  setup2FA() {
    if (this.userObject.secretFor2FA !== null) {
      this._loginService.setup2FA(this.userObject).subscribe(this.tokenValidationResult(this), this.error(this));
    } else {
      this.message = "Token is empty";
    }
  }

  private registrationResult(that) {
    return data => {
      if (data.status === 200) {
        that.qrUrl = data.body
      } else {
        that.message = data.body
      }
    }
  }

  private tokenValidationResult(that) {
    return data => {
      if (data.status === 200) {
        that.message = data.body
        setTimeout(() => {
          that._router.navigate(['/login']);
        }, 2000);
      } else {
        that.message = data.body
      }
    }
  }

  private error(that) {
    return error => that.message = error.error
  }
}
