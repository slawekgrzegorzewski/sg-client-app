import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {DetailedDomain, Domain} from '../model/domain';
import {map, tap} from 'rxjs/operators';
import {LoginService} from './login.service';

@Injectable({
  providedIn: 'root'
})
export class DomainService {

  private readonly endpoint = `${environment.serviceUrl}/domains`;
  domainsChangeEvent = new EventEmitter<DetailedDomain[]>();
  invitationChangeEvent = new EventEmitter<Domain[]>();
  availableDomains: DetailedDomain[] = [];
  invitations: Domain[] = [];

  get currentDomain(): DetailedDomain | null {
    return (this.availableDomains || []).find(d => d.id === (this.loginService.currentDomainId || -1)) || null;
  }

  constructor(
    private http: HttpClient,
    private loginService: LoginService
  ) {
    this.loginService.loginSubject.subscribe(isLoggedIn => this.refreshData(isLoggedIn));
  }

  private refreshData(isLoggedIn: boolean): void {
    if (isLoggedIn) {
      this.getAllDomains().subscribe(data => {
        this.availableDomains = data;
        this.domainsChangeEvent.emit(this.availableDomains);
      });
      this.getInvitations().subscribe(
        data => {
          this.invitations = data;
          this.invitationChangeEvent.emit(this.invitations);
        }
      );
    } else {
      this.availableDomains = [];
      this.invitations = [];
      this.domainsChangeEvent.emit(this.availableDomains);
      this.invitationChangeEvent.emit(this.invitations);
    }
  }

  getAllDomains(): Observable<DetailedDomain[]> {
    return this.http.get<DetailedDomain[]>(this.endpoint, {responseType: 'json'})
      .pipe(map((r: DetailedDomain[]) => r.map(r1 => new DetailedDomain(r1))));
  }

  create(name: string): Observable<Domain> {
    return this.http.put<Domain>(`${this.endpoint}/${name}`, {responseType: 'json'})
      .pipe(
        map(r => new Domain(r)),
        tap(d => this.refreshData(this.loginService.isLoggedIn()))
      );
  }

  update(domain: Domain): Observable<DetailedDomain> {
    return this.http.patch<DetailedDomain>(this.endpoint, domain, {responseType: 'json'})
      .pipe(
        map(d => new DetailedDomain(d)),
        tap(d => this.refreshData(this.loginService.isLoggedIn()))
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
        tap(d => this.refreshData(this.loginService.isLoggedIn()))
      );
  }

  getInvitations(): Observable<Domain[]> {
    return this.http.get<Partial<Domain>[]>(`${this.endpoint}/invitations`, {responseType: 'json'})
      .pipe(map((data: Partial<Domain>[]) => data.map(d => new Domain(d))));
  }

  removeUserFromDomain(domainId: number, userLogin: string): Observable<DetailedDomain> {
    return this.http.delete<DetailedDomain>(`${this.endpoint}/${domainId}/${userLogin}`, {responseType: 'json'})
      .pipe(
        map(d => new DetailedDomain(d)),
        tap(d => this.refreshData(this.loginService.isLoggedIn()))
      );
  }

  inviteUserToDomain(domainId: number, userLogin: string): Observable<object> {
    return this.http.post(`${this.endpoint}/invite/${domainId}/${userLogin}`, {observe: 'response'})
      .pipe(tap(d => this.refreshData(this.loginService.isLoggedIn())));
  }

  acceptInvitation(domainId: number): Observable<object> {
    return this.http.post(`${this.endpoint}/invitations/accept/${domainId}`, {observe: 'response'})
      .pipe(tap(d => this.refreshData(this.loginService.isLoggedIn())));
  }

  rejectInvitation(domainId: number): Observable<object> {
    return this.http.post(`${this.endpoint}/invitations/reject/${domainId}`, {observe: 'response'})
      .pipe(tap(d => this.refreshData(this.loginService.isLoggedIn())));
  }
}
