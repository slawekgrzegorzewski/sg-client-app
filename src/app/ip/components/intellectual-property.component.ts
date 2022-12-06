import {Component, OnInit, TemplateRef} from '@angular/core';
import {IntellectualPropertyService} from '../services/intellectual-property.service';
import {IntellectualProperty} from '../model/intellectual-property';
import {EMPTY_TASK, EMPTY_TASK_ID, IntellectualPropertyTask} from '../model/intellectual-property-task';
import {TimeRecord} from '../model/time-record';
import {ComparatorBuilder} from '../../general/utils/comparator-builder';
import {Observable} from 'rxjs';
import {HttpEvent} from '@angular/common/http';
import 'rxjs-compat/add/observable/of';
import {DatePipe} from '@angular/common';
import {NgbAccordion, NgbModal, NgbModalConfig} from '@ng-bootstrap/ng-bootstrap';
import {IntellectualPropertyEditorModalComponent} from './utils/intellectual-property-editor-modal.component';
import {IntellectualPropertyTaskEditorModalComponent} from './utils/intellectual-property-task-editor-modal.component';
import {DatesUtils} from '../../general/utils/dates-utils';
import {IntellectualPropertyTaskDetailsModalComponent} from './utils/intellectual-property-task-details-modal.component';
import Decimal from 'decimal.js';
import {UploaderComponent} from '../../general/components/uploader/uploader.component';
import {UploaderModalComponent} from '../../general/components/uploader/uploader-modal.component';

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

  activeIds: string = '';

  get activeIdsArray(): string[] {
    return this.activeIds.split(',').filter(s => s !== '');
  };

  set activeIdsArray(value: string[]) {
    this.activeIds = value.join(',');
  };

  constructor(private intellectualPropertyService: IntellectualPropertyService,
              private datePipe: DatePipe,
              private modalConfig: NgbModalConfig,
              private modalService: NgbModal) {
    this.modalConfig.centered = true;
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
        .map(d => DatesUtils.getMonthString(d, this.datePipe)))].sort();
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
          .filter(ip => ip.tasks.find(t => t.timeRecords.find(tr => DatesUtils.getMonthString(tr.date, this.datePipe) === this.intellectualPropertiesFilter))))
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
    const ngbModalRef = this.modalService.open(IntellectualPropertyEditorModalComponent);
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
    const ngbModalRef = this.modalService.open(IntellectualPropertyTaskEditorModalComponent);
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

  showAttachmentUpload(taskId: number) {
    this.attachmentData = {
      taskId: taskId
    };
    const ngbModalRef = this.modalService.open(UploaderModalComponent, {
      backdrop: true,
      keyboard: true
    });

    ngbModalRef.result.then(
      () => {
        this.attachmentData = null;
        this.refreshData();
        uploadFinishedSubscription.unsubscribe();
      },
      () => {
        this.attachmentData = null;
        this.refreshData();
        uploadFinishedSubscription.unsubscribe();
      });

    const componentInstance = ngbModalRef.componentInstance as UploaderComponent;
    componentInstance.uploadFunction = this.upload();
    const uploadFinishedSubscription = componentInstance.uploadFinished.subscribe(
      () => {
        this.attachmentData = null;
        this.refreshData();
        uploadFinishedSubscription.unsubscribe();
      }
    );
    const uploadCancelledSubscription = componentInstance.uploadCancelled.subscribe(
      () => {
        this.attachmentData = null;
        this.refreshData();
        uploadCancelledSubscription.unsubscribe();
      }
    );

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

  tabShown(id: string) {
    const activeIdsArray1 = this.activeIdsArray;
    if (!activeIdsArray1.includes(id)) {
      activeIdsArray1.push(id);
      this.activeIdsArray = activeIdsArray1;
    }
  }

  tabHidden(id: string) {
    const activeIdsArray1 = this.activeIdsArray;
    if (activeIdsArray1.includes(id)) {
      this.activeIdsArray = activeIdsArray1.filter(t => t !== id);
    }
  }

  getTimeRecordsSummary(task: IntellectualPropertyTask) {
    let minDate: Date | null = null;
    let maxDate: Date | null = null;
    let numberOfHours = new Decimal('0');
    task.timeRecords.forEach(tr => {
      minDate = DatesUtils.min(minDate, tr.date);
      maxDate = DatesUtils.max(maxDate, tr.date);
      numberOfHours = numberOfHours.plus(tr.numberOfHours);
    });
    if (!minDate || !maxDate) {
      return 'Brak zarejstrowanego czasu.';
    } else if (DatesUtils.compareDatesOnly(minDate, maxDate) == 0) {
      return DatesUtils.getDateString(minDate, this.datePipe) + ': ' + numberOfHours + ' godzin';
    }
    return DatesUtils.getDateString(minDate, this.datePipe) + ' - ' + DatesUtils.getDateString(maxDate, this.datePipe) + ': ' + numberOfHours + ' godzin';
  }

  showTasksDetails(task: IntellectualPropertyTask) {
    const ngbModalRef = this.modalService.open(IntellectualPropertyTaskDetailsModalComponent, {
      size: 'xl',
      backdrop: true,
      keyboard: true
    });
    const componentInstance = ngbModalRef.componentInstance as IntellectualPropertyTaskDetailsModalComponent;
    componentInstance.task = task;
  }

  openConfirmationModal(content: TemplateRef<any>, callback: () => void) {
    this.modalService.open(content).result.then(
      () => callback(),
      () => {
      }
    );
  }

  openAttachmentDeleteConfirmation(content: TemplateRef<any>, task: IntellectualPropertyTask, attachment: string) {
    this.openConfirmationModal(content, () => this.deleteAttachment(task, attachment));
  }

  openTaskDeletionConfirmationModel(content: TemplateRef<any>, taskId: number) {
    this.openConfirmationModal(content, () => this.deleteTask(taskId));
  }

  openIPDeletionConfirmationModal(content: TemplateRef<any>, intellectualPropertyId: number, accordion: NgbAccordion) {
    this.openConfirmationModal(content,
      () => {
        this.deleteIntellectualProperty(intellectualPropertyId);
        accordion.collapse(intellectualPropertyId.toString());
      }
    );
  }
}
