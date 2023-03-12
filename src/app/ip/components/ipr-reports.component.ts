import {Component, OnInit} from '@angular/core';
import {IntellectualPropertyService} from '../services/intellectual-property.service';
import {TimeRecord, TimeRecordWithTask} from '../model/time-record';
import {ComparatorBuilder} from '../../general/utils/comparator-builder';
import {forkJoin} from 'rxjs';
import 'rxjs-compat/add/observable/of';
import {DatePipe} from '@angular/common';
import {DatesUtils} from '../../general/utils/dates-utils';
import {DATA_REFRESH_REQUEST_EVENT} from '../../general/utils/event-bus-events';
import {NgEventBus} from 'ng-event-bus';
import {ActivatedRoute} from '@angular/router';
import {DomainService} from '../../general/services/domain.service';
import {DomainRegistrationHelper} from '../../general/components/domain/domain-registration-helper';
import {IntellectualProperty} from '../model/intellectual-property';
import {IPRReport} from '../utils/ipr-report';

export const IPR_REPORTS_ROUTER_URL = 'ipr-reports';

@Component({
  selector: 'app-ipr-reports',
  templateUrl: './ipr-reports.component.html',
  styleUrls: ['./ipr-reports.component.css']
})
export class IPRReportsComponent implements OnInit {

  timeRecordsNotAssignedToTask: TimeRecord[] = [];
  intellectualProperties: IntellectualProperty[] = [];
  iprReport: IPRReport | null = null;

  years: string[] = [];
  _year: string | null = null;

  get year(): string {
    return this._year || '';
  }

  set year(value: string) {
    this._year = value;
    const intellectualProperties1 = this.intellectualProperties.filter(ip => ip.tasks.find(t => t.timeRecords.find(tr => DatesUtils.getYearString(tr.date, this.datePipe) === this.year) !== undefined));
    const notAssignedTimeRecords = this.timeRecordsNotAssignedToTask.filter(tr => DatesUtils.getYearString(tr.date, this.datePipe) === this.year);
    this.iprReport = new IPRReport(
      this.datePipe,
      this.year,
      intellectualProperties1,
      notAssignedTimeRecords
    );
  }

  private domainRegistrationHelper: DomainRegistrationHelper;

  constructor(
    private intellectualPropertyService: IntellectualPropertyService,
    private datePipe: DatePipe,
    private eventBus: NgEventBus,
    private route: ActivatedRoute,
    private domainService: DomainService) {
    this.domainRegistrationHelper = new DomainRegistrationHelper(domainService, eventBus, route, IPR_REPORTS_ROUTER_URL);
    this.domainRegistrationHelper.domainChangedEvent.subscribe(() => this.refreshData());
  }

  ngOnInit(): void {
    this.refreshData();
    this.eventBus.on(DATA_REFRESH_REQUEST_EVENT).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnDestroy(): void {
    this.domainRegistrationHelper.onDestroy();
  }

  refreshData() {
    forkJoin([
      this.intellectualPropertyService.getTimeRecordsNotAssignedToTask(),
      this.intellectualPropertyService.getIntellectualPropertiesForDomain()
    ])
      .subscribe(([timeRecordsNotAssignedToTask, intellectualProperties]) => {
        this.timeRecordsNotAssignedToTask = timeRecordsNotAssignedToTask;
        this.intellectualProperties = intellectualProperties;
        const timeRecordsWithTask = intellectualProperties
          .flatMap(intellectualProperties => intellectualProperties.tasks)
          .flatMap(task => task.timeRecords.map(timeRecord => ({
            ...timeRecord,
            task: task
          } as TimeRecordWithTask)));
        const timeRecordsWithoutTask = timeRecordsNotAssignedToTask.map(timeRecord => ({
          ...timeRecord,
          task: null
        } as TimeRecordWithTask));

        const byDate = ComparatorBuilder.comparingByDate<TimeRecordWithTask>(timeRecord => timeRecord.date).build();
        const datesSet = new Set<string>();
        for (let timeRecord of this.timeRecordsNotAssignedToTask) {
          datesSet.add(DatesUtils.getYearString(timeRecord.date, this.datePipe));
        }
        for (let intellectualProperty of this.intellectualProperties) {
          for (let task of intellectualProperty.tasks) {
            for (let timeRecord of task.timeRecords) {
              datesSet.add(DatesUtils.getYearString(timeRecord.date, this.datePipe));
            }
          }
        }
        this.years = [...datesSet.values()];
        this.years.sort();
      });
  }
}
