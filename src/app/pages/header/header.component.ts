import {Component, OnInit} from '@angular/core';
import {LoginService} from 'src/app/services/login.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;

  constructor(
    public loginService: LoginService,
    private router: Router
  ) {
    this.loginService.authSub.subscribe(data => this.isLoggedIn = data);
  }

  ngOnInit(): void {
    this.isLoggedIn = this.loginService.isLoggedIn();
  }

  toggleMenuBar(): void {
    if (document.getElementById('collapsibleNavId').style.display == 'block') {
      document.getElementById('collapsibleNavId').style.display = 'none';
    } else {
      document.getElementById('collapsibleNavId').style.display = 'block';
    }
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}
