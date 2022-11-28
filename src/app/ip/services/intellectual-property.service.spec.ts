import {IntellectualPropertyService} from './intellectual-property.service';
import {TestBed} from '@angular/core/testing';
import {NgEventBus} from 'ng-event-bus';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {DATA_REFRESH_REQUEST_EVENT} from '../../general/utils/event-bus-events';
import {IntellectualProperty} from '../model/intellectual-property';

function callGetNTimes(intellectualPropertyService: IntellectualPropertyService, ipr: IntellectualProperty, n: number) {
  for (let i = 0; i < n; i++) {
    intellectualPropertyService.getIntellectualPropertiesForDomain().subscribe(data => {
      expect(data).toEqual([new IntellectualProperty(ipr)]);
    });
  }
}

describe('IntellectualPropertyService', () => {
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let eventBus: NgEventBus;
  let intellectualPropertyService: IntellectualPropertyService;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'patch', 'put', 'delete', 'post']);
    TestBed.configureTestingModule(
      {
        providers: [
          {provide: HttpClient, useValue: httpClientSpy},
          {provide: NgEventBus, useValue: new NgEventBus()},
          IntellectualPropertyService
        ]
      });
    eventBus = TestBed.inject(NgEventBus);
    intellectualPropertyService = TestBed.inject(IntellectualPropertyService);
  });

  it('refresh cached data', (done: DoneFn) => {
    const ipr = {
      id: 1,
      description: 'a',
      tasks: [{
        id: 2,
        attachments: ['at', 'bt'],
        coAuthors: 'author1',
        description: 'b',
        timeRecords: [{id: 3, date: new Date(), numberOfHours: 2, description: 'c', domain: {id: 1, name: 'a'}}]
      }],
      domain: {id: 1, name: 'a'}
    };

    httpClientSpy.get.and.returnValue(of([ipr]));
    httpClientSpy.put.and.returnValue(of(ipr));
    httpClientSpy.patch.and.returnValue(of('OK'));
    httpClientSpy.post.and.returnValue(of('OK'));
    httpClientSpy.delete.and.returnValue(of('OK'));

    callGetNTimes(intellectualPropertyService, ipr, 10);
    expect(httpClientSpy.get.calls.count()).toEqual(1);

    eventBus.cast(DATA_REFRESH_REQUEST_EVENT);
    callGetNTimes(intellectualPropertyService, ipr, 10);
    expect(httpClientSpy.get.calls.count()).toEqual(2);

    intellectualPropertyService.createIntellectualProperty('description').subscribe();
    callGetNTimes(intellectualPropertyService, ipr, 10);
    expect(httpClientSpy.get.calls.count()).toEqual(3);

    intellectualPropertyService.updateIntellectualProperty(1, 'description').subscribe();
    callGetNTimes(intellectualPropertyService, ipr, 10);
    expect(httpClientSpy.get.calls.count()).toEqual(4);

    intellectualPropertyService.deleteIntellectualProperty(1).subscribe();
    callGetNTimes(intellectualPropertyService, ipr, 10);
    expect(httpClientSpy.get.calls.count()).toEqual(5);

    intellectualPropertyService.createTask(1, {coAuthors: '', description: ''}).subscribe();
    callGetNTimes(intellectualPropertyService, ipr, 10);
    expect(httpClientSpy.get.calls.count()).toEqual(6);

    intellectualPropertyService.updateTask(1, {coAuthors: '', description: ''}).subscribe();
    callGetNTimes(intellectualPropertyService, ipr, 10);
    expect(httpClientSpy.get.calls.count()).toEqual(7);

    intellectualPropertyService.deleteTask(1).subscribe();
    callGetNTimes(intellectualPropertyService, ipr, 10);
    expect(httpClientSpy.get.calls.count()).toEqual(8);

    intellectualPropertyService.createTimeRecord(1, {date: new Date(), numberOfHours: 1, description: 'a'}).subscribe();
    callGetNTimes(intellectualPropertyService, ipr, 10);
    expect(httpClientSpy.get.calls.count()).toEqual(9);

    intellectualPropertyService.updateTimeRecord(1, {date: new Date(), numberOfHours: 1, description: 'a'}).subscribe();
    callGetNTimes(intellectualPropertyService, ipr, 10);
    expect(httpClientSpy.get.calls.count()).toEqual(10);

    intellectualPropertyService.deleteTimeRecord(1).subscribe();
    callGetNTimes(intellectualPropertyService, ipr, 10);
    expect(httpClientSpy.get.calls.count()).toEqual(11);

    intellectualPropertyService.uploadAttachment(1, jasmine.createSpyObj(File)).subscribe();
    callGetNTimes(intellectualPropertyService, ipr, 10);
    expect(httpClientSpy.get.calls.count()).toEqual(12);

    intellectualPropertyService.deleteAttachment(1, 'a').subscribe();
    callGetNTimes(intellectualPropertyService, ipr, 10);
    expect(httpClientSpy.get.calls.count()).toEqual(13);

    done();
  });

});
