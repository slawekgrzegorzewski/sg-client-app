import {Component, OnInit} from '@angular/core';
import {IntellectualPropertyService} from '../services/intellectual-property.service';
import {IntellectualProperty, NO_ID} from '../model/intellectual-property';
import {IntellectualPropertyTask} from '../model/intellectual-property-task';
import {TimeRecord} from '../model/time-record';
import {ComparatorBuilder} from '../../general/utils/comparator-builder';
import {Observable} from 'rxjs';
import {HttpEvent} from '@angular/common/http';
import 'rxjs-compat/add/observable/of';
import Decimal from 'decimal.js';
import {TimeRecordData} from './utils/time-record-editor.component';
import {IntellectualPropertyTaskData} from './utils/intellectual-property-task-editor.component';
import {DatePipe} from '@angular/common';

export const IP_HOME_ROUTER_URL = 'ip-home';
export const ALL = 'wszystkie';

@Component({
  selector: 'app-cube',
  templateUrl: './intellectual-property.component.html',
  styleUrls: ['./intellectual-property.component.css']
})
export class IntellectualPropertyComponent implements OnInit {

  $allIntellectualProperties: IntellectualProperty[] = [];

  get allIntellectualProperties(): IntellectualProperty[] {
    return this.$allIntellectualProperties;
  }

  set allIntellectualProperties(value: IntellectualProperty[]) {
    this.$allIntellectualProperties = value;
    this.filterDataByMonth(this.intellectualPropertiesFilter);
  }

  intellectualPropertiesFiltered: IntellectualProperty[] = [];
  intellectualPropertiesDates: string[] = [];
  $intellectualPropertiesFilter: string = '';

  get intellectualPropertiesFilter(): string {
    return this.$intellectualPropertiesFilter;
  }

  set intellectualPropertiesFilter(value: string) {
    this.$intellectualPropertiesFilter = value;
    this.filterDataByMonth(value);
  }

  intellectualPropertyToEdit: IntellectualProperty | null = null;
  taskData: IntellectualPropertyTaskData | null = null;
  timeRecordData: TimeRecordData | null = null;
  attachmentData: { taskId: number } | null = null;

  constructor(private intellectualPropertyService: IntellectualPropertyService, private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData() {
    this.intellectualPropertyService.getIntellectualPropertiesForDomain().subscribe(data => {
      const byIdDesc = ComparatorBuilder.comparing<IntellectualProperty>(intellectualProperty => intellectualProperty.id).desc().build();
      data.flatMap(entry => entry.tasks)
        .forEach(task => task.timeRecords = (task.timeRecords || []).sort(ComparatorBuilder.comparingByDate<TimeRecord>(timeRecord => timeRecord.date).build()));
      this.allIntellectualProperties = data.sort(byIdDesc);
      this.intellectualPropertiesDates = [...new Set(this.allIntellectualProperties
        .flatMap(ip => ip.tasks)
        .flatMap(t => t.timeRecords)
        .map(tr => tr.date)
        .map(d => this.getMonthString(d)))].sort();
      this.intellectualPropertiesDates.unshift(ALL);
      if (!this.intellectualPropertiesDates.includes(this.intellectualPropertiesFilter)) {
        this.intellectualPropertiesFilter = ALL;
      }
    });
  }

  private filterDataByMonth(monthFilter: string) {
    this.intellectualPropertiesFiltered = monthFilter === ALL
      ? this.allIntellectualProperties
      : this.allIntellectualProperties.filter(ip => ip.tasks.find(t => t.timeRecords.find(tr => this.getMonthString(tr.date) === this.intellectualPropertiesFilter)));
  }

  startIntellectualPropertyCreation() {
    this.intellectualPropertyToEdit = new IntellectualProperty();
    this.allIntellectualProperties = [this.intellectualPropertyToEdit, ...this.allIntellectualProperties];
  }

  removeCreatingIPFromList() {
    this.allIntellectualProperties = this.allIntellectualProperties.filter(ip => ip.id !== NO_ID);
  }

  startIntellectualPropertyEdit(intellectualProperty: IntellectualProperty) {
    this.removeCreatingIPFromList();
    this.intellectualPropertyToEdit = new IntellectualProperty({
      id: intellectualProperty.id,
      description: intellectualProperty.description
    });
  }

  intellectualPropertyAction(intellectualPropertyData: IntellectualProperty) {
    this.mapIPToRequest(intellectualPropertyData).subscribe({
      complete: () => {
        this.refreshData();
        this.intellectualPropertyToEdit = null;
      }
    });
  }

  mapIPToRequest(intellectualPropertyData: IntellectualProperty): Observable<IntellectualProperty | string> {
    if (intellectualPropertyData.id) {
      return this.intellectualPropertyService.updateIntellectualProperty(intellectualPropertyData.id, intellectualPropertyData.description);
    } else {
      return this.intellectualPropertyService.createIntellectualProperty(intellectualPropertyData.description);
    }
  }

  deleteIntellectualProperty(id: number) {
    this.intellectualPropertyService.deleteIntellectualProperty(id).subscribe({
      complete: () => this.refreshData()
    });
  }

  showTaskCreator(intellectualProperty: IntellectualProperty) {
    this.taskData = {
      intellectualPropertyId: intellectualProperty.id,
      taskId: null,
      coAuthors: '',
      description: ''
    };
  }

  showTaskEditor(intellectualProperty: IntellectualProperty, task: IntellectualPropertyTask) {
    this.taskData = {
      intellectualPropertyId: intellectualProperty.id,
      taskId: task.id,
      coAuthors: task.coAuthors,
      description: task.description
    };
  }

  taskAction(taskData: IntellectualPropertyTaskData) {
    this.mapToRequest(taskData)?.subscribe({
      complete: () => {
        this.refreshData();
        this.taskData = null;
      }
    });
  }

  private mapToRequest(taskData: IntellectualPropertyTaskData | null): Observable<string> | null {
    if (taskData) {
      if (taskData.taskId) {
        return this.intellectualPropertyService.updateTask(taskData.taskId, this.mapToRequestObject(taskData));
      } else {
        return this.intellectualPropertyService.createTask(taskData.intellectualPropertyId, this.mapToRequestObject(taskData));
      }
    }
    return null;
  }

  private mapToRequestObject(taskData: IntellectualPropertyTaskData) {
    return {
      coAuthors: taskData.coAuthors,
      description: taskData.description
    };
  }

  deleteTask(taskId: number) {
    this.intellectualPropertyService.deleteTask(taskId)
      .subscribe({
        complete: () => {
          this.refreshData();
          this.taskData = null;
        }
      });
  }

  showTimeRecordCreator(task: IntellectualPropertyTask) {
    this.timeRecordData = {
      taskId: task.id,
      timeRecordId: null,
      date: new Date(),
      numberOfHours: new Decimal(0),
      description: ''
    };
  }

  showTimeRecordEditor(task: IntellectualPropertyTask, timeRecord: TimeRecord) {
    this.timeRecordData = {
      taskId: task.id,
      timeRecordId: timeRecord.id,
      date: timeRecord.date,
      numberOfHours: timeRecord.numberOfHours,
      description: timeRecord.description
    };
  }

  timeRecordAction(timeRecordData: TimeRecordData) {
    this.mapActionToRequest(timeRecordData)?.subscribe({
      complete: () => {
        this.refreshData();
        this.timeRecordData = null;
      }
    });
  }

  private mapActionToRequest(timeRecordData: TimeRecordData): Observable<string> | null {
    if (timeRecordData) {
      if (timeRecordData.timeRecordId) {
        return this.intellectualPropertyService.updateTimeRecord(timeRecordData.timeRecordId, this.mapToTimeRecordData(timeRecordData));
      } else {
        return this.intellectualPropertyService.createTimeRecord(timeRecordData.taskId, this.mapToTimeRecordData(timeRecordData));
      }
    }
    return null;
  }

  private mapToTimeRecordData(timeRecordData: TimeRecordData) {
    return {
      date: timeRecordData.date,
      numberOfHours: timeRecordData.numberOfHours,
      description: timeRecordData.description
    };
  }

  deleteTimeRecord(timeRecordId: number) {
    this.intellectualPropertyService.deleteTimeRecord(timeRecordId)
      .subscribe({
        complete: () => {
          this.refreshData();
        }
      });
  }

  showAttachmentUpload(taskId: number) {
    this.attachmentData = {
      taskId: taskId
    };
  }

  deleteAttachment(task: IntellectualPropertyTask, fileName: string) {
    this.intellectualPropertyService.deleteAttachment(task.id, fileName).subscribe({
      complete: () => this.refreshData()
    });
  }

  downloadAttachment(task: IntellectualPropertyTask, fileName: string) {
    window.open(this.intellectualPropertyService.linkForAttachmentDownload(task.id, fileName));
  }

  upload(): (file: File) => Observable<HttpEvent<Object>> {
    const that = this;
    return (file: File) => {
      return that.intellectualPropertyService.uploadAttachment(that.attachmentData!.taskId, file);
    };
  }

  private getMonthString(d: Date) {
    return this.datePipe.transform(d, 'yyyy-MM')!;
  }
}
