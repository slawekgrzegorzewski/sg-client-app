import {Component, OnInit} from '@angular/core';
import {IntellectualPropertyService} from '../services/intellectual-property.service';
import {EMPTY_TASK, EMPTY_TASK_ID, IntellectualPropertyTask} from '../model/intellectual-property-task';
import {EMPTY_TIME_RECORD, TimeRecord, TimeRecordWithTask} from '../model/time-record';
import {ComparatorBuilder} from '../../general/utils/comparator-builder';
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
  selector: 'app-time-records',
  templateUrl: './time-records.component.html',
  styleUrls: ['./time-records.component.css']
})
export class TimeRecordsComponent implements OnInit {

  private intellectualProperties: IntellectualProperty[] = [];
  private timeRecordsNotAssociatedToTask: TimeRecord[] = [];
  timeRecords: TimeRecordWithTask[] = [];
  timeRecordsForMonth: Map<string, TimeRecordWithTask[]> = new Map<string, TimeRecordWithTask[]>();
  dates: string[] = [];
  $date: string | null = null;

  get date(): string {
    return this.$date || '';
  }

  set date(value: string) {
    this.$date = value;
    const filteredTimeRecords = this.timeRecords.filter(timeRecord => DatesUtils.getYearMonthString(timeRecord.date, this.datePipe) === this.date);
    this.timeRecordsForMonth = filteredTimeRecords.reduce((groups, item) => {
      const dateKey = DatesUtils.getDateString(item.date, this.datePipe);
      let items = groups.get(dateKey);
      if (!items) {
        items = [];
        groups.set(dateKey, items);
      }
      items.push(item);
      return groups;
    }, new Map<string, TimeRecordWithTask[]>());
  }

  tasks: IntellectualPropertyTask[] = [];
  private previousTaskId: number | null = null;
  private domainRegistrationHelper: DomainRegistrationHelper;

  constructor(
    private intellectualPropertyService: IntellectualPropertyService,
    private datePipe: DatePipe,
    private modalConfig: NgbModalConfig,
    private modalService: NgbModal,
    private eventBus: NgEventBus,
    private route: ActivatedRoute,
    private domainService: DomainService) {
    modalConfig.centered = true;
    this.domainRegistrationHelper = new DomainRegistrationHelper(domainService, eventBus, route, TIME_RECORDS_ROUTER_URL);
    this.domainRegistrationHelper.domainChangedEvent.subscribe(() => this.refreshData());
  }

  ngOnInit(): void {
    this.fetchData();
    this.eventBus.on(DATA_REFRESH_REQUEST_EVENT).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnDestroy(): void {
    this.domainRegistrationHelper.onDestroy();
  }

  refreshData() {
    this.intellectualPropertyService.refreshData();
    this.intellectualPropertyService.refreshNonIPTimeRecords();
  }

  fetchData() {
    this.intellectualPropertyService.getIntellectualPropertiesForDomain().subscribe(value => {
      this.intellectualProperties = value;
      this.recalculateData();
    });
    this.intellectualPropertyService.getTimeRecordsNotAssignedToTask().subscribe(value => {
      this.timeRecordsNotAssociatedToTask = value;
      this.recalculateData();
    });
  }

  private recalculateData() {
    const timeRecordsWithTask = this.intellectualProperties
      .flatMap(intellectualProperties => intellectualProperties.tasks)
      .flatMap(task => task.timeRecords.map(timeRecord => ({
        ...timeRecord,
        task: task
      } as TimeRecordWithTask)));
    const timeRecordsWithoutTask = this.timeRecordsNotAssociatedToTask.map(timeRecord => ({
      ...timeRecord,
      task: null
    } as TimeRecordWithTask));

    const byDate = ComparatorBuilder.comparingByDate<TimeRecordWithTask>(timeRecord => timeRecord.date).build();
    this.timeRecords = [...timeRecordsWithTask, ...timeRecordsWithoutTask].sort(byDate);
    this.dates = [...new Set(this.timeRecords.map(timeRecord => timeRecord.date).map(d => DatesUtils.getYearMonthString(d, this.datePipe)))].sort();
    const previousDate = this.date;
    this.date = this.dates[this.dates.length - 1];
    if (previousDate && this.dates.includes(previousDate)) {
      this.date = previousDate;
    }
    this.tasks = this.intellectualProperties.flatMap(intellectualProperty => intellectualProperty.tasks);
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
