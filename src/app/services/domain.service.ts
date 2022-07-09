import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom, forkJoin, mergeMap, Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {DetailedDomain, Domain} from '../model/domain';
import {filter, map, share, tap} from 'rxjs/operators';
import {ActivatedRoute, ActivationEnd, Router} from '@angular/router';
import {NgEventBus} from 'ng-event-bus';
import {APP_LOGIN_STATUS_EVENT, APP_LOGIN_STATUS_REQUEST_EVENT, AppLoginStatus} from '../app.module';
import {MetaData} from 'ng-event-bus/lib/meta-data';

export type ComponentRegistration = { component: string, route: ActivatedRoute };

const DOMAIN_KEY = 'domain';

@Injectable({
  providedIn: 'root'
})
export class DomainService {

  private readonly endpoint = `${environment.serviceUrl}/domains`;
  private getAllDomainsObservable: Observable<DetailedDomain[]> | null = null;
  private getOtherDomainsObservable: Observable<DetailedDomain[]> | null = null;
  private getInvitationsObservable: Observable<Domain[]> | null = null;

  onCurrentDomainChange = new EventEmitter<DetailedDomain | null>();
  onInvitationChange = new EventEmitter<Domain[]>();

  availableDomains: DetailedDomain[] = [];
  invitations: Domain[] = [];

  private isLoggedIn: boolean = false;
  private defaultDomainId: number | null = null;
  private componentRegistration: ComponentRegistration | null = null;

  get currentDomain(): DetailedDomain | null {
    const domainId = this.currentDomainId || -1;
    return this.findDomain(domainId);
  }

  private async findDomain(domainId: number) {

    firstValueFrom(this.getAllDomains()
      .pipe(
        map(domains => domains.filter(d => d.id === domainId) || null)
      ));
  }

  get currentDomainId(): number {
    let domainIdInLocalStorage = localStorage.getItem(DOMAIN_KEY);
    if (!domainIdInLocalStorage) {
      if (this.defaultDomainId) {
        domainIdInLocalStorage = this.defaultDomainId.toString();
      }
      if (domainIdInLocalStorage) {
        localStorage.setItem(DOMAIN_KEY, domainIdInLocalStorage);
      }
    }
    return Number(domainIdInLocalStorage);
  }

  set currentDomainId(domainId: number) {
    const domain = this.findDomain(+domainId);
    if (domain && this.componentRegistration) {
      this.router.navigate([this.componentRegistration.component, domain.id]);
    }
  }

  constructor(
    private http: HttpClient,
    private eventBus: NgEventBus,
    private router: Router
  ) {
    this.eventBus.on(APP_LOGIN_STATUS_EVENT).subscribe((metaData: MetaData) => {
      const appLoginStatus = metaData.data as AppLoginStatus;
      this.isLoggedIn = appLoginStatus.isLoggedId;
      this.defaultDomainId = appLoginStatus.defaultDomainId;
      this.refreshData();
    });
    setTimeout(() => this.eventBus.cast(APP_LOGIN_STATUS_REQUEST_EVENT), 1);

    this.router.events
      .pipe(filter(event => event instanceof ActivationEnd))
      .subscribe(value => {
        if (this.router.url !== '/' && this.componentRegistration) {
          let domainId = 0;
          this.componentRegistration.route.paramMap.subscribe(value => {
            if (value.get('domainId') !== undefined) {
              domainId = Number(value.get('domainId'));
            }
          });
          if (domainId > 0) {
            if (this.currentDomainId !== domainId) {
              localStorage.setItem(DOMAIN_KEY, domainId.toString());
              this.onCurrentDomainChange.emit(this.currentDomain);
            }
          } else {
            this.router.navigate([this.router.url, this.currentDomainId], {queryParamsHandling: 'preserve'});
          }
        }
      });
  }

  public registerToDomainChangesViaRouterUrl(component: string, route: ActivatedRoute): void {
    this.componentRegistration = {component: component, route: route};
  }

  public deregisterFromDomainChangesViaRouterUrl(component: string) {
    if (this.componentRegistration && this.componentRegistration.component === component) {
      this.componentRegistration = null;
    }
  }

  resetCurrentDomainId(): void {
    localStorage.removeItem(DOMAIN_KEY);
  }

  private refreshData(): void {
    this.getAllDomainsObservable = null;
    this.getOtherDomainsObservable = null;
  }

  private refreshInvitationData() {
    this.getInvitationsObservable = null;
  }

  getAllDomains(): Observable<DetailedDomain[]> {
    if (this.getAllDomainsObservable === null) {
      this.getAllDomainsObservable = this.http.get<DetailedDomain[]>(this.endpoint, {responseType: 'json'})
        .pipe(
          map((r: DetailedDomain[]) => r.map(r1 => new DetailedDomain(r1))),
          share()
        );
    }
    return this.getAllDomainsObservable;
  }

  getOtherDomains(): Observable<DetailedDomain[]> {
    if (this.getOtherDomainsObservable === null) {
      this.getOtherDomainsObservable = this.http.get<DetailedDomain[]>(this.endpoint, {responseType: 'json'})
        .pipe(
          map((r: DetailedDomain[]) => r.map(r1 => new DetailedDomain(r1))),
          map(domains => domains.filter(domain => domain.id !== this.currentDomainId)),
          share()
        );
    }
    return this.getOtherDomainsObservable;
  }

  create(name: string): Observable<Domain> {
    return this.http.put<Domain>(`${this.endpoint}/${name}`, {responseType: 'json'})
      .pipe(
        map(r => new Domain(r)),
        tap(d => this.refreshData())
      );
  }

  update(domain: Domain): Observable<DetailedDomain> {
    return this.http.patch<DetailedDomain>(this.endpoint, domain, {responseType: 'json'})
      .pipe(
        map(d => new DetailedDomain(d)),
        tap(d => this.refreshData())
      );
  }

  makeUserMember(domainId: number, userLogin: string): Observable<DetailedDomain> {
    return this.changeUserAccessLevel(domainId, userLogin, `MEMBER`);
  }

  makeUserAdmin(domainId: number, userLogin: string): Observable<DetailedDomain> {
    return this.changeUserAccessLevel(domainId, userLogin, `ADMIN`);
  }

  private changeUserAccessLevel(domainId: number, userLogin: string, accessLevel: string): Observable<DetailedDomain> {
    return this.http.post<DetailedDomain>(`${this.endpoint}/${accessLevel}/${domainId}/${userLogin}`, {responseType: 'json'})
      .pipe(
        map(d => new DetailedDomain(d)),
        tap(d => this.refreshData())
      );
  }

  getInvitations(): Observable<Domain[]> {
    if (this.getInvitationsObservable === null) {
      this.getInvitationsObservable = this.http.get<Partial<Domain>[]>(`${this.endpoint}/invitations`, {responseType: 'json'})
        .pipe(
          map((data: Partial<Domain>[]) => data.map(d => new Domain(d))),
          share()
        );
    }
    return this.getInvitationsObservable;
  }

  removeUserFromDomain(domainId: number, userLogin: string): Observable<DetailedDomain> {
    return this.http.delete<DetailedDomain>(`${this.endpoint}/${domainId}/${userLogin}`, {responseType: 'json'})
      .pipe(
        map(d => new DetailedDomain(d)),
        tap(d => this.refreshData())
      );
  }

  inviteUserToDomain(domainId: number, userLogin: string): Observable<object> {
    return this.http.post(`${this.endpoint}/invite/${domainId}/${userLogin}`, {observe: 'response'})
      .pipe(tap(d => this.refreshInvitationData()));
  }

  acceptInvitation(domainId: number): Observable<object> {
    return this.http.post(`${this.endpoint}/invitations/accept/${domainId}`, {observe: 'response'})
      .pipe(tap(d => this.refreshInvitationData()));
  }

  rejectInvitation(domainId: number): Observable<object> {
    return this.http.post(`${this.endpoint}/invitations/reject/${domainId}`, {observe: 'response'})
      .pipe(tap(d => this.refreshInvitationData()));
  }
}
