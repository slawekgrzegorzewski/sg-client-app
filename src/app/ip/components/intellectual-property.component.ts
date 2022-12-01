import {Component, OnInit} from '@angular/core';
import {IntellectualPropertyService} from '../services/intellectual-property.service';
import {IntellectualProperty} from '../model/intellectual-property';
import {IntellectualPropertyTask} from '../model/intellectual-property-task';
import {TimeRecord} from '../model/time-record';
import {ComparatorBuilder} from '../../general/utils/comparator-builder';
import {Observable} from 'rxjs';
import {HttpEvent} from '@angular/common/http';
import 'rxjs-compat/add/observable/of';
import Decimal from 'decimal.js';
import {TimeRecordData} from './utils/time-record-editor.component';
import {IntellectualPropertyTaskData} from './utils/intellectual-property-task-editor.component';
import {IntellectualPropertyData} from './utils/intellectual-property-editor.component';

export const IP_HOME_ROUTER_URL = 'ip-home';

@Component({
  selector: 'app-cube',
  templateUrl: './intellectual-property.component.html',
  styleUrls: ['./intellectual-property.component.css']
})
export class IntellectualPropertyComponent implements OnInit {

  intellectualProperties: IntellectualProperty[] = [];
  intellectualPropertyToEdit: IntellectualPropertyData | null = null;
  taskData: IntellectualPropertyTaskData | null = null;
  timeRecordData: TimeRecordData | null = null;
  attachmentData: { taskId: number } | null = null;

  constructor(private intellectualPropertyService: IntellectualPropertyService) {
  }

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData() {
    this.intellectualPropertyService.getIntellectualPropertiesForDomain().subscribe(data => {
      const byIdDesc = ComparatorBuilder.comparing<IntellectualProperty>(intellectualProperty => intellectualProperty.id).desc().build();
      data.flatMap(entry => entry.tasks)
        .forEach(task => task.timeRecords = (task.timeRecords || []).sort(ComparatorBuilder.comparingByDate<TimeRecord>(timeRecord => timeRecord.date).build()));
      this.intellectualProperties = data.sort(byIdDesc);
    });
  }

  startIntellectualPropertyCreation() {
    this.intellectualPropertyToEdit = {} as IntellectualPropertyData;
  }

  startIntellectualPropertyEdit(intellectualProperty: IntellectualProperty) {
    this.intellectualPropertyToEdit = {
      id: intellectualProperty.id,
      description: intellectualProperty.description
    } as IntellectualPropertyData;
  }

  intellectualPropertyAction(intellectualPropertyData: IntellectualPropertyData) {
    this.mapIPToRequest(intellectualPropertyData).subscribe({
      complete: () => {
        this.refreshData();
        this.intellectualPropertyToEdit = null;
      }
    });
  }

  mapIPToRequest(intellectualPropertyData: IntellectualPropertyData): Observable<IntellectualProperty | string> {
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
}
