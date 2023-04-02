import {Domain} from '../../general/model/domain';
import Decimal from 'decimal.js';
import {IntellectualPropertyTask} from './intellectual-property-task';
import {EMPTY_TIME_RECORD_CATEGORY, TimeRecordCategory} from "./time-record-category";

export const EMPTY_TIME_RECORD_ID = 0;

export type TimeRecordDTO = Partial<TimeRecord>;

export class TimeRecord {
  public id: number;
  public date: Date;
  public numberOfHours: Decimal;
  public description: string;
  public timeRecordCategory: TimeRecordCategory;
  public domain: Domain;

  constructor(data?: TimeRecordDTO) {
    if (!data) {
      data = {};
    }
    this.id = data.id || EMPTY_TIME_RECORD_ID;
    this.date = data.date && new Date(data.date) || new Date();
    this.description = data.description || '';
    this.numberOfHours = new Decimal(data.numberOfHours || '0.0');
    this.description = data.description || '';
    this.domain = new Domain(data.domain);
    this.timeRecordCategory = data.timeRecordCategory
      ? new TimeRecordCategory(data.timeRecordCategory)
      : EMPTY_TIME_RECORD_CATEGORY;
  }
}

export type TimeRecordWithTask = TimeRecord & {
  task: IntellectualPropertyTask | null;
}
export const EMPTY_TIME_RECORD = new TimeRecord();
