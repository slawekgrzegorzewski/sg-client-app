import {Component, OnInit} from '@angular/core';
import {ACCOUNTANT_APP, CHECKER_APP, LoginService, SYR_APP} from 'src/app/services/login.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  selectedProduct: string;
  availableApps: { app: string, routerLink: string }[] = [];
  selectedAppInternal: string;

  get selectedApp(): string {
    return this.selectedAppInternal;
  }

  set selectedApp(value: string) {
    this.selectedAppInternal = value;
    const app = this.availableApps.find(v => v.app === value);
    this.router.navigate([app.routerLink]);
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

  ngOnInit(): void {
    this.isLoggedIn = this.loginService.isLoggedIn();
    this.getAvailableApps();
  }

  private getAvailableApps(): void {
    const apps = this.loginService.getAvailableApps();
    this.availableApps = [];
    for (const a of apps.keys()) {
      this.availableApps.push({app: a, routerLink: apps.get(a)});
    }
    if (this.availableApps && this.availableApps.length > 0) {
      this.selectedApp = this.availableApps[0].app;
    }
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

  isSYR(): boolean {
    return this.selectedApp === SYR_APP;
  }

  isSYRAdmin(): boolean {
    return this.isSYR() && this.loginService.containsRole('SYR_ADMIN');
  }
}
