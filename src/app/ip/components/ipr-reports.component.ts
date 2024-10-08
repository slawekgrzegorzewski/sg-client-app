import {Component, OnInit} from '@angular/core';
import {IntellectualPropertyService} from '../services/intellectual-property.service';
import {TimeRecord} from '../model/time-record';
import 'rxjs-compat/add/observable/of';
import {DatePipe} from '@angular/common';
import {DatesUtils} from '../../general/utils/dates-utils';
import {DATA_REFRESH_REQUEST_EVENT} from '../../general/utils/event-bus-events';
import {NgEventBus} from 'ng-event-bus';
import {ActivatedRoute} from '@angular/router';
import {DomainService} from '../../general/services/domain.service';
import {DomainRegistrationHelper} from '../../general/components/domain/domain-registration-helper';
import {IntellectualProperty} from '../model/intellectual-property';
import {IPRReport} from '../utils/ipr-report';
import {TimeRecordCategory} from '../model/time-record-category';
import Decimal from 'decimal.js';
import * as XLSX from 'xlsx';

export const IPR_REPORTS_ROUTER_URL = 'ipr-reports';

@Component({
  selector: 'app-ipr-reports',
  templateUrl: './ipr-reports.component.html',
  styleUrls: ['./ipr-reports.component.css']
})
export class IPRReportsComponent implements OnInit {
  timeRecordsNotAssignedToTask: TimeRecord[] = [];
  intellectualProperties: IntellectualProperty[] = [];
  timeRecordCategories: TimeRecordCategory[] = [];
  iprReport: IPRReport | null = null;
  reportHeaderColSpan = 5;

  years: string[] = [];
  _year: string | null = null;

  get year(): string {
    return this._year || '';
  }

  set year(value: string) {
    this._year = value;
    this.recalculateIPReport();
  }

  private domainRegistrationHelper: DomainRegistrationHelper;

  constructor(
    private intellectualPropertyService: IntellectualPropertyService,
    private datePipe: DatePipe,
    private eventBus: NgEventBus,
    route: ActivatedRoute,
    domainService: DomainService) {
    this.domainRegistrationHelper = new DomainRegistrationHelper(domainService, eventBus, route, IPR_REPORTS_ROUTER_URL);
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
    this.intellectualPropertyService.refreshTimeRecordCategories();
  }

  fetchData() {
    this.intellectualPropertyService.getIntellectualPropertiesForDomain().subscribe(value => {
      this.intellectualProperties = value;
      this.recalculateData();
    });
    this.intellectualPropertyService.getTimeRecordsNotAssignedToTask().subscribe(value => {
      this.timeRecordsNotAssignedToTask = value;
      this.recalculateData();
    });
    this.intellectualPropertyService.getTimeRecordCategoryForDomain().subscribe(value => {
      this.timeRecordCategories = value;
    });
  }

  private recalculateData() {
    const datesSet = new Set<string>();
    for (let timeRecord of this.timeRecordsNotAssignedToTask) {
      datesSet.add(DatesUtils.getYearString(timeRecord.date, this.datePipe));
    }
    for (let intellectualProperty of this.intellectualProperties) {
      for (let task of intellectualProperty.tasks) {
        for (let timeRecord of task.timeRecords) {
          datesSet.add(DatesUtils.getYearString(timeRecord.date, this.datePipe));
        }
      }
    }
    this.years = [...datesSet.values()];
    this.years.sort();
    if (this.year) {
      this.recalculateIPReport();
    } else {
      this.iprReport = null;
    }
  }

  private recalculateIPReport() {
    this.iprReport = new IPRReport(
      this.datePipe,
      this.year,
      this.intellectualProperties
        .filter(
          ip => ip.tasks
            .find(
              t => t.timeRecords
                .find(
                  tr => DatesUtils.getYearString(tr.date, this.datePipe) === this.year
                ) !== undefined
            )
        ),
      this.timeRecordsNotAssignedToTask
        .filter(
          tr => DatesUtils.getYearString(tr.date, this.datePipe) === this.year
        )
    );
  }

  assignTimeRecordCategory(timeRecordId: number, timeRecordCategoryId: any) {
    this.intellectualPropertyService.assignTimeRecordToCategory(timeRecordId, Number(timeRecordCategoryId.value))
      .subscribe({
        complete: () => {
          this.intellectualPropertyService.refreshNonIPTimeRecords();
        }
      });
  }

  percentage(ipHours: Decimal, nonIPHours: Decimal): number {
    if (ipHours.plus(nonIPHours).isZero()) {
      return 0;
    }
    return ipHours.div(ipHours.plus(nonIPHours)).toDecimalPlaces(4, Decimal.ROUND_DOWN).toNumber();
  }

  exportexcel() {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.table_to_sheet(document.getElementById('report')),
      this.year);

    /* save to file */
    XLSX.writeFile(wb, 'Raport IP - ' + this.year + '.xlsx');
  }
}
