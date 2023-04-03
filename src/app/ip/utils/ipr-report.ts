import {TimeRecord} from '../model/time-record';
import {IntellectualProperty} from '../model/intellectual-property';
import Decimal from 'decimal.js';
import {DatesUtils} from '../../general/utils/dates-utils';
import {DatePipe} from '@angular/common';
import {EMPTY_TIME_RECORD_CATEGORY_ID} from "../model/time-record-category";

export class IPRMonthReport {
  ipHours: Decimal = new Decimal(0);
  nonIPHours: Decimal = new Decimal(0);
  totalHours: Decimal = new Decimal(0);
  ipTasksWithHours = new Map<string, Decimal>();
  nonIPTasksWithHours = new Map<string, Decimal>();
  nonIPTasksWithHoursNotCategorized = new Map<string, TimeRecord>();

  public addIntellectualProperty(intellectualProperty: IntellectualProperty, timeRecord: TimeRecord) {
    this.putStats(this.ipTasksWithHours, intellectualProperty.description, timeRecord);
    this.ipHours = this.ipHours.plus(new Decimal(timeRecord.numberOfHours));
    this.totalHours = this.totalHours.plus(new Decimal(timeRecord.numberOfHours));
  }

  public addNonIntellectualProperty(timeRecord: TimeRecord) {
    this.putStats(this.nonIPTasksWithHours, timeRecord.timeRecordCategory.name, timeRecord);
    this.nonIPHours = this.nonIPHours.plus(new Decimal(timeRecord.numberOfHours));
    this.totalHours = this.totalHours.plus(new Decimal(timeRecord.numberOfHours));
  }

  public addNonIntellectualPropertyNotCategorized(timeRecord: TimeRecord) {
    this.nonIPTasksWithHoursNotCategorized.set(timeRecord.id + ' - ' + timeRecord.description, timeRecord);
    this.nonIPHours = this.nonIPHours.plus(new Decimal(timeRecord.numberOfHours));
    this.totalHours = this.totalHours.plus(new Decimal(timeRecord.numberOfHours));
  }

  private putStats(register: Map<string, Decimal>, description: string, timeRecord: TimeRecord) {
    let hours = register.get(description);
    if (!hours) {
      hours = new Decimal(0);
    }
    hours = hours.plus(timeRecord.numberOfHours);
    register.set(description, hours);
  }
}

export class IPRReport {

  months: Map<string, IPRMonthReport>;

  constructor(
    private datePipe: DatePipe,
    private year: string,
    public intellectualProperties: IntellectualProperty[],
    public notAssignedTimeRecords: TimeRecord[]
  ) {
    this.months = new Map<string, IPRMonthReport>([
      [this.year + '-01', new IPRMonthReport()],
      [this.year + '-02', new IPRMonthReport()],
      [this.year + '-03', new IPRMonthReport()],
      [this.year + '-04', new IPRMonthReport()],
      [this.year + '-05', new IPRMonthReport()],
      [this.year + '-06', new IPRMonthReport()],
      [this.year + '-07', new IPRMonthReport()],
      [this.year + '-08', new IPRMonthReport()],
      [this.year + '-09', new IPRMonthReport()],
      [this.year + '-10', new IPRMonthReport()],
      [this.year + '-11', new IPRMonthReport()],
      [this.year + '-12', new IPRMonthReport()],
    ]);
    for (let intellectualProperty of this.intellectualProperties) {
      for (let task of intellectualProperty.tasks) {
        for (let timeRecord of task.timeRecords) {
          this.months.get(DatesUtils.getYearMonthString(timeRecord.date, this.datePipe))?.addIntellectualProperty(intellectualProperty, timeRecord);
        }
      }
    }
    for (let notAssignedTimeRecord of this.notAssignedTimeRecords) {
      if (notAssignedTimeRecord.timeRecordCategory.id === EMPTY_TIME_RECORD_CATEGORY_ID) {
        this.months
          .get(DatesUtils.getYearMonthString(notAssignedTimeRecord.date, this.datePipe))
          ?.addNonIntellectualPropertyNotCategorized(notAssignedTimeRecord);
      } else {
        this.months
          .get(DatesUtils.getYearMonthString(notAssignedTimeRecord.date, this.datePipe))
          ?.addNonIntellectualProperty(notAssignedTimeRecord);
      }
    }
  }

}
