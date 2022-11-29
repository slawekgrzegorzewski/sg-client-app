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

export const IP_HOME_ROUTER_URL = 'ip-home';

@Component({
  selector: 'app-cube',
  templateUrl: './intellectual-property.component.html',
  styleUrls: ['./intellectual-property.component.css']
})
export class IntellectualPropertyComponent implements OnInit {

  intellectualProperties: IntellectualProperty[] = [];
  showIntellectualPropertyCreation: boolean = false;
  intellectualPropertyDescriptionToCreate: string = '';
  intellectualPropertyToEdit: IntellectualProperty | null = null;
  taskData: { intellectualPropertyId: number, taskId: number | null, coAuthors: string, description: string } | null = null;
  timeRecordData: { taskId: number, timeRecordId: number | null, date: Date, numberOfHours: Decimal, description: string } | null = null;
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

  createIntellectualProperty() {
    if (this.intellectualPropertyDescriptionToCreate) {
      this.intellectualPropertyService.createIntellectualProperty(this.intellectualPropertyDescriptionToCreate).subscribe({
        complete: () => {
          this.refreshData();
          this.showIntellectualPropertyCreation = false;
          this.intellectualPropertyDescriptionToCreate = '';
        }
      });
    }
  }

  deleteIntellectualProperty(id: number) {
    this.intellectualPropertyService.deleteIntellectualProperty(id).subscribe({
      complete: () => this.refreshData()
    });
  }

  updateIntellectualProperty() {
    if (this.intellectualPropertyToEdit) {
      this.intellectualPropertyService.updateIntellectualProperty(this.intellectualPropertyToEdit.id, this.intellectualPropertyToEdit.description).subscribe({
        complete: () => {
          this.refreshData();
          this.intellectualPropertyToEdit = null;
        }
      });
    }
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

  taskAction() {
    if (this.taskData) {
      if (this.taskData.taskId) {
        this.intellectualPropertyService.updateTask(this.taskData.taskId, {
          coAuthors: this.taskData.coAuthors,
          description: this.taskData.description
        })
          .subscribe({
            complete: () => {
              this.refreshData();
              this.taskData = null;
            }
          });
      } else {
        this.intellectualPropertyService.createTask(this.taskData.intellectualPropertyId, {
          coAuthors: this.taskData.coAuthors,
          description: this.taskData.description
        })
          .subscribe({
            complete: () => {
              this.refreshData();
              this.taskData = null;
            }
          });
      }
    }
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

  timeRecordAction() {
    if (this.timeRecordData) {
      if (this.timeRecordData.timeRecordId) {
        this.intellectualPropertyService.updateTimeRecord(this.timeRecordData.timeRecordId, {
          date: this.timeRecordData.date,
          numberOfHours: this.timeRecordData.numberOfHours.toString(),
          description: this.timeRecordData.description
        })
          .subscribe({
            complete: () => {
              this.refreshData();
              this.timeRecordData = null;
            }
          });
      } else {
        this.intellectualPropertyService.createTimeRecord(this.timeRecordData.taskId, {
          date: this.timeRecordData.date,
          numberOfHours: this.timeRecordData.numberOfHours.toString(),
          description: this.timeRecordData.description
        })
          .subscribe({
            complete: () => {
              this.refreshData();
              this.timeRecordData = null;
            }
          });
      }
    }
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
