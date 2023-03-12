import {Component, OnInit} from '@angular/core';
import {IntellectualPropertyService} from '../services/intellectual-property.service';
import {EMPTY_TASK, EMPTY_TASK_ID, IntellectualPropertyTask} from '../model/intellectual-property-task';
import {EMPTY_TIME_RECORD, TimeRecord, TimeRecordWithTask} from '../model/time-record';
import {ComparatorBuilder} from '../../general/utils/comparator-builder';
import {forkJoin} from 'rxjs';
import 'rxjs-compat/add/observable/of';
import Decimal from 'decimal.js';
import {DatePipe} from '@angular/common';
import {DatesUtils} from '../../general/utils/dates-utils';
import {NgbModal, NgbModalConfig} from '@ng-bootstrap/ng-bootstrap';
import {TimeRecordEditorComponent} from './utils/time-record-editor.component';
import {DATA_REFRESH_REQUEST_EVENT} from '../../general/utils/event-bus-events';
import {NgEventBus} from 'ng-event-bus';
import {ActivatedRoute} from '@angular/router';
import {DomainService} from '../../general/services/domain.service';
import {DomainRegistrationHelper} from '../../general/components/domain/domain-registration-helper';
import {IntellectualProperty} from "../model/intellectual-property";

export const TIME_RECORDS_ROUTER_URL = 'time-records';

@Component({
  selector: 'app-ip-records',
  templateUrl: './ip-records.component.html',
  styleUrls: ['./ip-records.component.css']
})
export class IpRecordsComponent implements OnInit {

  timeRecordsNotAssignedToTask: TimeRecord[] = [];
  intellectualProperties: IntellectualProperty[] = [];
  dates: string[] = [];
  _date: string | null = null;

  get date(): string {
    return this._date || '';
  }

  set date(value: string) {
    this._date = value;
  }

  private domainRegistrationHelper: DomainRegistrationHelper;

  constructor(
    private intellectualPropertyService: IntellectualPropertyService,
    private datePipe: DatePipe,
    private eventBus: NgEventBus,
    private route: ActivatedRoute,
    private domainService: DomainService) {
    this.domainRegistrationHelper = new DomainRegistrationHelper(domainService, eventBus, route, TIME_RECORDS_ROUTER_URL);
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
        this.dates = [
          ...new Set([...this.timeRecordsNotAssignedToTask, this.intellectualProperties.map(ip=>ip.tasks)] this.timeRecords.map(timeRecord => timeRecord.date)
            .map(d => DatesUtils.getYearString(d, this.datePipe)))
        ].sort();
        const previousDate = this.date;
        this.date = this.dates[this.dates.length - 1];
        if (previousDate && this.dates.includes(previousDate)) {
          this.date = previousDate;
        }
        this.tasks = intellectualProperties.flatMap(intellectualProperty => intellectualProperty.tasks);
      });
  }

  timeRecordAction(actionData: { timeRecord: TimeRecord, task: IntellectualPropertyTask }) {
    const {timeRecord, task} = actionData;
    let responseObservable;
    if (timeRecord) {
      const taskId = task && task.id
        ? (task.id === EMPTY_TASK_ID ? null : task.id)
        : null;
      if (timeRecord.id) {
        if ((taskId === null && this.previousTaskId === null) || (taskId === this.previousTaskId)) {
          responseObservable = this.intellectualPropertyService.updateTimeRecord(timeRecord.id, timeRecord);
        } else {
          responseObservable = this.intellectualPropertyService.updateTimeRecordWithTask(taskId, timeRecord.id, timeRecord);
          responseObservable = this.intellectualPropertyService.updateTimeRecordWithTask(taskId, timeRecord.id, timeRecord);
        }
      } else {
        responseObservable = this.intellectualPropertyService.createTimeRecord(taskId, timeRecord);
      }
    }
    responseObservable?.subscribe({
      complete: () => {
        this.refreshData();
      }
    });
  }

  showTimeRecordEdition(timeRecord: TimeRecordWithTask) {
    this.previousTaskId = timeRecord.task?.id || null;
    const ngbModalRef = this.modalService.open(TimeRecordEditorComponent);
    const componentInstance = ngbModalRef.componentInstance as TimeRecordEditorComponent;
    componentInstance.tasks = this.tasks;
    componentInstance.task = timeRecord.task || EMPTY_TASK;
    componentInstance.timeRecord = timeRecord;
    ngbModalRef.result.then(
      result => this.timeRecordAction(result),
      () => {
      }
    );
  }

  showTimeRecordCreation() {
    const ngbModalRef = this.modalService.open(TimeRecordEditorComponent);
    const componentInstance = ngbModalRef.componentInstance as TimeRecordEditorComponent;
    componentInstance.tasks = this.tasks;
    componentInstance.timeRecord = new TimeRecord(EMPTY_TIME_RECORD);
    ngbModalRef.result.then(
      result => this.timeRecordAction(result),
      () => {
      }
    );
  }

  totalHours() {
    return Array.from(this.timeRecordsForMonth.values())
      .flatMap(arr => arr)
      .map(timeRecord => timeRecord.numberOfHours)
      .reduce((previousValue, currentValue) => previousValue.plus(currentValue), new Decimal(0));
  }

  sumHours(value: TimeRecordWithTask[]) {
    return value.map(t => t.numberOfHours).reduce((previousValue, currentValue) => previousValue.plus(currentValue), new Decimal(0));
  }
}
