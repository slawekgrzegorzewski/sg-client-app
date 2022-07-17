import {AccountantSettingsService} from './accountant-settings.service';
import {TestBed} from '@angular/core/testing';
import {NgEventBus} from 'ng-event-bus';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {AccountantSettings} from '../../model/accountant/accountant-settings';
import {ACCOUNTANT_SETTINGS_CHANGED, DATA_REFRESH_REQUEST_EVENT} from '../../utils/event-bus-events';

describe('AccountantSettingsService', () => {
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let eventBus: NgEventBus;
  let accountantSettingsService: AccountantSettingsService;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'patch']);
    TestBed.configureTestingModule(
      {
        providers: [
          {provide: HttpClient, useValue: httpClientSpy},
          {provide: NgEventBus, useValue: new NgEventBus()},
          AccountantSettingsService
        ]
      });
    eventBus = TestBed.inject(NgEventBus);
    accountantSettingsService = TestBed.inject(AccountantSettingsService);
  });

  it('GET should call http API only once, with reset for event bus event and when calling refresh method', (done: DoneFn) => {
    const accountantSettings = {'id': 1, 'domain': {'id': 1, 'name': 'a'}, 'company': false};
    httpClientSpy.get.and.returnValue(of(accountantSettings));
    for (let i = 0; i < 10; i++) {
      accountantSettingsService.getForDomain().subscribe(data => expect(data).toEqual(new AccountantSettings(accountantSettings)));
    }
    expect(httpClientSpy.get.calls.count()).toEqual(1);
    eventBus.cast(DATA_REFRESH_REQUEST_EVENT);
    for (let i = 0; i < 10; i++) {
      accountantSettingsService.getForDomain().subscribe(data => expect(data).toEqual(new AccountantSettings(accountantSettings)));
    }
    expect(httpClientSpy.get.calls.count()).toEqual(2);
    done();
  });

  it('Set is company should update the data and generate refresh data', (done: DoneFn) => {
    const accountantSettings = {'id': 1, 'domain': {'id': 1, 'name': 'a'}, 'company': false};
    const accountantSettingsAfterChange = {'id': 1, 'domain': {'id': 1, 'name': 'a'}, 'company': true};

    httpClientSpy.get.and.returnValue(of(accountantSettings));
    httpClientSpy.patch.and.returnValue(of(accountantSettingsAfterChange));
    let accountantSettingsChangedCount = 0;
    eventBus.on(ACCOUNTANT_SETTINGS_CHANGED).subscribe(md => accountantSettingsChangedCount++);

    accountantSettingsService.getForDomain()
      .subscribe(data => expect(data).toEqual(new AccountantSettings(accountantSettings)));
    expect(httpClientSpy.get.calls.count()).toEqual(1);
    accountantSettingsService.setIsCompany(true)
      .subscribe(data => expect(data).toEqual(new AccountantSettings(accountantSettings)));
    expect(httpClientSpy.get.calls.count()).toEqual(2);
    expect(httpClientSpy.patch).toHaveBeenCalledWith(`${accountantSettingsService.API_URL}/is-company/enable`, {});
    expect(accountantSettingsChangedCount).toEqual(1);
    done();
  });

});
