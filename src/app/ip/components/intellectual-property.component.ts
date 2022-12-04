import {Component, OnInit} from '@angular/core';
import {IntellectualPropertyService} from '../services/intellectual-property.service';
import {IntellectualProperty} from '../model/intellectual-property';
import {EMPTY_TASK, EMPTY_TASK_ID, IntellectualPropertyTask} from '../model/intellectual-property-task';
import {EMPTY_TIME_RECORD, EMPTY_TIME_RECORD_ID, TimeRecord} from '../model/time-record';
import {ComparatorBuilder} from '../../general/utils/comparator-builder';
import {Observable} from 'rxjs';
import {HttpEvent} from '@angular/common/http';
import 'rxjs-compat/add/observable/of';
import {DatePipe} from '@angular/common';
import {NgbModal, NgbModalConfig} from '@ng-bootstrap/ng-bootstrap';
import {IntellectualPropertyEditorModalComponent} from './utils/intellectual-property-editor-modal.component';
import {IntellectualPropertyTaskEditorModalComponent} from './utils/intellectual-property-task-editor-modal.component';

export const IP_HOME_ROUTER_URL = 'ip-home';
export const ALL = 'wszystkie';

@Component({
  selector: 'app-intellectual-property',
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
    this.filterData();
  }

  intellectualPropertiesFiltered: IntellectualProperty[] = [];
  intellectualPropertiesDates: string[] = [];
  $intellectualPropertiesFilter: string = '';

  get intellectualPropertiesFilter(): string {
    return this.$intellectualPropertiesFilter;
  }

  set intellectualPropertiesFilter(value: string) {
    this.$intellectualPropertiesFilter = value;
    this.filterData();
  }

  timeRecordToEdit: TimeRecord | null = null;
  attachmentData: { taskId: number } | null = null;

  activeIds: string = '0';

  get activeIdsArray(): string[] {
    return this.activeIds.split(',');
  };

  set activeIdsArray(value: string[]) {
    this.activeIds = value.join(',');
  };

  constructor(private intellectualPropertyService: IntellectualPropertyService,
              private datePipe: DatePipe,
              private modalConfig: NgbModalConfig,
              private modalService: NgbModal) {
    this.modalConfig.backdrop = 'static';
    this.modalConfig.keyboard = false;
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

  filterData() {
    this.intellectualPropertiesFiltered = (
      this.intellectualPropertiesFilter === ALL
        ? this.allIntellectualProperties
        : this.allIntellectualProperties
          .filter(ip => ip.tasks.find(t => t.timeRecords.find(tr => this.getMonthString(tr.date) === this.intellectualPropertiesFilter))))
      .map(ip => new IntellectualProperty(ip));
  }

  openIntellectualPropertyCreationModal() {
    this.openIntellectualPropertyModal(new IntellectualProperty({}));
  }

  openIntellectualPropertyEditModal(intellectualProperty: IntellectualProperty) {
    this.openIntellectualPropertyModal(new IntellectualProperty({
      id: intellectualProperty.id,
      description: intellectualProperty.description
    }));
  }

  openIntellectualPropertyModal(intellectualProperty: IntellectualProperty) {
    const ngbModalRef = this.modalService.open(IntellectualPropertyEditorModalComponent, {centered: true});
    const componentInstance = ngbModalRef.componentInstance as IntellectualPropertyEditorModalComponent;
    componentInstance.intellectualProperty = intellectualProperty;
    ngbModalRef.result.then(
      (intellectualProperty) => {
        const request: Observable<IntellectualProperty | string> = intellectualProperty.id
          ? this.intellectualPropertyService.updateIntellectualProperty(intellectualProperty.id, intellectualProperty.description)
          : this.intellectualPropertyService.createIntellectualProperty(intellectualProperty.description);
        request.subscribe({
          complete: () => this.refreshData()
        });
      },
      () => {
      },
    );
  }

  deleteIntellectualProperty(id: number) {
    this.intellectualPropertyService.deleteIntellectualProperty(id).subscribe({
      complete: () => this.refreshData()
    });
  }

  showTaskCreator(intellectualProperty: IntellectualProperty) {
    this.openIntellectualPropertyTaskModal(intellectualProperty, new IntellectualPropertyTask(EMPTY_TASK));
  }

  showTaskEditor(intellectualProperty: IntellectualProperty, task: IntellectualPropertyTask) {
    this.openIntellectualPropertyTaskModal(intellectualProperty, new IntellectualPropertyTask(task));
  }

  openIntellectualPropertyTaskModal(intellectualProperty: IntellectualProperty, task: IntellectualPropertyTask) {
    const ngbModalRef = this.modalService.open(IntellectualPropertyTaskEditorModalComponent, {centered: true});
    const componentInstance = ngbModalRef.componentInstance as IntellectualPropertyTaskEditorModalComponent;
    componentInstance.intellectualProperty = intellectualProperty;
    componentInstance.taskData = task;
    ngbModalRef.result.then(
      (actionData: { intellectualProperty: IntellectualProperty, task: IntellectualPropertyTask }) => {
        const {intellectualProperty, task} = actionData;

        const requestObject = {
          coAuthors: task.coAuthors,
          description: task.description
        };

        (EMPTY_TASK_ID === task.id
          ? this.intellectualPropertyService.createTask(intellectualProperty.id, requestObject)
          : this.intellectualPropertyService.updateTask(task.id, requestObject))
          .subscribe({
            complete: () => {
              this.refreshData();
            }
          });
      },
      () => this.filterData(),
    );
  }

  deleteTask(taskId: number) {
    this.intellectualPropertyService.deleteTask(taskId)
      .subscribe({
        complete: () => {
          this.refreshData();
        }
      });
  }

  showTimeRecordCreator(task: IntellectualPropertyTask) {
    this.timeRecordToEdit = new TimeRecord(EMPTY_TIME_RECORD);
    task.timeRecords.unshift(this.timeRecordToEdit);
  }

  showTimeRecordEditor(task: IntellectualPropertyTask, timeRecord: TimeRecord) {
    this.timeRecordToEdit = timeRecord;
  }

  cancelTimeRecordEdition() {
    this.timeRecordToEdit = null;
    this.filterData();
  }

  timeRecordAction(dataAction: { timeRecord: TimeRecord, task: IntellectualPropertyTask }) {
    const {timeRecord, task} = dataAction;
    this.mapActionToRequest(timeRecord, task).subscribe({
      complete: () => {
        this.refreshData();
        this.timeRecordToEdit = null;
      }
    });
  }

  private mapActionToRequest(timeRecord: TimeRecord, task: IntellectualPropertyTask): Observable<string> {
    function mapToRequestObject(timeRecord: TimeRecord) {
      return {
        date: timeRecord.date,
        numberOfHours: timeRecord.numberOfHours,
        description: timeRecord.description
      };
    }

    if (EMPTY_TIME_RECORD_ID === timeRecord.id) {
      return this.intellectualPropertyService.createTimeRecord(task.id, mapToRequestObject(timeRecord));
    } else {
      return this.intellectualPropertyService.updateTimeRecord(timeRecord.id, mapToRequestObject(timeRecord));
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

  private getMonthString(d: Date) {
    return this.datePipe.transform(d, 'yyyy-MM')!;
  }

  tabShown(id: string) {
    const activeIdsArray1 = this.activeIdsArray;
    if (!activeIdsArray1.includes(id)) {
      activeIdsArray1.push(id);
      this.activeIdsArray = activeIdsArray1;
    }
  }

  tabHidden(id: string) {
    const activeIdsArray1 = this.activeIdsArray;
    if (!activeIdsArray1.includes(id)) {
      this.activeIdsArray = activeIdsArray1.filter(t => t !== id);
    }
  }
}
