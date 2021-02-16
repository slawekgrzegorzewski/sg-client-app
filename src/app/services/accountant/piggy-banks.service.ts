import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {SettingsService} from './settings.service';
import {map} from 'rxjs/operators';
import {PiggyBank} from '../../model/accountant/piggy-bank';
import {DomainService} from '../domain.service';

@Injectable({
  providedIn: 'root'
})
export class PiggyBanksService {
  serviceUrl: string;

  constructor(private http: HttpClient,
              private settingsService: SettingsService,
              private domainService: DomainService) {
    this.serviceUrl = environment.serviceUrl;
  }

  currentDomainPiggyBanks(): Observable<PiggyBank[]> {
    return this.http.get<PiggyBank[]>(environment.serviceUrl + '/piggy-banks/' + this.domainService.currentDomainId)
      .pipe(map(data => data.map(d => new PiggyBank(d))));
  }

  create(piggyBank: PiggyBank): Observable<number> {
    piggyBank.domain = this.domainService.currentDomain;
    return this.http.put<number>(environment.serviceUrl + '/piggy-banks', piggyBank);
  }

  update(piggyBank: PiggyBank): Observable<string> {
    return this.http.patch(environment.serviceUrl + '/piggy-banks', piggyBank, {responseType: 'text'});
  }

}
