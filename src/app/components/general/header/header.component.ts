import {Component, OnInit} from '@angular/core';
import {LoginService} from 'src/app/services/login.service';
import {Router} from '@angular/router';
import {DomainService} from '../../../services/domain.service';
import {DetailedDomain, Domain} from '../../../model/domain';

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
  invitations: Domain[];
  availableDomains: DetailedDomain[];

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
    public domainService: DomainService,
    private router: Router
  ) {
    this.loginService.loginSubject.subscribe(data => this.fetchData());
    this.domainService.domainsChangeEvent.subscribe(domains => this.availableDomains = domains);
    this.domainService.invitationChangeEvent.subscribe(domains => this.invitations = domains);
  }

  ngOnInit(): void {
    this.fetchData();
  }

  private fetchData(): void {
    this.isLoggedIn = this.loginService.isLoggedIn();
    this.getAvailableApps();
    this.invitations = this.domainService.invitations;
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
    return this.loginService.isAccountant(this.selectedApp);
  }

  isChecker(): boolean {
    return this.loginService.isChecker(this.selectedApp);
  }

  isSYR(): boolean {
    return this.loginService.isSYR(this.selectedApp);
  }

  isSYRAdmin(): boolean {
    return this.loginService.isSYRAdmin(this.selectedApp);
  }

  acceptInvitation(domain: Domain): void {
    this.domainService.acceptInvitation(domain.id).subscribe(data => {
    });
  }

  rejectInvitation(domain: Domain): void {
    this.domainService.rejectInvitation(domain.id).subscribe(data => {
    });
  }
}
