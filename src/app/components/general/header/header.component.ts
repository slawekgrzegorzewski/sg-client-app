import {Component, OnInit} from '@angular/core';
import {LoginService} from 'src/app/services/login.service';
import {Router} from '@angular/router';
import {DomainService} from '../../../services/domain.service';
import {DetailedDomain, Domain} from '../../../model/domain';
import {NgEventBus} from 'ng-event-bus';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  availableApps: { app: string, routerLink: string }[] = [];
  invitations: Domain[] = [];
  availableDomains: DetailedDomain[] = [];

  selectedAppInternal: string | null = null;

  get selectedApp(): string | null {
    return this.selectedAppInternal;
  }

  set selectedApp(value: string | null) {
    this.selectedAppInternal = value;
    const app = this.availableApps.find(v => v.app === value);
    if (app) {
      this.router.navigate([app.routerLink]);
    }
  }

  constructor(
    public loginService: LoginService,
    public domainService: DomainService,
    private router: Router,
    public eventBus: NgEventBus
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
    apps.forEach((value, key) => this.availableApps.push({app: key, routerLink: value}));
    if (this.availableApps && this.availableApps.length > 0) {
      this.selectedApp = this.availableApps[0].app;
    }
  }

  toggleMenuBar(): void {
    const collapsibleNav = document.getElementById('collapsibleNavId');
    if (!collapsibleNav) {
      return;
    }
    if (collapsibleNav.style.display === 'block') {
      collapsibleNav.style.display = 'none';
    } else {
      collapsibleNav.style.display = 'block';
    }
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

  isAccountant(): boolean {
    return this.selectedApp !== null && this.loginService.isAccountant(this.selectedApp);
  }

  isChecker(): boolean {
    return this.selectedApp !== null && this.loginService.isChecker(this.selectedApp);
  }

  isSYR(): boolean {
    return this.selectedApp !== null && this.loginService.isSYR(this.selectedApp);
  }

  isSYRAdmin(): boolean {
    return this.selectedApp !== null && this.loginService.isSYRAdmin(this.selectedApp);
  }

  isCubesApp(): boolean {
    return this.selectedApp !== null && this.loginService.isCubesApp(this.selectedApp);
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
