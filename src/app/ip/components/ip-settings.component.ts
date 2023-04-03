import {Component, OnInit, TemplateRef} from '@angular/core';
import {IntellectualPropertyService} from '../services/intellectual-property.service';
import 'rxjs-compat/add/observable/of';
import {DatePipe} from '@angular/common';
import {NgbModal, NgbModalConfig} from '@ng-bootstrap/ng-bootstrap';
import {DATA_REFRESH_REQUEST_EVENT} from '../../general/utils/event-bus-events';
import {NgEventBus} from 'ng-event-bus';
import {ActivatedRoute} from '@angular/router';
import {DomainService} from '../../general/services/domain.service';
import {DomainRegistrationHelper} from '../../general/components/domain/domain-registration-helper';
import {TimeRecordCategory} from "../model/time-record-category";
import {TimeRecordCategoryEditorComponent} from "./utils/time-record-category-editor.component";

export const IP_SETTINGS_ROUTER_URL = 'ip-settings';

@Component({
  selector: 'app-ip-settings',
  templateUrl: './ip-settings.component.html',
  styleUrls: ['./ip-settings.component.css']
})
export class IPSettingsComponent implements OnInit {

  timeRecordCategories: TimeRecordCategory[] = [];

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
    this.domainRegistrationHelper = new DomainRegistrationHelper(domainService, eventBus, route, IP_SETTINGS_ROUTER_URL);
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
    this.intellectualPropertyService.refreshTimeRecordCategories();
  }

  fetchData() {
    this.intellectualPropertyService.getTimeRecordCategoryForDomain().subscribe(value => {
      this.timeRecordCategories = value;
    });
  }

  timeRecordCategoryAction(actionData: { timeRecordCategory: TimeRecordCategory }) {
    const {timeRecordCategory} = actionData;
    if (timeRecordCategory) {
      if (timeRecordCategory.id) {
        this.intellectualPropertyService.updateTimeRecordCategory(
          timeRecordCategory.id,
          timeRecordCategory.name)
          .subscribe({
            complete: () => {
              this.refreshData();
              this.intellectualPropertyService.refreshNonIPTimeRecords();
            }
          });
      } else {
        this.intellectualPropertyService.createTimeRecordCategory(timeRecordCategory.name)
          .subscribe({
            complete: () => {
              this.refreshData();
              this.intellectualPropertyService.refreshNonIPTimeRecords();
            }
          });
      }
    }
  }

  showTimeRecordCategoryEdition(timeRecordCategory: TimeRecordCategory) {
    const ngbModalRef = this.modalService.open(TimeRecordCategoryEditorComponent);
    const componentInstance = ngbModalRef.componentInstance as TimeRecordCategoryEditorComponent;
    componentInstance.timeRecordCategory = timeRecordCategory;
    ngbModalRef.result.then(
      result => this.timeRecordCategoryAction(result),
      () => {
      }
    );
  }

  showTimeRecordCategoryCreation() {
    const ngbModalRef = this.modalService.open(TimeRecordCategoryEditorComponent);
    const componentInstance = ngbModalRef.componentInstance as TimeRecordCategoryEditorComponent;
    componentInstance.timeRecordCategory = new TimeRecordCategory();
    ngbModalRef.result.then(
      result => this.timeRecordCategoryAction(result),
      () => {
      }
    );
  }

  showTimeRecordCategoryDeletionConfirmation(content: TemplateRef<any>, timeRecordCategory: TimeRecordCategory) {
    const that = this;
    this.modalService.open(content).result.then(
      () => that.intellectualPropertyService.deleteTimeRecordCategory(timeRecordCategory.id).subscribe({
        complete: () => {
          that.refreshData();
        }
      }),
      () => {
      }
    );
  }
}
