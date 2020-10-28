import {Component, OnInit} from '@angular/core';
import {LoginService} from 'src/app/services/login.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false

  constructor(
    public loginService: LoginService,
    private router: Router
  ) {
    this.loginService.authSub.subscribe(data => this.isLoggedIn = data);
  }

  ngOnInit() {
    this.isLoggedIn = this.loginService.isLoggedIn();
  }

  toggleMenuBar() {
    if (document.getElementById("collapsibleNavId").style.display == "block") {
      document.getElementById("collapsibleNavId").style.display = "none";
    } else {
      document.getElementById("collapsibleNavId").style.display = "block";
    }
  }

  logout() {
    this.loginService.logout()
    this.router.navigate(['/login'])
  }

  goAsAdmin() {
    localStorage.setItem('token', localStorage.getItem('adminToken'));
    window.location.reload();
  }

  goAsGuest() {
    localStorage.setItem('token', localStorage.getItem('guestToken'));
    window.location.reload();
  }
}
