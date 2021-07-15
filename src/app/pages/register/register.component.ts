import {Component, OnInit} from '@angular/core';
import {LoginService} from 'src/app/services/login.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  message: string | null = null;
  qrUrl: string | null = null;
  confirmPass = '';
  confirmNewPass = '';

  userObject = {
    uname: '',
    upass: '',
    secretFor2FA: ''
  };

  changePasswordObject = {
    uname: '',
    oldpass: '',
    authcode: '',
    newpass: ''
  };
  private type: string | null = null;

  constructor(private loginService: LoginService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(value => {
      this.type = value.get('type');
    });
  }

  registerUser(): void {
    if (this.userObject.uname.trim() !== '' && this.userObject.upass.trim() !== '' && (this.userObject.upass.trim() === this.confirmPass)) {
      this.loginService.registerUser(this.userObject).subscribe(this.registrationResult(this), this.error(this));
    } else {
      this.message = 'Typed password does not match';
    }
  }

  setup2FA(): void {
    if (this.userObject.secretFor2FA !== null) {
      this.loginService.setup2FA(this.userObject).subscribe(this.tokenValidationResult(this), this.error(this));
    } else {
      this.message = 'Token is empty';
    }
  }

  changePassword(): void {
    if (this.changePasswordObject.uname.trim() !== '' && this.changePasswordObject.oldpass.trim() !== ''
      && this.changePasswordObject.newpass.trim() !== '' && this.changePasswordObject.newpass.trim() === this.confirmNewPass) {
      this.loginService.changePassword(this.changePasswordObject).subscribe(this.changePasswordResult(this), this.error(this));
    } else {
      this.message = 'Can not change the password';
    }
  }

  private registrationResult(that: RegisterComponent): (data: any) => void {
    return data => {
      if (data.status === 200) {
        that.qrUrl = data.body;
      } else {
        that.message = data.body;
      }
    };
  }

  private tokenValidationResult(that: RegisterComponent): (data: any) => void {
    return data => {
      if (data.status === 200) {
        that.message = data.body;
        setTimeout(() => {
          that.router.navigate(['/login']);
        }, 2000);
      } else {
        that.message = data.body;
      }
    };
  }

  private changePasswordResult(that: RegisterComponent): (data: any) => void {
    return data => {
      if (data.status === 200) {
        if (that.loginService.isLoggedIn()) {
          that.loginService.logout();
        }
        that.message = data.body;
        setTimeout(() => {
          that.router.navigate(['/login']);
        }, 2000);
      } else {
        that.message = data.body;
      }
    };
  }

  private error(that: RegisterComponent): (error: any) => void {
    return error => that.message = error.error;
  }

  isRegister(): boolean {
    return this.type === 'register';
  }

  isChangePassword(): boolean {
    return this.type === 'change-password';
  }
}
