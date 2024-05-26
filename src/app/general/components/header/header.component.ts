import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {LoginService} from 'src/app/general/services/login.service';
import {Router} from '@angular/router';
import {DomainService} from '../../services/domain.service';
import {DetailedDomain, Domain} from '../../model/domain';
import {NgEventBus} from 'ng-event-bus';
import {ApplicationsService} from '../../services/applications.service';
import {
  DATA_REFRESH_REQUEST_EVENT,
  DOMAINS_CHANGED,
  INVITATIONS_CHANGED,
  NAVIGATION_RESIZE_EVENT,
  SELECTED_DOMAIN_CHANGED
} from '../../utils/event-bus-events';
import {AccountantSettingsService} from '../../../accountant/services/accountant-settings.service';
import {AccountantSettings} from '../../../accountant/model/accountant-settings';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @ViewChild('navigation') navigation!: ElementRef;
  isLoggedIn = false;
  invitations: Domain[] = [];
  availableDomains: DetailedDomain[] = [];
  public accountantSettings: AccountantSettings | null = null;

  constructor(
    public loginService: LoginService,
    public domainService: DomainService,
    private router: Router,
    public eventBus: NgEventBus,
    public applicationsService: ApplicationsService,
    private accountantSettingsService: AccountantSettingsService
  ) {

    this.eventBus.on(DOMAINS_CHANGED)
      .subscribe(md => this.domainService.getAllDomains().subscribe(domains => this.availableDomains = domains));

    this.eventBus.on(INVITATIONS_CHANGED)
      .subscribe(md => this.domainService.getInvitations().subscribe(invitations => this.invitations = invitations));

    this.eventBus.on(SELECTED_DOMAIN_CHANGED).subscribe((md) => {
      this.accountantSettingsService.getForDomain().subscribe(data => this.accountantSettings = data);
    });
  }

  ngOnInit(): void {
    this.fetchData();
  }

  public getTakenHeight(): number {
    return this.navigation?.nativeElement?.offsetHeight || 0;
  }

  public getTakenWidth(): number {
    return this.navigation?.nativeElement?.offsetWidth || 0;
  }

  private fetchData(): void {
    this.isLoggedIn = this.loginService.isLoggedIn();
    this.accountantSettingsService.getForDomain().subscribe(data => this.accountantSettings = data);
    this.domainService.getAllDomains().subscribe(domains => this.availableDomains = domains);
    this.domainService.getInvitations().subscribe(invitations => this.invitations = invitations);
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

  acceptInvitation(domain: Domain): void {
    this.domainService.acceptInvitation(domain.id).subscribe(data => {
    });
  }

  rejectInvitation(domain: Domain): void {
    this.domainService.rejectInvitation(domain.id).subscribe(data => {
    });
  }

  onResize() {
    this.eventBus.cast(NAVIGATION_RESIZE_EVENT, {h: this.getTakenHeight(), w: this.getTakenWidth()});
  }

  castRefreshRequest(): void {
    this.fetchData();
    this.eventBus.cast(DATA_REFRESH_REQUEST_EVENT);
  }

  protected readonly environment = environment;
}
