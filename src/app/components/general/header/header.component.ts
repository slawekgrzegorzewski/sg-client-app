import {Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {LoginService} from 'src/app/services/login.service';
import {Router} from '@angular/router';
import {DomainService} from '../../../services/domain.service';
import {DetailedDomain, Domain} from '../../../model/domain';
import {NgEventBus} from 'ng-event-bus';
import {ApplicationsService} from '../../../services/applications.service';
import {DATA_REFRESH_REQUEST_EVENT, NAVIGATION_RESIZE_EVENT} from '../../../app.module';
import {AccountantSettingsService} from '../../../services/accountant/accountant-settings.service';
import {AccountantSettings} from '../../../model/accountant/accountant-settings';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnDestroy {

  @ViewChild('navigation') navigation!: ElementRef;
  isLoggedIn = false;
  invitations: Domain[] = [];
  availableDomains: DetailedDomain[] = [];
  public accountantSettings: AccountantSettings | null = null;
  private domainSubscription: Subscription;

  constructor(
    public loginService: LoginService,
    public domainService: DomainService,
    private router: Router,
    public eventBus: NgEventBus,
    public applicationsService: ApplicationsService,
    private accountantSettingsService: AccountantSettingsService
  ) {
    this.accountantSettingsService.getForDomain().subscribe(data => this.accountantSettings = data);
    this.fetchData();
    this.domainService.onDomainsChange.subscribe(domains => this.availableDomains = domains);
    this.domainService.onInvitationChange.subscribe(domains => this.invitations = domains);
    this.domainSubscription = this.domainService.onCurrentDomainChange.subscribe((domain) => {
      this.accountantSettingsService.getForDomain().subscribe(data => this.accountantSettings = data);
    });
  }

  ngOnDestroy(): void {
    if (this.domainSubscription) {
      this.domainSubscription.unsubscribe();
    }
  }

  public getTakenHeight(): number {
    return this.navigation?.nativeElement?.offsetHeight || 0;
  }

  public getTakenWidth(): number {
    return this.navigation?.nativeElement?.offsetWidth || 0;
  }

  private fetchData(): void {
    this.isLoggedIn = this.loginService.isLoggedIn();
    this.invitations = this.domainService.invitations;
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
    this.eventBus.cast(DATA_REFRESH_REQUEST_EVENT);
  }
}
