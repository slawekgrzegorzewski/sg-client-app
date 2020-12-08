import {Component, OnInit} from '@angular/core';
import {ACCOUNTANT_APP, CHECKER_APP, LoginService} from 'src/app/services/login.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  selectedProduct: string;
  availableApps: string[][] = [];
  selectedAppInternal: string[] = [];

  get selectedApp(): string {
    return this.selectedAppInternal[0];
  }

  set selectedApp(value: string) {
    this.selectedAppInternal = this.availableApps.find(v => v[0] === value);
    this.router.navigate([this.selectedAppInternal[1]]);
  }

  constructor(
    public loginService: LoginService,
    private router: Router
  ) {
    this.loginService.authSub.subscribe(data => {
      this.isLoggedIn = data;
      this.getAvailableApps();
    });
  }

  private getAvailableApps(): void {
    const apps = this.loginService.getAvailableApps();
    for (const app of apps.keys()) {
      this.availableApps.push([app, apps.get(app)]);
    }
    this.selectedApp = this.availableApps[0][0];
  }

  ngOnInit(): void {
    this.isLoggedIn = this.loginService.isLoggedIn();
    this.getAvailableApps();
  }

  toggleMenuBar(): void {
    if (document.getElementById('collapsibleNavId').style.display === 'block') {
      document.getElementById('collapsibleNavId').style.display = 'none';
    } else {
      document.getElementById('collapsibleNavId').style.display = 'block';
    }
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

  isAccountant(): boolean {
    return this.selectedApp === ACCOUNTANT_APP;
  }

  isChecker(): boolean {
    return this.selectedApp === CHECKER_APP;
  }
}
