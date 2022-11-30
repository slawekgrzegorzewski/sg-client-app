import {Component, OnInit} from '@angular/core';
import {IntellectualPropertyService} from '../services/intellectual-property.service';
import {EMPTY_TASK, IntellectualPropertyTask} from '../model/intellectual-property-task';
import {TimeRecordWithTask} from '../model/time-record';
import {ComparatorBuilder} from '../../general/utils/comparator-builder';
import {forkJoin} from 'rxjs';
import 'rxjs-compat/add/observable/of';
import Decimal from 'decimal.js';
import {DatePipe} from '@angular/common';
import {TimeRecordData} from './utils/time-record-editor.component';

export const TIME_RECORDS_ROUTER_URL = 'time-records';

@Component({
  selector: 'app-cube',
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
    const filteredTimeRecords = this.timeRecords.filter(timeRecord => this.getMonthString(timeRecord.date) === this.date);
    this.timeRecordsForMonth = filteredTimeRecords.reduce((groups, item) => {
      const dateKey = this.getDateString(item.date);
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
  timeRecordData: TimeRecordData & { timeRecordId: number | null } | null = null;
  private previousTaskId: number | null = null;

  constructor(private intellectualPropertyService: IntellectualPropertyService, private datePipe: DatePipe) {
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
        this.dates = [...new Set(this.timeRecords.map(timeRecord => timeRecord.date).map(d => this.getMonthString(d)))].sort();
        if (!this.date || (this.date && !this.dates.includes(this.date))) {
          this.date = this.dates[this.dates.length - 1];
        }
        this.tasks = [EMPTY_TASK, ...intellectualProperties.flatMap(intellectualProperty => intellectualProperty.tasks)];
      });
  }

  private getMonthString(d: Date) {
    return this.datePipe.transform(d, 'yyyy-MM')!;
  }

  private getDateString(d: Date) {
    return this.datePipe.transform(d, 'yyyy-MM-dd')!;
  }

  timeRecordAction() {
    let responseObservable;
    if (this.timeRecordData) {
      const taskId = this.timeRecordData.taskId
        ? (this.timeRecordData.taskId === EMPTY_TASK.id ? null : this.timeRecordData.taskId)
        : null;
      if (this.timeRecordData.timeRecordId) {
        if ((taskId === null && this.previousTaskId === null) || (taskId === this.previousTaskId)) {
          responseObservable = this.intellectualPropertyService.updateTimeRecord(this.timeRecordData.timeRecordId, this.timeRecordData);
        } else {
          responseObservable = this.intellectualPropertyService.updateTimeRecordWithTask(taskId, this.timeRecordData.timeRecordId, this.timeRecordData);
        }
      } else {
        responseObservable = this.intellectualPropertyService.createTimeRecord(taskId, this.timeRecordData);
      }
    }
    responseObservable?.subscribe({
      complete: () => {
        this.refreshData();
        this.timeRecordData = null;
      }
    });
  }

  showTimeRecordEdition(timeRecord: TimeRecordWithTask) {
    this.previousTaskId = timeRecord.task?.id || null;
    this.timeRecordData = {
      taskId: timeRecord.task?.id || null,
      timeRecordId: timeRecord.id,
      date: timeRecord.date,
      description: timeRecord.description,
      numberOfHours: timeRecord.numberOfHours
    } as TimeRecordData & { timeRecordId: number | null };
  }

  showTimeRecordCreation() {
    this.timeRecordData = {
      taskId: null,
      timeRecordId: null,
      date: new Date(this.date + '-01'),
      description: '',
      numberOfHours: new Decimal(0)
    } as TimeRecordData & { timeRecordId: number | null };
  }

  sumHours(value: TimeRecordWithTask[]) {
    return value.map(t => t.numberOfHours).reduce((previousValue, currentValue) => previousValue.plus(currentValue), new Decimal(0));
  }
}
