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

export const TIME_RECORDS_ROUTER_URL = 'time-records';

@Component({
  selector: 'app-time-records',
  templateUrl: './time-records.component.html',
  styleUrls: ['./time-records.component.css']
})
export class TimeRecordsComponent implements OnInit {

  timeRecords: TimeRecordWithTask[] = [];
  timeRecordsForMonth: Map<string, TimeRecordWithTask[]> = new Map<string, TimeRecordWithTask[]>();
  dates: string[] = [];
  $date: string | null = null;

  get date(): string {
    return this.$date || '';
  }

  set date(value: string) {
    this.$date = value;
    const filteredTimeRecords = this.timeRecords.filter(timeRecord => DatesUtils.getMonthString(timeRecord.date, this.datePipe) === this.date);
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

  constructor(
    private intellectualPropertyService: IntellectualPropertyService,
    private datePipe: DatePipe,
    private modalConfig: NgbModalConfig,
    private modalService: NgbModal) {
    modalConfig.centered = true;
  }

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData() {
    forkJoin([
      this.intellectualPropertyService.getTimeRecordsNotAssignedToTask(),
      this.intellectualPropertyService.getIntellectualPropertiesForDomain()
    ])
      .subscribe(([timeRecordsNotAssociatedToTask, intellectualProperties]) => {
        const timeRecordsWithTask = intellectualProperties
          .flatMap(intellectualProperties => intellectualProperties.tasks)
          .flatMap(task => task.timeRecords.map(timeRecord => ({
            ...timeRecord,
            task: task
          } as TimeRecordWithTask)));
        const timeRecordsWithoutTask = timeRecordsNotAssociatedToTask.map(timeRecord => ({
          ...timeRecord,
          task: null
        } as TimeRecordWithTask));

        const byDate = ComparatorBuilder.comparingByDate<TimeRecordWithTask>(timeRecord => timeRecord.date).build();
        this.timeRecords = [...timeRecordsWithTask, ...timeRecordsWithoutTask].sort(byDate);
        this.dates = [...new Set(this.timeRecords.map(timeRecord => timeRecord.date).map(d => DatesUtils.getMonthString(d, this.datePipe)))].sort();
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
