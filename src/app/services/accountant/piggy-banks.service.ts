import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {SettingsService} from './settings.service';
import {map} from 'rxjs/operators';
import {PiggyBank} from '../../model/accountant/piggy-bank';

@Injectable({
  providedIn: 'root'
})
export class PiggyBanksService {
  serviceUrl: string;

  constructor(private http: HttpClient,
              private settingsService: SettingsService) {
    this.serviceUrl = environment.serviceUrl;
  }

  getAllPiggyBanks(): Observable<PiggyBank[]> {
    return this.http.get<PiggyBank[]>(environment.serviceUrl + '/piggy-banks')
      .pipe(map(data => data.map(d => new PiggyBank(d))));
  }

  create(piggyBank: PiggyBank): Observable<number> {
    return this.http.put<number>(environment.serviceUrl + '/piggy-banks', piggyBank);
  }

  update(piggyBank: PiggyBank): Observable<string> {
    return this.http.patch(environment.serviceUrl + '/piggy-banks', piggyBank, {responseType: 'text'});
  }

}
